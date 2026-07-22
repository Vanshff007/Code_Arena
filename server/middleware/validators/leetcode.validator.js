import { body } from 'express-validator';

export const connectLeetCodeValidation = [
  body('username')
    .trim()
    .isLength({ min: 1, max: 40 })
    .withMessage('A LeetCode username is required')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('LeetCode usernames only contain letters, numbers, hyphens, and underscores'),
];
