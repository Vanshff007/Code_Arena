import express from 'express';
import { getLeaderboard } from './leaderboard.controller.js';

const router = express.Router();

// Public - global ranking isn't sensitive information.
router.get('/', getLeaderboard);

export default router;
