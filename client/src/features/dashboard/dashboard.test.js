import { describe, it, expect } from 'vitest';
import { winRate, pickRandom } from './dashboard';

describe('winRate', () => {
  it('rounds to a whole percent', () => {
    expect(winRate({ wins: 2, totalBattles: 3 })).toBe(67);
  });

  it('is 0 with no battles', () => {
    expect(winRate({ wins: 0, totalBattles: 0 })).toBe(0);
    expect(winRate()).toBe(0);
  });
});

describe('pickRandom', () => {
  it('picks using the random source', () => {
    expect(pickRandom(['a', 'b', 'c'], () => 0)).toBe('a');
    expect(pickRandom(['a', 'b', 'c'], () => 0.99)).toBe('c');
  });

  it('returns null for an empty list', () => {
    expect(pickRandom([])).toBeNull();
    expect(pickRandom()).toBeNull();
  });
});
