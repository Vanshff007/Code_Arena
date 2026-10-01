import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'fs';

vi.mock('../../shared/api', () => ({ default: { post: vi.fn(async () => ({ data: 'ok' })) } }));

import api from '../../shared/api';
import { runCode, submitCode } from './executionService';
import { LANGUAGES, STARTER_CODE, MONACO_LANGUAGE, starterFor, defaultInputFor } from './languages';

describe('executionService', () => {
  it('posts to run and submit', async () => {
    await runCode({ language: 'python', code: 'x', input: '' });
    expect(api.post).toHaveBeenCalledWith('/execute/run', { language: 'python', code: 'x', input: '' });

    await submitCode({ language: 'cpp', code: 'y', problemId: 'p1' });
    expect(api.post).toHaveBeenCalledWith('/execute/submit', { language: 'cpp', code: 'y', problemId: 'p1' });
  });
});

describe('languages', () => {
  it('has a template and an editor mode for every language', () => {
    for (const { id } of LANGUAGES) {
      expect(STARTER_CODE[id]).toBeTruthy();
      expect(MONACO_LANGUAGE[id]).toBeTruthy();
    }
  });

  it('starts Java with public class Main, which the judge requires', () => {
    expect(STARTER_CODE.java).toContain('public class Main');
  });

  it('matches the languages the server accepts', () => {
    const validator = readFileSync(
      new URL('../../../../server/features/execution/execution.validator.js', import.meta.url),
      'utf8'
    );
    const serverList = validator.match(/SUPPORTED_LANGUAGES = \[([^\]]+)\]/)[1].match(/'(\w+)'/g).map((s) => s.slice(1, -1));
    expect(LANGUAGES.map((l) => l.id).sort()).toEqual(serverList.sort());
  });
});

describe('starter code and default input', () => {
  const problem = {
    starterCode: { cpp: 'class Solution {};', java: 'class Solution {}', python: 'class Solution:\n    pass\n' },
    examples: [{ input: '[1,2]\n3', output: '[0,1]' }],
  };

  it('uses the problem stub for function-style problems', () => {
    expect(starterFor(problem, 'java')).toBe('class Solution {}');
  });

  it('falls back to full-program templates without a stub', () => {
    expect(starterFor({}, 'cpp')).toBe(STARTER_CODE.cpp);
    expect(starterFor(undefined, 'python')).toBe(STARTER_CODE.python);
  });

  it('prefills custom input with the first example', () => {
    expect(defaultInputFor(problem)).toBe('[1,2]\n3');
    expect(defaultInputFor({})).toBe('');
  });
});
