import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../app.js';
import User from '../auth/User.model.js';
import Problem from './Problem.model.js';

const validProblemBody = (title) => ({
  title,
  difficulty: 'Easy',
  description: 'A trivial test problem.',
  examples: [{ input: 'a', output: 'b' }],
  publicTestCases: [{ input: 'a', output: 'b' }],
  hiddenTestCases: [{ input: 'a', output: 'b' }],
});

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await Promise.all([User.deleteMany({}), Problem.deleteMany({})]);
});

describe('problems', () => {
  it('lists problems publicly with no auth required', async () => {
    await Problem.create(validProblemBody('Listed Problem'));

    const res = await request(app).get('/api/problems');

    expect(res.status).toBe(200);
    expect(res.body.data.problems).toHaveLength(1);
    expect(res.body.data.problems[0].title).toBe('Listed Problem');
  });

  it('never leaks hiddenTestCases on the detail endpoint', async () => {
    const problem = await Problem.create(validProblemBody('Detail Problem'));

    const res = await request(app).get(`/api/problems/${problem._id}`);

    expect(res.status).toBe(200);
    expect(res.body.data.problem.hiddenTestCases).toBeUndefined();
  });

  it('rejects problem creation for a non-admin user', async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ username: 'regularuser', email: 'regularuser@test.com', password: 'password123' });

    const res = await request(app)
      .post('/api/problems')
      .set('Authorization', `Bearer ${reg.body.data.token}`)
      .send(validProblemBody('Should Not Be Created'));

    expect(res.status).toBe(403);
    expect(await Problem.findOne({ title: 'Should Not Be Created' })).toBeNull();
  });

  it('rejects problem creation with no token at all', async () => {
    const res = await request(app).post('/api/problems').send(validProblemBody('Anonymous Attempt'));
    expect(res.status).toBe(401);
  });

  it('allows problem creation for an admin user', async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ username: 'adminuser', email: 'adminuser@test.com', password: 'password123' });
    await User.updateOne({ email: 'adminuser@test.com' }, { role: 'admin' });

    const res = await request(app)
      .post('/api/problems')
      .set('Authorization', `Bearer ${reg.body.data.token}`)
      .send(validProblemBody('Admin Created Problem'));

    expect(res.status).toBe(201);
    expect(await Problem.findOne({ title: 'Admin Created Problem' })).not.toBeNull();
  });
});
