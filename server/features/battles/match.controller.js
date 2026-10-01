import Match from './Match.model.js';
import BattleReplay from './BattleReplay.model.js';
import { listLiveBattles } from './roomManager.js';

// GET /api/matches/me - the logged-in user's own match history.
export const getMyMatches = async (req, res, next) => {
  try {
    const matches = await Match.find({ 'players.user': req.user._id, status: 'completed' })
      .populate('problem', 'title difficulty')
      .populate('players.user', 'username')
      .sort('-endedAt')
      .limit(50);

    // Battles from before replays existed have none.
    const withReplay = new Set(
      (await BattleReplay.find({ match: { $in: matches.map((m) => m._id) } }).select('match')).map((r) =>
        r.match.toString()
      )
    );

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
        hasReplay: withReplay.has(m._id.toString()),
      };
    });

    return res.status(200).json({ success: true, data: { matches: formatted } });
  } catch (err) {
    next(err);
  }
};

// GET /api/matches/live - battles in progress right now, for spectators.
export const getLiveBattles = (req, res) => {
  return res.status(200).json({ success: true, data: { battles: listLiveBattles() } });
};

// GET /api/matches/:id/replay - how the battle unfolded: both players' code
// over time and every submission. Only the two players can open it.
export const getReplay = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('problem', 'title difficulty')
      .populate('players.user', 'username');
    if (!match) return res.status(404).json({ success: false, message: 'Battle not found' });

    const me = req.user._id.toString();
    if (!match.players.some((p) => p.user?._id.toString() === me)) {
      return res.status(403).json({ success: false, message: 'Only the two players can watch this replay' });
    }
    const replay = await BattleReplay.findOne({ match: match._id });
    if (!replay) {
      return res.status(404).json({ success: false, message: 'No replay was recorded for this battle' });
    }

    return res.status(200).json({
      success: true,
      data: {
        match: {
          matchId: match._id,
          problem: match.problem,
          durationMs: match.durationMs,
          startedAt: match.startedAt,
          endedAt: match.endedAt,
          winner: match.winner,
          isDraw: match.isDraw,
          players: match.players.map((p) => ({
            userId: p.user?._id,
            username: p.user?.username,
            verdict: p.verdict,
            passedCount: p.passedCount,
            totalCount: p.totalCount,
            language: p.language,
            ratingBefore: p.ratingBefore,
            ratingAfter: p.ratingAfter,
          })),
        },
        players: replay.players.map((p) => ({ userId: p.user, username: p.username, snapshots: p.snapshots })),
        timeline: replay.timeline,
      },
    });
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ success: false, message: 'Invalid battle id' });
    next(err);
  }
};
