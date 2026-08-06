import http from 'http';
import app from './app.js';
import config from './config/env.js';
import { initSocketService } from './services/socket.service.js';

const server = http.createServer(app);

// Initialize Socket.io server
initSocketService(server);

const PORT = config.port;

server.listen(PORT, () => {
  console.log(`🚀 Mandhikkindo server running on port ${PORT}`);
  console.log(`🌐 Allowed Client Origin: ${config.clientOrigin}`);
});

// Handle uncaught exceptions and rejections gracefully
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
});
