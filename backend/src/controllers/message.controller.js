import { CustomResponse } from '../utils/CustomResponse.js';
import { CustomError } from '../utils/CustomError.js';

import { asyncErrorHandler } from '../utils/asyncErrorHandler.js';
import { Conversation } from '../models/conversation.model.js';
import { Message } from '../models/message.model.js';
import { getReceiverSocketId, getSocketIds, io } from '../socket/socket.js';
import mongoose from 'mongoose';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { format } from 'winston';

// @DESC Send a message between users and handle socket communication
// @METHOD POST
// @PATH /message/send/:id (id - receiverId)
// @RETURN Created newMessage
export const sendMessage = asyncErrorHandler(async (req, res, next) => {
  const senderId = req.user._id;
  const receiverId = req.params.id;
  const { caption, message, messageReplyDetails } = req.body;

  console.log('blockL', message);

  let replyDetails;
  if (messageReplyDetails && !messageReplyDetails?.status) {
    replyDetails = JSON.parse(messageReplyDetails);
  } else if (messageReplyDetails) {
    replyDetails = messageReplyDetails;
  }

  // split url and get extension (jpg, jpeg, mp4 etc)
  function getFileExtensionFromUrl(url) {
    const urlParts = url.split('/');
    if (urlParts.length === 0) {
      return null;
    }

    return urlParts;
    // return urlParts[urlParts.length - 1].split('?')[0].toLowerCase(); // Split on '?' to handle query parameters
  }

  // condition runs only when file is present
  let file;
  let urlParts;
  if (req.file?.path) {
    // extension for specify file type when upload file to cloudinary
    urlParts = getFileExtensionFromUrl(req.file?.mimetype);

    file = await uploadOnCloudinary(req.file?.path, urlParts[1]);

    if (!file?.url) {
      return res.status(500).json(new CustomError(500, 'Server error.'));
    }
  }

  // Find or create conversation between sender and receiver
  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
    isGroupChat: false,
  });

  const newMessage = await Message.create({
    senderId,
    receiverId,
    conversationId: conversation._id,
    message: {
      content: file ? file?.url : message,
      type: file ? urlParts[0] : 'text',
      format: file ? file?.format : 'string',
      caption: caption ? caption : '',
    },
    status: 'sent',
    // ...(messageReplyDetails?.status && messageReplyDetails ),
    ...(replyDetails?.status && {
      messageReplyDetails: {
        replyMessageId: replyDetails.replyMessageId,
        replyMessageUserId: replyDetails.replyMessageUserId,
        status: replyDetails.status,
      },
    }),
  });

  console.log('replyMessage:', newMessage);

  // Update conversation with new message
  conversation.messages.push(newMessage._id);
  await conversation.save();

  //   SOCKET.IO
  const receiverSocketId = getReceiverSocketId(receiverId);

  // send new message to receiver
  if (receiverSocketId) {
    io.to(receiverSocketId).emit('new_message', newMessage);
  }

  return res.status(201).json(new CustomResponse(201, newMessage));
});

// @DESC Get messages between the specific users
// @METHOD GET
// @PATH /message/:id (id - receiverId)
// @RETURN Array of messages belonging to the conversation between the users
export const getMessage = asyncErrorHandler(async (req, res, next) => {
  const receiverId = req.params.id;
  const senderId = req.user._id;

  // check status is seen , otherwise update status to seen
  const updateStatus = await Message.updateMany(
    {
      senderId: req.params.id, // only change status the message send by opposite user , in this case the getMessage called is receiver
      receiverId: req.user._id,
      status: { $ne: 'seen' },
    },
    {
      $set: { status: 'seen' },
    },
  );

  const conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
    isGroupChat: false,
  }).populate('messages');

  // the user call getMessage is sender and other is receiver thats why we use like this
  // actually receiverId is the senderId of message
  const socketId = getReceiverSocketId(receiverId);
  // send status update to sender
  if (updateStatus.modifiedCount > 0) {
    io.to(socketId).emit('message_status_update_from_backend_to_sender', conversation._id, 'seen');
  }

  return res.status(200).json(new CustomResponse(200, conversation?.messages));
});

// @DESC Send group messages and handle socket communication
// @METHOD POST
// @PATH /message/send-group/:id (id - groupId)
// @RETURN Created newMessage
export const sendGroupMessage = asyncErrorHandler(async (req, res, next) => {
  const senderId = req.user._id;
  const groupId = req.params.id;
  const { message, caption, messageReplyDetails } = req.body;

  console.log('here');
  console.log('messagroup:', message);
  console.log(messageReplyDetails);

  let replyDetails;
  if (messageReplyDetails && !messageReplyDetails?.status) {
    replyDetails = JSON.parse(messageReplyDetails);
  } else if (messageReplyDetails) {
    replyDetails = messageReplyDetails;
  }

  // split url and get extension (jpg, jpeg, mp4 etc)
  function getFileExtensionFromUrl(url) {
    const urlParts = url.split('/');
    if (urlParts.length === 0) {
      return null;
    }

    return urlParts;
    // return urlParts[urlParts.length - 1].split('?')[0].toLowerCase(); // Split on '?' to handle query parameters
  }

  // condition runs only when file is present
  let file;
  let urlParts;
  if (req.file?.path) {
    // extension for specify file type when upload file to cloudinary
    urlParts = getFileExtensionFromUrl(req.file?.mimetype);

    file = await uploadOnCloudinary(req.file?.path, urlParts[1]);

    if (!file?.url) {
      return res.status(500).json(new CustomError(500, 'Server error.'));
    }
  }

  // add all participants id to notification array and whenever the participant seen the message their id remove from notification
  // used to track whether participant seen the message or not and show notification
  const group = await Conversation.findById(groupId);

  const notifications = group.participants.filter(
    (participant) => !participant._id.equals(senderId),
  );

  let newMessage = await Message.create({
    senderId,
    groupId,
    message: {
      content: file ? file?.url : message,
      type: file ? urlParts[0] : 'text',
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
  conversation.messages.push(newMessage._id);
  await conversation.save();

  newMessage = await Message.aggregate([
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

  //   SOCKET.IO
  let socketIds = getSocketIds();

  conversation.participants.forEach((userId) => {
    // to prevent emit message to the senderItself
    if (req.user._id.equals(userId)) {
      return;
    }

    const socketId = socketIds[userId]; // Assuming userId directly corresponds to index in socketIds array
    if (socketId) {
      io.to(socketId).emit('new_message', newMessage[0]);
    }
  });

  res.status(201).json(new CustomResponse(201, newMessage[0]));
});

// @DESC Get group messages
// @METHOD GET
// @PATH /message/group/:id (id - groupId)
// @RETURN Array of group messages
export const getGroupMessage = asyncErrorHandler(async (req, res, next) => {
  const groupId = req.params.id;

  const check = await Message.updateMany(
    { groupId: groupId },
    { $pull: { notifications: req.user._id } },
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
  console.log('messagegroupK', conversation[0].messages);

  res.status(200).json(new CustomResponse(200, conversation[0].messages));
});

export const deleteMessage = asyncErrorHandler(async (req, res, next) => {
  const messageId = req.params.messageId;
  const id = req.params.id;

  const deletedMessage = await Message.findByIdAndUpdate(
    messageId,
    { $unset: { message: '', messageReplyDetails: '' } },
    { new: true },
  );

  if (!deletedMessage) {
    return res.status(500).json(new CustomError(500, 'Server error.'));
  }

  console.log(deletedMessage);

  if (deletedMessage?.conversationId) {
    //   SOCKET.IO
    const receiverSocketId = getReceiverSocketId(id);

    // send new message to receiver
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('message_deleted', deletedMessage._id);
    }
  } else {
    // SOCKET.IO
    let socketIds = getSocketIds();
    let conversation = await Conversation.findById(id);

    conversation.participants.forEach((userId) => {
      // to prevent emit message to the senderItself
      if (req.user._id.equals(userId)) {
        return;
      }

      const socketId = socketIds[userId]; // Assuming userId directly corresponds to index in socketIds array
      if (socketId) {
        io.to(socketId).emit('message_deleted', deletedMessage._id);
      }
    });
  }

  return res.status(201).json(new CustomResponse(201, 'Message deleted successfully'));
});
