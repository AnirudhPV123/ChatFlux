import { Server } from 'socket.io';
import { redisClient } from '@/config';

import express, { Application } from 'express';
import http from 'http';
import { Message } from '@/models/message.model';
import { User } from '@/models/user.model';

export const app: Application = express();
export const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    methods: ['GET', 'POST'],
  },
});

const storeUserSocketId = async (userId: string, socketId: string) => {
  await redisClient.hSet('userSockets', userId, socketId);
};

// Helper function for getting user socket id | used in emitSocketEvent - controllers
export const getUserSocketId = async (userId: string) => {
  return await redisClient.hGet('userSockets', userId);
};

const removeUserSocketId = async (userId: string) => {
  await redisClient.hDel('userSockets', userId);
};

const getAllSocketIds = async () => {
  return await redisClient.hKeys('userSockets');
};

io.on('connection', async (socket) => {
  console.log('A user connected:', socket.id);
  const userId = socket.handshake.query.userId as string;

  await removeUserSocketId(userId);
  await storeUserSocketId(userId, socket.id);

  io.emit('getOnlineUsers', await getAllSocketIds());

  // message status update from receiver and update DB and send status to sender
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
          const userSocketId = await getUserSocketId(updateStatus.senderId.toString());
          if (userSocketId) {
            io.to(userSocketId).emit(
              'message_status_update_from_backend_to_sender',
              conversationId,
              status,
            );
          }
        }
      })();
    },
  );

  // when a participant seen the message , remove participant id from notification array
  socket.on('new_message_status_update_from_group_participant_to_backend', (newMessageId) => {
    (async function () {
      await Message.findByIdAndUpdate(
        newMessageId,
        {
          $pull: { notifications: userId }, // Remove userId from notifications array
        },
        { new: true },
      );
    })();
  });

  // Call logics
  socket.on('user:call', async ({ toUserId, offer,isVideo }) => {
    const toSocketId = await getUserSocketId(toUserId);
    const callerDetails = await User.findById(userId);
    if (toSocketId) {
      io.to(toSocketId).emit('incoming:call', { from: socket.id, offer, callerDetails,isVideo });
      io.to(socket.id).emit('user:socket:id', { to: toSocketId });
    }
  });

  socket.on('call:accepted', ({ to, ans }) => {
    io.to(to).emit('call:accepted', { from: socket.id, ans });
  });

  socket.on('peer:nego:needed', async ({ to, offer }) => {
    io.to(to).emit('peer:nego:needed', {
      from: socket.id,
      offer,
    });
  });

  socket.on('peer:nego:done', ({ to, ans }) => {
    io.to(to).emit('peer:nego:done', {
      from: socket.id,
      ans,
    });
  });

  socket.on('call:hangup', ({ to }) => {
    io.to(to).emit('call:hangup');
  });

  socket.on('call:rejected', ({ to }) => {
    io.to(to).emit('call:rejected');
  });

  socket.on('call:stop', ({ to }) => {
    io.to(to).emit('call:stop');
  });

  // end

  socket.on('disconnect', async () => {
    console.log('user disconnected');
    removeUserSocketId(userId);
    io.emit('getOnlineUsers', await getAllSocketIds());
  });
});

export { io };
