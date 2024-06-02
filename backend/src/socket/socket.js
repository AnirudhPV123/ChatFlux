import { Server } from 'socket.io';

import express from 'express';
import http from 'http';

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
  console.log('her socket');
  const userId = socket.handshake.query.userId;
  if (userId !== undefined) {
    userSocketMap[userId] = socket.id;
  }

  io.emit('getOnlineUsers', Object.keys(userSocketMap));

  socket.on('disconnect', () => {
    delete userSocketMap[userId];
    io.emit('getOnlineUsers', Object.keys(userSocketMap));
  });
});

export { io, getReceiverSocketId };

// export{server,app}
