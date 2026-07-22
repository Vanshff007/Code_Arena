import http from 'http';
import { Server } from 'socket.io';
import env from './config/env.js';
import connectDB from './config/db.js';
import logger from './utils/logger.js';
import app from './app.js';
import { registerSocketHandlers } from './sockets/index.js';

// Using an explicit http.Server (instead of app.listen directly) because
// Socket.io needs to attach to this same server instance to share the port
// with the REST API.
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: env.clientUrl,
    credentials: true,
  },
});

registerSocketHandlers(io);

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
