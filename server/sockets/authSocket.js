import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import User from '../models/User.model.js';

// Socket.io equivalent of the `protect` REST middleware - verifies the JWT
// sent during the handshake and attaches the authenticated user to the
// socket, so every event handler can trust socket.user without re-checking.
export async function authSocket(socket, next) {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Not authorized, no token provided'));
    }

    const decoded = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new Error('Not authorized, user no longer exists'));
    }

    socket.user = user;
    next();
  } catch (err) {
    next(new Error('Not authorized, token invalid or expired'));
  }
}
