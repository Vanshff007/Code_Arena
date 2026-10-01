// Cookie sessions, logging out (one device / everywhere) and password
// changes. See session.js.
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../app.js';
import User from './User.model.js';
import { AUTH_COOKIE } from './session.js';
import { parseCookies, durationToMs } from '../../core/utils/cookies.js';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await User.deleteMany({});
});

const creds = { username: 'cookieuser', email: 'cookie@test.com', password: 'password123' };

function sessionCookie(res) {
  return (res.headers['set-cookie'] ?? []).find((c) => c.startsWith(`${AUTH_COOKIE}=`));
}

describe('cookie sessions', () => {
  it('sets an httpOnly, SameSite=Lax session cookie on register and login', async () => {
    const reg = await request(app).post('/api/auth/register').send(creds);
    const cookie = sessionCookie(reg);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Lax/i);

    const login = await request(app).post('/api/auth/login').send({ email: creds.email, password: creds.password });
    expect(sessionCookie(login)).toBeDefined();
  });

  it('authenticates with the cookie alone', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/register').send(creds);
    const me = await agent.get('/api/auth/me');
    expect(me.status).toBe(200);
    expect(me.body.data.user.username).toBe('cookieuser');
  });

  it('never exposes the password or token version', async () => {
    const reg = await request(app).post('/api/auth/register').send(creds);
    expect(reg.body.data.user.password).toBeUndefined();
    expect(reg.body.data.user.tokenVersion).toBeUndefined();
  });

  it('logout clears the cookie', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/register').send(creds);
    const out = await agent.post('/api/auth/logout');
    expect(out.status).toBe(200);
    expect(sessionCookie(out)).toMatch(/Expires=Thu, 01 Jan 1970/);
    expect((await agent.get('/api/auth/me')).status).toBe(401);
  });

  it('logout-all revokes every existing session', async () => {
    const first = await request(app).post('/api/auth/register').send(creds);
    const second = await request(app).post('/api/auth/login').send({ email: creds.email, password: creds.password });
    const tokenA = first.body.data.token;
    const tokenB = second.body.data.token;

    const res = await request(app).post('/api/auth/logout-all').set('Authorization', `Bearer ${tokenA}`);
    expect(res.status).toBe(200);
    expect((await request(app).get('/api/auth/me').set('Authorization', `Bearer ${tokenA}`)).status).toBe(401);
    expect((await request(app).get('/api/auth/me').set('Authorization', `Bearer ${tokenB}`)).status).toBe(401);

    // Logging in again works.
    const again = await request(app).post('/api/auth/login').send({ email: creds.email, password: creds.password });
    expect((await request(app).get('/api/auth/me').set('Authorization', `Bearer ${again.body.data.token}`)).status).toBe(200);
  });

  it('changing the password needs the current one and revokes other sessions', async () => {
    const reg = await request(app).post('/api/auth/register').send(creds);
    const oldToken = reg.body.data.token;
    const auth = { Authorization: `Bearer ${oldToken}` };

    const wrong = await request(app).put('/api/auth/password').set(auth).send({ currentPassword: 'nope', newPassword: 'newpass123' });
    expect(wrong.status).toBe(400);

    const short = await request(app).put('/api/auth/password').set(auth).send({ currentPassword: 'password123', newPassword: '123' });
    expect(short.status).toBe(400);

    const ok = await request(app).put('/api/auth/password').set(auth).send({ currentPassword: 'password123', newPassword: 'newpass123' });
    expect(ok.status).toBe(200);
    expect(sessionCookie(ok)).toBeDefined();

    expect((await request(app).get('/api/auth/me').set(auth)).status).toBe(401);
    expect((await request(app).get('/api/auth/me').set('Authorization', `Bearer ${ok.body.data.token}`)).status).toBe(200);
    expect((await request(app).post('/api/auth/login').send({ email: creds.email, password: 'password123' })).status).toBe(401);
    expect((await request(app).post('/api/auth/login').send({ email: creds.email, password: 'newpass123' })).status).toBe(200);
  });

  it('rejects a token signed with the wrong secret', async () => {
    const res = await request(app).get('/api/auth/me').set('Cookie', `${AUTH_COOKIE}=not-a-real-token`);
    expect(res.status).toBe(401);
  });
});

describe('cookie helpers', () => {
  it('parses cookie headers', () => {
    expect(parseCookies('a=1; ca_token=abc%20d; b')).toEqual({ a: '1', ca_token: 'abc d' });
    expect(parseCookies('')).toEqual({});
    expect(parseCookies(undefined)).toEqual({});
  });

  it('converts durations like 7d to milliseconds', () => {
    expect(durationToMs('7d')).toBe(604_800_000);
    expect(durationToMs('12h')).toBe(43_200_000);
    expect(durationToMs('30')).toBe(30_000);
    expect(durationToMs(60)).toBe(60_000);
    expect(() => durationToMs('soon')).toThrow();
  });
});
