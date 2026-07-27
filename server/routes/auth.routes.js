import express from 'express';
import { register, login, getMe } from '../controllers/auth.controller.js';
import { registerValidation, loginValidation } from '../middleware/validators/auth.validator.js';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimiters.js';

const router = express.Router();

router.post('/register', authLimiter, registerValidation, validate, register);
router.post('/login', authLimiter, loginValidation, validate, login);
router.get('/me', protect, getMe);

export default router;
