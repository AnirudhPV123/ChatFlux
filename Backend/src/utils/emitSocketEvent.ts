import { getUserSocketId, io } from '@/socket/socket';

// Helper function for emitting socket events
const emitSocketEvent = async (userId: string, event: string, data: any, data2?: any) => {
  const socketId = await getUserSocketId(userId);
  if (socketId) {
    io.to(socketId).emit(event, data, data2);
  }
};

export default emitSocketEvent;
