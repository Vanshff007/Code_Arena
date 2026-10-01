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

describe('profiles', () => {
  it('returns 404 for an unknown username', async () => {
    const res = await request(app).get('/api/users/nobody/profile');
    expect(res.status).toBe(404);
  });

  it('returns public stats, rank and badges', async () => {
    await makeUser('champ', { rating: 1550, wins: 30, losses: 5, totalBattles: 35 });
    await makeUser('second', { rating: 1300 });

    const res = await request(app).get('/api/users/second/profile');
    const { user, recentMatches } = res.body.data;

    expect(res.status).toBe(200);
    expect(user.rank).toBe(2);
    expect(recentMatches).toEqual([]);

    const champ = (await request(app).get('/api/users/champ/profile')).body.data.user;
    expect(champ.rank).toBe(1);
    expect(champ.winRate).toBe(86);
    expect(champ.badges).toEqual(['First Blood', 'Rising Star', 'Veteran', 'Expert', 'Master']);
  });

  it('gives a new user no badges', async () => {
    await makeUser('fresh');
    const res = await request(app).get('/api/users/fresh/profile');
    expect(res.body.data.user.badges).toEqual([]);
  });

  it('never exposes email, password or role', async () => {
    await makeUser('quiet');
    const { user } = (await request(app).get('/api/users/quiet/profile')).body.data;

    expect(user.email).toBeUndefined();
    expect(user.password).toBeUndefined();
    expect(user.role).toBeUndefined();
  });

  it('shows the LeetCode connection as read-only data', async () => {
    await makeUser('linked', {
      leetcode: {
        username: 'lc_user',
        allTimeTopicCounts: { Arrays: 50, Graphs: 8, Trees: 20 },
        languages: [{ name: 'C++', solved: 70 }],
        activity: { streak: 3, totalActiveDays: 40, last30Days: 12 },
        contestHistory: [{ title: 'Weekly 1', rating: 1550, ranking: 900, date: new Date() }],
        recentSolvedSlugs: ['two-sum'],
      },
    });
    const { user } = (await request(app).get('/api/users/linked/profile')).body.data;
    expect(user.leetcode.username).toBe('lc_user');
    expect(user.leetcode.topTopics.map((t) => t.topic)).toEqual(['Arrays', 'Trees', 'Graphs']);
    expect(user.leetcode.languages).toEqual([{ name: 'C++', solved: 70 }]);
    expect(user.leetcode.activity).toMatchObject({ streak: 3, totalActiveDays: 40 });
    expect(user.leetcode.contestHistory[0]).toMatchObject({ title: 'Weekly 1', rating: 1550 });
    expect(user.leetcode.recentSolvedSlugs).toBeUndefined();
  });

  it('shows no LeetCode details when nothing is linked', async () => {
    await makeUser('unlinked');
    const { user } = (await request(app).get('/api/users/unlinked/profile')).body.data;
    expect(user.leetcode).toEqual({ username: null, stats: null, lastSyncedAt: null });
  });
});
