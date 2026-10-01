import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';

import env from './core/config/env.js';
import logger from './core/utils/logger.js';
import { notFound, errorHandler } from './core/middleware/errorHandler.js';
import { apiLimiter } from './core/middleware/rateLimiters.js';
import healthRoutes from './features/health/health.routes.js';
import authRoutes from './features/auth/auth.routes.js';
import problemRoutes from './features/problems/problem.routes.js';
import executionRoutes from './features/execution/execution.routes.js';
import leaderboardRoutes from './features/leaderboard/leaderboard.routes.js';
import userRoutes from './features/profiles/profile.routes.js';
import matchRoutes from './features/battles/match.routes.js';
import leetcodeRoutes from './features/leetcode/leetcode.routes.js';
import skillRoutes from './features/skills/skill.routes.js';
import friendRoutes from './features/friends/friends.routes.js';

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
app.use('/api/friends', friendRoutes);

// --- Error handling (must be registered last) ---
app.use(notFound);
app.use(errorHandler);

export default app;
