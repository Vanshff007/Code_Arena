import jwt from 'jsonwebtoken';
import env from '../../core/config/env.js';
import { parseCookies, durationToMs } from '../../core/utils/cookies.js';
import User from './User.model.js';

// Sessions are JWTs in an httpOnly cookie, so scripts in the page (e.g. an
// XSS payload) can never read them. SameSite=Lax keeps the cookie off
// cross-site POSTs, which covers CSRF for this API: every state-changing
// route is a POST/PUT/DELETE. This needs the web app and API on the same
// site (same domain, any port) - true locally and behind the Nginx config.
//
// Each token carries the user's tokenVersion; bumping it ("log out
// everywhere", password change) invalidates every token issued before.
export const AUTH_COOKIE = 'ca_token';

export function signToken(user) {
  return jwt.sign({ id: user._id.toString(), tv: user.tokenVersion ?? 0 }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.nodeEnv === 'production',
    path: '/',
  };
}

// Sets the session cookie and returns the token (also sent in the body for
// non-browser API clients and tests; the web app never stores it).
export function startSession(res, user) {
  const token = signToken(user);
  res.cookie(AUTH_COOKIE, token, { ...cookieOptions(), maxAge: durationToMs(env.jwtExpiresIn) });
  return token;
}

export function endSession(res) {
  res.clearCookie(AUTH_COOKIE, cookieOptions());
}

// Cookie first (browser), then an Authorization: Bearer header (API
// clients, tests).
export function tokenFromHeaders(headers = {}) {
  const fromCookie = parseCookies(headers.cookie)[AUTH_COOKIE];
  if (fromCookie) return fromCookie;
  const auth = headers.authorization;
  if (auth && auth.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

// Returns the user for a valid, current token, or null. A token is stale
// when its tokenVersion is lower than the user's (sessions were revoked).
export async function userFromToken(token) {
  if (!token) return null;
  let decoded;
  try {
    decoded = jwt.verify(token, env.jwtSecret);
  } catch {
    return null;
  }
  const user = await User.findById(decoded.id).select('+tokenVersion');
  if (!user) return null;
  if ((decoded.tv ?? 0) !== (user.tokenVersion ?? 0)) return null;
  return user;
}
