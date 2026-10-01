import express from 'express';
import mongoose from 'mongoose';
import { readFileSync } from 'fs';

const router = express.Router();

// Read once at boot. The client shows its own copy of this version (from
// client/package.json); health.test.js fails if the two ever drift apart.
const { version } = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));

// GET /api/health - lets us confirm the server is up and check DB connection
// state at a glance, without digging through logs. Useful for uptime checks
// once deployed, too.
router.get('/', (req, res) => {
  const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];

  res.json({
    success: true,
    version,
    uptime: process.uptime(),
    db: dbStates[mongoose.connection.readyState],
    timestamp: new Date().toISOString(),
  });
});

export default router;
