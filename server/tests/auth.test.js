import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../app.js';
import User from '../models/User.model.js';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('auth', () => {
  it('registers a new user and returns a token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'alice', email: 'alice@test.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.password).toBeUndefined();
  });

  it('rejects registration with a duplicate email', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'bob', email: 'dup@test.com', password: 'password123' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'bob2', email: 'dup@test.com', password: 'password123' });

    expect(res.status).toBe(409);
  });

  it('logs in with correct credentials', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'carol', email: 'carol@test.com', password: 'password123' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'carol@test.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });

  it('rejects login with the wrong password', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'dave', email: 'dave@test.com', password: 'password123' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'dave@test.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
  });

  it('rejects /me with no token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns the current user for /me with a valid token', async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ username: 'erin', email: 'erin@test.com', password: 'password123' });

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${reg.body.data.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.username).toBe('erin');
  });
});
