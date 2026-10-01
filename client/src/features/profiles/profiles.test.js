import { describe, it, expect, vi } from 'vitest';

vi.mock('../../shared/api', () => ({ default: { get: vi.fn(async () => ({ data: 'ok' })) } }));

import api from '../../shared/api';
import { getProfileByUsername } from './profileService';

describe('profileService', () => {
  it('fetches a public profile', async () => {
    await getProfileByUsername('ana');
    expect(api.get).toHaveBeenCalledWith('/users/ana/profile');
  });

  it('encodes the username in the URL', async () => {
    await getProfileByUsername('a/b?c');
    expect(api.get).toHaveBeenCalledWith('/users/a%2Fb%3Fc/profile');
  });
});
