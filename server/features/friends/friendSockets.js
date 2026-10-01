import { areFriends } from './friends.service.js';
import { isOnline, socketsOf } from '../../core/presence.js';
import { getIO } from '../../core/io.js';
import { findRoomByUserId } from '../battles/state.js';
import { createPrivateRoom } from '../battles/roomManager.js';

// Live friend challenges. The challenger gets a private room right away
// (like "Create a room"); the friend gets an invite on every open tab and
// joins that room if they accept.
export function registerFriendSocketHandlers(socket, on) {
  on('friend:challenge', async ({ userId }) => {
    if (!userId || String(userId) === socket.user._id.toString()) return;
    if (!(await areFriends(socket.user._id, userId))) {
      return socket.emit('friend:challengeError', { message: 'You can only challenge friends.' });
    }
    if (!isOnline(userId)) {
      return socket.emit('friend:challengeError', { message: 'Your friend is offline.' });
    }
    if (findRoomByUserId(String(userId))) {
      return socket.emit('friend:challengeError', { message: 'Your friend is already in a battle.' });
    }
    const roomCode = createPrivateRoom(socket);
    if (!roomCode) return;

    const io = getIO();
    for (const id of socketsOf(userId)) {
      io.to(id).emit('friend:challenged', { roomCode, from: socket.user.username, fromId: socket.user._id.toString() });
    }
    socket.emit('friend:challengeSent', { roomCode });
  });

  on('friend:challengeDecline', ({ fromId, roomCode }) => {
    if (!fromId) return;
    const io = getIO();
    for (const id of socketsOf(fromId)) {
      io.to(id).emit('friend:challengeDeclined', { roomCode, by: socket.user.username });
    }
  });
}
