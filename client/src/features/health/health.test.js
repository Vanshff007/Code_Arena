import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'fs';

vi.mock('../../shared/api', () => ({ default: { get: vi.fn(async () => ({ data: { version: '1.0.0' } })) } }));

import api from '../../shared/api';
import { getHealth } from './healthService';

describe('healthService', () => {
  it('fetches /health and returns the body', async () => {
    expect(await getHealth()).toEqual({ version: '1.0.0' });
    expect(api.get).toHaveBeenCalledWith('/health');
  });
});

describe('version rule', () => {
  it('ships the same version as the server', () => {
    const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8')).version;
    expect(read('../../../package.json')).toBe(read('../../../../server/package.json'));
  });
});
