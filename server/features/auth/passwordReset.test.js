import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../app.js';
import User from './User.model.js';
import { outbox } from '../../core/utils/mailer.js';
import { hashResetToken } from './passwordReset.js';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await User.deleteMany({});
  outbox.length = 0;
});

const register = (username) =>
  request(app)
    .post('/api/auth/register')
    .send({ username, email: `${username}@test.com`, password: 'oldpass123' })
    .then((res) => res.body.data.token);

// The emailed link is <client>/reset-password#token=<64 hex>.
const tokenFromMail = () => outbox.at(-1).text.match(/#token=([0-9a-f]{64})/)[1];

const forgot = (email) => request(app).post('/api/auth/forgot-password').send({ email });
const reset = (token, password = 'newpass123') => request(app).post('/api/auth/reset-password').send({ token, password });

describe('forgot password', () => {
  it('gives the same answer for known and unknown emails, and only mails known ones', async () => {
    await register('known');
    const known = await forgot('known@test.com');
    const unknown = await forgot('nobody@test.com');
    expect(known.status).toBe(200);
    expect(unknown.status).toBe(200);
    expect(known.body).toEqual(unknown.body);
    expect(outbox).toHaveLength(1);
    expect(outbox[0].to).toBe('known@test.com');
    expect(outbox[0].text).toMatch(/http:\/\/localhost:5173\/reset-password#token=[0-9a-f]{64}/);
  });

  it('stores only a hash of the token, never returns it, and rejects a bad email', async () => {
    await register('hashed');
    const res = await forgot('hashed@test.com');
    const token = tokenFromMail();
    expect(JSON.stringify(res.body)).not.toContain(token);

    const user = await User.findOne({ username: 'hashed' }).select('+passwordResetHash +passwordResetExpires');
    expect(user.passwordResetHash).toBe(hashResetToken(token));
    expect(user.passwordResetHash).not.toBe(token);
    expect(user.passwordResetExpires.getTime()).toBeGreaterThan(Date.now() + 29 * 60 * 1000);

    expect((await forgot('not-an-email')).status).toBe(400);
  });
});

describe('reset password', () => {
  it('sets the new password, logs in, ends old sessions, and works only once', async () => {
    const oldToken = await register('resetme');
    await forgot('resetme@test.com');
    const token = tokenFromMail();

    const res = await reset(token);
    expect(res.status).toBe(200);
    expect(res.headers['set-cookie'].join(';')).toMatch(/ca_token=/);
    expect(JSON.stringify(res.body)).not.toMatch(/passwordReset|tokenVersion|"password"/);

    const login = await request(app).post('/api/auth/login').send({ email: 'resetme@test.com', password: 'newpass123' });
    expect(login.status).toBe(200);
    const oldLogin = await request(app).post('/api/auth/login').send({ email: 'resetme@test.com', password: 'oldpass123' });
    expect(oldLogin.status).toBe(401);

    // Sessions from before the reset are revoked.
    const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${oldToken}`);
    expect(me.status).toBe(401);

    expect((await reset(token, 'another123')).status).toBe(400);
  });

  it('rejects expired, wrong and malformed tokens, and short passwords', async () => {
    await register('expired');
    await forgot('expired@test.com');
    const token = tokenFromMail();

    expect((await reset(token, '123')).status).toBe(400);
    expect((await reset('a'.repeat(64))).status).toBe(400);
    expect((await reset('not-hex')).status).toBe(400);

    await User.updateOne({ username: 'expired' }, { passwordResetExpires: new Date(Date.now() - 1000) });
    const res = await reset(token);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/expired/);
  });

  it('a newer request replaces the older link', async () => {
    await register('twice');
    await forgot('twice@test.com');
    const first = tokenFromMail();
    await forgot('twice@test.com');
    const second = tokenFromMail();
    expect((await reset(first)).status).toBe(400);
    expect((await reset(second)).status).toBe(200);
  });
});
