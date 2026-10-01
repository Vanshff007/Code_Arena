import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../app.js';
import User from '../auth/User.model.js';
import Match from '../battles/Match.model.js';
import Problem from '../problems/Problem.model.js';
import { seasonId, isSeasonId, seasonRange, seasonLabel } from './seasons.js';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await Promise.all([User.deleteMany({}), Match.deleteMany({}), Problem.deleteMany({})]);
});

describe('season helpers', () => {
  it('names seasons by UTC month', () => {
    expect(seasonId(new Date(Date.UTC(2026, 9, 31, 23, 59)))).toBe('2026-10');
    expect(isSeasonId('2026-10')).toBe(true);
    expect(isSeasonId('2026-13')).toBe(false);
    expect(seasonRange('2026-12')).toEqual({ start: new Date(Date.UTC(2026, 11, 1)), end: new Date(Date.UTC(2027, 0, 1)) });
    expect(seasonLabel('2026-10')).toBe('October 2026');
  });
});

describe('season leaderboard', () => {
  async function battle(winner, loser, endedAt, delta = 16) {
    const problem = await Problem.findOne();
    await Match.create({
      problem: problem._id,
      status: 'completed',
      winner: winner._id,
      durationMs: 1,
      startedAt: endedAt,
      endedAt,
      players: [
        { user: winner._id, ratingBefore: 1000, ratingAfter: 1000 + delta },
        { user: loser._id, ratingBefore: 1000, ratingAfter: 1000 - delta },
      ],
    });
  }

  it('ranks by rating points gained that month only', async () => {
    await Problem.create({
      title: 'P',
      difficulty: 'Easy',
      description: 'd',
      examples: [{ input: '1', output: '1' }],
      publicTestCases: [{ input: '1', output: '1' }],
      hiddenTestCases: [{ input: '1', output: '1' }],
    });
    const [ann, bob, cat] = await User.create([
      { username: 'annseason', email: 'a@s.com', password: 'password123' },
      { username: 'bobseason', email: 'b@s.com', password: 'password123' },
      { username: 'catseason', email: 'c@s.com', password: 'password123' },
    ]);
    const oct = new Date(Date.UTC(2026, 9, 5));
    await battle(ann, bob, oct);
    await battle(ann, cat, oct);
    await battle(bob, cat, oct, 10);
    await battle(cat, ann, new Date(Date.UTC(2026, 8, 20)), 30); // September - not counted

    const res = await request(app).get('/api/leaderboard/seasons/2026-10');
    expect(res.status).toBe(200);
    const rows = res.body.data.leaderboard;
    expect(rows.map((r) => [r.username, r.points, r.wins, r.battles])).toEqual([
      ['annseason', 32, 2, 2],
      ['bobseason', -6, 1, 2],
      ['catseason', -26, 0, 2],
    ]);
    expect(rows[0].rank).toBe(1);
    expect(res.body.data.season.label).toBe('October 2026');

    const list = await request(app).get('/api/leaderboard/seasons');
    const ids = list.body.data.seasons.map((s) => s.id);
    expect(ids).toEqual(expect.arrayContaining(['2026-10', '2026-09', seasonId()]));
    expect(list.body.data.seasons.find((s) => s.current).id).toBe(seasonId());
  });

  it('rejects a malformed season', async () => {
    const res = await request(app).get('/api/leaderboard/seasons/october');
    expect(res.status).toBe(400);
  });
});
