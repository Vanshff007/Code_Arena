// Every built-in problem must accept its reference solution on every public
// and hidden test case, through the real Docker judge and function harness.
// This catches both wrong test data and harness bugs per language/type.
// Needs Docker and the sandbox images (npm run docker:build).
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import Problem from './Problem.model.js';
import { SEED_PROBLEMS } from './seedData.js';
import { PYTHON, CPP, JAVA } from './referenceSolutions.js';
import { validateSignature } from '../execution/harness/index.js';
import { judgeSubmission } from '../execution/engine/judge.js';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('seed data', () => {
  it('has 60 problems with unique titles', () => {
    expect(SEED_PROBLEMS).toHaveLength(60);
    expect(new Set(SEED_PROBLEMS.map((p) => p.title)).size).toBe(60);
  });

  it.each(SEED_PROBLEMS.map((p) => [p.title, p]))('%s has a valid signature and well-formed tests', (_, p) => {
    expect(validateSignature(p.signature)).toEqual([]);
    // Model validation (required fields, enums) without touching the DB.
    expect(new Problem(p).validateSync()).toBeUndefined();
    for (const tcase of [...p.examples, ...p.publicTestCases, ...p.hiddenTestCases]) {
      const lines = tcase.input.split('\n');
      expect(lines).toHaveLength(p.signature.params.length);
      for (const line of lines) expect(() => JSON.parse(line)).not.toThrow();
      expect(() => JSON.parse(tcase.output)).not.toThrow();
    }
  });

  it('has C++ and Java references covering every type used in the bank', () => {
    const typesOf = (p) => [...p.signature.params.map((x) => `param ${x.type}`), `return ${p.signature.returnType}`];
    const used = new Set(SEED_PROBLEMS.flatMap(typesOf));
    const covered = new Set(SEED_PROBLEMS.filter((p) => CPP[p.title] && JAVA[p.title]).flatMap(typesOf));
    expect([...used].filter((t) => !covered.has(t))).toEqual([]);
  });

  it('generates starter code for every language', () => {
    const doc = new Problem(SEED_PROBLEMS[0]);
    expect(doc.starterCode.cpp).toContain('vector<int> twoSum(vector<int>& nums, int target)');
    expect(doc.starterCode.java).toContain('public int[] twoSum(int[] nums, int target)');
    expect(doc.starterCode.python).toContain('def twoSum(self, nums: List[int], target: int) -> List[int]:');
    expect(doc.toJSON().starterCode).toBeDefined();
  });
});

const judge = (problem, language, code) =>
  judgeSubmission({
    language,
    code,
    publicTestCases: problem.publicTestCases,
    hiddenTestCases: problem.hiddenTestCases,
    signature: problem.signature,
    outputOrder: problem.outputOrder,
  });

const cases = [
  ...SEED_PROBLEMS.map((p) => ['python', p, PYTHON[p.title]]),
  ...SEED_PROBLEMS.filter((p) => CPP[p.title]).map((p) => ['cpp', p, CPP[p.title]]),
  ...SEED_PROBLEMS.filter((p) => JAVA[p.title]).map((p) => ['java', p, JAVA[p.title]]),
];

describe('reference solutions (real Docker judge)', () => {
  it.each(cases.map(([lang, p, code]) => [`${lang}: ${p.title}`, lang, p, code]))(
    '%s is accepted',
    async (_, language, problem, code) => {
      expect(code, 'missing reference solution').toBeTruthy();
      const result = await judge(problem, language, code);
      expect(result.failedCase ?? null).toBeNull();
      expect(result.verdict).toBe('Accepted');
      expect(result.passedCount).toBe(problem.publicTestCases.length + problem.hiddenTestCases.length);
    },
    60000
  );
});
