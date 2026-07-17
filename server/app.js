import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import env from './config/env.js';
import logger from './utils/logger.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import problemRoutes from './routes/problem.routes.js';

const app = express();

// --- Security & parsing middleware ---
app.use(helmet());
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true, // allows the Authorization header pattern used by auth
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- HTTP request logging, routed through Winston ---
app.use(morgan('combined', { stream: logger.morganStream }));

// --- Routes ---
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);

// --- Error handling (must be registered last) ---
app.use(notFound);
app.use(errorHandler);

export default app;
