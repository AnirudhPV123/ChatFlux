import { Server } from 'socket.io';
import { redisClient } from '@/config/redisConfig';

import express, { Application } from 'express';
import http from 'http';
import { Conversation } from '@/models/conversation.model';
import mongoose from 'mongoose';
import { Message } from '@/models/message.model';

export const app: Application = express();
export const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    methods: ['GET', 'POST'],
  },
});

const userSocketMap = new Map();

const addSocketForUser = (userId: string, socketId: string) => {
  userSocketMap.set(userId, socketId);
};

const removeSocketForUser = (userId: string) => {
  userSocketMap.delete(userId);
};

const getSocketForUser = (userId: string) => {
  return userSocketMap.get(userId);
};

// Function to get all online users
const getOnlineUsers = () => {
  return Array.from(userSocketMap.keys());
};

io.on('connection', async (socket) => {
  console.log('A user connected:', socket.id);
  const userId = socket.handshake.query.userId as string;

  // just tesing
  removeSocketForUser(userId);
  addSocketForUser(userId, socket.id);

  if (userId) {
    try {
      await redisClient.del(userId as string);
      await redisClient.setEx(userId as string, 60 * 60, socket.id as string);
      socket.emit('welcome', { message: 'Welcome to the server socket io!' });
    } catch (error) {
      console.error('Error setting Redis value:', error);
    }
  }

  // console.log('fuck;', getOnlineUsers());
  // const socketIDS = getOnlineUsers();
  // io.emit('getOnlineUsers', socketIDS);
  // io.emit('getOnlineUsers', {message:"done"});

  // extra codes

  // send online status to the users who the user connected
  // const sendOnlineUsers = await Conversation.aggregate([
  //   {
  //     $match: {
  //       isGroupChat: false,
  //       participants: new mongoose.Types.ObjectId(userId),
  //     },
  //   },
  //   {
  //     $project: {
  //       _id: 1, // Include only the _id
  //       participantId: {
  //         $arrayElemAt: [
  //           {
  //             $filter: {
  //               input: '$participants',
  //               as: 'participant',
  //               cond: { $ne: ['$$participant', userId] }, // Filter out the userId
  //             },
  //           },
  //           0, // Get the first element of the filtered array
  //         ],
  //       },
  //     },
  //   },
  // ]);

  // console.log('userid', userId);
  // console.log('cahts:', sendOnlineUsers);

  // sendOnlineUsers.forEach(async ({ participantId }) => {
  //   const userSocketId = await redisClient.get(participantId.toString());
  //   console.log('userSocketIdlk,', userSocketId);
  //   if (userSocketId) {
  //     io.to(userSocketId).emit('getOnlineUsers', userId);
  //   }
  // });

  // end

  io.emit('getOnlineUsers', getOnlineUsers());

  // new message status update send from receiver to backend
  // update Message status in DB
  // send update status to message sender
  socket.on(
    'new_message_status_update_from_receiver_to_backend',
    (messageId, conversationId, status) => {
      (async function () {
        // update message status in DB
        const updateStatus = await Message.findByIdAndUpdate(
          messageId,
          { status: status },
          { new: true },
        );

        // send update to sender
        if (updateStatus) {
          // getting sender socket id from updateStatus.senderId
          const userSocketId = getSocketForUser(updateStatus.senderId.toString());
          io.to(userSocketId).emit(
            'message_status_update_from_backend_to_sender',
            conversationId,
            status,
          );
        }
      })();
    },
  );

  // when a participant seen the message , remove participant id from notification array
  socket.on('new_message_status_update_from_group_participant_to_backend', (newMessageId) => {
    (async function () {
      const updatedMessage = await Message.findByIdAndUpdate(
        newMessageId,
        {
          $pull: { notifications: userId }, // Remove userId from notifications array
        },
        { new: true },
      );
    })();
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    removeSocketForUser(userId);
    io.emit('getOnlineUsers', getOnlineUsers());
  });
});

export { io };
