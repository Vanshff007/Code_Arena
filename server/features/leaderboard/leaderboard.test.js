import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../app.js';
import User from '../auth/User.model.js';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await User.deleteMany({});
});

function makeUser(username, stats) {
  return User.create({ username, email: `${username}@test.com`, password: 'password123', ...stats });
}

describe('leaderboard', () => {
  it('returns an empty list when there are no users', async () => {
    const res = await request(app).get('/api/leaderboard');
    expect(res.status).toBe(200);
    expect(res.body.data.leaderboard).toEqual([]);
  });

  it('ranks users by rating, highest first', async () => {
    await makeUser('low', { rating: 900 });
    await makeUser('high', { rating: 1400 });
    await makeUser('mid', { rating: 1100 });

    const res = await request(app).get('/api/leaderboard');
    const rows = res.body.data.leaderboard;

    expect(rows.map((r) => r.username)).toEqual(['high', 'mid', 'low']);
    expect(rows.map((r) => r.rank)).toEqual([1, 2, 3]);
  });

  it('computes win rate and handles zero battles', async () => {
    await makeUser('fighter', { rating: 1200, wins: 3, losses: 1, totalBattles: 4 });
    await makeUser('rookie', { rating: 1000 });

    const res = await request(app).get('/api/leaderboard');
    const [fighter, rookie] = res.body.data.leaderboard;

    expect(fighter.winRate).toBe(75);
    expect(rookie.winRate).toBe(0);
  });

  it('respects the limit query parameter', async () => {
    await makeUser('user1', { rating: 1000 });
    await makeUser('user2', { rating: 1001 });
    await makeUser('user3', { rating: 1002 });

    const res = await request(app).get('/api/leaderboard?limit=2');
    expect(res.body.data.leaderboard).toHaveLength(2);
  });

  it('never exposes email or password', async () => {
    await makeUser('private', { rating: 1000 });

    const res = await request(app).get('/api/leaderboard');
    const [row] = res.body.data.leaderboard;

    expect(row.email).toBeUndefined();
    expect(row.password).toBeUndefined();
  });
});
