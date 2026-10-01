import { describe, it, expect, vi } from 'vitest';

vi.mock('../../shared/api', () => ({ default: { get: vi.fn(async () => ({ data: 'ok' })) } }));

import api from '../../shared/api';
import { getSkillProfile, getXP, getRecommendations, getFeedback } from './skillService';
import { weakTopics, strongTopics, xpPercent } from './skills';

describe('skillService', () => {
  it('calls each skills endpoint', async () => {
    await getSkillProfile();
    await getXP();
    await getRecommendations();
    await getFeedback();
    expect(api.get.mock.calls.map((c) => c[0])).toEqual([
      '/skills/me',
      '/skills/xp',
      '/skills/recommendations',
      '/skills/feedback',
    ]);
  });
});

describe('skill helpers', () => {
  const scores = { Arrays: 80, Graphs: 20, Trees: 39, DP: 40, Heap: 90 };

  it('lists weak topics, weakest first', () => {
    expect(weakTopics(scores)).toEqual([
      ['Graphs', 20],
      ['Trees', 39],
    ]);
  });

  it('lists strong topics, strongest first', () => {
    expect(strongTopics(scores).map(([t]) => t)).toEqual(['Heap', 'Arrays']);
  });

  it('handles an empty profile', () => {
    expect(weakTopics()).toEqual([]);
    expect(strongTopics({})).toEqual([]);
  });

  it('computes level progress and caps it at 100', () => {
    expect(xpPercent({ xpIntoLevel: 50, xpForNextLevel: 200 })).toBe(25);
    expect(xpPercent({ xpIntoLevel: 300, xpForNextLevel: 200 })).toBe(100);
    expect(xpPercent({})).toBe(0);
  });
});
