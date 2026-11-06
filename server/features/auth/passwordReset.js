import { createHash, randomBytes } from 'crypto';
import User from './User.model.js';
import { startSession } from './session.js';
import { disconnectSockets } from './auth.controller.js';
import env from '../../core/config/env.js';
import { sendMail } from '../../core/utils/mailer.js';
import logger from '../../core/utils/logger.js';

export const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;

export const hashResetToken = (token) => createHash('sha256').update(token).digest('hex');

// The token goes in the URL fragment (#), which browsers never send to a
// server, so it cannot end up in Nginx access logs or Referer headers.
export const resetLink = (token) => `${env.clientUrls[0]}/reset-password#token=${token}`;

const SENT_MESSAGE = 'If an account uses that email, a reset link is on its way. It works for 30 minutes.';

// POST /api/auth/forgot-password - always the same answer, so it never
// reveals whether an email is registered.
export const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const token = randomBytes(32).toString('hex');
      await User.updateOne(
        { _id: user._id },
        { passwordResetHash: hashResetToken(token), passwordResetExpires: new Date(Date.now() + RESET_TOKEN_TTL_MS) }
      );
      // Not awaited: a slow SMTP reply would otherwise make registered
      // emails measurably slower to answer than unknown ones.
      sendMail({
        to: user.email,
        subject: 'Reset your CodeArena password',
        text: [
          `Hi ${user.username},`,
          '',
          'Someone asked to reset the password of your CodeArena account. Open this link to choose a new one:',
          '',
          resetLink(token),
          '',
          'The link works once, for 30 minutes. If you did not ask for this, ignore this email; your password stays the same.',
        ].join('\n'),
      }).catch((err) => logger.error(`[Mail] Password reset email failed: ${err.message}`));
    }
    return res.status(200).json({ success: true, message: SENT_MESSAGE });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/reset-password - sets the new password, ends every other
// session (tokenVersion), and logs this browser in.
export const resetPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({
      passwordResetHash: hashResetToken(req.body.token),
      passwordResetExpires: { $gt: new Date() },
    }).select('+password +tokenVersion');
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: 'This reset link is invalid or has expired. Ask for a new one.' });
    }

    user.password = req.body.password;
    user.tokenVersion = (user.tokenVersion ?? 0) + 1;
    user.passwordResetHash = null;
    user.passwordResetExpires = null;
    await user.save();
    await disconnectSockets(user._id.toString());

    const token = startSession(res, user);
    logger.info(`Password reset: ${user.username}`);
    return res.status(200).json({ success: true, message: 'Password reset', data: { user, token } });
  } catch (err) {
    next(err);
  }
};
