import { validationResult } from 'express-validator';

// Runs after any express-validator chain (auth, problems, ...) and turns
// collected errors into a single 400 response, so controllers never need to
// think about validation at all.
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};
