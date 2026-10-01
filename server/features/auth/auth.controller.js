import User from './User.model.js';
import { startSession, endSession } from './session.js';
import { getIO } from '../../core/io.js';
import logger from '../../core/utils/logger.js';

// POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Checked as one query (not two) to avoid a race where two requests
    // both pass separate checks before either has written to the DB.
    // The schema's unique indexes are the real guarantee; this just gives
    // us a friendly error message instead of a raw Mongo duplicate-key error.
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      const field = existingUser.email === email ? 'Email' : 'Username';
      return res.status(409).json({ success: false, message: `${field} is already in use` });
    }

    const user = await User.create({ username, email, password });
    const token = startSession(res, user);

    logger.info(`New user registered: ${user.username}`);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { user, token },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Password and tokenVersion are select: false on the schema, so they
    // must be requested explicitly here.
    const user = await User.findOne({ email }).select('+password +tokenVersion');

    // Deliberately identical error message whether the email doesn't exist
    // or the password is wrong - avoids leaking which emails are registered.
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = startSession(res, user);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { user, token },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me (protected - requires the `protect` middleware)
export const getMe = async (req, res, next) => {
  try {
    // req.user was already fetched and attached by the `protect` middleware.
    return res.status(200).json({ success: true, data: { user: req.user } });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/logout - ends this browser's session. Public on purpose:
// clearing a cookie is harmless, and it must work with an expired session.
export const logout = (req, res) => {
  endSession(res);
  return res.status(200).json({ success: true, message: 'Logged out' });
};

// Disconnects every live socket of a user, so revoked sessions also drop
// out of battles and presence right away instead of at their next request.
async function disconnectSockets(userId) {
  const io = getIO();
  if (!io) return;
  const sockets = await io.fetchSockets();
  for (const s of sockets) {
    if (s.data?.userId === userId) s.disconnect(true);
  }
}

// POST /api/auth/logout-all - revokes every session of this user (all
// devices), including the current one.
export const logoutAll = async (req, res, next) => {
  try {
    await User.updateOne({ _id: req.user._id }, { $inc: { tokenVersion: 1 } });
    endSession(res);
    await disconnectSockets(req.user._id.toString());
    logger.info(`All sessions revoked: ${req.user.username}`);
    return res.status(200).json({ success: true, message: 'Logged out of all devices' });
  } catch (err) {
    next(err);
  }
};

// PUT /api/auth/password - changes the password, revokes every other
// session, and starts a fresh one for this browser.
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password +tokenVersion');
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    user.tokenVersion = (user.tokenVersion ?? 0) + 1;
    await user.save();
    await disconnectSockets(user._id.toString());

    const token = startSession(res, user);
    logger.info(`Password changed: ${user.username}`);
    return res.status(200).json({ success: true, message: 'Password changed', data: { token } });
  } catch (err) {
    next(err);
  }
};
