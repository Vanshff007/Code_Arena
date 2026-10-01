import express from 'express';
import {
  getMySkillProfile,
  getMyXP,
  getMyRecommendations,
  getMyFeedback,
} from './skill.controller.js';
import { protect } from '../auth/auth.middleware.js';

const router = express.Router();

router.get('/me', protect, getMySkillProfile);
router.get('/xp', protect, getMyXP);
router.get('/recommendations', protect, getMyRecommendations);
router.get('/feedback', protect, getMyFeedback);

export default router;
