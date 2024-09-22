import { Conversation } from '@/models/conversation.model';
import { Message } from '@/models/message.model';
import { asyncHandler, CustomError, CustomResponse, emitSocketEvent } from '@/utils';
import mongoose from 'mongoose';

// Common aggregation for chat participants
const chatCommonAggregation = () => {
  return [
    {
      $lookup: {
        from: 'users',
        foreignField: '_id',
        localField: 'participants',
        as: 'participants',
        pipeline: [
          {
            $project: {
              password: 0,
              refreshToken: 0,
              phoneNumber: 0,
              gender: 0,
              isActive: 0,
            },
          },
        ],
      },
    },
  ];
};

// Create one-on-one chat
export const createAOneOnOneChat = asyncHandler(async (req, res, next) => {
  const senderId = (req.user as any)._id;
  const receiverId = req.params.id;

  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
    isGroupChat: false,
  });

  if (conversation && conversation?.isGroupChat === false) {
    return next(new CustomError(400, 'Chat already exist'));
  }

  conversation = await Conversation.create({
    participants: [senderId, receiverId],
  });

  const chat = await Conversation.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(conversation._id),
      },
    },
    {
      $project: { messages: 0 },
    },
    ...chatCommonAggregation(),
  ]);

  await emitSocketEvent(receiverId, 'new-chat', chat[0]);
  return res.status(200).json(new CustomResponse(200, chat, 'Chat created Successfully'));
});

// Create group chat
export const createAGroupChat = asyncHandler(async (req, res, next) => {
  const { participants, groupName } = req.body;
  const groupAdmin = (req.user as any)._id;

  const conversation = await Conversation.create({
    participants: [groupAdmin, ...participants],
    isGroupChat: true,
    groupName,
    groupAdmin,
  });

  const chat = await Conversation.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(conversation._id),
      },
    },
    {
      $project: { messages: 0 },
    },
  ]);

  await Promise.all(
    conversation.participants.map((userId) => {
      // to prevent emit message to the senderItself
      if (groupAdmin.equals(userId)) {
        return;
      }
      emitSocketEvent(userId.toString(), 'new-chat', chat[0]);
    }),
  );

  return res.status(200).json(new CustomResponse(200, chat, 'Group chat created Successfully'));
});

// Get all chats
export const getAllChats = asyncHandler(async (req, res, next) => {
  const userId = (req.user as any)._id;

  // update message status to delivered when receiver is online
  await Message.updateMany(
    { receiverId: userId, status: { $ne: 'seen' } },
    { $set: { status: 'delivered' } },
  );

  const participantsIds = await Conversation.aggregate([
    {
      $match: {
        participants: { $elemMatch: { $eq: userId } },
        isGroupChat: false,
      },
    },
    { $project: { participants: 1 } },
    { $unwind: { path: '$participants' } },
    { $match: { participants: { $ne: userId } } },
    { $project: { participants: 1 } },
    { $project: { id: `$participants` } },
  ]);

  // update message status to delivered when receiver is online
  await Promise.all(
    participantsIds.map(async ({ id, _id: conversationId }) => {
      if (userId === id) {
        return;
      }
      emitSocketEvent(
        id.toString(),
        'message_status_update_from_backend_to_sender',
        conversationId?.toString(),
        'delivered',
      );
    }),
  );

  // get all chats with participants details and calculate notification based on status !seen
  const chats = await Conversation.aggregate([
    {
      $match: {
        participants: { $elemMatch: { $eq: userId } }, // get all chats that have logged in user as a participant and isGroupChat false
        isGroupChat: false,
      },
    },
    { $sort: { updatedAt: -1 } },
    {
      $lookup: {
        from: 'users',
        localField: 'participants',
        foreignField: '_id',
        as: 'participants',
      },
    },
    {
      $project: {
        'participants.password': 0,
        'participants.refreshToken': 0,
        'participants.phoneNumber': 0,
        'participants.gender': 0,
        'participants.isActive': 0,
      },
    },
    {
      $lookup: {
        from: 'messages',
        let: { messages: '$messages' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ['$_id', '$$messages'] },
                  { $eq: ['$receiverId', userId] },
                  { $ne: ['$status', 'seen'] }, // filter by not seen status
                ],
              },
            },
          },
          {
            $sort: {
              createdAt: 1, // sort messages by createdAt in ascending order
            },
          },
        ],
        as: 'messages',
      },
    },
    {
      $addFields: {
        notification: { $size: '$messages' },
        lastMessageTime: { $arrayElemAt: ['$messages.createdAt', -1] },
      },
    },
    {
      $project: {
        messages: 0,
      },
    },
  ]);

  const groupChats = await Conversation.aggregate([
    {
      $match: {
        participants: { $elemMatch: { $eq: userId } }, // get all chats that have logged in user as a participant and isGroupChat
        isGroupChat: true,
      },
    },
    { $sort: { updatedAt: -1 } },
    {
      $lookup: {
        from: 'messages',
        let: { messages: '$messages' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ['$_id', '$$messages'] },
                  { $in: [userId, '$notifications'] }, // filter messages where notifications contain userId
                ],
              },
            },
          },
          {
            $sort: {
              createdAt: 1, // sort messages by createdAt in ascending order
            },
          },
        ],
        as: 'messages',
      },
    },
    {
      $addFields: {
        notification: { $size: '$messages' },
        lastMessageTime: { $arrayElemAt: ['$messages.createdAt', -1] },
      },
    },
  ]);

  // combine both one-on-one and group chats
  const allChats = [...chats, ...groupChats];

  return res.status(200).json(new CustomResponse(200, allChats, 'Chats fetched successfully'));
});

// get group members details for profile click
export const groupMembersDetails = asyncHandler(async (req, res, next) => {
  const chatId = req.params.id;

  const result = await Conversation.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(chatId) } },
    {
      $lookup: {
        from: 'users',
        localField: 'participants',
        foreignField: '_id',
        as: 'membersDetails',
      },
    },
    {
      $project: {
        membersDetails: 1,
        groupAdmin: 1,
        isGroupChat: 1,
      },
    },
    {
      $project: {
        isGroupChat: 1,
        groupAdmin: 1,

        'membersDetails._id': 1,
        'membersDetails.username': 1,
        'membersDetails.avatar': 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new CustomResponse(200, result, 'Group members details fetched Successfully'));
});

// Delete chat
export const deleteChat = asyncHandler(async (req, res, next) => {
  const chatId = req.params.id;
  const userId = req.params.userId; // opposite userId

  const result = await Conversation.findByIdAndDelete(chatId);

  if (!result) {
    return res.status(500).json(new CustomError(500, 'Server error.'));
  }

  await emitSocketEvent(userId, 'chat_deleted', result._id);

  return res.status(200).json(new CustomResponse(200, result, 'Chat deleted Successfully'));
});

// Add user to a group
export const addUserToGroup = asyncHandler(async (req, res, next) => {
  const { groupId, userId: newUserId } = req.params;
  const adminId = (req.user as any)._id;

  const result = await Conversation.findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(groupId) },
    { $push: { participants: newUserId } },
    { new: true },
  );

  if (!result) {
    throw new CustomError(500, 'Server error.');
  }

  // SOCKET.IO
  await Promise.all(
    result.participants.map((id) => {
      // to prevent emit message to the senderItself
      if (adminId.equals(id)) {
        return;
      }
      if (id.toString() === newUserId) {
        emitSocketEvent(id.toString(), 'add-user-to-group', newUserId, result);
      } else {
        emitSocketEvent(id.toString(), 'add-user-to-group', newUserId, result._id);
      }
    }),
  );

  return res
    .status(200)
    .json(new CustomResponse(200, { groupId, newUserId }, 'User added to group Successfully'));
});

// Delete group
export const deleteGroup = asyncHandler(async (req, res, next) => {
  const chatId = req.params.id;
  const adminId = (req.user as any)._id;

  let conversation = await Conversation.findById(chatId);

  const result = await Conversation.findByIdAndDelete(chatId);

  if (!result) {
    throw new CustomError(500, 'Server error.');
  }
  // SOCKET.IO
  conversation?.participants.forEach(async (id) => {
    if (adminId.equals(id)) {
      return;
    }

    await emitSocketEvent(id.toString(), 'delete-group', result._id);
  });

  return res
    .status(200)
    .json(new CustomResponse(200, { groupId: result?._id }, 'Group deleted Successfully'));
});

export const leaveGroup = asyncHandler(async (req, res, next) => {
  const chatId = req.params.id;
  const userId = (req.user as any)._id;

  const result = await Conversation.findByIdAndUpdate(
    { _id: new mongoose.Types.ObjectId(chatId) },
    { $pull: { participants: userId } },
    { new: true },
  );

  if (!result) {
    throw new CustomError(500, 'Server error.');
  }

  // SOCKET.IO
  result?.participants.forEach(async (id) => {
    if (userId === id) {
      return;
    }

    await emitSocketEvent(id.toString(), 'leave-group', userId, result._id.toString());
  });

  return res
    .status(200)
    .json(new CustomResponse(200, { groupId: result?._id }, 'Leaved group Successfully'));
});

// almost same has leaveGroup
export const removeUserFromGroup = asyncHandler(async (req, res, next) => {
  const chatId = req.params.groupId;
  const removeUserId = req.params.userId;
  const adminId = (req.user as any)._id;

  const result = await Conversation.findByIdAndUpdate(
    { _id: new mongoose.Types.ObjectId(chatId) },
    { $pull: { participants: removeUserId } },
  );

  if (!result) {
    throw new CustomError(500, 'Server error.');
  }

  // SOCKET.IO
  await Promise.all(
    result.participants.map((id) => {
      if (adminId === id.toString()) {
        return;
      }
      emitSocketEvent(id.toString(), 'remove-user-from-group', removeUserId, result._id);
    }),
  );

  return res
    .status(200)
    .json(new CustomResponse(200, { groupId: chatId }, 'User removed from group Successfully'));
});
