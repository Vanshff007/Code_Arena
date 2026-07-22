import Match from '../models/Match.model.js';

// GET /api/matches/me - the logged-in user's own match history.
export const getMyMatches = async (req, res, next) => {
  try {
    const matches = await Match.find({ 'players.user': req.user._id, status: 'completed' })
      .populate('problem', 'title difficulty')
      .populate('players.user', 'username')
      .sort('-endedAt')
      .limit(50);

    const formatted = matches.map((m) => {
      const self = m.players.find((p) => p.user._id.toString() === req.user._id.toString());
      const opponent = m.players.find((p) => p.user._id.toString() !== req.user._id.toString());
      const result = m.isDraw ? 'Draw' : m.winner?.toString() === req.user._id.toString() ? 'Win' : 'Loss';

      return {
        matchId: m._id,
        problem: m.problem?.title,
        difficulty: m.problem?.difficulty,
        opponent: opponent?.user?.username ?? 'Unknown',
        language: self?.language,
        result,
        verdict: self?.verdict,
        ratingChange: self ? self.ratingAfter - self.ratingBefore : 0,
        durationMs: m.durationMs,
        startedAt: m.startedAt,
        endedAt: m.endedAt,
      };
    });

    return res.status(200).json({ success: true, data: { matches: formatted } });
  } catch (err) {
    next(err);
  }
};
