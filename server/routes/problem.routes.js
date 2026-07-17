import express from 'express';
import {
  createProblem,
  getProblems,
  getProblemById,
  updateProblem,
  deleteProblem,
} from '../controllers/problem.controller.js';
import { createProblemValidation, updateProblemValidation } from '../middleware/validators/problem.validator.js';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.middleware.js';
import { isAdmin } from '../middleware/admin.middleware.js';

const router = express.Router();

// Public - anyone (logged in or not) can browse and view problems
router.get('/', getProblems);
router.get('/:id', getProblemById);

// Admin only - problem bank management
router.post('/', protect, isAdmin, createProblemValidation, validate, createProblem);
router.put('/:id', protect, isAdmin, updateProblemValidation, validate, updateProblem);
router.delete('/:id', protect, isAdmin, deleteProblem);

export default router;
