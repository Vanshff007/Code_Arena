// Pure tests for the function harness (no Docker). The real end-to-end
// check - every built-in problem judged with a reference solution - is in
// features/problems/seed.test.js; function-style judging is also covered in
// execution.test.js.
import { describe, it, expect } from 'vitest';
import {
  buildProgram,
  remapLineNumbers,
  extractResult,
  outputsMatch,
  validateSignature,
  generateStarterCode,
} from './harness/index.js';

const twoSum = {
  functionName: 'twoSum',
  params: [
    { name: 'nums', type: 'int[]' },
    { name: 'target', type: 'int' },
  ],
  returnType: 'int[]',
};

describe('validateSignature', () => {
  it('accepts a valid signature', () => {
    expect(validateSignature(twoSum)).toEqual([]);
  });

  it('rejects bad names, types and duplicates', () => {
    const errors = validateSignature({
      functionName: '2sum',
      params: [
        { name: 'a', type: 'map' },
        { name: 'a', type: 'int' },
      ],
      returnType: 'void',
    });
    expect(errors.join(' ')).toMatch(/functionName/);
    expect(errors.join(' ')).toMatch(/Unsupported parameter type: map/);
    expect(errors.join(' ')).toMatch(/Duplicate parameter name: a/);
    expect(errors.join(' ')).toMatch(/Unsupported return type: void/);
  });

  it('rejects a missing signature or empty params', () => {
    expect(validateSignature(null)).not.toEqual([]);
    expect(validateSignature({ functionName: 'f', params: [], returnType: 'int' })).not.toEqual([]);
  });
});

describe('starter code', () => {
  it('generates LeetCode-style stubs without headers or main', () => {
    const s = generateStarterCode(twoSum);
    expect(s.cpp).toContain('class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target)');
    expect(s.java).toContain('public int[] twoSum(int[] nums, int target)');
    expect(s.python).toContain('def twoSum(self, nums: List[int], target: int) -> List[int]:');
    for (const code of Object.values(s)) {
      expect(code).not.toMatch(/#include|import |int main|static void main/);
    }
  });

  it('documents node types when the signature uses them', () => {
    const s = generateStarterCode({ functionName: 'f', params: [{ name: 'root', type: 'TreeNode' }], returnType: 'ListNode' });
    expect(s.cpp).toContain('struct TreeNode');
    expect(s.cpp).toContain('struct ListNode');
    expect(s.java).toContain('public ListNode f(TreeNode root)');
    expect(s.python).toContain('def f(self, root: Optional[TreeNode]) -> Optional[ListNode]:');
  });
});

describe('buildProgram', () => {
  it('places the player code after a short prelude and reports the offset', () => {
    const code = 'class Solution {};';
    for (const lang of ['cpp', 'java', 'python']) {
      const p = buildProgram(lang, twoSum, code);
      const lines = p.source.split('\n');
      expect(lines[p.offset]).toBe(code);
      expect(p.userLines).toBe(1);
    }
  });

  it('hoists Java imports and drops public from Solution, keeping line numbers', () => {
    const code = 'import java.util.HashMap;\npublic class Solution {\n}';
    const p = buildProgram('java', twoSum, code);
    const lines = p.source.split('\n');
    expect(lines[0]).toBe('import java.util.HashMap;');
    expect(lines[p.offset]).toBe('');
    expect(lines[p.offset + 1]).toBe('class Solution {');
  });

  it('rejects an unknown language', () => {
    expect(() => buildProgram('ruby', twoSum, '')).toThrow(/Unsupported language/);
  });
});

describe('remapLineNumbers', () => {
  const meta = { offset: 4, userLines: 10 };

  it('shifts lines inside the player code', () => {
    expect(remapLineNumbers('cpp', 'main.cpp:7:5: error: x', meta)).toBe('main.cpp:3:5: error: x');
    expect(remapLineNumbers('java', 'Main.java:6: error', meta)).toBe('Main.java:2: error');
    expect(remapLineNumbers('python', 'File "/box/main.py", line 9, in f', meta)).toBe('File "/box/main.py", line 5, in f');
  });

  it('labels lines in the hidden harness', () => {
    expect(remapLineNumbers('cpp', 'main.cpp:200:1: error', meta)).toBe('main.cpp:harness:1: error');
    expect(remapLineNumbers('cpp', 'main.cpp:2:1: error', meta)).toBe('main.cpp:harness:1: error');
  });

  it('leaves empty text alone', () => {
    expect(remapLineNumbers('cpp', '', meta)).toBe('');
  });
});

describe('extractResult', () => {
  it('separates the player prints from the returned value', () => {
    expect(extractResult('debug 1\ndebug 2\n\n@@CA_RESULT@@[0,1]\n')).toEqual({ output: 'debug 1\ndebug 2', result: '[0,1]' });
    expect(extractResult('\n@@CA_RESULT@@true\n')).toEqual({ output: '', result: 'true' });
  });

  it('returns null when the harness never printed a result', () => {
    expect(extractResult('partial output')).toEqual({ output: 'partial output', result: null });
  });
});

describe('outputsMatch', () => {
  it('ignores formatting', () => {
    expect(outputsMatch('[0,1]', '[0, 1]')).toBe(true);
    expect(outputsMatch('"abc"', '"abc"')).toBe(true);
  });

  it('respects order unless any order is allowed', () => {
    expect(outputsMatch('[1,0]', '[0,1]')).toBe(false);
    expect(outputsMatch('[[2,-1,-1],[1,0,-1]]', '[[-1,-1,2],[-1,0,1]]', { anyOrder: true })).toBe(true);
    expect(outputsMatch('[["tea","eat"]]', '[["eat","tea"],["x"]]', { anyOrder: true })).toBe(false);
  });

  it('compares doubles with a tolerance and integers exactly', () => {
    expect(outputsMatch('2.0000001', '2')).toBe(true);
    expect(outputsMatch('2.1', '2')).toBe(false);
    expect(outputsMatch('3', '4')).toBe(false);
  });

  it('tells true from 1 and null from []', () => {
    expect(outputsMatch('1', 'true')).toBe(false);
    expect(outputsMatch('null', '[]')).toBe(false);
  });

  it('falls back to text comparison when a side is not JSON', () => {
    expect(outputsMatch('hello ', 'hello')).toBe(true);
    expect(outputsMatch('hello', '"hello"')).toBe(false);
  });
});
