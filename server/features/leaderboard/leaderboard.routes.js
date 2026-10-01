import express from 'express';
import { getLeaderboard, listSeasons, getSeasonLeaderboard } from './leaderboard.controller.js';

const router = express.Router();

// Public - rankings aren't sensitive information.
router.get('/', getLeaderboard);
router.get('/seasons', listSeasons);
router.get('/seasons/:season', getSeasonLeaderboard);

export default router;
