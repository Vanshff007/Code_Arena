import { describe, it, expect } from 'vitest';
import { diffCallouts } from './callouts';
import { streakLabel, formLabel } from './form';

const p = (passedCount, totalCount = 10) => ({ passedCount, totalCount });
const state = (self, opponent, remainingMs = 600_000) => ({ self, opponent, remainingMs });
const titles = (list) => list.map((c) => c.title);

describe('battle callouts', () => {
  it('calls first blood for whoever passes cases first', () => {
    expect(titles(diffCallouts(state(null, null), state(p(3), null)))).toEqual(['First blood.']);
    expect(titles(diffCallouts(state(null, null), state(null, p(2)), 'rival'))).toEqual(['First blood to rival.']);
  });

  it('does not call first blood twice', () => {
    const out = diffCallouts(state(p(3), null), state(p(3), p(1)), 'rival');
    expect(titles(out)).toEqual(['rival is on 1/10.']);
  });

  it('calls a lead change in either direction', () => {
    expect(titles(diffCallouts(state(p(3), p(5)), state(p(6), p(5))))).toEqual(['You took the lead.']);
    expect(titles(diffCallouts(state(p(6), p(5)), state(p(6), p(8)), 'rival'))).toEqual(['rival took the lead.']);
  });

  it('reports opponent progress when the lead does not change', () => {
    expect(titles(diffCallouts(state(p(9), p(2)), state(p(9), p(4)), 'rival'))).toEqual(['rival is on 4/10.']);
  });

  it('says nothing when nothing changed or a submit passed nothing', () => {
    expect(diffCallouts(state(p(4), p(2)), state(p(4), p(2)))).toEqual([]);
    expect(diffCallouts(state(null, null), state(p(0), null))).toEqual([]);
  });

  it('calls one minute left once, as the clock crosses it', () => {
    expect(titles(diffCallouts(state(null, null, 61_000), state(null, null, 60_000)))).toEqual(['One minute left.']);
    expect(diffCallouts(state(null, null, 60_000), state(null, null, 59_000))).toEqual([]);
    expect(diffCallouts(state(null, null, 61_000), state(null, null, 0))).toEqual([]);
  });
});

describe('form strip text', () => {
  it('calls out a streak from three wins', () => {
    expect(streakLabel(2)).toBeNull();
    expect(streakLabel(3)).toBe('3 wins in a row');
    expect(streakLabel()).toBeNull();
  });

  it('reads the form oldest first for screen readers', () => {
    expect(formLabel('rival', ['L', 'W', 'D'])).toBe('rival, last 3: lost, won, drew');
    expect(formLabel('rival', [])).toBe('');
  });
});
