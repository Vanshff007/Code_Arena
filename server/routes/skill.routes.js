import express from 'express';
import {
  getMySkillProfile,
  getMyXP,
  getMyRecommendations,
  getMyFeedback,
} from '../controllers/skill.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/me', protect, getMySkillProfile);
router.get('/xp', protect, getMyXP);
router.get('/recommendations', protect, getMyRecommendations);
router.get('/feedback', protect, getMyFeedback);

export default router;
