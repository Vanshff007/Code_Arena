// Loads .env and validates that required environment variables are present.
// Failing fast here beats discovering a missing var mid-request in production.
import dotenv from 'dotenv';

dotenv.config();

const required = ['MONGO_URI', 'JWT_SECRET'];

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  // Logger isn't set up yet at this point in the boot sequence, so we use
  // console here deliberately - this is the one place in the app allowed to.
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

// A short/weak JWT_SECRET is brute-forceable - fail fast on it the same way
// we fail fast on a missing one, rather than discovering it during an audit.
if (process.env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET must be at least 32 characters long.');
  process.exit(1);
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI,
  // Comma-separated in .env (e.g. "https://codearena.app,https://www.codearena.app")
  // so multiple environments/domains work without a code change.
  clientUrls: (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((s) => s.trim()),
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  // In production the app sits behind exactly one Nginx hop (DEPLOYMENT.md).
  // Trusting that one hop makes req.ip the real client IP from
  // X-Forwarded-For, so IP-keyed rate limits are per visitor instead of one
  // shared 127.0.0.1 bucket. Elsewhere no proxy exists, so the header is
  // ignored and cannot be spoofed.
  trustProxy: process.env.NODE_ENV === 'production' ? 1 : false,
};

export default env;
