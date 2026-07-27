import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import env from '../config/env.js';

// The automated test suite makes many rapid, legitimate register/login/
// submit calls in a single run - real rate limiting there would produce
// false-positive 429s unrelated to anything the tests are actually
// checking, so it's disabled under NODE_ENV=test only.
const skipInTests = () => env.nodeEnv === 'test';

// Loose, global safety net on every /api route - not meant to stop targeted
// abuse (the two limiters below do that), just to cap accidental runaway
// clients (e.g. a buggy retry loop) from hammering the server.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTests,
});

// Register/login have no other brute-force or credential-stuffing defense -
// keyed by IP since there's no authenticated user yet at this point.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTests,
  message: { success: false, message: 'Too many attempts. Please try again later.' },
});

// Run/submit each spin up a real Docker container - the expensive resource
// here is compute, not requests, so this is keyed per authenticated user
// (protect has already run) rather than per IP, which would let one user
// behind a shared/proxied IP starve everyone else's budget or vice versa.
export const executeLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTests,
  keyGenerator: (req) => req.user?._id?.toString() ?? ipKeyGenerator(req.ip),
  message: { success: false, message: 'Too many submissions. Please slow down and try again shortly.' },
});
