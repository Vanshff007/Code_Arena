// Exercises the real Docker judge (not a mock) - requires the sandbox
// images to already be built: run `npm run docker:build` first (CI does
// this before `npm test`; see .github/workflows/ci.yml).
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../app.js';
import User from '../auth/User.model.js';
import Problem from '../problems/Problem.model.js';

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

  it(
    'accepts a correct C++ solution',
    async () => {
      const problem = await sumProblem('Judge Test - C++');
      const token = await registerUser('judgecpp');
      const code = '#include <iostream>\nint main(){long long a,b;std::cin>>a>>b;std::cout<<a+b<<"\\n";}';
      const res = await submit(token, problem, 'cpp', code);
      expect(res.body.data.verdict).toBe('Accepted');
    },
    60000
  );

  it(
    'accepts a correct Java solution',
    async () => {
      const problem = await sumProblem('Judge Test - Java');
      const token = await registerUser('judgejava');
      const code =
        'import java.util.*;\npublic class Main { public static void main(String[] a){ Scanner s=new Scanner(System.in); System.out.println(s.nextLong()+s.nextLong()); } }';
      const res = await submit(token, problem, 'java', code);
      expect(res.body.data.verdict).toBe('Accepted');
    },
    60000
  );

  it(
    'reports a compilation error',
    async () => {
      const problem = await sumProblem('Judge Test - Compile Error');
      const token = await registerUser('judgecompile');
      const res = await submit(token, problem, 'cpp', 'int main( { return 0; }');
      expect(res.body.data.verdict).toBe('Compilation Error');
      expect(res.body.data.passedCount).toBe(0);
    },
    60000
  );

  it(
    'never leaks a failing hidden test case',
    async () => {
      const problem = await sumProblem('Judge Test - Hidden Leak');
      const token = await registerUser('judgehidden');
      // Passes the public case (2 3 -> 5) but fails the hidden one (10 20 -> 30).
      const res = await submit(token, problem, 'python', 'print(5)');
      expect(res.body.data.verdict).toBe('Wrong Answer');
      expect(res.body.data.failedCase.input).toBeUndefined();
      expect(res.body.data.failedCase.expectedOutput).toBeUndefined();
      expect(JSON.stringify(res.body)).not.toContain('10 20');
    },
    30000
  );

  it(
    'runs code against custom input',
    async () => {
      const token = await registerUser('judgerun');
      const res = await request(app)
        .post('/api/execute/run')
        .set('Authorization', `Bearer ${token}`)
        .send({ language: 'python', code: 'print(input()[::-1])', input: 'arena' });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Success');
      expect(res.body.data.stdout.trim()).toBe('anera');
    },
    30000
  );

  it(
    'reports a runtime error',
    async () => {
      const token = await registerUser('judgecrash');
      const res = await request(app)
        .post('/api/execute/run')
        .set('Authorization', `Bearer ${token}`)
        .send({ language: 'python', code: 'raise SystemExit(3)' });
      expect(res.body.data.status).toBe('Runtime Error');
    },
    30000
  );

  it('rejects an unsupported language', async () => {
    const token = await registerUser('judgelang');
    const res = await request(app)
      .post('/api/execute/run')
      .set('Authorization', `Bearer ${token}`)
      .send({ language: 'ruby', code: 'puts 1' });
    expect(res.status).toBe(400);
  });

  it('requires login', async () => {
    const res = await request(app).post('/api/execute/run').send({ language: 'python', code: 'print(1)' });
    expect(res.status).toBe(401);
  });
});

// Function-style (LeetCode format) problems: the player sends only a
// Solution class; the harness supplies headers and main().
describe('judge: function-style problems', () => {
  function addProblem(title) {
    return Problem.create({
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
      examples: [{ input: '2\n3', output: '5' }],
      publicTestCases: [{ input: '2\n3', output: '5' }],
      hiddenTestCases: [{ input: '10\n20', output: '30' }],
    });
  }

  it(
    'accepts a Solution class with no headers or main',
    async () => {
      const problem = await addProblem('Fn - Accepted');
      const token = await registerUser('fnaccept');
      const code = 'class Solution {\npublic:\n    int add(int a, int b) { return a + b; }\n};';
      const res = await submit(token, problem, 'cpp', code);
      expect(res.body.data.verdict).toBe('Accepted');
      expect(res.body.data.passedCount).toBe(2);
    },
    60000
  );

  it(
    'returns the method result and the player prints separately on Run',
    async () => {
      const problem = await addProblem('Fn - Run');
      const token = await registerUser('fnrun');
      const code = 'class Solution:\n    def add(self, a, b):\n        print("debugging", a)\n        return a + b\n';
      const res = await request(app)
        .post('/api/execute/run')
        .set('Authorization', `Bearer ${token}`)
        .send({ language: 'python', code, input: '4\n5', problemId: problem._id.toString() });
      expect(res.body.data.status).toBe('Success');
      expect(res.body.data.result).toBe('9');
      expect(res.body.data.stdout).toBe('debugging 4');
    },
    30000
  );

  it(
    'explains when the custom input has too few lines',
    async () => {
      const problem = await addProblem('Fn - Bad Input');
      const token = await registerUser('fnbadinput');
      const code = 'class Solution:\n    def add(self, a, b):\n        return a + b\n';
      const res = await request(app)
        .post('/api/execute/run')
        .set('Authorization', `Bearer ${token}`)
        .send({ language: 'python', code, input: '4', problemId: problem._id.toString() });
      expect(res.body.data.status).toBe('Runtime Error');
      expect(res.body.data.stderr).toMatch(/Input needs 2 lines/);
    },
    30000
  );

  it(
    'reports compile errors at the player line numbers',
    async () => {
      const problem = await addProblem('Fn - Compile Error');
      const token = await registerUser('fncompile');
      const code = 'class Solution {\npublic:\n    int add(int a, int b) { return a + b }\n};';
      const res = await submit(token, problem, 'cpp', code);
      expect(res.body.data.verdict).toBe('Compilation Error');
      expect(res.body.data.compileError).toMatch(/main\.cpp:3:/);
    },
    60000
  );

  it(
    'marks a wrong return value as Wrong Answer with the returned value',
    async () => {
      const problem = await addProblem('Fn - Wrong');
      const token = await registerUser('fnwrong');
      const code = 'class Solution:\n    def add(self, a, b):\n        return a - b\n';
      const res = await submit(token, problem, 'python', code);
      expect(res.body.data.verdict).toBe('Wrong Answer');
      expect(res.body.data.failedCase).toMatchObject({ input: '2\n3', expectedOutput: '5', actualOutput: '-1' });
    },
    30000
  );

  it('returns starter code with the problem, not hidden test cases', async () => {
    const problem = await addProblem('Fn - Starter');
    const res = await request(app).get(`/api/problems/${problem._id}`);
    expect(res.body.data.problem.starterCode.python).toContain('def add(self, a: int, b: int) -> int:');
    expect(res.body.data.problem.hiddenTestCases).toBeUndefined();
  });
});

function sumProblem(title) {
  return Problem.create({
    title,
    difficulty: 'Easy',
    description: 'Read two integers and print their sum.',
    examples: [{ input: '2 3', output: '5' }],
    publicTestCases: [{ input: '2 3', output: '5' }],
    hiddenTestCases: [{ input: '10 20', output: '30' }],
  });
}

function submit(token, problem, language, code) {
  return request(app)
    .post('/api/execute/submit')
    .set('Authorization', `Bearer ${token}`)
    .send({ language, code, problemId: problem._id.toString() });
}