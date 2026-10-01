import { describe, it, expect } from 'vitest';
import { calculateRatings } from './rating.service.js';

describe('ELO rating', () => {
  it('moves equal players by 16 points (K/2)', () => {
    expect(calculateRatings(1000, 1000, 'A')).toEqual({ ratingA: 1016, ratingB: 984 });
  });

  it('is symmetric for the other winner', () => {
    expect(calculateRatings(1000, 1000, 'B')).toEqual({ ratingA: 984, ratingB: 1016 });
  });

  it('leaves equal players unchanged on a draw', () => {
    expect(calculateRatings(1200, 1200, 'draw')).toEqual({ ratingA: 1200, ratingB: 1200 });
  });

  it('gives an upset more points than an expected win', () => {
    const upset = calculateRatings(1000, 1400, 'A').ratingA - 1000;
    const expected = calculateRatings(1400, 1000, 'A').ratingA - 1400;
    expect(upset).toBeGreaterThan(expected);
  });

  it('conserves total rating points (within rounding)', () => {
    const { ratingA, ratingB } = calculateRatings(1350, 1120, 'B');
    expect(Math.abs(ratingA + ratingB - (1350 + 1120))).toBeLessThanOrEqual(1);
  });
});
