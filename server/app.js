import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';

import env from './config/env.js';
import logger from './utils/logger.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiters.js';
import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import problemRoutes from './routes/problem.routes.js';
import executionRoutes from './routes/execution.routes.js';
import leaderboardRoutes from './routes/leaderboard.routes.js';
import userRoutes from './routes/user.routes.js';
import matchRoutes from './routes/match.routes.js';
import leetcodeRoutes from './routes/leetcode.routes.js';
import skillRoutes from './routes/skill.routes.js';

const app = express();

// --- Security & parsing middleware ---
app.use(helmet());
app.use(
  cors({
    origin: env.clientUrls,
    credentials: true, // allows the Authorization header pattern used by auth
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Defense-in-depth beyond the per-route express-validator chains: strips any
// Mongo query operator ($ne, $gt, ...) an attacker tries to smuggle through
// body/query/params, and collapses duplicate HTTP parameters so a handler
// can't be tricked by e.g. ?role=user&role=admin.
app.use(mongoSanitize());
app.use(hpp());

// --- HTTP request logging, routed through Winston ---
app.use(morgan('combined', { stream: logger.morganStream }));

// --- Global rate limit (defense-in-depth; auth/execute routes layer their
// own stricter limiters on top - see routes/*.js) ---
app.use('/api', apiLimiter);

// --- Routes ---
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/execute', executionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/leetcode', leetcodeRoutes);
app.use('/api/skills', skillRoutes);

// --- Error handling (must be registered last) ---
app.use(notFound);
app.use(errorHandler);

export default app;
