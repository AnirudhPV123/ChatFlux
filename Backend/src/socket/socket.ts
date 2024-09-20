import { Server } from 'socket.io';
import { redisClient } from '@/config/redisConfig';

import express, { Application } from 'express';
import http from 'http';

export const app: Application = express();
export const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    methods: ['GET', 'POST'],
  },
});

io.on('connection', async (socket) => {
  console.log('A user connected:', socket.id);
  const userId = socket.handshake.query.userId as string;

  if (userId) {
    try {
      await redisClient.setEx(userId as string, 60 * 60, socket.id as string);
      socket.emit('welcome', { message: 'Welcome to the server socket io!' });
    } catch (error) {
      console.error('Error setting Redis value:', error);
    }
  }

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

export { io };
