import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../shared/api', () => ({
  default: { get: vi.fn(async () => ({ data: 'ok' })), post: vi.fn(async () => ({ data: 'ok' })) },
}));

import api from '../../shared/api';
import { registerUser, loginUser, getCurrentUser } from './authService';
import { validateRegistration } from './validation';

beforeEach(() => vi.clearAllMocks());

describe('authService', () => {
  it('calls the auth endpoints and unwraps the body', async () => {
    expect(await registerUser({ username: 'a' })).toBe('ok');
    expect(api.post).toHaveBeenCalledWith('/auth/register', { username: 'a' });

    await loginUser({ email: 'e' });
    expect(api.post).toHaveBeenCalledWith('/auth/login', { email: 'e' });

    await getCurrentUser();
    expect(api.get).toHaveBeenCalledWith('/auth/me');
  });
});

describe('validateRegistration', () => {
  const valid = { username: 'player1', email: 'p@test.com', password: 'secret1', confirmPassword: 'secret1' };

  it('accepts a valid form', () => {
    expect(validateRegistration(valid)).toEqual({});
  });

  it('enforces username length and characters', () => {
    expect(validateRegistration({ ...valid, username: 'ab' }).username).toBeDefined();
    expect(validateRegistration({ ...valid, username: 'a'.repeat(21) }).username).toBeDefined();
    expect(validateRegistration({ ...valid, username: 'bad name' }).username).toBeDefined();
  });

  it('checks email, password length and confirmation', () => {
    const errors = validateRegistration({ ...valid, email: 'nope', password: '123', confirmPassword: '456' });
    expect(Object.keys(errors).sort()).toEqual(['confirmPassword', 'email', 'password']);
  });

  it('handles a completely empty form', () => {
    expect(Object.keys(validateRegistration({})).sort()).toEqual(['email', 'password', 'username']);
  });
});
