import { describe, it, expect, vi } from 'vitest';

vi.mock('../../shared/api', () => ({ default: { get: vi.fn(async () => ({ data: 'ok' })) } }));

import api from '../../shared/api';
import { getLeaderboard } from './leaderboardService';
import { ratingBarPercent, gapToNext } from './ladder';

const rows = [
  { rank: 1, username: 'top', rating: 1500 },
  { rank: 2, username: 'mid', rating: 1250 },
  { rank: 3, username: 'low', rating: 1000 },
];

describe('leaderboardService', () => {
  it('fetches the leaderboard', async () => {
    await getLeaderboard();
    expect(api.get).toHaveBeenCalledWith('/leaderboard');
  });
});

describe('ratingBarPercent', () => {
  it('scales between a floor and 100', () => {
    expect(ratingBarPercent(1500, rows)).toBe(100);
    expect(ratingBarPercent(1000, rows)).toBe(15);
    expect(ratingBarPercent(1250, rows)).toBe(58);
  });

  it('handles equal ratings and empty lists', () => {
    expect(ratingBarPercent(1000, [{ rating: 1000 }, { rating: 1000 }])).toBe(100);
    expect(ratingBarPercent(1000, [])).toBe(0);
  });
});

describe('gapToNext', () => {
  it('reports the gap to the rank above', () => {
    expect(gapToNext(rows, 'low')).toEqual({ points: 250, rank: 2, username: 'mid' });
  });

  it('is null for the leader or a player not listed', () => {
    expect(gapToNext(rows, 'top')).toBeNull();
    expect(gapToNext(rows, 'ghost')).toBeNull();
  });
});
