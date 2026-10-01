import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../app.js';
import User from '../auth/User.model.js';
import SkillProfile from './SkillProfile.model.js';
import XPProgress from './XPProgress.model.js';
import AIFeedbackHistory from './AIFeedbackHistory.model.js';
import { calculateSubmissionScore } from './scoring.service.js';
import { xpForLevel, levelForXp, xpProgressWithinLevel, xpFromScore } from './xp.service.js';
import { computeTopicScore } from './skillAnalyzer.service.js';
import { pickConceptsToRecommend } from './recommendation.service.js';
import { generateFeedback } from './aiCoach.service.js';
import { normalizeTopicName } from './topics.js';

describe('scoring', () => {
  it('scales the base score by difficulty', () => {
    const easy = calculateSubmissionScore({ difficulty: 'Easy' });
    const hard = calculateSubmissionScore({ difficulty: 'Hard' });
    expect(easy).toBe(115); // 100 * (1 + 0.15 no-hints bonus)
    expect(hard).toBe(575);
  });

  it('rewards a first attempt and penalizes wrong attempts', () => {
    const first = calculateSubmissionScore({ difficulty: 'Medium', isFirstAttempt: true });
    const retried = calculateSubmissionScore({ difficulty: 'Medium', wrongAttempts: 3 });
    expect(first).toBeGreaterThan(retried);
  });

  it('never goes below zero', () => {
    const score = calculateSubmissionScore({
      difficulty: 'Easy',
      wrongAttempts: 50,
      hintsUsed: 3,
      editorialViewed: true,
    });
    expect(score).toBe(0);
  });

  it('returns 0 for an unknown difficulty', () => {
    expect(calculateSubmissionScore({ difficulty: 'Impossible' })).toBe(0);
  });
});

describe('xp', () => {
  it('starts at level 1 with 0 xp', () => {
    expect(xpForLevel(1)).toBe(0);
    expect(levelForXp(0)).toBe(1);
  });

  it('levels up exactly at the threshold', () => {
    const need = xpForLevel(2);
    expect(levelForXp(need - 1)).toBe(1);
    expect(levelForXp(need)).toBe(2);
  });

  it('makes each level cost more than the last', () => {
    const step2 = xpForLevel(3) - xpForLevel(2);
    const step1 = xpForLevel(2) - xpForLevel(1);
    expect(step2).toBeGreaterThan(step1);
  });

  it('reports progress inside the current level', () => {
    const p = xpProgressWithinLevel(150);
    expect(p.level).toBe(2);
    expect(p.xpIntoLevel).toBe(50);
    expect(p.xpForNextLevel).toBe(115);
  });

  it('converts score to xp', () => {
    expect(xpFromScore(250)).toBe(125);
  });
});

describe('skill analyzer', () => {
  it('scores 0 with no data at all', () => {
    expect(computeTopicScore({})).toBe(0);
  });

  it('uses the LeetCode seed alone when there is no CodeArena history', () => {
    expect(computeTopicScore({ leetcodeCount: 1 })).toBe(50);
  });

  it('scores all-time LeetCode counts on a curve that keeps rising with volume', () => {
    expect(computeTopicScore({ leetcodeAllTimeCount: 0 })).toBe(0);
    expect(computeTopicScore({ leetcodeAllTimeCount: 1 })).toBe(15);
    expect(computeTopicScore({ leetcodeAllTimeCount: 7 })).toBe(45);
    expect(computeTopicScore({ leetcodeAllTimeCount: 63 })).toBe(90);
    expect(computeTopicScore({ leetcodeAllTimeCount: 300 })).toBe(100);
  });

  it('prefers all-time counts over the recent window when both are known', () => {
    expect(computeTopicScore({ leetcodeCount: 1, leetcodeAllTimeCount: 63 })).toBe(90);
  });

  it('weights repeated success above a single lucky solve', () => {
    const one = computeTopicScore({ performanceRecords: [{ isAccepted: true }] });
    const ten = computeTopicScore({ performanceRecords: Array(10).fill({ isAccepted: true }) });
    expect(ten).toBeGreaterThan(one);
    expect(ten).toBeLessThanOrEqual(100);
  });

  it('normalizes problem tags to canonical topic names', () => {
    expect(normalizeTopicName('dynamic programming')).toBe('Dynamic Programming');
    expect(normalizeTopicName('custom-tag')).toBe('custom-tag');
  });
});

describe('recommendations', () => {
  it('recommends adjacent concepts for weak topics', () => {
    const r = pickConceptsToRecommend({ Graphs: 20 });
    expect(r.weakTopics).toEqual(['Graphs']);
    expect(r.concepts).toEqual(['BFS', 'DFS', 'Shortest Path', 'Union Find']);
  });

  it('recommends advanced concepts for strong topics', () => {
    const r = pickConceptsToRecommend({ Trees: 90 });
    expect(r.strongTopics).toEqual(['Trees']);
    expect(r.concepts).toContain('LCA');
  });

  it('recommends nothing for mid-range or unknown topics', () => {
    expect(pickConceptsToRecommend({ Arrays: 55, Unknown: 10 }).concepts).toEqual([]);
  });
});

describe('coach feedback', () => {
  it('flags a struggle and repeat struggles on a failed submission', () => {
    const { messages } = generateFeedback({
      verdict: 'Wrong Answer',
      topic: 'Graphs',
      topicScore: 30,
      recentTopicStruggles: ['Graphs'],
    });
    expect(messages[0]).toBe('You struggled with this Graphs problem.');
    expect(messages.join(' ')).toMatch(/also struggled with Graphs/);
  });

  it('praises a faster-than-average solve', () => {
    const { messages } = generateFeedback({
      verdict: 'Accepted',
      timeTakenMs: 5 * 60000,
      averageTimeMs: 15 * 60000,
      topic: 'Arrays',
      topicScore: 60,
    });
    expect(messages).toContain('Excellent speed.');
  });
});

describe('skills API', () => {
  let token;
  let userId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Promise.all([
      User.deleteMany({}),
      SkillProfile.deleteMany({}),
      XPProgress.deleteMany({}),
      AIFeedbackHistory.deleteMany({}),
    ]);
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ username: 'skilled', email: 'skilled@test.com', password: 'password123' });
    token = reg.body.data.token;
    userId = reg.body.data.user._id || reg.body.data.user.id;
  });

  const get = (path) => request(app).get(path).set('Authorization', `Bearer ${token}`);

  it('requires login', async () => {
    for (const path of ['/api/skills/me', '/api/skills/xp', '/api/skills/recommendations', '/api/skills/feedback']) {
      const res = await request(app).get(path);
      expect(res.status).toBe(401);
    }
  });

  it('returns an empty profile for a new user', async () => {
    const res = await get('/api/skills/me');
    expect(res.status).toBe(200);
    expect(res.body.data.topicScores).toEqual({});
  });

  it('returns xp with derived levels, highest first', async () => {
    await XPProgress.create([
      { user: userId, topic: 'Arrays', xp: 50 },
      { user: userId, topic: 'Graphs', xp: 300 },
    ]);
    const res = await get('/api/skills/xp');
    const [first, second] = res.body.data.xp;

    expect(first.topic).toBe('Graphs');
    expect(first.level).toBeGreaterThan(1);
    expect(second.level).toBe(1);
  });

  it('returns recommendations and feedback lists', async () => {
    const rec = await get('/api/skills/recommendations');
    expect(rec.status).toBe(200);
    expect(Array.isArray(rec.body.data.problems)).toBe(true);

    const fb = await get('/api/skills/feedback');
    expect(fb.status).toBe(200);
    expect(fb.body.data.feedback).toEqual([]);
  });
});
