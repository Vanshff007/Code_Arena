import { tokenFromHeaders, userFromToken } from './session.js';

// Protects routes by requiring a valid, current session: the httpOnly
// session cookie (browser) or an Authorization: Bearer token (API clients,
// tests). On success, attaches the authenticated user to req.user.
export const protect = async (req, res, next) => {
  try {
    const token = tokenFromHeaders(req.headers);
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no session' });
    }
    const user = await userFromToken(token);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Not authorized, session invalid or expired' });
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};
