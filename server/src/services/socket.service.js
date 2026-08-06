import { Server } from 'socket.io';
import { auth } from '../config/firebase.js';
import config from '../config/env.js';
import { registerChatHandlers } from '../sockets/chat.socket.js';

export const initSocketService = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: config.clientOrigin,
      credentials: true,
    },
  });

  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split('Bearer ')[1];

      if (!token) {
        return next(new Error('Authentication error: Token required'));
      }

      const decodedToken = await auth.verifyIdToken(token);
      socket.user = {
        uid: decodedToken.uid,
        email: decodedToken.email || '',
        name: decodedToken.name || decodedToken.email || 'Anonymous',
        photoURL: decodedToken.picture || '',
        admin: !!decodedToken.admin,
      };

      next();
    } catch (error) {
      console.error('Socket authentication failed:', error.message);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Socket connection lifecycle
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected to Socket.io: ${socket.id} (UID: ${socket.user?.uid})`);

    registerChatHandlers(io, socket);

    socket.on('disconnect', (reason) => {
      console.log(`🔌 Client disconnected from Socket.io: ${socket.id} (${reason})`);
    });
  });

  return io;
};
