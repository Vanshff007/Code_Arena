import mongoose from 'mongoose';
import env from './env.js';
import logger from '../utils/logger.js';

const MAX_ATTEMPTS = 5;
const RETRY_DELAY_MS = 3000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Retries a few times before giving up - in the Docker Compose deployment,
// `depends_on` only waits for the mongo container to *start*, not for
// mongod to actually be ready to accept connections, so the very first
// connection attempt on a fresh `docker compose up` can lose that race.
const connectDB = async () => {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 10000 });
      logger.info(`MongoDB connected: ${mongoose.connection.host}`);
      return;
    } catch (err) {
      logger.error(`MongoDB connection attempt ${attempt}/${MAX_ATTEMPTS} failed: ${err.message}`);
      if (attempt === MAX_ATTEMPTS) {
        // The API is useless without a DB - fail fast instead of limping along.
        process.exit(1);
      }
      await sleep(RETRY_DELAY_MS);
    }
  }
};

export default connectDB;
