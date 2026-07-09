import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// GET /api/health - lets us confirm the server is up and check DB connection
// state at a glance, without digging through logs. Useful for uptime checks
// once deployed, too.
router.get('/', (req, res) => {
  const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];

  res.json({
    success: true,
    uptime: process.uptime(),
    db: dbStates[mongoose.connection.readyState],
    timestamp: new Date().toISOString(),
  });
});

export default router;
