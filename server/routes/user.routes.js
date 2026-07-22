import express from 'express';
import { getProfileByUsername } from '../controllers/user.controller.js';

const router = express.Router();

// Public - profile pages are viewable by anyone, same as clicking a
// username on the leaderboard. No sensitive fields (email, password) are
// ever included in the response.
router.get('/:username/profile', getProfileByUsername);

export default router;
