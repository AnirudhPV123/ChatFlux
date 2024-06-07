import { Server } from 'socket.io';
import express from 'express';
import http from 'http';
import { Message } from '../models/message.model.js';

export const app = express();
export const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    methods: ['GET', 'POST'],
  },
});

const userSocketMap = {}; // {userId->socketId}

const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

export const getSocketIds = () => {
  return userSocketMap;
};
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  const userId = socket.handshake.query.userId;
  if (userId !== undefined) {
    userSocketMap[userId] = socket.id;
  }

  io.emit('getOnlineUsers', Object.keys(userSocketMap));

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
          io.to(userSocketMap[updateStatus.senderId]).emit(
            'message_status_update_from_backend_to_sender',
            conversationId,
            status,
          );
        }
      })();
    },
  );

  // when a participant seen the message , remove participant id from notification array
  socket.on(
    'new_message_status_update_from_group_participant_to_backend',
    (newMessageId) => {
      (async function () {
        const updatedMessage = await Message.findByIdAndUpdate(
          newMessageId,
          {
            $pull: { notifications: userId }, // Remove userId from notifications array
          },
          { new: true },
        );
      })()
    },
  );

  socket.on('disconnect', () => {
    delete userSocketMap[userId];
    io.emit('getOnlineUsers', Object.keys(userSocketMap));
  });
});

export { io, getReceiverSocketId };
