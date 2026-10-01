import express from 'express';
import { getMyMatches } from './match.controller.js';
import { protect } from '../auth/auth.middleware.js';

const router = express.Router();

router.get('/me', protect, getMyMatches);

export default router;
