import { Server } from 'socket.io';
import { redisClient } from '@/config';

import express, { Application } from 'express';
import http from 'http';
import { Message } from '@/models/message.model';
import { User } from '@/models/user.model';
import { Call } from '@/models/call.model';
import { Conversation } from '@/models/conversation.model';

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

// New function to get userId based on socketId
export const getUserIdBySocketId = async (socketId: string) => {
  const userSockets = await redisClient.hGetAll('userSockets');

  for (const [userId, storedSocketId] of Object.entries(userSockets)) {
    if (storedSocketId === socketId) {
      return userId;
    }
  }
  return null;
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
  socket.on('user:call', async ({ toUserId, offer, isVideo }) => {
    const toSocketId = await getUserSocketId(toUserId);
    const callerDetails = await User.findById(userId);
    const conversation = await Conversation.find({
      isGroupChat: false,
      participants: { $all: [userId, toUserId] },
    });

    const call = await Call.create({
      callerId: userId,
      attenderId: toUserId,
      isVideo,
      isAttend: false,
      conversationId: conversation[0]._id,
    });

    if (toSocketId) {
      io.to(toSocketId).emit('incoming:call', {
        from: socket.id,
        offer,
        callerDetails,
        isVideo,
        callId: call._id,
      });
      io.to(socket.id).emit('user:socket:id', { to: toSocketId, callId: call._id });
    }
  });

  socket.on('call:accepted', async ({ to, ans, callId }) => {
    io.to(to).emit('call:accepted', { from: socket.id, ans });
    await Call.findOneAndUpdate({ _id: callId }, { isAttend: true });
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

  socket.on('call:hangup', async ({ to, callId }) => {
    const callDetails = await Call.findOne({ _id: callId });
    console.log(callDetails);
    console.log('call', callId);

    io.to(to).emit('call:hangup');
    io.to(socket.id).emit('new:call', callDetails);
    io.to(to).emit('new:call', callDetails);
  });

  socket.on('call:rejected', async ({ to, callId }) => {
    io.to(to).emit('call:rejected');
    const callDetails = await Call.findOne({ _id: callId });

    io.to(socket.id).emit('new:call', callDetails);
    io.to(to).emit('new:call', callDetails);
  });

  socket.on('call:stop', async ({ to, callId }) => {
    io.to(to).emit('call:stop');
    if (callId) {
      const callDetails = await Call.findOne({ _id: callId });

      io.to(socket.id).emit('new:call', callDetails);
      io.to(to).emit('new:call', callDetails);
    }
  });

  // end

  socket.on('disconnect', async () => {
    console.log('user disconnected');
    removeUserSocketId(userId);
    io.emit('getOnlineUsers', await getAllSocketIds());
  });
});

export { io };
