import express from 'express';
import { connectLeetCode, disconnectLeetCode, syncLeetCode, getRecommendations } from './leetcode.controller.js';
import { connectLeetCodeValidation } from './leetcode.validator.js';
import { validate } from '../../core/middleware/validate.js';
import { protect } from '../auth/auth.middleware.js';

const router = express.Router();

router.post('/connect', protect, connectLeetCodeValidation, validate, connectLeetCode);
router.post('/disconnect', protect, disconnectLeetCode);
router.post('/sync', protect, syncLeetCode);
router.get('/recommendations', protect, getRecommendations);

export default router;
