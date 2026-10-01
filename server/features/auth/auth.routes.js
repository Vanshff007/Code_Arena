import express from 'express';
import { register, login, getMe } from './auth.controller.js';
import { registerValidation, loginValidation } from './auth.validator.js';
import { validate } from '../../core/middleware/validate.js';
import { protect } from './auth.middleware.js';
import { authLimiter } from '../../core/middleware/rateLimiters.js';

const router = express.Router();

router.post('/register', authLimiter, registerValidation, validate, register);
router.post('/login', authLimiter, loginValidation, validate, login);
router.get('/me', protect, getMe);

export default router;
