import User from '../auth/User.model.js';
import Match from '../battles/Match.model.js';
import { seasonId, isSeasonId, seasonLabel, seasonPipeline } from './seasons.js';

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

// GET /api/leaderboard/seasons - the current season and every past season
// that has battles, newest first.
export const listSeasons = async (req, res, next) => {
  try {
    const current = seasonId();
    const months = await Match.aggregate([
      { $match: { status: 'completed', endedAt: { $ne: null } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$endedAt' } } } },
    ]);
    const ids = new Set([current, ...months.map((m) => m._id)]);
    const seasons = [...ids].sort().reverse().map((id) => ({ id, label: seasonLabel(id), current: id === current }));
    return res.status(200).json({ success: true, data: { seasons } });
  } catch (err) {
    next(err);
  }
};

// GET /api/leaderboard/seasons/:season - ranking by rating points gained
// that month (e.g. 2026-10).
export const getSeasonLeaderboard = async (req, res, next) => {
  try {
    const { season } = req.params;
    if (!isSeasonId(season)) {
      return res.status(400).json({ success: false, message: 'Season must look like 2026-10' });
    }
    const rows = await Match.aggregate(seasonPipeline(season));
    const leaderboard = rows.map((r, i) => ({ rank: i + 1, ...r }));
    return res.status(200).json({
      success: true,
      data: { season: { id: season, label: seasonLabel(season), current: season === seasonId() }, leaderboard },
    });
  } catch (err) {
    next(err);
  }
};
