// Exercises the real Docker judge (not a mock) - requires the sandbox
// images to already be built: run `npm run docker:build` first (CI does
// this before `npm test`; see .github/workflows/ci.yml).
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../app.js';
import User from '../models/User.model.js';
import Problem from '../models/Problem.model.js';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await Promise.all([User.deleteMany({}), Problem.deleteMany({})]);
});

async function registerUser(username) {
  const reg = await request(app)
    .post('/api/auth/register')
    .send({ username, email: `${username}@test.com`, password: 'password123' });
  return reg.body.data.token;
}

describe('judge (real Docker execution)', () => {
  it(
    'accepts a correct solution',
    async () => {
      const problem = await Problem.create({
        title: 'Judge Test - Sum Two Numbers',
        difficulty: 'Easy',
        description: 'Read two integers and print their sum.',
        examples: [{ input: '2 3', output: '5' }],
        publicTestCases: [{ input: '2 3', output: '5' }],
        hiddenTestCases: [{ input: '10 20', output: '30' }],
      });
      const token = await registerUser('judgeuserok');

      const res = await request(app)
        .post('/api/execute/submit')
        .set('Authorization', `Bearer ${token}`)
        .send({
          language: 'python',
          code: 'a, b = map(int, input().split())\nprint(a + b)',
          problemId: problem._id.toString(),
        });

      expect(res.status).toBe(200);
      expect(res.body.data.verdict).toBe('Accepted');
      expect(res.body.data.passedCount).toBe(res.body.data.totalCount);
    },
    30000
  );

  it(
    'rejects an incorrect solution',
    async () => {
      const problem = await Problem.create({
        title: 'Judge Test - Sum Two Numbers (Wrong)',
        difficulty: 'Easy',
        description: 'Read two integers and print their sum.',
        examples: [{ input: '2 3', output: '5' }],
        publicTestCases: [{ input: '2 3', output: '5' }],
        hiddenTestCases: [{ input: '10 20', output: '30' }],
      });
      const token = await registerUser('judgeuserbad');

      const res = await request(app)
        .post('/api/execute/submit')
        .set('Authorization', `Bearer ${token}`)
        .send({
          language: 'python',
          code: 'a, b = map(int, input().split())\nprint(a - b)',
          problemId: problem._id.toString(),
        });

      expect(res.status).toBe(200);
      expect(res.body.data.verdict).toBe('Wrong Answer');
    },
    30000
  );
});
