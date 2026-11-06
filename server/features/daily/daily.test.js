import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../app.js';
import User from '../auth/User.model.js';
import Problem from '../problems/Problem.model.js';
import PerformanceHistory from '../skills/PerformanceHistory.model.js';
import DailyProblem from './DailyProblem.model.js';
import { dayId, previousDay, streakFrom, getDailyProblem, getStreak } from './daily.service.js';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await Promise.all([
    User.deleteMany({}),
    Problem.deleteMany({}),
    PerformanceHistory.deleteMany({}),
    DailyProblem.deleteMany({}),
  ]);
});

const problemDoc = (title) => ({
  title,
  difficulty: 'Easy',
  description: 'd',
  examples: [{ input: '1', output: '1' }],
  publicTestCases: [{ input: '1', output: '1' }],
  hiddenTestCases: [{ input: 'secret-in', output: 'secret-out' }],
});

async function register(username) {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ username, email: `${username}@test.com`, password: 'password123' });
  return { token: res.body.data.token, userId: res.body.data.user._id };
}

const solve = (user, problem, createdAt, isAccepted = true) =>
  PerformanceHistory.collection.insertOne({
    user: new mongoose.Types.ObjectId(user),
    problem: problem._id,
    language: 'python',
    verdict: isAccepted ? 'Accepted' : 'Wrong Answer',
    isAccepted,
    createdAt,
    updatedAt: createdAt,
  });

describe('day helpers', () => {
  it('uses UTC days', () => {
    expect(dayId(new Date('2026-11-06T23:59:59Z'))).toBe('2026-11-06');
    expect(previousDay('2026-03-01')).toBe('2026-02-28');
    expect(previousDay('2026-01-01')).toBe('2025-12-31');
  });

  it('counts consecutive days, and an unsolved today does not break the streak', () => {
    const days = new Set(['2026-11-04', '2026-11-05']);
    expect(streakFrom(days, '2026-11-05')).toBe(2);
    expect(streakFrom(days, '2026-11-06')).toBe(2); // today not solved yet
    expect(streakFrom(days, '2026-11-07')).toBe(0); // missed yesterday
    expect(streakFrom(new Set(), '2026-11-06')).toBe(0);
  });
});

describe('daily problem', () => {
  it('returns 404 when the bank is empty and requires login', async () => {
    expect((await request(app).get('/api/daily')).status).toBe(401);
    const { token } = await register('dailyEmpty');
    const res = await request(app).get('/api/daily').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it('keeps one problem per day for everyone and never leaks hidden tests', async () => {
    await Problem.create(problemDoc('Daily A'));
    await Problem.create(problemDoc('Daily B'));
    const a = await register('dailyA');
    const b = await register('dailyB');

    const ra = await request(app).get('/api/daily').set('Authorization', `Bearer ${a.token}`);
    const rb = await request(app).get('/api/daily').set('Authorization', `Bearer ${b.token}`);
    expect(ra.status).toBe(200);
    expect(ra.body.data.problem._id).toBe(rb.body.data.problem._id);
    expect(ra.body.data).toMatchObject({ date: dayId(), solvedToday: false, streak: 0 });
    expect(JSON.stringify(ra.body)).not.toMatch(/secret|hiddenTestCases/);
    expect(await DailyProblem.countDocuments()).toBe(1);
  });

  it('replaces a pick whose problem was deleted', async () => {
    const gone = await Problem.create(problemDoc('Deleted'));
    const kept = await Problem.create(problemDoc('Kept'));
    await DailyProblem.create({ date: dayId(), problem: gone._id });
    await Problem.deleteOne({ _id: gone._id });
    const daily = await getDailyProblem();
    expect(daily.problem._id.toString()).toBe(kept._id.toString());
  });

  it('counts the streak from accepted solves of each day\'s problem on that day', async () => {
    const now = new Date('2026-11-06T12:00:00Z');
    const p1 = await Problem.create(problemDoc('Day 1'));
    const p2 = await Problem.create(problemDoc('Day 2'));
    const p3 = await Problem.create(problemDoc('Day 3'));
    await DailyProblem.create([
      { date: '2026-11-04', problem: p1._id },
      { date: '2026-11-05', problem: p2._id },
      { date: '2026-11-06', problem: p3._id },
    ]);
    const { userId } = await register('streaker');

    await solve(userId, p1, new Date('2026-11-04T08:00:00Z'));
    await solve(userId, p2, new Date('2026-11-05T22:00:00Z'));
    expect(await getStreak(userId, now)).toEqual({ streak: 2, solvedToday: false });

    // A wrong answer today, or today's problem solved on another day, does not count.
    await solve(userId, p3, new Date('2026-11-06T09:00:00Z'), false);
    await solve(userId, p1, new Date('2026-11-06T09:00:00Z'));
    expect(await getStreak(userId, now)).toEqual({ streak: 2, solvedToday: false });

    await solve(userId, p3, new Date('2026-11-06T10:00:00Z'));
    expect(await getStreak(userId, now)).toEqual({ streak: 3, solvedToday: true });
  });
});
