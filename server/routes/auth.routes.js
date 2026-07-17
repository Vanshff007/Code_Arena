import express from 'express';
import { register, login, getMe } from '../controllers/auth.controller.js';
import { registerValidation, loginValidation } from '../middleware/validators/auth.validator.js';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.get('/me', protect, getMe);

export default router;
