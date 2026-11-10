import Match from '../battles/Match.model.js';

// Results shown under each name in the versus bar.
export const FORM_LENGTH = 5;
// shortcut: a streak is counted within the last 20 matches only, so it
// shows at most 20; store a running streak on User if longer ones matter.
export const STREAK_LOOKBACK = 20;

// Pure: matches newest first ({ winner, isDraw }) -> the player's last
// results oldest to newest ('W', 'L', 'D') and their current win streak.
export function formFromMatches(matches, userId) {
  const results = matches.map((m) => (m.isDraw ? 'D' : String(m.winner) === String(userId) ? 'W' : 'L'));
  const streak = results.findIndex((r) => r !== 'W');
  return {
    form: results.slice(0, FORM_LENGTH).reverse(),
    streak: streak === -1 ? results.length : streak,
  };
}

// { [userId]: { form, streak } } for the players of a battle about to start.
export async function getRecentForm(userIds) {
  const entries = await Promise.all(
    userIds.map(async (id) => {
      const matches = await Match.find({ status: 'completed', 'players.user': id })
        .sort({ endedAt: -1 })
        .limit(STREAK_LOOKBACK)
        .select('winner isDraw')
        .lean();
      return [id, formFromMatches(matches, id)];
    })
  );
  return Object.fromEntries(entries);
}
