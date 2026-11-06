// Outgoing email (password reset links) over SMTP, e.g. Gmail with an app
// password. Off when SMTP_USER / SMTP_PASS are empty: sendMail then logs a
// warning and resolves false. In tests nothing is sent; messages go to
// `outbox` so tests can read them.
import nodemailer from 'nodemailer';
import env from '../config/env.js';
import logger from './logger.js';

export const outbox = [];

export const mailEnabled = Boolean(env.smtp.user && env.smtp.pass);

const transport =
  mailEnabled && env.nodeEnv !== 'test'
    ? nodemailer.createTransport({
        host: env.smtp.host,
        port: env.smtp.port,
        secure: env.smtp.port === 465,
        auth: { user: env.smtp.user, pass: env.smtp.pass },
      })
    : null;

// Resolves true when sent. Never logs the message body: it holds the link.
export async function sendMail({ to, subject, text }) {
  if (env.nodeEnv === 'test') {
    outbox.push({ to, subject, text });
    return true;
  }
  if (!transport) {
    logger.warn(`[Mail] SMTP is not configured; "${subject}" was not sent`);
    return false;
  }
  await transport.sendMail({ from: env.smtp.from || env.smtp.user, to, subject, text });
  logger.info(`[Mail] Sent "${subject}"`);
  return true;
}
