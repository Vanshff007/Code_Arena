import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { formatSigned, formatNumber, formatClock, formatDate } from './format';
import { getErrorMessage } from './getErrorMessage';
import { verdictTone } from './ui/verdict';
import { APP_VERSION } from './version';
import { THEME_KEY, readThemePreference, saveThemePreference, applyTheme, resolveDark } from './theme';

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

describe('theme', () => {
  const store = () => {
    const data = {};
    return {
      getItem: (k) => data[k] ?? null,
      setItem: (k, v) => (data[k] = v),
      removeItem: (k) => delete data[k],
    };
  };

  it('saves and reads the preference, defaulting to system', () => {
    const s = store();
    expect(readThemePreference(s)).toBe('system');
    saveThemePreference('dark', s);
    expect(readThemePreference(s)).toBe('dark');
    saveThemePreference('system', s);
    expect(s.getItem(THEME_KEY)).toBeNull();
  });

  it('ignores unknown values and blocked storage', () => {
    const s = store();
    s.setItem(THEME_KEY, 'purple');
    expect(readThemePreference(s)).toBe('system');
    const blocked = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } };
    expect(readThemePreference(blocked)).toBe('system');
    expect(() => saveThemePreference('dark', blocked)).not.toThrow();
  });

  it('applies the theme attribute', () => {
    const root = { dataset: {} };
    applyTheme('dark', root);
    expect(root.dataset.theme).toBe('dark');
    applyTheme('system', root);
    expect(root.dataset.theme).toBeUndefined();
  });

  it('resolves dark from preference and the device', () => {
    expect(resolveDark('dark', false)).toBe(true);
    expect(resolveDark('light', true)).toBe(false);
    expect(resolveDark('system', true)).toBe(true);
    expect(resolveDark('system', false)).toBe(false);
  });
});

describe('api client', () => {
  it('notifies listeners on a 401 and lets them unsubscribe', async () => {
    const { default: api, onUnauthorized } = await import('./api');
    let calls = 0;
    const off = onUnauthorized(() => (calls += 1));
    const reject = api.interceptors.response.handlers[0].rejected;
    await expect(reject({ response: { status: 401 } })).rejects.toBeTruthy();
    await expect(reject({ response: { status: 500 } })).rejects.toBeTruthy();
    expect(calls).toBe(1);
    off();
    await expect(reject({ response: { status: 401 } })).rejects.toBeTruthy();
    expect(calls).toBe(1);
    expect(api.defaults.withCredentials).toBe(true);
  });
});
