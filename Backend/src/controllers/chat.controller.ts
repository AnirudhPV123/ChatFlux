import { Conversation } from '@/models/conversation.model';
import { asyncHandler } from '@/utils/asyncHandler';
import { CustomError } from '@/utils/CustomError';
import { CustomResponse } from '@/utils/CustomResponse';
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

// @DESC Create new chat
// @METHOD POST
// @PATH /chat/c/:id (id - receiverId)
// @RETURN chat details
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

//   TODO: testing remove this code
  await Conversation.findByIdAndDelete(conversation._id);

  //   SOCKET.IO
  //   const receiverSocketId = getReceiverSocketId(receiverId);
  //   io.to(receiverSocketId).emit('newChat', chat[0]);

  return res.status(200).json(new CustomResponse(200, chat, 'Chat created Successfully'));
});

// @DESC Create group chat
// @METHOD POST
// @PATH /chat/group/
// @RETURN return group chat details
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
    // ...chatCommonAggregation(),
  ]);

  console.log('gouprchatcreate', chat);

  //   let socketIds = getSocketIds();

  //   conversation.participants.forEach((userId) => {
  //     const socketId = socketIds[userId]; // Assuming userId directly corresponds to index in socketIds array
  //     if (socketId) {
  //       io.to(socketId).emit('newChat', chat[0]);
  //     }
  //   });

  return res.status(200).json(new CustomResponse(200, chat, 'Group chat created Successfully'));
});
