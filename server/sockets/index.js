import { authSocket } from './authSocket.js';
import { setIO } from './ioInstance.js';
import logger from '../utils/logger.js';
import {
  createRoom,
  joinRoom,
  setReady,
  joinQueue,
  leaveQueue,
  sendChatMessage,
  broadcastTyping,
  handleDisconnect,
  handleReconnect,
} from './roomManager.js';

export function registerSocketHandlers(io) {
  setIO(io);
  io.use(authSocket);

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.user.username} (${socket.id})`);

    // If this user already has an in-progress battle (e.g. they refreshed
    // the battle page), rejoin them instead of leaving the old session to
    // time out into a forfeit.
    const resumed = handleReconnect(socket);
    if (resumed) socket.emit('battle:resume', resumed);

    socket.on('room:create', () => createRoom(socket));
    socket.on('room:join', ({ roomCode }) => joinRoom(socket, roomCode));
    socket.on('room:ready', ({ roomCode }) => setReady(socket, roomCode));

    socket.on('matchmaking:join', () => joinQueue(socket));
    socket.on('matchmaking:leave', () => leaveQueue(socket));

    socket.on('chat:send', ({ roomCode, message }) => sendChatMessage(socket, roomCode, message));
    socket.on('battle:typing', ({ roomCode }) => broadcastTyping(socket, roomCode));

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.user.username} (${socket.id})`);
      handleDisconnect(socket);
    });
  });
}
