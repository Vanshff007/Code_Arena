import mongoose from 'mongoose';
import ArenaXP from './ArenaXP.model.js';
import XPProgress from '../skills/XPProgress.model.js';
import { xpProgressWithinLevel } from '../skills/xp.service.js';
import logger from '../../core/utils/logger.js';

export const UPSET_GAP = 100; // beat someone rated at least this much higher

// Pure: the XP lines one player earns from one battle.
export function arenaXpBreakdown({ won, isDraw, verdict, attempts, timeMs, durationMs, ratingBefore, opponentRating }) {
  const items = [{ key: 'played', label: 'Battle played', xp: 10 }];
  if (won) items.push({ key: 'win', label: 'Win', xp: 30 });
  if (isDraw) items.push({ key: 'draw', label: 'Draw', xp: 15 });
  if (verdict === 'Accepted') {
    items.push({ key: 'solved', label: 'Solved', xp: 20 });
    const speed = durationMs > 0 && timeMs != null ? Math.round(20 * Math.max(0, 1 - timeMs / durationMs)) : 0;
    if (speed > 0) items.push({ key: 'speed', label: 'Speed', xp: speed });
    if (attempts === 1) items.push({ key: 'firstTry', label: 'First try', xp: 10 });
  }
  if (won && opponentRating - ratingBefore >= UPSET_GAP) items.push({ key: 'upset', label: 'Upset win', xp: 15 });
  return items;
}

// Overall level = topic XP + arena XP.
export async function getOverallXp(userId) {
  const user = new mongoose.Types.ObjectId(String(userId));
  const sum = (Model) => Model.aggregate([{ $match: { user } }, { $group: { _id: null, xp: { $sum: '$xp' } } }]);
  const [[topic], [arena]] = await Promise.all([sum(XPProgress), sum(ArenaXP)]);
  const arenaXp = arena?.xp ?? 0;
  return { arenaXp, overall: xpProgressWithinLevel((topic?.xp ?? 0) + arenaXp) };
}

// Saves each player's arena XP for a finished battle and returns
// { [userId]: { gained, items, overall } }. A failure is logged and gives
// {} so the battle still ends.
export async function awardArenaXp(matchId, players) {
  if (!matchId) return {};
  try {
    const out = {};
    for (const p of players) {
      const items = arenaXpBreakdown(p);
      const gained = items.reduce((n, i) => n + i.xp, 0);
      await ArenaXP.updateOne(
        { user: p.userId, match: matchId },
        { $setOnInsert: { xp: gained, items } },
        { upsert: true }
      );
      out[p.userId] = { gained, items, overall: (await getOverallXp(p.userId)).overall };
    }
    return out;
  } catch (err) {
    logger.error(`[ArenaXP] Could not award XP for match ${matchId}: ${err.message}`);
    return {};
  }
}
