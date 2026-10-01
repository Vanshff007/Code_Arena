import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'fs';

vi.mock('../../shared/api', () => ({
  default: {
    get: vi.fn(async () => ({ data: 'ok' })),
    post: vi.fn(async () => ({ data: 'ok' })),
    put: vi.fn(async () => ({ data: 'ok' })),
    delete: vi.fn(async () => ({ data: 'ok' })),
  },
}));

import api from '../../shared/api';
import { listProblems, getProblemForEdit, checkProblem, createProblem, updateProblem, deleteProblem } from './adminService';
import { SIGNATURE_TYPES, emptyDraft, draftFromProblem, validateDraft, buildPayload } from './problemForm';

describe('adminService', () => {
  it('calls the admin problem endpoints', async () => {
    await listProblems();
    expect(api.get).toHaveBeenCalledWith('/problems');
    await getProblemForEdit('p1');
    expect(api.get).toHaveBeenCalledWith('/problems/p1/admin');
    await checkProblem({ a: 1 });
    expect(api.post).toHaveBeenCalledWith('/problems/check', { a: 1 });
    await createProblem({ b: 2 });
    expect(api.post).toHaveBeenCalledWith('/problems', { b: 2 });
    await updateProblem('p2', { c: 3 });
    expect(api.put).toHaveBeenCalledWith('/problems/p2', { c: 3 });
    await deleteProblem('p3');
    expect(api.delete).toHaveBeenCalledWith('/problems/p3');
  });
});

describe('signature types', () => {
  it('match the types the server harness supports', () => {
    const source = readFileSync(new URL('../../../../server/features/execution/harness/types.js', import.meta.url), 'utf8');
    const block = source.slice(source.indexOf('export const TYPES = {'), source.indexOf('};'));
    const serverTypes = [...block.matchAll(/^\s+'?([\w<>[\]]+)'?: \{ cpp:/gm)].map((m) => m[1]);
    expect([...SIGNATURE_TYPES].sort()).toEqual(serverTypes.sort());
  });
});

const filledDraft = () => ({
  ...emptyDraft(),
  title: 'Add',
  description: 'Return a + b.',
  tags: ' Math, Arrays ',
  constraints: 'a >= 0\n\n b >= 0 ',
  functionName: 'add',
  params: [
    { name: 'a', type: 'int' },
    { name: 'b', type: 'int' },
  ],
  examples: [{ input: '1\n2', output: '3', explanation: '' }],
  publicTestCases: [{ input: '1\n2', output: '3' }, { input: '', output: '' }],
  hiddenTestCases: [{ input: '5\n5', output: '10' }],
  refCode: 'class Solution: ...',
});

describe('validateDraft', () => {
  it('accepts a complete function-style draft', () => {
    expect(validateDraft(filledDraft())).toEqual([]);
  });

  it('lists everything missing on an empty draft', () => {
    const errors = validateDraft(emptyDraft());
    expect(errors.join(' ')).toMatch(/title/);
    expect(errors.join(' ')).toMatch(/description/);
    expect(errors.join(' ')).toMatch(/reference solution/);
  });

  it('checks parameter names and input line counts', () => {
    const bad = { ...filledDraft(), params: [{ name: '1x', type: 'int' }, { name: '1x', type: 'int' }] };
    expect(validateDraft(bad).join(' ')).toMatch(/valid name/);
    expect(validateDraft(bad).join(' ')).toMatch(/different/);
    const lines = { ...filledDraft(), publicTestCases: [{ input: '1', output: '1' }] };
    expect(validateDraft(lines).join(' ')).toMatch(/2 lines/);
  });

  it('allows keeping stored hidden cases when editing', () => {
    const edit = { ...filledDraft(), hiddenTestCases: [], keepHidden: true };
    expect(validateDraft(edit, { isEdit: true })).toEqual([]);
    expect(validateDraft({ ...edit, keepHidden: false }, { isEdit: true }).join(' ')).toMatch(/hidden/);
  });
});

describe('buildPayload', () => {
  it('normalizes tags, constraints and test cases', () => {
    const p = buildPayload(filledDraft());
    expect(p.tags).toEqual(['math', 'arrays']);
    expect(p.constraints).toEqual(['a >= 0', 'b >= 0']);
    expect(p.publicTestCases).toEqual([{ input: '1\n2', output: '3' }]);
    expect(p.signature).toEqual({ functionName: 'add', params: filledDraft().params, returnType: 'int' });
    expect(p.referenceSolution).toEqual({ language: 'python', code: 'class Solution: ...' });
    expect(p.hiddenTestCases).toHaveLength(1);
  });

  it('leaves hidden cases out when keeping the stored ones', () => {
    const p = buildPayload({ ...filledDraft(), keepHidden: true }, { isEdit: true });
    expect(p.hiddenTestCases).toBeUndefined();
  });

  it('sends no signature for a new full-program problem, and null to remove one on edit', () => {
    const fullProgram = { ...filledDraft(), functionName: '' };
    expect('signature' in buildPayload(fullProgram)).toBe(false);
    expect(buildPayload(fullProgram, { isEdit: true }).signature).toBeNull();
  });
});

describe('draftFromProblem', () => {
  it('fills the form from a problem and keeps stored hidden cases', () => {
    const draft = draftFromProblem({
      title: 'Two Sum',
      difficulty: 'Medium',
      tags: ['arrays'],
      description: 'd',
      constraints: ['x', 'y'],
      signature: { functionName: 'twoSum', params: [{ name: 'nums', type: 'int[]' }], returnType: 'int[]' },
      outputOrder: 'any',
      examples: [{ input: '[1]', output: '[0]' }],
      publicTestCases: [{ input: '[1]', output: '[0]' }],
      editorial: { approach: 'hash map', solutions: { python: 'code' } },
    });
    expect(draft).toMatchObject({
      title: 'Two Sum',
      tags: 'arrays',
      constraints: 'x\ny',
      functionName: 'twoSum',
      returnType: 'int[]',
      outputOrder: 'any',
      keepHidden: true,
      approach: 'hash map',
    });
    expect(draft.solutions).toEqual({ python: 'code', cpp: '', java: '' });
    expect(draft.examples[0].explanation).toBe('');
  });

  it('handles a full-program problem without a signature', () => {
    const draft = draftFromProblem({ title: 'Old' });
    expect(draft.functionName).toBe('');
    expect(draft.params).toHaveLength(1);
  });
});
