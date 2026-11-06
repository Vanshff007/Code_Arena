import express from 'express';
import { getDaily } from './daily.controller.js';
import { protect } from '../auth/auth.middleware.js';

const router = express.Router();

router.get('/', protect, getDaily);

export default router;
