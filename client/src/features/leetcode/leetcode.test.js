import { describe, it, expect, vi } from 'vitest';

vi.mock('../../shared/api', () => ({
  default: { post: vi.fn(async () => ({ data: 'ok' })), get: vi.fn(async () => ({ data: 'ok' })) },
}));

import api from '../../shared/api';
import { connectLeetCode, disconnectLeetCode, syncLeetCode, getLeetCodeRecommendations } from './leetcodeService';
import { isValidLeetCodeUsername, recommendationState, ratingChart, barPercent } from './leetcode';

describe('leetcodeService', () => {
  it('posts connect, sync and disconnect', async () => {
    await connectLeetCode('lc_user');
    expect(api.post).toHaveBeenCalledWith('/leetcode/connect', { username: 'lc_user' });
    await syncLeetCode();
    expect(api.post).toHaveBeenCalledWith('/leetcode/sync');
    await disconnectLeetCode();
    expect(api.post).toHaveBeenCalledWith('/leetcode/disconnect');
  });
});

describe('isValidLeetCodeUsername', () => {
  it('accepts letters, numbers, hyphens and underscores', () => {
    expect(isValidLeetCodeUsername('lc_user-01')).toBe(true);
  });

  it('rejects empty, too long, and invalid characters', () => {
    expect(isValidLeetCodeUsername('')).toBe(false);
    expect(isValidLeetCodeUsername('a'.repeat(41))).toBe(false);
    expect(isValidLeetCodeUsername('bad name')).toBe(false);
    expect(isValidLeetCodeUsername()).toBe(false);
  });
});

describe('recommendations', () => {
  it('fetches LeetCode recommendations', async () => {
    await getLeetCodeRecommendations();
    expect(api.get).toHaveBeenCalledWith('/leetcode/recommendations');
  });

  it('turns a 400 into a connect prompt and anything else into an error', () => {
    expect(recommendationState({ response: { status: 400 } })).toEqual({ status: 'not-connected' });
    expect(recommendationState({ response: { status: 502, data: { message: 'LeetCode is down' } } })).toEqual({
      status: 'error',
      message: 'LeetCode is down',
    });
    expect(recommendationState(new Error('network')).status).toBe('error');
  });
});

describe('chart helpers', () => {
  it('fits ratings into the chart box, newest on the right', () => {
    const { points, last } = ratingChart([1500, 1600, 1550], 100, 50, 0);
    expect(points).toBe('0.0,50.0 50.0,0.0 100.0,25.0');
    expect(last).toEqual({ x: 100, y: 25 });
  });

  it('handles one contest and no contests', () => {
    expect(ratingChart([1500], 100, 50, 0).points).toBe('50.0,50.0');
    expect(ratingChart([], 100, 50)).toEqual({ points: '', last: null });
  });

  it('scales topic bars with a visible minimum', () => {
    expect(barPercent(50, 100)).toBe(50);
    expect(barPercent(1, 1000)).toBe(2);
    expect(barPercent(5, 0)).toBe(0);
  });
});
