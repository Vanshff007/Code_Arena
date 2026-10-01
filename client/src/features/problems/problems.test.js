import { describe, it, expect, vi } from 'vitest';

vi.mock('../../shared/api', () => ({ default: { get: vi.fn(async () => ({ data: 'ok' })) } }));

import api from '../../shared/api';
import { getProblems, getProblemById, getEditorial } from './problemService';
import { difficultyLevel, filterProblems } from './difficulty';
import { namedArguments, splitInlineCode, editorialLanguages } from './statement';

describe('problemService', () => {
  it('lists with filters and fetches one problem', async () => {
    await getProblems({ difficulty: 'Easy' });
    expect(api.get).toHaveBeenCalledWith('/problems', { params: { difficulty: 'Easy' } });

    await getProblemById('abc');
    expect(api.get).toHaveBeenCalledWith('/problems/abc');
  });
});

describe('difficulty', () => {
  it('maps difficulty to a 1-3 level', () => {
    expect(difficultyLevel('Easy')).toBe(1);
    expect(difficultyLevel('Medium')).toBe(2);
    expect(difficultyLevel('Hard')).toBe(3);
    expect(difficultyLevel('Unknown')).toBe(0);
  });
});

describe('filterProblems', () => {
  const problems = [
    { title: 'Two Sum', difficulty: 'Easy', tags: ['arrays', 'hashing'] },
    { title: 'Course Schedule', difficulty: 'Medium', tags: ['graphs'] },
    { title: 'Median of Two Arrays', difficulty: 'Hard', tags: [] },
  ];

  it('returns everything by default', () => {
    expect(filterProblems(problems)).toHaveLength(3);
  });

  it('filters by difficulty', () => {
    expect(filterProblems(problems, { difficulty: 'Medium' }).map((p) => p.title)).toEqual(['Course Schedule']);
  });

  it('searches titles and tags, case-insensitively', () => {
    expect(filterProblems(problems, { query: 'two' })).toHaveLength(2);
    expect(filterProblems(problems, { query: 'GRAPH' }).map((p) => p.title)).toEqual(['Course Schedule']);
  });

  it('combines filters and handles missing tags', () => {
    expect(filterProblems(problems, { difficulty: 'Easy', query: 'course' })).toEqual([]);
    expect(filterProblems([{ title: 'X', difficulty: 'Easy' }], { query: 'y' })).toEqual([]);
  });
});

describe('statement helpers', () => {
  const signature = {
    params: [
      { name: 'nums', type: 'int[]' },
      { name: 'target', type: 'int' },
    ],
  };

  it('names example arguments by parameter', () => {
    expect(namedArguments(signature, '[2,7,11,15]\n9')).toEqual([
      { name: 'nums', value: '[2,7,11,15]' },
      { name: 'target', value: '9' },
    ]);
  });

  it('falls back to raw input without a signature or on a line mismatch', () => {
    expect(namedArguments(undefined, '1 2')).toBeNull();
    expect(namedArguments(signature, '[1]')).toBeNull();
  });

  it('splits inline code marked with backticks', () => {
    expect(splitInlineCode('Return `true` if `s` is valid.')).toEqual([
      { code: false, text: 'Return ' },
      { code: true, text: 'true' },
      { code: false, text: ' if ' },
      { code: true, text: 's' },
      { code: false, text: ' is valid.' },
    ]);
    expect(splitInlineCode('no code')).toEqual([{ code: false, text: 'no code' }]);
    expect(splitInlineCode()).toEqual([]);
  });
});

describe('editorial helpers', () => {
  it('lists languages that have a solution, in app order', () => {
    expect(editorialLanguages({ solutions: { java: 'x', python: 'y', cpp: '  ' } })).toEqual(['python', 'java']);
    expect(editorialLanguages(undefined)).toEqual([]);
  });

  it('fetches the editorial', async () => {
    await getEditorial('p1');
    expect(api.get).toHaveBeenCalledWith('/problems/p1/editorial');
  });
});
