import { tokenFromHeaders, userFromToken } from '../auth/session.js';

// Socket.io equivalent of the `protect` REST middleware. Browsers send the
// session cookie with the handshake (withCredentials); API clients and
// tests may pass { auth: { token } } instead. Attaches socket.user.
export async function authSocket(socket, next) {
  try {
    const token = socket.handshake.auth?.token || tokenFromHeaders(socket.handshake.headers);
    const user = await userFromToken(token);
    if (!user) return next(new Error('Not authorized, session invalid or expired'));
    socket.user = user;
    // Readable from io.fetchSockets() (e.g. to disconnect a revoked user).
    socket.data.userId = user._id.toString();
    next();
  } catch {
    next(new Error('Not authorized'));
  }
}
