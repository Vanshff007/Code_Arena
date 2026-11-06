import logger from '../utils/logger.js';
import { captureError } from '../monitoring.js';

// Catches requests to routes that don't exist.
export function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Route not found - ${req.originalUrl}`));
}

// Centralized error handler - every controller can just `next(err)` and
// let this format the response consistently instead of hand-rolling
// try/catch responses everywhere.
export function errorHandler(err, req, res, next) {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  logger.error(err.stack || err.message);
  // 4xx are expected outcomes (bad input, not found); only server faults are tracked.
  if (statusCode >= 500) captureError(err, { method: req.method, route: req.baseUrl + (req.route?.path ?? '') });

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    // Stack traces are only useful (and safe) to expose in development.
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
}
