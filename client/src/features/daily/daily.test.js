import { describe, it, expect, vi } from 'vitest';

vi.mock('../../shared/api', () => ({ default: { get: vi.fn(async () => ({ data: 'ok' })) } }));

import api from '../../shared/api';
import { getDaily } from './dailyService';
import { streakText } from './daily';

describe('dailyService', () => {
  it('fetches the daily problem', async () => {
    expect(await getDaily()).toBe('ok');
    expect(api.get).toHaveBeenCalledWith('/daily');
  });
});

describe('streakText', () => {
  it('words the streak', () => {
    expect(streakText(0)).toBe('No streak yet');
    expect(streakText(undefined)).toBe('No streak yet');
    expect(streakText(1)).toBe('1 day streak');
    expect(streakText(12)).toBe('12 day streak');
  });
});
