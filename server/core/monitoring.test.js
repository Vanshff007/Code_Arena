import { describe, it, expect } from 'vitest';
import { scrubEvent, monitoringEnabled, captureError, flushMonitoring } from './monitoring.js';

describe('monitoring', () => {
  it('is off in tests, and its helpers are safe no-ops', async () => {
    expect(monitoringEnabled).toBe(false);
    expect(() => captureError(new Error('x'))).not.toThrow();
    expect(await flushMonitoring()).toBe(true);
  });

  it('removes request bodies, headers, cookies and user details before sending', () => {
    const event = scrubEvent({
      message: 'boom',
      request: {
        url: '/api/execute/submit',
        method: 'POST',
        data: { code: 'class Solution {}', password: 'hunter2' },
        cookies: { ca_token: 'jwt' },
        headers: { authorization: 'Bearer jwt' },
        query_string: 'a=1',
      },
      user: { id: 'u1', email: 'a@b.c', ip_address: '1.2.3.4' },
    });
    expect(event.request).toEqual({ url: '/api/execute/submit', method: 'POST' });
    expect(event.user).toEqual({ id: 'u1' });
    expect(JSON.stringify(event)).not.toMatch(/hunter2|jwt|Solution|a@b\.c|1\.2\.3\.4/);
  });

  it('keeps events without request or user data unchanged', () => {
    expect(scrubEvent({ message: 'plain' })).toEqual({ message: 'plain' });
  });
});
