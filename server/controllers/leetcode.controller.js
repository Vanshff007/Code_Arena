import User from '../models/User.model.js';
import { syncLeetCodeProfile } from '../services/leetcode.service.js';
import { recalculateSkillProfile } from '../services/skillAnalyzer.service.js';
import logger from '../utils/logger.js';

// POST /api/leetcode/connect - stores the username only; does not sync yet
// (sync is a separate explicit action, matching "Connect / Sync" as two
// distinct steps in the spec).
export const connectLeetCode = async (req, res, next) => {
  try {
    const { username } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        'leetcode.username': username,
        'leetcode.connectedAt': new Date(),
        'leetcode.syncStatus': 'idle',
        'leetcode.syncError': null,
      },
      { new: true }
    );
    return res.status(200).json({ success: true, data: { leetcode: user.leetcode } });
  } catch (err) {
    next(err);
  }
};

// POST /api/leetcode/disconnect - clears the connection and all synced
// data. Does not touch PerformanceHistory/SkillProfile built from CodeArena
// activity - only the LeetCode-sourced seed goes away.
export const disconnectLeetCode = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        leetcode: {
          username: null,
          connectedAt: null,
          lastSyncedAt: null,
          syncStatus: 'idle',
          syncError: null,
          stats: {},
          topicCounts: {},
        },
      },
      { new: true }
    );

    await recalculateSkillProfile(user._id);

    return res.status(200).json({ success: true, data: { leetcode: user.leetcode } });
  } catch (err) {
    next(err);
  }
};

// POST /api/leetcode/sync - the actual network call to LeetCode's public
// API. Can fail for reasons outside our control (username typo, LeetCode
// rate-limiting/blocking, their API shape changing) - failures are
// recorded on the user and returned as a normal error response, never a
// 500 crash.
export const syncLeetCode = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.leetcode?.username) {
      return res.status(400).json({ success: false, message: 'Connect a LeetCode username first' });
    }

    try {
      const stats = await syncLeetCodeProfile(user.leetcode.username);

      user.leetcode.stats = {
        totalSolved: stats.totalSolved,
        easySolved: stats.easySolved,
        mediumSolved: stats.mediumSolved,
        hardSolved: stats.hardSolved,
        contestRating: stats.contestRating,
        contestRanking: stats.contestRanking,
      };
      user.leetcode.topicCounts = stats.recentTopicCounts;
      user.leetcode.lastSyncedAt = new Date();
      user.leetcode.syncStatus = 'synced';
      user.leetcode.syncError = null;
      await user.save();

      const skillProfile = await recalculateSkillProfile(user._id);

      logger.info(`LeetCode synced: ${req.user.username} <- ${user.leetcode.username}`);

      return res.status(200).json({
        success: true,
        data: { leetcode: user.leetcode, skillProfile },
      });
    } catch (syncErr) {
      user.leetcode.syncStatus = 'failed';
      user.leetcode.syncError = syncErr.message;
      await user.save();

      const status = syncErr.code === 'NOT_FOUND' ? 404 : 502;
      return res.status(status).json({ success: false, message: syncErr.message });
    }
  } catch (err) {
    next(err);
  }
};
