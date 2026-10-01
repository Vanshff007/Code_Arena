import express from 'express';
import { getMyMatches, getLiveBattles, getReplay } from './match.controller.js';
import { protect } from '../auth/auth.middleware.js';

const router = express.Router();

router.get('/me', protect, getMyMatches);
router.get('/live', protect, getLiveBattles);
router.get('/:id/replay', protect, getReplay);

export default router;
