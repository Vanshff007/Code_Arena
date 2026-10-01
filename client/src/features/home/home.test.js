import { describe, it, expect } from 'vitest';
import { demoFrame, FINAL_FRAME, LEFT, RIGHT, TIMELINE } from './duelScript';

describe('duel demo script', () => {
  it('starts empty with nobody submitted', () => {
    const f = demoFrame(0);
    expect(f.leftCode).toBe('');
    expect(f.rightCode).toBe('');
    expect(f.left).toBeNull();
    expect(f.right).toBeNull();
    expect(f.winner).toBeNull();
  });

  it('types code over time', () => {
    const early = demoFrame(1000);
    const later = demoFrame(3000);
    expect(later.leftCode.length).toBeGreaterThan(early.leftCode.length);
    expect(LEFT.code.startsWith(later.leftCode)).toBe(true);
  });

  it('shows the right player missing a case first', () => {
    const f = demoFrame(TIMELINE.rightSubmit);
    expect(f.rightCode).toBe(RIGHT.code);
    expect(f.right.verdict).toBe('Wrong Answer');
    expect(f.winner).toBeNull();
  });

  it('ends with the left player accepted and the clock stopped', () => {
    const atWin = demoFrame(TIMELINE.leftSubmit);
    expect(atWin.left).toMatchObject({ verdict: 'Accepted', passed: 10, total: 10 });
    expect(atWin.winner).toBe('left');
    expect(FINAL_FRAME.clockMs).toBe(atWin.clockMs);
  });

  it('loops and never shows a negative clock', () => {
    expect(demoFrame(TIMELINE.end)).toEqual(demoFrame(0));
    for (let t = 0; t < TIMELINE.end; t += 250) expect(demoFrame(t).clockMs).toBeGreaterThan(0);
  });
});
