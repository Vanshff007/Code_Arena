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

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
};

export default env;
