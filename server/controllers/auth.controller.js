import User from '../models/User.model.js';
import generateToken from '../utils/generateToken.js';
import logger from '../utils/logger.js';

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
    const token = generateToken(user._id);

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

    // Password is select: false on the schema, so it must be explicitly
    // requested here to run the comparison.
    const user = await User.findOne({ email }).select('+password');

    // Deliberately identical error message whether the email doesn't exist
    // or the password is wrong - avoids leaking which emails are registered.
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

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
