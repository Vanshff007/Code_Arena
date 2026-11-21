import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import Match from '../battles/Match.model.js';
import Problem from '../problems/Problem.model.js';
import { formFromMatches, getRecentForm, FORM_LENGTH } from './form.service.js';
import { arenaXpBreakdown, awardArenaXp, getOverallXp, UPSET_GAP } from './arenaXp.service.js';
import ArenaXP from './ArenaXP.model.js';
import XPProgress from '../skills/XPProgress.model.js';

const me = new mongoose.Types.ObjectId();
const other = new mongoose.Types.ObjectId();
const win = { winner: me, isDraw: false };
const loss = { winner: other, isDraw: false };
const draw = { winner: null, isDraw: true };

describe('formFromMatches', () => {
  it('lists the last five results oldest first and counts the win streak', () => {
    // Newest first, as the query returns them.
    const out = formFromMatches([win, win, loss, draw, win, loss, win], me);
    expect(out.form).toEqual(['W', 'D', 'L', 'W', 'W']);
    expect(out.form).toHaveLength(FORM_LENGTH);
    expect(out.streak).toBe(2);
  });

  it('gives an empty form and no streak to a new player', () => {
    expect(formFromMatches([], me)).toEqual({ form: [], streak: 0 });
  });

  it('ends a streak on a draw or a loss, and counts all wins when there is nothing else', () => {
    expect(formFromMatches([draw, win], me).streak).toBe(0);
    expect(formFromMatches([loss], me).streak).toBe(0);
    expect(formFromMatches([win, win, win], me).streak).toBe(3);
  });

  it('compares winner ids as strings', () => {
    expect(formFromMatches([{ winner: String(me), isDraw: false }], me).form).toEqual(['W']);
  });
});

describe('getRecentForm', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
  });
  afterAll(async () => {
    await mongoose.connection.close();
  });
  beforeEach(async () => {
    await Promise.all([Match.deleteMany({}), Problem.deleteMany({})]);
  });

  it('reads completed matches newest first and skips unfinished ones', async () => {
    const problem = new mongoose.Types.ObjectId();
    const match = (minutesAgo, winner, status = 'completed') =>
      Match.create({
        problem,
        players: [
          { user: me, ratingBefore: 1000 },
          { user: other, ratingBefore: 1000 },
        ],
        status,
        winner,
        durationMs: 1000,
        startedAt: new Date(Date.now() - minutesAgo * 60_000 - 1000),
        endedAt: status === 'completed' ? new Date(Date.now() - minutesAgo * 60_000) : null,
      });
    await match(30, other);
    await match(20, me);
    await match(10, me);
    await match(1, null, 'in_progress');

    const forms = await getRecentForm([String(me), String(other)]);
    expect(forms[String(me)]).toEqual({ form: ['L', 'W', 'W'], streak: 2 });
    expect(forms[String(other)]).toEqual({ form: ['W', 'L', 'L'], streak: 0 });
  });
});

describe('arenaXpBreakdown', () => {
  const base = { won: false, isDraw: false, verdict: null, attempts: 0, timeMs: null, durationMs: 1000, ratingBefore: 1000, opponentRating: 1000 };
  const keys = (p) => arenaXpBreakdown({ ...base, ...p }).map((i) => i.key);

  it('gives a loss with no solve only the played XP', () => {
    expect(arenaXpBreakdown(base)).toEqual([{ key: 'played', label: 'Battle played', xp: 10 }]);
  });

  it('adds win, solved, speed and first try for a fast first-try win', () => {
    const items = arenaXpBreakdown({ ...base, won: true, verdict: 'Accepted', attempts: 1, timeMs: 250 });
    expect(items.map((i) => i.key)).toEqual(['played', 'win', 'solved', 'speed', 'firstTry']);
    expect(items.find((i) => i.key === 'speed').xp).toBe(15);
  });

  it('gives no speed XP at the buzzer and no first try after several attempts', () => {
    expect(keys({ won: true, verdict: 'Accepted', attempts: 3, timeMs: 1000 })).toEqual(['played', 'win', 'solved']);
  });

  it('gives draw XP on a draw', () => {
    expect(keys({ isDraw: true })).toEqual(['played', 'draw']);
  });

  it('adds an upset bonus only for a win against a much higher rating', () => {
    expect(keys({ won: true, opponentRating: 1000 + UPSET_GAP })).toContain('upset');
    expect(keys({ won: true, opponentRating: 1000 + UPSET_GAP - 1 })).not.toContain('upset');
    expect(keys({ opponentRating: 2000 })).not.toContain('upset');
  });
});

describe('awardArenaXp and getOverallXp', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
  });
  afterAll(async () => {
    await mongoose.connection.close();
  });
  beforeEach(async () => {
    await Promise.all([ArenaXP.deleteMany({}), XPProgress.deleteMany({})]);
  });

  const player = { userId: String(me), won: true, isDraw: false, verdict: null, attempts: 0, timeMs: null, durationMs: 1000, ratingBefore: 1000, opponentRating: 1000 };

  it('saves one entry per match, even when awarded twice', async () => {
    const match = new mongoose.Types.ObjectId();
    const first = await awardArenaXp(match, [player]);
    expect(first[String(me)].gained).toBe(40);
    await awardArenaXp(match, [player]);
    expect(await ArenaXP.countDocuments({ user: me })).toBe(1);
  });

  it('skips a battle with no match id', async () => {
    expect(await awardArenaXp(null, [player])).toEqual({});
    expect(await ArenaXP.countDocuments()).toBe(0);
  });

  it('adds topic XP and arena XP into the overall level', async () => {
    await XPProgress.create({ user: me, topic: 'Graphs', xp: 70 });
    await awardArenaXp(new mongoose.Types.ObjectId(), [player]);
    const { arenaXp, overall } = await getOverallXp(me);
    expect(arenaXp).toBe(40);
    expect(overall).toMatchObject({ level: 2, xp: 110, xpIntoLevel: 10 });
  });
});
