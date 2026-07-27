import express from 'express';
import { runCode, submitCode } from '../controllers/execution.controller.js';
import { runCodeValidation, submitCodeValidation } from '../middleware/validators/execution.validator.js';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.middleware.js';
import { executeLimiter } from '../middleware/rateLimiters.js';

const router = express.Router();

// Both require login - executing arbitrary code is expensive and abusable
// enough that it shouldn't be reachable anonymously. executeLimiter runs
// after protect so it can key the limit per-user, not just per-IP.
router.post('/run', protect, executeLimiter, runCodeValidation, validate, runCode);
router.post('/submit', protect, executeLimiter, submitCodeValidation, validate, submitCode);

export default router;
