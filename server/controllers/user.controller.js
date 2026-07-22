import User from '../models/User.model.js';
import Match from '../models/Match.model.js';

// Computed on the fly from existing stats rather than stored - a full
// achievements system (with unlock events, etc.) is a listed future
// feature; this satisfies the profile page's "Badges" display without
// building that out early.
function computeBadges(user) {
  const badges = [];
  if (user.totalBattles >= 1) badges.push('First Blood');
  if (user.wins >= 5) badges.push('Rising Star');
  if (user.wins >= 25) badges.push('Veteran');
  if (user.rating >= 1200) badges.push('Expert');
  if (user.rating >= 1500) badges.push('Master');
  return badges;
}

// GET /api/users/:username/profile - public profile lookup (like clicking
// a username on the leaderboard), so only non-sensitive fields are exposed.
export const getProfileByUsername = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const rank = (await User.countDocuments({ rating: { $gt: user.rating } })) + 1;

    const recentMatches = await Match.find({ 'players.user': user._id, status: 'completed' })
      .populate('problem', 'title difficulty')
      .sort('-endedAt')
      .limit(5);

    const recent = recentMatches.map((m) => {
      const self = m.players.find((p) => p.user.toString() === user._id.toString());
      const result = m.isDraw ? 'Draw' : m.winner?.toString() === user._id.toString() ? 'Win' : 'Loss';
      return {
        problem: m.problem?.title,
        difficulty: m.problem?.difficulty,
        result,
        endedAt: m.endedAt,
        ratingChange: self ? self.ratingAfter - self.ratingBefore : 0,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        user: {
          username: user.username,
          rating: user.rating,
          wins: user.wins,
          losses: user.losses,
          totalBattles: user.totalBattles,
          winRate: user.totalBattles > 0 ? Math.round((user.wins / user.totalBattles) * 100) : 0,
          rank,
          badges: computeBadges(user),
          createdAt: user.createdAt,
          // Public, read-only view of the LeetCode connection - like a
          // badge. Managing the connection (connect/disconnect/sync) is
          // only exposed on the authenticated user's own profile view, via
          // /api/leetcode/*, never through this endpoint.
          leetcode: {
            username: user.leetcode?.username ?? null,
            stats: user.leetcode?.stats ?? null,
            lastSyncedAt: user.leetcode?.lastSyncedAt ?? null,
          },
        },
        recentMatches: recent,
      },
    });
  } catch (err) {
    next(err);
  }
};
