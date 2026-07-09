import http from 'http';
import env from './config/env.js';
import connectDB from './config/db.js';
import logger from './utils/logger.js';
import app from './app.js';

// Using an explicit http.Server (instead of app.listen directly) because
// Socket.io (Step 9) needs to attach to this same server instance to share
// the port with the REST API.
const server = http.createServer(app);

async function start() {
  await connectDB();

  server.listen(env.port, () => {
    logger.info(`CodeArena server running in ${env.nodeEnv} mode on port ${env.port}`);
  });
}

start();

// Log unhandled rejections instead of letting the process die silently.
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});
