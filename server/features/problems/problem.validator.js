import { body } from 'express-validator';
import { validateSignature } from '../execution/harness/index.js';

// Optional on both create and update: a problem with a signature is
// function-style (LeetCode format), one without is a full-program problem.
const signatureRule = body('signature')
  .optional({ values: 'null' })
  .custom((sig) => {
    const errors = validateSignature(sig);
    if (errors.length) throw new Error(errors.join('; '));
    return true;
  });
const outputOrderRule = body('outputOrder')
  .optional()
  .isIn(['exact', 'any'])
  .withMessage('outputOrder must be exact or any');

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
  signatureRule,
  outputOrderRule,
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
  signatureRule,
  outputOrderRule,
];

const LANGUAGES = ['cpp', 'java', 'python'];

// Reference solution used to prove the test cases are right.
const referenceSolutionRules = (required) => [
  (required ? body('referenceSolution') : body('referenceSolution').optional())
    .isObject()
    .withMessage('A reference solution is required'),
  body('referenceSolution.language')
    .if(body('referenceSolution').exists())
    .isIn(LANGUAGES)
    .withMessage(`Reference language must be one of: ${LANGUAGES.join(', ')}`),
  body('referenceSolution.code')
    .if(body('referenceSolution').exists())
    .isString()
    .notEmpty()
    .withMessage('Reference solution code is required'),
];

const editorialRule = body('editorial').optional().isObject().withMessage('Editorial must be an object');

createProblemValidation.push(...referenceSolutionRules(true), editorialRule);
updateProblemValidation.push(...referenceSolutionRules(false), editorialRule);

// POST /api/problems/check
export const checkProblemValidation = [
  body('problem').isObject().withMessage('A problem draft is required'),
  body('problem.publicTestCases').isArray({ min: 1 }).withMessage('At least one public test case is required'),
  body('problemId').optional().isMongoId(),
  ...referenceSolutionRules(true),
];
