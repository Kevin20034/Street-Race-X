import { Server } from 'socket.io';

let io: Server | null = null;

export const setSocketServer = (server: Server): void => {
  io = server;
};

export const getSocketServer = (): Server | null => {
  return io;
};

export const emitToUser = (userId: string, event: string, payload: unknown): void => {
  if (!io) {
    return;
  }

  io.to(`user:${userId}`).emit(event, payload);
};
