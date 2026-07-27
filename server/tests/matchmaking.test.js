// This is the direct regression guard for the "Friendly Matchmaking is
// completely broken" bug: the room used to fail at battle-start whenever
// the Problems collection was empty, surfacing as room:error with
// "Could not start the battle." That failure mode is asserted explicitly
// below, alongside the happy path, so it can never silently come back.
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import http from 'http';
import { Server } from 'socket.io';
import { io as ioClient } from 'socket.io-client';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../app.js';
import { registerSocketHandlers } from '../sockets/index.js';
import User from '../models/User.model.js';
import Problem from '../models/Problem.model.js';
import Match from '../models/Match.model.js';

let server;
let port;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  server = http.createServer(app);
  const io = new Server(server, { cors: { origin: '*' } });
  registerSocketHandlers(io);

  await new Promise((resolve) => server.listen(0, resolve));
  port = server.address().port;
});

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
  await mongoose.connection.close();
});

beforeEach(async () => {
  await Promise.all([User.deleteMany({}), Problem.deleteMany({}), Match.deleteMany({})]);
});

async function registerAndConnect(username) {
  const reg = await request(app)
    .post('/api/auth/register')
    .send({ username, email: `${username}@test.com`, password: 'password123' });
  const token = reg.body.data.token;

  const socket = ioClient(`http://localhost:${port}`, { auth: { token }, transports: ['websocket'] });
  await new Promise((resolve, reject) => {
    socket.once('connect', resolve);
    socket.once('connect_error', reject);
  });
  return socket;
}

describe('matchmaking', () => {
  it(
    'surfaces room:error when the Problems collection is empty (regression guard)',
    async () => {
      const socketA = await registerAndConnect('nprobA');
      const socketB = await registerAndConnect('nprobB');

      const errorPromise = new Promise((resolve) => socketA.once('room:error', resolve));

      socketA.emit('matchmaking:join');
      socketB.emit('matchmaking:join');

      const err = await errorPromise;
      expect(err.message).toMatch(/Could not start the battle/);

      socketA.close();
      socketB.close();
    },
    15000
  );

  it(
    'completes matchmaking and starts a battle with a real problem when one exists',
    async () => {
      await Problem.create({
        title: 'Matchmaking Test Problem',
        difficulty: 'Easy',
        description: 'd',
        examples: [{ input: '1', output: '1' }],
        publicTestCases: [{ input: '1', output: '1' }],
        hiddenTestCases: [{ input: '1', output: '1' }],
      });

      const socketA = await registerAndConnect('battleA');
      const socketB = await registerAndConnect('battleB');

      const startPromise = new Promise((resolve) => socketA.once('battle:start', resolve));

      socketA.emit('matchmaking:join');
      socketB.emit('matchmaking:join');

      const data = await startPromise;
      expect(data.problem.title).toBe('Matchmaking Test Problem');
      expect(data.players).toHaveLength(2);

      socketA.close();
      socketB.close();
    },
    15000
  );
});
