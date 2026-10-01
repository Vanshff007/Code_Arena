import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../app.js';
import User from '../auth/User.model.js';
import Problem from './Problem.model.js';
import EditorialView from './EditorialView.model.js';
import { rooms, createRoomState } from '../battles/state.js';

// A function-style problem: add(a, b) -> a + b.
const addProblem = (title, extra = {}) => ({
  title,
  difficulty: 'Easy',
  description: 'Return a + b.',
  signature: {
    functionName: 'add',
    params: [
      { name: 'a', type: 'int' },
      { name: 'b', type: 'int' },
    ],
    returnType: 'int',
  },
  examples: [{ input: '1\n2', output: '3' }],
  publicTestCases: [{ input: '1\n2', output: '3' }],
  hiddenTestCases: [{ input: '10\n5', output: '15' }],
  ...extra,
});

const GOOD = { language: 'python', code: 'class Solution:\n    def add(self, a, b):\n        return a + b\n' };
const BAD = { language: 'python', code: 'class Solution:\n    def add(self, a, b):\n        return a - b\n' };

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await Promise.all([User.deleteMany({}), Problem.deleteMany({}), EditorialView.deleteMany({})]);
});

afterEach(() => rooms.clear());

async function tokenFor(username, { admin = false } = {}) {
  const reg = await request(app)
    .post('/api/auth/register')
    .send({ username, email: `${username}@test.com`, password: 'password123' });
  if (admin) await User.updateOne({ username }, { role: 'admin' });
  return reg.body.data.token;
}

describe('problems', () => {
  it('lists problems publicly with no auth required', async () => {
    await Problem.create(addProblem('Listed Problem'));
    const res = await request(app).get('/api/problems');
    expect(res.status).toBe(200);
    expect(res.body.data.problems).toHaveLength(1);
    expect(res.body.data.problems[0].title).toBe('Listed Problem');
  });

  it('never leaks hiddenTestCases or the editorial on the detail endpoint', async () => {
    const problem = await Problem.create(addProblem('Detail Problem', { editorial: { approach: 'Add them.' } }));
    const res = await request(app).get(`/api/problems/${problem._id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.problem.hiddenTestCases).toBeUndefined();
    expect(res.body.data.problem.editorial).toBeUndefined();
  });

  it('rejects problem creation for a non-admin user', async () => {
    const token = await tokenFor('regularuser');
    const res = await request(app)
      .post('/api/problems')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...addProblem('Should Not Be Created'), referenceSolution: GOOD });
    expect(res.status).toBe(403);
    expect(await Problem.findOne({ title: 'Should Not Be Created' })).toBeNull();
  });

  it('rejects problem creation with no session at all', async () => {
    const res = await request(app).post('/api/problems').send(addProblem('Anonymous Attempt'));
    expect(res.status).toBe(401);
  });
});

describe('admin problem management', () => {
  it('requires a reference solution to create a problem', async () => {
    const token = await tokenFor('adminnoref', { admin: true });
    const res = await request(app).post('/api/problems').set('Authorization', `Bearer ${token}`).send(addProblem('No Ref'));
    expect(res.status).toBe(400);
  });

  it(
    'refuses to save when the reference solution fails, and shows why',
    async () => {
      const token = await tokenFor('adminbad', { admin: true });
      const res = await request(app)
        .post('/api/problems')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...addProblem('Bad Ref'), referenceSolution: BAD });
      expect(res.status).toBe(422);
      expect(res.body.data.check.verdict).toBe('Wrong Answer');
      expect(res.body.data.check.failedCase).toMatchObject({ expectedOutput: '3', actualOutput: '-1' });
      expect(await Problem.findOne({ title: 'Bad Ref' })).toBeNull();
    },
    60000
  );

  it(
    'creates the problem when the reference solution passes every case',
    async () => {
      const token = await tokenFor('admingood', { admin: true });
      const res = await request(app)
        .post('/api/problems')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...addProblem('Good Ref'), referenceSolution: GOOD, editorial: { approach: 'Add them.' } });
      expect(res.status).toBe(201);
      expect(res.body.data.problem.starterCode.python).toContain('def add(self, a: int, b: int) -> int:');
    },
    60000
  );

  it(
    'checks a draft without saving it',
    async () => {
      const token = await tokenFor('admincheck', { admin: true });
      const res = await request(app)
        .post('/api/problems/check')
        .set('Authorization', `Bearer ${token}`)
        .send({ problem: addProblem('Draft'), referenceSolution: GOOD });
      expect(res.status).toBe(200);
      expect(res.body.data.check.verdict).toBe('Accepted');
      expect(await Problem.countDocuments()).toBe(0);
    },
    60000
  );

  it('shows admins the editorial and the hidden case count, never hidden content', async () => {
    const token = await tokenFor('adminview', { admin: true });
    const problem = await Problem.create(addProblem('Admin View', { editorial: { approach: 'Add.' } }));
    const res = await request(app).get(`/api/problems/${problem._id}/admin`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.hiddenCount).toBe(1);
    expect(res.body.data.problem.hiddenTestCases).toBeUndefined();
    expect(res.body.data.problem.editorial.approach).toBe('Add.');
  });

  it(
    'lets text edits through without a reference, but not test changes',
    async () => {
      const token = await tokenFor('adminedit', { admin: true });
      const problem = await Problem.create(addProblem('Editable'));
      const auth = { Authorization: `Bearer ${token}` };

      const text = await request(app).put(`/api/problems/${problem._id}`).set(auth).send({ description: 'New text.' });
      expect(text.status).toBe(200);
      expect(text.body.data.problem.description).toBe('New text.');

      const tests = await request(app)
        .put(`/api/problems/${problem._id}`)
        .set(auth)
        .send({ publicTestCases: [{ input: '2\n2', output: '4' }] });
      expect(tests.status).toBe(400);

      // Keeps the stored hidden case (10 + 5 = 15) when only public cases change.
      const withRef = await request(app)
        .put(`/api/problems/${problem._id}`)
        .set(auth)
        .send({ publicTestCases: [{ input: '2\n2', output: '4' }], referenceSolution: GOOD });
      expect(withRef.status).toBe(200);
      const stored = await Problem.findById(problem._id).select('+hiddenTestCases');
      expect(stored.hiddenTestCases).toHaveLength(1);
    },
    60000
  );
});

describe('editorial', () => {
  it('returns 404 when a problem has no editorial', async () => {
    const token = await tokenFor('noeditorial');
    const problem = await Problem.create(addProblem('No Editorial'));
    const res = await request(app).get(`/api/problems/${problem._id}/editorial`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it('returns the editorial and records the view', async () => {
    const token = await tokenFor('reader');
    const problem = await Problem.create(addProblem('Has Editorial', { editorial: { approach: 'Add them.', solutions: { python: 'x' } } }));
    const res = await request(app).get(`/api/problems/${problem._id}/editorial`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.editorial.approach).toBe('Add them.');
    expect(await EditorialView.countDocuments({ problem: problem._id })).toBe(1);
  });

  it('is blocked while the player is in a live battle on that problem', async () => {
    const token = await tokenFor('battler');
    const user = await User.findOne({ username: 'battler' });
    const problem = await Problem.create(addProblem('Battle Problem', { editorial: { approach: 'Secret.' } }));
    const room = createRoomState('EDIT01', { userId: user._id.toString(), username: 'battler', rating: 1000 });
    room.status = 'in_progress';
    room.problem = problem;

    const res = await request(app).get(`/api/problems/${problem._id}/editorial`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });
});
