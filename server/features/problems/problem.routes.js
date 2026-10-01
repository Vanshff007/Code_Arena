import express from 'express';
import {
  createProblem,
  getProblems,
  getProblemById,
  getProblemForAdmin,
  checkProblem,
  updateProblem,
  deleteProblem,
  getEditorial,
} from './problem.controller.js';
import {
  createProblemValidation,
  updateProblemValidation,
  checkProblemValidation,
} from './problem.validator.js';
import { validate } from '../../core/middleware/validate.js';
import { protect } from '../auth/auth.middleware.js';
import { isAdmin } from '../auth/admin.middleware.js';
import { executeLimiter } from '../../core/middleware/rateLimiters.js';

const router = express.Router();

// Public - anyone (logged in or not) can browse and view problems
router.get('/', getProblems);
router.get('/:id', getProblemById);

// Logged in - the editorial (recorded, and blocked during a live battle)
router.get('/:id/editorial', protect, getEditorial);

// Admin only - problem bank management. Create, update and check run a
// reference solution through the judge, so they share the execute limiter.
router.post('/check', protect, isAdmin, executeLimiter, checkProblemValidation, validate, checkProblem);
router.get('/:id/admin', protect, isAdmin, getProblemForAdmin);
router.post('/', protect, isAdmin, executeLimiter, createProblemValidation, validate, createProblem);
router.put('/:id', protect, isAdmin, executeLimiter, updateProblemValidation, validate, updateProblem);
router.delete('/:id', protect, isAdmin, deleteProblem);

export default router;
