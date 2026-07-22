import express from 'express';
import { runCode, submitCode } from '../controllers/execution.controller.js';
import { runCodeValidation, submitCodeValidation } from '../middleware/validators/execution.validator.js';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Both require login - executing arbitrary code is expensive and abusable
// enough that it shouldn't be reachable anonymously.
router.post('/run', protect, runCodeValidation, validate, runCode);
router.post('/submit', protect, submitCodeValidation, validate, submitCode);

export default router;
