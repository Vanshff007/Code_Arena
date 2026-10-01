import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { formatSigned, formatNumber, formatClock, formatDate } from './format';
import { getErrorMessage } from './getErrorMessage';
import { verdictTone } from './ui/verdict';
import { APP_VERSION } from './version';

describe('format', () => {
  it('always signs rating changes', () => {
    expect(formatSigned(16)).toBe('+16');
    expect(formatSigned(-12)).toBe('-12');
    expect(formatSigned(0)).toBe('0');
    expect(formatSigned(undefined)).toBe('0');
  });

  it('groups thousands', () => {
    expect(formatNumber(1482)).toBe('1,482');
    expect(formatNumber(null)).toBe('0');
  });

  it('formats clocks as m:ss and never goes negative', () => {
    expect(formatClock(15 * 60 * 1000)).toBe('15:00');
    expect(formatClock(61_000)).toBe('1:01');
    expect(formatClock(500)).toBe('0:01');
    expect(formatClock(-3000)).toBe('0:00');
  });

  it('formats dates and tolerates empty values', () => {
    // ICU versions differ on "Sep" vs "Sept".
    expect(formatDate('2026-09-12T10:00:00Z')).toMatch(/^12 Sept? 2026$/);
    expect(formatDate(null)).toBe('');
  });
});

describe('getErrorMessage', () => {
  it('joins validation errors', () => {
    const err = { response: { data: { errors: [{ message: 'A' }, { message: 'B' }] } } };
    expect(getErrorMessage(err)).toBe('A, B');
  });

  it('uses the server message, then the fallback', () => {
    expect(getErrorMessage({ response: { data: { message: 'Nope' } } })).toBe('Nope');
    expect(getErrorMessage({}, 'Fallback')).toBe('Fallback');
  });
});

describe('verdictTone', () => {
  it('maps verdicts to tones', () => {
    expect(verdictTone('Accepted')).toBe('ok');
    expect(verdictTone('Success')).toBe('ok');
    expect(verdictTone('Wrong Answer')).toBe('warn');
    expect(verdictTone('Compilation Error')).toBe('bad');
    expect(verdictTone(null)).toBe('muted');
  });
});

describe('version rule', () => {
  it('shows the version from package.json', () => {
    const pkg = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
    expect(APP_VERSION).toBe(pkg.version);
    expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
