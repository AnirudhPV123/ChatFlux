import { redisClient } from '@/config/redisConfig';
import { Conversation } from '@/models/conversation.model';
import { io } from '@/socket/socket';
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
// @PATH /chat/one-on-one/:id (id - receiverId)
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

  //   SOCKET.IO
  const receiverSocketId = await redisClient.get(receiverId);
  if (receiverSocketId) {
    io.to(receiverSocketId).emit('new-chat', chat[0]);
  }

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

  conversation.participants.forEach(async (userId) => {
    const socketId = await redisClient.get(userId.toString()); // Assuming userId directly corresponds to index in socketIds array
    if (socketId) {
      io.to(socketId).emit('new-chat', chat[0]);
    }
  });

  return res.status(200).json(new CustomResponse(200, chat, 'Group chat created Successfully'));
});

// @DESC Get all chats
// @METHOD GET
// @PATH /chat/
// @RETURN Array of chats
export const getAllChats = asyncHandler(async (req, res, next) => {
  // TODO: This part is used to update status to delivered if status is !seen or when the user open the application | this getAllChats always calls when user open the application

  const userId = (req.user as any)._id;

  //   const messagesToStatusUpdate = await Message.find({
  //     receiverId: req.user._id,
  //     status: { $ne: 'seen' },
  //   });

  //   if (messagesToStatusUpdate.length > 0) {
  //     // update status to delivered if status is !seen
  //     await Message.updateMany(
  //       {
  //         receiverId: req.user._id,
  //         status: { $ne: 'seen' },
  //       },
  //       {
  //         $set: { status: 'delivered' },
  //       },
  //     );

  //     const conversationIds = await Conversation.aggregate([
  //       {
  //         $match: {
  //           participants: { $elemMatch: { $eq: req.user._id } }, // get all chats that have logged in user as a participant
  //           isGroupChat: false,
  //         },
  //       },
  //       {
  //         $project: {
  //           participants: 1,
  //         },
  //       },
  //       {
  //         $unwind: {
  //           path: '$participants',
  //         },
  //       },
  //       {
  //         $match: {
  //           participants: { $ne: userId },
  //         },
  //       },
  //       {
  //         $project: {
  //           participants: 1,
  //         },
  //       },
  //     ]);

  //     //   SOCKET.IO
  //     //   let socketIds = getSocketIds();

  //     //   // send status update to sender
  //     //   conversationIds.forEach((conversation) => {
  //     //     const socketId = socketIds[conversation.participants];
  //     //     if (socketId) {
  //     //       io.to(socketId).emit(
  //     //         'message_status_update_from_backend_to_sender',
  //     //         conversation._id,
  //     //         'delivered',
  //     //       );
  //     //     }
  //     //   });
  //   }

  // get all chats with participants details and calculate notification based on status !seen
  // by getting chats like this one to one and group chat both notification created but from frontend for group notification not use

  const chats = await Conversation.aggregate([
    {
      $match: {
        participants: { $elemMatch: { $eq: userId } }, // get all chats that have logged in user as a participant
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
        participants: { $elemMatch: { $eq: userId } }, // get all chats that have logged in user as a participant
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

  // pushing group chats to one on one chat and combine then and return to frontend
  if (groupChats.length > 0) {
    groupChats.forEach((chat) => chats.push(chat));
  }

  // console.log('final chats', chats);

  return res.status(200).json(new CustomResponse(200, chats, 'Chats fetched successfully'));
});


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
