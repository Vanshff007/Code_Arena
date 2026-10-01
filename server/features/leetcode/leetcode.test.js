// LeetCode's API is never called for real here: global fetch is stubbed so
// these tests are deterministic and do not depend on leetcode.com.
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../app.js';
import User from '../auth/User.model.js';
import SkillProfile from '../skills/SkillProfile.model.js';
import {
  pickFocusTopics,
  difficultyFor,
  selectProblems,
  clearRecommendationCache,
} from './leetcodeRecommendations.service.js';
import { topicCountsFromTags, summarizeCalendar, summarizeContests } from './leetcode.service.js';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await mongoose.connection.close();
});

let token;

beforeEach(async () => {
  await Promise.all([User.deleteMany({}), SkillProfile.deleteMany({})]);
  const reg = await request(app)
    .post('/api/auth/register')
    .send({ username: 'lcfan', email: 'lcfan@test.com', password: 'password123' });
  token = reg.body.data.token;
});

afterEach(() => {
  vi.unstubAllGlobals();
  clearRecommendationCache();
});

const post = (path, body) => request(app).post(path).set('Authorization', `Bearer ${token}`).send(body);

// Answers each GraphQL query by the operation it asks for.
function stubLeetCode({ found = true } = {}) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url, options) => {
      const { query } = JSON.parse(options.body);
      let data;
      if (query.includes('tagProblemCounts')) {
        data = found
          ? {
              matchedUser: {
                tagProblemCounts: {
                  fundamental: [{ tagSlug: 'array', problemsSolved: 120 }],
                  intermediate: [
                    { tagSlug: 'hash-table', problemsSolved: 40 },
                    { tagSlug: 'tree', problemsSolved: 10 },
                    { tagSlug: 'binary-tree', problemsSolved: 14 },
                  ],
                  advanced: [{ tagSlug: 'dynamic-programming', problemsSolved: 3 }],
                },
                languageProblemCount: [
                  { languageName: 'Python3', problemsSolved: 50 },
                  { languageName: 'C++', problemsSolved: 70 },
                ],
                userCalendar: { streak: 4, totalActiveDays: 90, submissionCalendar: '{}' },
              },
              userContestRankingHistory: [
                { attended: false, rating: 1500, ranking: 0, contest: { title: 'Skipped', startTime: 1 } },
                { attended: true, rating: 1612.7, ranking: 3456, contest: { title: 'Weekly 400', startTime: 1717200000 } },
              ],
            }
          : { matchedUser: null, userContestRankingHistory: [] };
      } else if (query.includes('matchedUser')) {
        data = found
          ? {
              matchedUser: {
                username: 'lc_user',
                submitStats: {
                  acSubmissionNum: [
                    { difficulty: 'All', count: 60 },
                    { difficulty: 'Easy', count: 30 },
                    { difficulty: 'Medium', count: 25 },
                    { difficulty: 'Hard', count: 5 },
                  ],
                },
              },
            }
          : { matchedUser: null };
      } else if (query.includes('userContestRanking')) {
        data = { userContestRanking: { rating: 1650.4, globalRanking: 12000, attendedContestsCount: 4 } };
      } else if (query.includes('questionList')) {
        data = {
          problemsetQuestionList: {
            questions: [
              { title: 'Two Sum', titleSlug: 'two-sum', difficulty: 'Medium', acRate: 55, isPaidOnly: false },
              { title: 'Paid One', titleSlug: 'paid-one', difficulty: 'Medium', acRate: 90, isPaidOnly: true },
              { title: 'Hard To Crack', titleSlug: 'hard-to-crack', difficulty: 'Medium', acRate: 30.4, isPaidOnly: false },
              { title: 'Friendly', titleSlug: 'friendly', difficulty: 'Medium', acRate: 70.6, isPaidOnly: false },
            ],
          },
        };
      } else if (query.includes('recentAcSubmissionList')) {
        data = { recentAcSubmissionList: [{ title: 'Two Sum', titleSlug: 'two-sum', timestamp: '1' }] };
      } else {
        data = { question: { topicTags: [{ name: 'Array', slug: 'array' }, { name: 'Hash Table', slug: 'hash-table' }] } };
      }
      return { ok: true, json: async () => ({ data }) };
    })
  );
}

describe('leetcode', () => {
  it('requires login', async () => {
    const res = await request(app).post('/api/leetcode/connect').send({ username: 'x' });
    expect(res.status).toBe(401);
  });

  it('rejects an invalid username', async () => {
    const res = await post('/api/leetcode/connect', { username: 'bad name!' });
    expect(res.status).toBe(400);
  });

  it('connects a username without syncing', async () => {
    const res = await post('/api/leetcode/connect', { username: 'lc_user' });
    expect(res.status).toBe(200);
    expect(res.body.data.leetcode.username).toBe('lc_user');
    expect(res.body.data.leetcode.syncStatus).toBe('idle');
  });

  it('refuses to sync before a username is connected', async () => {
    const res = await post('/api/leetcode/sync');
    expect(res.status).toBe(400);
  });

  it('syncs stats and topic counts', async () => {
    stubLeetCode();
    await post('/api/leetcode/connect', { username: 'lc_user' });

    const res = await post('/api/leetcode/sync');
    const { leetcode } = res.body.data;

    expect(res.status).toBe(200);
    expect(leetcode.syncStatus).toBe('synced');
    expect(leetcode.stats.totalSolved).toBe(60);
    expect(leetcode.stats.contestRating).toBeCloseTo(1650.4);
    expect(leetcode.topicCounts).toMatchObject({ Arrays: 1, Hashing: 1 });
    expect(leetcode.recentSolvedSlugs).toEqual(['two-sum']);
    expect(leetcode.allTimeTopicCounts).toMatchObject({ Arrays: 120, Hashing: 40, Trees: 14, 'Dynamic Programming': 3 });
    expect(leetcode.languages[0]).toEqual({ name: 'C++', solved: 70 });
    expect(leetcode.activity).toMatchObject({ streak: 4, totalActiveDays: 90 });
    expect(leetcode.contestHistory).toHaveLength(1);
    expect(leetcode.contestHistory[0]).toMatchObject({ title: 'Weekly 400', rating: 1613 });

    // All-time counts drive the skill seed: 120 Arrays solves is not a beginner.
    const profile = await SkillProfile.findOne({});
    expect(profile.topicScores.get('Arrays')).toBeGreaterThanOrEqual(95);
    expect(profile.topicScores.get('Dynamic Programming')).toBe(30);
  });

  it('returns 404 and records the failure for an unknown LeetCode user', async () => {
    stubLeetCode({ found: false });
    await post('/api/leetcode/connect', { username: 'ghost' });

    const res = await post('/api/leetcode/sync');
    expect(res.status).toBe(404);

    const user = await User.findOne({ username: 'lcfan' });
    expect(user.leetcode.syncStatus).toBe('failed');
  });

  it('returns 502 without crashing when LeetCode is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 503 })));
    await post('/api/leetcode/connect', { username: 'lc_user' });

    const res = await post('/api/leetcode/sync');
    expect(res.status).toBe(502);
    expect(res.body.success).toBe(false);
  });

  it('disconnect clears the connection', async () => {
    await post('/api/leetcode/connect', { username: 'lc_user' });
    const res = await post('/api/leetcode/disconnect');
    expect(res.status).toBe(200);
    expect(res.body.data.leetcode.username).toBeNull();
  });

  it('recommendations need a connected account', async () => {
    const res = await request(app).get('/api/leetcode/recommendations').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  it('recommends unsolved free problems for the topics being practiced', async () => {
    stubLeetCode();
    await post('/api/leetcode/connect', { username: 'lc_user' });
    await post('/api/leetcode/sync');

    const res = await request(app).get('/api/leetcode/recommendations').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const { topics } = res.body.data;
    // Recent: Arrays, Hashing. Weakest skill: Dynamic Programming (30).
    expect(topics.map((t) => t.topic)).toEqual(['Arrays', 'Hashing', 'Dynamic Programming']);
    expect(topics[0].reason).toMatch(/recent LeetCode problem/);
    // two-sum was just solved and paid-one is premium: both skipped.
    expect(topics[0].problems.map((p) => p.slug)).toEqual(['friendly', 'hard-to-crack']);
    expect(topics[0].problems[0]).toMatchObject({ acceptance: 71, url: 'https://leetcode.com/problems/friendly/' });
  });

  it('returns 502 when LeetCode is down while recommending', async () => {
    await User.updateOne({ username: 'lcfan' }, { 'leetcode.username': 'lc_user' });
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 503 })));
    const res = await request(app).get('/api/leetcode/recommendations').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(502);
  });
});

describe('leetcode profile data', () => {
  it('maps all-time tag counts to topics, taking the largest of shared tags', () => {
    expect(
      topicCountsFromTags({
        fundamental: [{ tagSlug: 'array', problemsSolved: 5 }],
        intermediate: [
          { tagSlug: 'tree', problemsSolved: 2 },
          { tagSlug: 'binary-search-tree', problemsSolved: 7 },
          { tagSlug: 'not-a-known-tag', problemsSolved: 9 },
        ],
      })
    ).toEqual({ Arrays: 5, Trees: 7 });
    expect(topicCountsFromTags(undefined)).toEqual({});
  });

  it('summarizes the activity calendar', () => {
    const now = Date.UTC(2026, 9, 1);
    const day = 24 * 60 * 60;
    const cal = JSON.stringify({ [now / 1000 - 2 * day]: 3, [now / 1000 - 40 * day]: 5 });
    expect(summarizeCalendar({ streak: 2, totalActiveDays: 12, submissionCalendar: cal }, now)).toEqual({
      streak: 2,
      totalActiveDays: 12,
      last30Days: 3,
      lastActiveAt: new Date(now - 2 * day * 1000),
    });
    expect(summarizeCalendar(null)).toBeNull();
    expect(summarizeCalendar({ submissionCalendar: 'not json' }).last30Days).toBe(0);
  });

  it('keeps only attended contests, newest 20', () => {
    const many = Array.from({ length: 25 }, (_, i) => ({ attended: true, rating: 1500 + i, contest: { title: `C${i}` } }));
    const out = summarizeContests([{ attended: false, rating: 1, contest: { title: 'x' } }, ...many]);
    expect(out).toHaveLength(20);
    expect(out[0].title).toBe('C5');
    expect(out.at(-1)).toMatchObject({ title: 'C24', rating: 1524 });
  });
});

describe('leetcode recommendation rules', () => {
  it('picks recent topics first, then the weakest topic', () => {
    const picked = pickFocusTopics({
      topicCounts: { Graphs: 3, Arrays: 5, Math: 1 },
      topicScores: { Trees: 20, Arrays: 70 },
    });
    expect(picked.map((p) => p.topic)).toEqual(['Arrays', 'Graphs', 'Trees']);
    expect(picked[0].slug).toBe('array');
    expect(picked[2].reason).toContain('weakest topic (20/100)');
  });

  it('skips a weakest topic that is not actually weak, and topics LeetCode has no tag for', () => {
    const picked = pickFocusTopics({ topicCounts: { 'Binary Lifting': 4 }, topicScores: { Arrays: 80 } });
    expect(picked.map((p) => p.topic)).toEqual(['Arrays', 'Hashing']);
  });

  it('adds the core topic with the fewest all-time solves as a gap', () => {
    const allTimeTopicCounts = Object.fromEntries(
      ['Arrays', 'Hashing', 'Strings', 'Two Pointers', 'Sliding Window', 'Binary Search', 'Stack', 'Linked List', 'Trees', 'Heap', 'Graphs', 'Greedy', 'Dynamic Programming'].map((t) => [t, 20])
    );
    const picked = pickFocusTopics({ topicCounts: { Arrays: 3 }, allTimeTopicCounts });
    expect(picked.map((p) => p.topic)).toEqual(['Arrays', 'Backtracking']);
    expect(picked[1].reason).toMatch(/haven't solved any Backtracking/);
  });

  it('falls back to starter topics with no data', () => {
    expect(pickFocusTopics().map((p) => p.topic)).toEqual(['Arrays', 'Hashing']);
  });

  it('matches difficulty to skill', () => {
    expect(difficultyFor(undefined)).toBe('EASY');
    expect(difficultyFor(39)).toBe('EASY');
    expect(difficultyFor(60)).toBe('MEDIUM');
    expect(difficultyFor(90)).toBe('HARD');
  });

  it('filters premium and solved problems and limits the list', () => {
    const qs = [
      { title: 'A', titleSlug: 'a', difficulty: 'Easy', acRate: 50, isPaidOnly: false },
      { title: 'B', titleSlug: 'b', difficulty: 'Easy', acRate: 80, isPaidOnly: false },
      { title: 'C', titleSlug: 'c', difficulty: 'Easy', acRate: 99, isPaidOnly: true },
      { title: 'D', titleSlug: 'd', difficulty: 'Easy', acRate: 60, isPaidOnly: false },
    ];
    expect(selectProblems(qs, ['d'], 2).map((p) => p.slug)).toEqual(['b', 'a']);
  });
});
