import express from 'express';
import { getMyMatches } from '../controllers/match.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/me', protect, getMyMatches);

export default router;
