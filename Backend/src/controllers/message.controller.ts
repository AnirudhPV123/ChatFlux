import {
  asyncHandler,
  CustomError,
  CustomResponse,
  uploadOnCloudinary,
  emitSocketEvent,
} from '@/utils';
import { Conversation } from '@/models/conversation.model';
import { Message } from '@/models/message.model';
import mongoose from 'mongoose';

// Utility function to handle messageReplyDetails parsing
const parseMessageReplyDetails = (messageReplyDetails: any) => {
  if (messageReplyDetails && !messageReplyDetails.status) {
    return JSON.parse(messageReplyDetails);
  }
  return messageReplyDetails || null;
};

// Utility function to get file extension and type from a URL
const getFileExtensionFromUrl = (url: string) => {
  const urlParts = url.split('/');
  if (urlParts.length === 0) return null;
  return urlParts;
};

// Utility function for cloudinary file upload
const handleFileUpload = async ({ mimetype, path }: { mimetype: string; path: string }) => {
  const urlParts = getFileExtensionFromUrl(mimetype);
  const file = await uploadOnCloudinary(path, urlParts![1]); //second arg is extension
  if (!file?.url) {
    throw new CustomError(500, 'Server error.');
  }
  return { file, urlParts };
};

// Send message one-one-one chat
export const sendMessage = asyncHandler(async (req, res, next) => {
  const senderId = (req.user as any)._id;
  const receiverId = req.params.id;
  const { caption, message, messageReplyDetails } = req.body;

  // handle reply message
  const replyDetails = parseMessageReplyDetails(messageReplyDetails);

  // condition runs only when file is present
  let file;
  let urlParts;
  if (req.file?.path) {
    // handle file upload
    ({ file, urlParts } = await handleFileUpload({
      mimetype: req.file?.mimetype,
      path: req.file?.path,
    }));
  }

  // Find or create conversation between sender and receiver
  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
    isGroupChat: false,
  });

  const newMessage = await Message.create({
    senderId,
    receiverId,
    conversationId: conversation?._id,
    message: {
      content: file ? file?.url : message,
      type: file ? urlParts![0] : 'text',
      format: file ? file?.format : 'string',
      caption: caption ? caption : '',
    },
    status: 'sent',
    ...(replyDetails?.status && {
      messageReplyDetails: {
        replyMessageId: replyDetails.replyMessageId,
        replyMessageUserId: replyDetails.replyMessageUserId,
        status: replyDetails.status,
      },
    }),
  });

  // Update conversation with new message
  conversation?.messages.push(newMessage._id);
  await conversation?.save();

  // SOCKET.IO
  await emitSocketEvent(receiverId.toString(), 'new_message', newMessage);

  return res.status(201).json(new CustomResponse(201, newMessage));
});

// Send group message
export const sendGroupMessage = asyncHandler(async (req, res, next) => {
  const senderId = (req.user as any)._id;
  const groupId = req.params.id;
  const { message, caption, messageReplyDetails } = req.body;

  const replyDetails = parseMessageReplyDetails(messageReplyDetails);

  // condition runs only when file is present
  let file;
  let urlParts;
  if (req.file?.path) {
    // handle file upload
    ({ file, urlParts } = await handleFileUpload({
      mimetype: req.file?.mimetype,
      path: req.file?.path,
    }));
  }

  // add all participants id to notification array and whenever the participant seen the message their id remove from notification
  // used to track whether participant seen the message or not and show notification
  const group = await Conversation.findById(groupId);

  const notifications = group?.participants.filter(
    (participant) => !participant._id.equals(senderId),
  );

  const newMessage = await Message.create({
    senderId,
    groupId,
    message: {
      content: file ? file?.url : message,
      type: file ? urlParts![0] : 'text',
      format: file ? file?.format : 'string',
      caption: caption ? caption : '',
    },
    notifications,
    ...(replyDetails?.status && {
      messageReplyDetails: {
        replyMessageId: replyDetails.replyMessageId,
        replyMessageUserId: replyDetails.replyMessageUserId,
        status: replyDetails.status,
      },
    }),
  });

  // Update conversation with new message
  let conversation = await Conversation.findById(groupId);
  conversation?.messages.push(newMessage._id);
  await conversation?.save();

  const newMessage2 = await Message.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(newMessage._id) },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'senderId',
        foreignField: '_id',
        as: 'senderDetails',
      },
    },
    {
      $unwind: '$senderDetails',
    },
    {
      $project: {
        'senderDetails.password': 0,
        'senderDetails.gender': 0,
        'senderDetails.isActive': 0,
        'senderDetails.createdAt': 0,
        'senderDetails.updatedAt': 0,
        'senderDetails.__v': 0,
        'senderDetails.refreshToken': 0,
      },
    },
  ]);

  if (conversation) {
    await Promise.all(
      conversation.participants.map((id) => {
        if (id.equals(senderId)) {
          return;
        }
        emitSocketEvent(id.toString(), 'new_message', newMessage2[0]);
      }),
    );
  }

  res.status(201).json(new CustomResponse(201, newMessage2[0]));
});

// Get message one-on-one chat
export const getMessage = asyncHandler(async (req, res, next) => {
  const oppositeUserId = req.params.id;
  const userId = (req.user as any)._id;

  // check status is seen , otherwise update status to seen
  const updateStatus = await Message.updateMany(
    {
      senderId: oppositeUserId, // update status if the receiver call getMessage (here userId is receiver)
      receiverId: userId,
      status: { $ne: 'seen' },
    },
    {
      $set: { status: 'seen' },
    },
  );

  const conversation = await Conversation.findOne({
    participants: { $all: [oppositeUserId, userId] },
    isGroupChat: false,
  }).populate('messages');

  // send status update to sender
  if (updateStatus.modifiedCount > 0) {
    await emitSocketEvent(
      oppositeUserId.toString(),
      'message_status_update_from_backend_to_sender',
      conversation?._id,
      'seen',
    );
  }

  return res.status(200).json(new CustomResponse(200, conversation?.messages));
});

// Get group message
export const getGroupMessage = asyncHandler(async (req, res, next) => {
  const groupId = req.params.id;
  const userId = (req.user as any)._id;

  await Message.updateMany(
    { groupId: groupId },
    { $pull: { notifications: userId } }, // remove userId from notifications array
  );

  const conversation = await Conversation.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(groupId) },
    },
    {
      $lookup: {
        from: 'messages',
        localField: 'messages',
        foreignField: '_id',
        as: 'messageDetails',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'messageDetails.senderId',
        foreignField: '_id',
        as: 'senderDetails',
      },
    },
    {
      $project: {
        messages: {
          $map: {
            input: '$messageDetails',
            as: 'message',
            in: {
              $mergeObjects: [
                {
                  senderId: '$$message.senderId',
                  message: '$$message.message',
                  groupId: '$$message.groupId',
                  createdAt: '$$message.createdAt',
                  updatedAt: '$$message.updatedAt',
                  _id: '$$message._id',
                  messageReplyDetails: '$$message.messageReplyDetails',
                },
                {
                  senderDetails: {
                    $let: {
                      vars: {
                        sender: {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: '$senderDetails',
                                as: 'sender',
                                cond: { $eq: ['$$sender._id', '$$message.senderId'] },
                              },
                            },
                            0,
                          ],
                        },
                      },
                      in: {
                        _id: '$$sender._id',
                        phoneNumber: '$$sender.phoneNumber',
                        userName: '$$sender.userName',
                        avatar: '$$sender.avatar',
                        // Add other fields you want to include, but exclude password and refreshToken
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      },
    },
  ]);

  res.status(200).json(new CustomResponse(200, conversation[0].messages));
});

// delete message both one-on-one and group
export const deleteMessage = asyncHandler(async (req, res, next) => {
  const messageId = req.params.messageId;
  const id = req.params.id; // id is chatId for group or receiverId for one-on-one chat
  const userId = (req.user as any)._id;

  const deletedMessage = await Message.findByIdAndUpdate(
    messageId,
    { $unset: { message: '', messageReplyDetails: '' } },
    { new: true },
  );

  if (!deletedMessage) {
    return res.status(500).json(new CustomError(500, 'Server error.'));
  }

  if (deletedMessage?.conversationId) {
    await emitSocketEvent(id.toString(), 'message_deleted', deletedMessage._id);
  } else {
    const conversation = await Conversation.findById(id);

    if (conversation) {
      await Promise.all(
        conversation?.participants.map(async (id) => {
          if (userId.equals(id)) {
            return;
          }
          emitSocketEvent(id.toString(), 'message_deleted', deletedMessage._id);
        }),
      );
    }
  }

  return res.status(201).json(new CustomResponse(201, 'Message deleted successfully'));
});
