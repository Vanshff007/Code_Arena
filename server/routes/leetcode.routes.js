import express from 'express';
import { connectLeetCode, disconnectLeetCode, syncLeetCode } from '../controllers/leetcode.controller.js';
import { connectLeetCodeValidation } from '../middleware/validators/leetcode.validator.js';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/connect', protect, connectLeetCodeValidation, validate, connectLeetCode);
router.post('/disconnect', protect, disconnectLeetCode);
router.post('/sync', protect, syncLeetCode);

export default router;
