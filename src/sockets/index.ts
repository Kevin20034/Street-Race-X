import { Server } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { env } from '../config/env';
import { setSocketServer } from './socket.manager';
import { verifyToken } from '../utils/jwt';

export const configureSockets = (httpServer: Server): SocketIOServer => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.clientUrl,
      credentials: true,
    },
  });

  setSocketServer(io);

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token || typeof token !== 'string') {
      next(new Error('Authentication token is required'));
      return;
    }

    try {
      const payload = verifyToken(token);

      socket.data.user = {
        userId: payload.userId,
        role: payload.role,
      };

      next();
    } catch {
      next(new Error('Invalid or expired socket token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.user.userId;

    socket.join(`user:${userId}`);

    socket.emit('socket:connected', {
      userId,
      message: 'Connected to Street Race X realtime server',
    });
  });

  return io;
};
