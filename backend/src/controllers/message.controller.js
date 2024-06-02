import { CustomResponse } from '../utils/CustomResponse.js';
import { asyncErrorHandler } from '../utils/asyncErrorHandler.js';
import { Conversation } from '../models/conversation.model.js';
import { Message } from '../models/message.model.js';
import { getReceiverSocketId, getSocketIds, io } from '../socket/socket.js';
import mongoose from 'mongoose';
import { User } from '../models/user.model.js';

// @DESC Send a message between users and handle socket communication
// @METHOD POST
// @PATH /message/send/:id (id - receiverId)
// @RETURN Created newMessage
export const sendMessage = asyncErrorHandler(async (req, res, next) => {
  const senderId = req.user._id;
  const receiverId = req.params.id;
  const { message } = req.body;

  // Find or create conversation between sender and receiver
  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [senderId, receiverId],
    });
  }

  const newMessage = await Message.create({ senderId, receiverId, message });

  // Update conversation with new message
  conversation.messages.push(newMessage._id);
  await conversation.save();

  //   SOCKET.IO
  const receiverSocketId = getReceiverSocketId(receiverId);

  if (receiverSocketId) {
    io.to(receiverSocketId).emit('newMessage', newMessage);
  }

  res.status(201).json(new CustomResponse(201, newMessage));
});

// @DESC Get messages between the specific users
// @METHOD GET
// @PATH /message/:id (id - receiverId)
// @RETURN Array of messages belonging to the conversation between the users
export const getMessage = asyncErrorHandler(async (req, res, next) => {
  const receiverId = req.params.id;
  const senderId = req.user._id;

  const conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  }).populate('messages');

  res.status(200).json(new CustomResponse(200, conversation?.messages));
});

// @DESC Send group messages and handle socket communication
// @METHOD POST
// @PATH /message/send-group/:id (id - groupId)
// @RETURN Created newMessage
export const sendGroupMessage = asyncErrorHandler(async (req, res, next) => {
  const senderId = req.user._id;
  const groupId = req.params.id;
  const { message } = req.body;

  let newMessage = await Message.create({ senderId, groupId, message });

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
    const socketId = socketIds[userId]; // Assuming userId directly corresponds to index in socketIds array
    if (socketId) {
      io.to(socketId).emit('newMessage', newMessage[0]);
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
                '$$message',
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
                        phonNumber: '$$sender.phoneNumber',
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
