import User from '../models/User.model.js';

// GET /api/leaderboard - public global ranking by rating.
export const getLeaderboard = async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);

    const users = await User.find().select('username rating wins losses totalBattles').sort('-rating').limit(limit);

    const leaderboard = users.map((u, index) => ({
      rank: index + 1,
      username: u.username,
      rating: u.rating,
      wins: u.wins,
      losses: u.losses,
      totalBattles: u.totalBattles,
      winRate: u.totalBattles > 0 ? Math.round((u.wins / u.totalBattles) * 100) : 0,
    }));

    return res.status(200).json({ success: true, data: { leaderboard } });
  } catch (err) {
    next(err);
  }
};
