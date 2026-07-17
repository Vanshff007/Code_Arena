import { body } from 'express-validator';

// Validation chain for POST /api/problems
export const createProblemValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('difficulty')
    .isIn(['Easy', 'Medium', 'Hard'])
    .withMessage('Difficulty must be Easy, Medium, or Hard'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('constraints').optional().isArray().withMessage('Constraints must be an array of strings'),
  body('examples').isArray({ min: 1 }).withMessage('At least one example is required'),
  body('examples.*.input').notEmpty().withMessage('Each example needs an input'),
  body('examples.*.output').notEmpty().withMessage('Each example needs an output'),
  body('publicTestCases')
    .isArray({ min: 1 })
    .withMessage('At least one public test case is required'),
  body('publicTestCases.*.input').notEmpty().withMessage('Each public test case needs an input'),
  body('publicTestCases.*.output').notEmpty().withMessage('Each public test case needs an output'),
  body('hiddenTestCases')
    .isArray({ min: 1 })
    .withMessage('At least one hidden test case is required'),
  body('hiddenTestCases.*.input').notEmpty().withMessage('Each hidden test case needs an input'),
  body('hiddenTestCases.*.output').notEmpty().withMessage('Each hidden test case needs an output'),
  body('tags').optional().isArray().withMessage('Tags must be an array of strings'),
];

// Validation chain for PUT /api/problems/:id - every field optional since
// an admin may only be updating one piece (e.g. just fixing a typo).
export const updateProblemValidation = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('difficulty')
    .optional()
    .isIn(['Easy', 'Medium', 'Hard'])
    .withMessage('Difficulty must be Easy, Medium, or Hard'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('constraints').optional().isArray().withMessage('Constraints must be an array of strings'),
  body('examples').optional().isArray({ min: 1 }).withMessage('At least one example is required'),
  body('publicTestCases')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one public test case is required'),
  body('hiddenTestCases')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one hidden test case is required'),
  body('tags').optional().isArray().withMessage('Tags must be an array of strings'),
];
