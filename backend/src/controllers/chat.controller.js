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
        // isGroupChat: false,
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
    ...chatCommonAggregation(),
  ]);

  let socketIds = getSocketIds();

  conversation.participants.forEach((userId) => {
    const socketId = socketIds[userId]; // Assuming userId directly corresponds to index in socketIds array
    if (socketId) {
      io.to(socketId).emit('newChat', chat[0]);
    }
  });

  res.status(200).json(new CustomResponse(200, chat, 'Group chat created Successfully'));
});
