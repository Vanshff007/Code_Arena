import { body } from 'express-validator';

const SUPPORTED_LANGUAGES = ['cpp', 'java', 'python'];

// Validation chain for POST /api/execute/run
export const runCodeValidation = [
  body('language')
    .isIn(SUPPORTED_LANGUAGES)
    .withMessage(`Language must be one of: ${SUPPORTED_LANGUAGES.join(', ')}`),
  body('code').isString().notEmpty().withMessage('Code is required'),
  body('input').optional().isString(),
];

// Validation chain for POST /api/execute/submit
export const submitCodeValidation = [
  body('language')
    .isIn(SUPPORTED_LANGUAGES)
    .withMessage(`Language must be one of: ${SUPPORTED_LANGUAGES.join(', ')}`),
  body('code').isString().notEmpty().withMessage('Code is required'),
  body('problemId').isMongoId().withMessage('A valid problemId is required'),
  // Present only when submitting from an active battle room, so the
  // controller knows to feed the result into the real-time battle state.
  body('roomCode').optional().isString(),
  // Client-supplied timestamp (ms since epoch) of when the player opened
  // this problem - used only to compute timeTakenMs for performance
  // tracking/AI coaching. Missing it just means that submission has no
  // "solved in N minutes" feedback, nothing breaks.
  body('startedAt').optional().isNumeric(),
];
