import { Conversation } from '../models/conversation.model.js';
import { User } from '../models/user.model.js';
import { CustomError } from '../utils/CustomError.js';
import { CustomResponse } from '../utils/CustomResponse.js';
import { asyncErrorHandler } from '../utils/asyncErrorHandler.js';
import { getReceiverSocketId, getSocketIds, io } from '../socket/socket.js';
import mongoose from 'mongoose';

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
  const chats = await Conversation.aggregate([
    {
      $match: {
        participants: { $elemMatch: { $eq: req.user._id } }, // get all chats that have logged in user as a participant
      },
    },
    {
      $sort: {
        updatedAt: -1,
      },
    },
    {
      $project: { messages: 0 },
    },
    ...chatCommonAggregation(),
  ]);

  // Configure options for setting cookies
  const options = {
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  };

  console.log(chats);

  res.status(200).json(new CustomResponse(200, chats, 'Chats fetched successfully'));
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
      console.log('socketID:', socketId);
      io.to(socketId).emit('newChat', chat[0]);
    }
  });

  res.status(200).json(new CustomResponse(200, chat, 'Group chat created Successfully'));
});
