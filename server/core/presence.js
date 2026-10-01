// Who is online right now: userId -> set of connected socket ids (a user
// can have several tabs). Used for friends' online status and to deliver
// friend challenges. In memory, single process.
const online = new Map();

export function markOnline(userId, socketId) {
  if (!online.has(userId)) online.set(userId, new Set());
  online.get(userId).add(socketId);
}

export function markOffline(userId, socketId) {
  const sockets = online.get(userId);
  if (!sockets) return;
  sockets.delete(socketId);
  if (sockets.size === 0) online.delete(userId);
}

export function isOnline(userId) {
  return online.has(String(userId));
}

export function socketsOf(userId) {
  return [...(online.get(String(userId)) ?? [])];
}

export function resetPresence() {
  online.clear();
}
