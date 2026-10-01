import { authSocket } from './authSocket.js';
import { setIO } from '../../core/io.js';
import { createSocketLimiter } from '../../core/socketLimits.js';
import { markOnline, markOffline } from '../../core/presence.js';
import logger from '../../core/utils/logger.js';
import { registerFriendSocketHandlers } from '../friends/friendSockets.js';
import {
  createRoom,
  joinRoom,
  setReady,
  joinQueue,
  leaveQueue,
  sendChatMessage,
  broadcastTyping,
  recordSnapshot,
  requestRematch,
  acceptRematch,
  declineRematch,
  joinSpectators,
  leaveSpectators,
  claimBattle,
  handleDisconnect,
  handleReconnect,
} from './roomManager.js';

// Every client event goes through here: payloads are normalized to an
// object, the per-socket rate limit is applied, and a handler error is
// logged instead of crashing the process.
function guarded(socket, allow) {
  return (event, handler) => {
    socket.on(event, (payload) => {
      if (!allow(event)) {
        if (event === 'chat:send') socket.emit('chat:rateLimited', { message: 'Slow down - too many messages.' });
        return;
      }
      Promise.resolve()
        .then(() => handler(payload && typeof payload === 'object' ? payload : {}))
        .catch((err) => logger.error(`[Socket] ${event} failed for ${socket.user.username}: ${err.message}`));
    });
  };
}

export function registerSocketHandlers(io) {
  setIO(io);
  io.use(authSocket);

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    markOnline(userId, socket.id);
    logger.info(`Socket connected: ${socket.user.username} (${socket.id})`);

    // If this user has a battle and no other live connection for it (e.g.
    // they refreshed the battle page), rejoin them instead of leaving the
    // old session to time out into a forfeit.
    const resumed = handleReconnect(socket);
    if (resumed) socket.emit('battle:resume', resumed);

    const on = guarded(socket, createSocketLimiter());

    on('room:create', () => createRoom(socket));
    on('room:join', ({ roomCode }) => joinRoom(socket, roomCode));
    on('room:ready', ({ roomCode }) => setReady(socket, roomCode));
    on('battle:claim', ({ roomCode }) => claimBattle(socket, roomCode));

    on('matchmaking:join', () => joinQueue(socket));
    on('matchmaking:leave', () => leaveQueue(socket));

    on('chat:send', ({ roomCode, message }) => sendChatMessage(socket, roomCode, message));
    on('battle:typing', ({ roomCode }) => broadcastTyping(socket, roomCode));
    on('battle:snapshot', (payload) => recordSnapshot(socket, payload));

    on('rematch:request', (payload) => requestRematch(socket, payload));
    on('rematch:accept', (payload) => acceptRematch(socket, payload));
    on('rematch:decline', (payload) => declineRematch(socket, payload));

    on('spectate:join', (payload) => joinSpectators(socket, payload));
    on('spectate:leave', (payload) => leaveSpectators(socket, payload));

    registerFriendSocketHandlers(socket, on);

    socket.on('disconnect', () => {
      markOffline(userId, socket.id);
      logger.info(`Socket disconnected: ${socket.user.username} (${socket.id})`);
      handleDisconnect(socket);
    });
  });
}
