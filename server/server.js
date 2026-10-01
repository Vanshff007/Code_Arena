import http from 'http';
import { Server } from 'socket.io';
import env from './core/config/env.js';
import connectDB from './core/config/db.js';
import logger from './core/utils/logger.js';
import app from './app.js';
import { registerSocketHandlers } from './features/battles/sockets.js';
import { restoreActiveBattles } from './features/battles/roomManager.js';

// Using an explicit http.Server (instead of app.listen directly) because
// Socket.io needs to attach to this same server instance to share the port
// with the REST API.
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: env.clientUrls,
    credentials: true,
  },
});

registerSocketHandlers(io);

async function start() {
  await connectDB();
  // Battles that were in progress when the server stopped pick up where
  // they left off (players rejoin when their browsers reconnect).
  await restoreActiveBattles().catch((err) => logger.error(`Restoring battles failed: ${err.message}`));

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

// A synchronous throw with no catch anywhere would otherwise crash the
// process with no log line at all - mirror the same graceful-shutdown path.
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.stack || err.message}`);
  server.close(() => process.exit(1));
});
