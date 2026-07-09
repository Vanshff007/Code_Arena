import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import User from '../models/User.model.js';

// Protects routes by requiring a valid JWT in the Authorization header.
// On success, attaches the authenticated user (password already excluded by
// the schema's select: false) to req.user, so downstream controllers - and,
// later, the Socket.io connection handshake in Step 9 - can rely on it being
// present without re-verifying anything themselves.
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.jwtSecret);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Not authorized, user no longer exists' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized, token invalid or expired' });
  }
};
