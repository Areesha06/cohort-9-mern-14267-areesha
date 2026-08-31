import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';

let io;

export const authenticateSocket = (socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error('Authentication required'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (error) {
    next(new Error('Invalid or expired token'));
  }
};

export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
    },
  });

  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    socket.join(`user:${socket.userId}`);
    logger.info(`Socket connected: user ${socket.userId} (socket ${socket.id})`);

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: user ${socket.userId} (socket ${socket.id})`);
    });
  });

  return io;
};

export const emitToUser = (userId, event, payload) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
};
