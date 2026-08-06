import { addGroupMessage } from '../services/firestore.service.js';

export const registerChatHandlers = (io, socket) => {
  const user = socket.user;

  // Join a group chat room
  socket.on('group:join', ({ groupId }) => {
    if (!groupId) return;
    const roomName = `group_${groupId}`;
    socket.join(roomName);
    console.log(`👤 User ${user.uid} (${user.name}) joined room ${roomName}`);
  });

  // Leave a group chat room
  socket.on('group:leave', ({ groupId }) => {
    if (!groupId) return;
    const roomName = `group_${groupId}`;
    socket.leave(roomName);
    console.log(`👤 User ${user.uid} (${user.name}) left room ${roomName}`);
  });

  // Handle incoming message
  socket.on('group:message', async ({ groupId, text }) => {
    try {
      if (!groupId || !text || typeof text !== 'string' || !text.trim()) {
        return socket.emit('error', { message: 'Invalid message content or groupId' });
      }

      const roomName = `group_${groupId}`;

      // Write message to Firestore subcollection
      const message = await addGroupMessage(groupId, {
        text: text.trim(),
        authorUid: user.uid,
        authorName: user.name || 'Anonymous',
      });

      // Broadcast saved message to everyone in room including sender
      io.to(roomName).emit('group:message', message);
    } catch (error) {
      console.error('Error handling group:message socket event:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Ephemeral typing indicator broadcast
  socket.on('group:typing', ({ groupId, isTyping }) => {
    if (!groupId) return;
    const roomName = `group_${groupId}`;
    socket.to(roomName).emit('group:typing', {
      groupId,
      uid: user.uid,
      authorName: user.name || 'Anonymous',
      isTyping: !!isTyping,
    });
  });
};
