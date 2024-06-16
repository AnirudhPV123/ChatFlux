import { Conversation } from '../models/conversation.model.js';
import { CustomError } from '../utils/CustomError.js';
import { CustomResponse } from '../utils/CustomResponse.js';
import { asyncErrorHandler } from '../utils/asyncErrorHandler.js';
import { getReceiverSocketId, getSocketIds, io } from '../socket/socket.js';
import mongoose from 'mongoose';
import { Message } from '../models/message.model.js';

const chatCommonAggregation = () => {
  return [
    {
      // lookup for the participants present
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

// @DESC Get all chats
// @METHOD GET
// @PATH /chat/
// @RETURN Array of chats
export const getAllChats = asyncErrorHandler(async (req, res, next) => {
  const messagesToStatusUpdate = await Message.find({
    receiverId: req.user._id,
    status: { $ne: 'seen' },
  });

  if (messagesToStatusUpdate.length > 0) {
    // update status to delivered if status is !seen
    await Message.updateMany(
      {
        receiverId: req.user._id,
        status: { $ne: 'seen' },
      },
      {
        $set: { status: 'delivered' },
      },
    );

    const conversationIds = await Conversation.aggregate([
      {
        $match: {
          participants: { $elemMatch: { $eq: req.user._id } }, // get all chats that have logged in user as a participant
          isGroupChat: false,
        },
      },
      {
        $project: {
          participants: 1,
        },
      },
      {
        $unwind: {
          path: '$participants',
        },
      },
      {
        $match: {
          participants: { $ne: req.user._id },
        },
      },
      {
        $project: {
          participants: 1,
        },
      },
    ]);

    //   SOCKET.IO
    let socketIds = getSocketIds();

    // send status update to sender
    conversationIds.forEach((conversation) => {
      const socketId = socketIds[conversation.participants];
      if (socketId) {
        io.to(socketId).emit(
          'message_status_update_from_backend_to_sender',
          conversation._id,
          'delivered',
        );
      }
    });
  }

  // get all chats with participants details and calculate notification based on status !seen
  // by getting chats like this one to one and group chat both notification created but from frontend for group notification not use
  const chats = await Conversation.aggregate([
    {
      $match: {
        participants: { $elemMatch: { $eq: req.user._id } }, // get all chats that have logged in user as a participant
        isGroupChat: false,
      },
    },
    {
      $sort: {
        updatedAt: -1,
      },
    },
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
                  { $eq: ['$receiverId', req.user._id] },
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
        participants: { $elemMatch: { $eq: req.user._id } }, // get all chats that have logged in user as a participant
        isGroupChat: true,
      },
    },
    {
      $sort: {
        updatedAt: -1,
      },
    },
    // {
    //   $project: {
    //     participants: 0,
    //   },
    // },
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
                  { $in: [req.user._id, '$notifications'] }, // filter messages where notifications contain userId
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

  // pushing group chats to one on one chat and combine then and return to frontend
  if (groupChats.length > 0) {
    groupChats.forEach((chat) => chats.push(chat));
  }

  // Configure options for setting cookies
  const options = {
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  };

  return res.status(200).json(new CustomResponse(200, chats, 'Chats fetched successfully'));
});

// @DESC Create new chat
// @METHOD POST
// @PATH /chat/c/:id (id - receiverId)
// @RETURN chat details
export const createAOneOnOneChat = asyncErrorHandler(async (req, res, next) => {
  const senderId = req.user._id;
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

  //   SOCKET.IO
  const receiverSocketId = getReceiverSocketId(receiverId);
  io.to(receiverSocketId).emit('newChat', chat[0]);

  return res.status(200).json(new CustomResponse(200, chat, 'Chat created Successfully'));
});

// @DESC Create group chat
// @METHOD POST
// @PATH /chat/group/
// @RETURN return group chat details
export const createAGroupChat = asyncErrorHandler(async (req, res, next) => {
  const { participants, groupName } = req.body;
  const groupAdmin = req.user._id;

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
    // ...chatCommonAggregation(),
  ]);

  console.log('gouprchatcreate', chat);

  let socketIds = getSocketIds();

  conversation.participants.forEach((userId) => {
    const socketId = socketIds[userId]; // Assuming userId directly corresponds to index in socketIds array
    if (socketId) {
      io.to(socketId).emit('newChat', chat[0]);
    }
  });

  res.status(200).json(new CustomResponse(200, chat, 'Group chat created Successfully'));
});

export const deleteChat = asyncErrorHandler(async (req, res, next) => {
  const id = req.params.id;

  const result = await Conversation.findByIdAndDelete(id);
  console.log('deleted', result);

  if (!result) {
    return res.status(500).json(new CustomError(500, 'Server error.'));
  }

  if (deleteChat?.isGroupChat) {
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
        io.to(socketId).emit('chat_deleted', deleteChat._id);
      }
    });
  } else {
    //   SOCKET.IO
    const receiverSocketId = getReceiverSocketId(id);

    // send new message to receiver
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('chat_deleted', deleteChat._id);
    }
  }

  return res.status(200).json(new CustomResponse(200, result, 'Chat deleted Successfully'));
});

// export const blockChat = asyncErrorHandler(async (req, res, next) => {
//   const chatId = req.params.id;
//   const userId = req.user._id;

//   console.log("here")

//   const result = await Conversation.findOneAndUpdate(
//     { _id: new mongoose.Types.ObjectId(chatId) },
//     {
//       $push: { block: { blockerId: userId } },
//     },
//     { new: true },
//   );
//   // const result = await Conversation.findById(chatId)

//   console.log(result)
// });

export const leaveGroup = asyncErrorHandler(async (req, res, next) => {
  const chatId = req.params.id;
  const userId = req.user._id;

  const result = await Conversation.findByIdAndUpdate(
    { _id: new mongoose.Types.ObjectId(chatId) },
    { $pull: { participants: userId } },
    { new: true },
  );

  if (result) {
    // SOCKET.IO
    let socketIds = getSocketIds();
    let conversation = await Conversation.findById(chatId);

    conversation.participants.forEach((userId) => {
      // to prevent emit message to the senderItself
      if (req.user._id.equals(userId)) {
        return;
      }

      const socketId = socketIds[userId]; // Assuming userId directly corresponds to index in socketIds array
      if (socketId) {
        io.to(socketId).emit('leave-group', userId, result._id);
      }
    });
  }

  return res
    .status(200)
    .json(new CustomResponse(200, { groupId: result?._id }, 'Leaved group Successfully'));
});

// do further optimzation
export const deleteGroup = asyncErrorHandler(async (req, res, next) => {
  const chatId = req.params.id;
  const userId = req.user._id;

  let conversation = await Conversation.findById(chatId);

  const result = await Conversation.findByIdAndDelete(chatId);

  if (result) {
    // SOCKET.IO
    let socketIds = getSocketIds();

    conversation.participants.forEach((userId) => {
      // to prevent emit message to the senderItself
      if (req.user._id.equals(userId)) {
        return;
      }

      const socketId = socketIds[userId]; // Assuming userId directly corresponds to index in socketIds array
      if (socketId) {
        io.to(socketId).emit('delete-group', result._id);
      }
    });
  }

  return res
    .status(200)
    .json(new CustomResponse(200, { groupId: result?._id }, 'Group deleted Successfully'));
});

export const groupMembersDetails = asyncErrorHandler(async (req, res, next) => {
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
        'membersDetails.userName': 1,
        'membersDetails.avatar': 1,
      },
    },
  ]);

  console.log('get groupmend', result);

  return res
    .status(200)
    .json(new CustomResponse(200, result, 'Group members details fetched Successfully'));
});

// almost same has leaveGroup
export const removeUserFromGroup = asyncErrorHandler(async (req, res, next) => {
  const chatId = req.params.groupId;
  const userId = req.params.userId;

  console.log('remove userId', userId);
  // do like this or if we get converstion after result we get only the updated conversation
  let conversation = await Conversation.findById(chatId);

  const result = await Conversation.findByIdAndUpdate(
    { _id: new mongoose.Types.ObjectId(chatId) },
    { $pull: { participants: userId } },
    { new: true },
  );

  console.log('redmo ', result);

  if (result) {
    // SOCKET.IO
    let socketIds = getSocketIds();

    conversation.participants.forEach((userId) => {
      // to prevent emit message to the senderItself
      if (req.user._id.equals(userId)) {
        return;
      }

      const socketId = socketIds[userId]; // Assuming userId directly corresponds to index in socketIds array
      if (socketId) {
        // userid and groupid
        io.to(socketId).emit('remove-user-from-group', req.params.userId, result._id);
      }
    });
  }

  return res
    .status(200)
    .json(new CustomResponse(200, { groupId: chatId }, 'User removed from group Successfully'));
});

export const addUserToGroup = asyncErrorHandler(async (req, res, next) => {
  const { groupId, userId } = req.params;
  console.log('groupId add', groupId);
  console.log('usrId add', groupId);
  let conversation = await Conversation.findById(groupId);

  const result = await Conversation.findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(groupId) },
    { $push: { participants: userId } },
    { new: true },
  );

  if (result) {
    // SOCKET.IO
    let socketIds = getSocketIds();

    conversation.participants.forEach((userId) => {
      // to prevent emit message to the senderItself
      if (req.user._id.equals(userId)) {
        return;
      }

      const socketId = socketIds[userId]; // Assuming userId directly corresponds to index in socketIds array
      if (socketId) {
        // userid and groupid
        io.to(socketId).emit('add-user-to-group', req.params.userId, result._id);
      }
    });
  }

  return res
    .status(200)
    .json(new CustomResponse(200, { groupId, userId }, 'User added to group Successfully'));
});

