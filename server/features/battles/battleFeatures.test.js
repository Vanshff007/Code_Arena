// Battle features beyond the basic flow (battles.test.js): problem
// difficulty from ratings, restart-safe battles, several tabs, rematches,
// spectators, replays and chat rate limits. Real Socket.io server and
// clients; battles are finished by calling handleBattleSubmission directly,
// so no Docker judge is needed.
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import http from 'http';
import { Server } from 'socket.io';
import { io as ioClient } from 'socket.io-client';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../app.js';
import { registerSocketHandlers } from './sockets.js';
import { handleBattleSubmission, restoreActiveBattles } from './roomManager.js';
import { rooms, matchmakingQueue } from './state.js';
import { resetPresence } from '../../core/presence.js';
import User from '../auth/User.model.js';
import Problem from '../problems/Problem.model.js';
import Match from './Match.model.js';
import ActiveRoom from './ActiveRoom.model.js';
import BattleReplay from './BattleReplay.model.js';

let server;
let port;
let sockets = [];

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
  await Promise.all([
    User.deleteMany({}),
    Problem.deleteMany({}),
    Match.deleteMany({}),
    ActiveRoom.deleteMany({}),
    BattleReplay.deleteMany({}),
  ]);
});

afterEach(() => {
  for (const s of sockets) s.close();
  sockets = [];
  for (const room of rooms.values()) {
    clearInterval(room.timerInterval);
    clearInterval(room.countdownInterval);
    Object.values(room.disconnectTimers).forEach(clearTimeout);
  }
  rooms.clear();
  matchmakingQueue.length = 0;
  resetPresence();
});

const problemDoc = (title, difficulty) => ({
  title,
  difficulty,
  description: 'd',
  examples: [{ input: '1', output: '1' }],
  publicTestCases: [{ input: '1', output: '1' }],
  hiddenTestCases: [{ input: '1', output: '1' }],
});

async function register(username, rating) {
  const reg = await request(app)
    .post('/api/auth/register')
    .send({ username, email: `${username}@test.com`, password: 'password123' });
  if (rating) await User.updateOne({ username }, { rating });
  return { token: reg.body.data.token, userId: reg.body.data.user._id };
}

async function connect(token) {
  const socket = ioClient(`http://localhost:${port}`, { auth: { token }, transports: ['websocket'], forceNew: true });
  sockets.push(socket);
  await new Promise((resolve, reject) => {
    socket.once('connect', resolve);
    socket.once('connect_error', reject);
  });
  return socket;
}

const once = (socket, event) => new Promise((resolve) => socket.once(event, resolve));

async function startBattle(aName, bName, ratings = []) {
  const a = await register(aName, ratings[0]);
  const b = await register(bName, ratings[1]);
  const sa = await connect(a.token);
  const sb = await connect(b.token);
  const started = Promise.all([once(sa, 'battle:start'), once(sb, 'battle:start')]);
  sa.emit('matchmaking:join');
  sb.emit('matchmaking:join');
  const [start] = await started;
  return { a, b, sa, sb, start };
}

describe('problem difficulty from ratings', () => {
  it(
    'gives new players an Easy problem when the bank has one',
    async () => {
      await Problem.create(problemDoc('Hard One', 'Hard'));
      await Problem.create(problemDoc('Easy One', 'Easy'));
      const { start } = await startBattle('easyA', 'easyB');
      expect(start.problem.difficulty).toBe('Easy');
    },
    20000
  );

  it(
    'gives strong players a Hard problem',
    async () => {
      await Problem.create(problemDoc('Easy Two', 'Easy'));
      await Problem.create(problemDoc('Hard Two', 'Hard'));
      const { start } = await startBattle('proA', 'proB', [1600, 1700]);
      expect(start.problem.difficulty).toBe('Hard');
    },
    20000
  );
});

describe('restart-safe battles and replays', () => {
  it(
    'stores the live battle, then saves a replay and clears it when the battle ends',
    async () => {
      await Problem.create(problemDoc('Persisted', 'Easy'));
      const { a, b, sa, start } = await startBattle('persistA', 'persistB');
      expect(await ActiveRoom.countDocuments({ roomCode: start.roomCode })).toBe(1);

      sa.emit('battle:snapshot', { roomCode: start.roomCode, code: 'print(1)', language: 'python' });
      await new Promise((r) => setTimeout(r, 200));

      const ended = once(sa, 'battle:end');
      await handleBattleSubmission(start.roomCode, a.userId, { verdict: 'Accepted', passedCount: 2, totalCount: 2 }, {
        language: 'python',
        code: 'print(2)',
      });
      const end = await ended;
      expect(end.winner).toBe(a.userId);
      expect(await ActiveRoom.countDocuments()).toBe(0);

      const match = await Match.findById(end.matchId);
      expect(match.players.find((p) => p.user.toString() === a.userId).language).toBe('python');

      const replay = await BattleReplay.findOne({ match: end.matchId });
      const mine = replay.players.find((p) => p.user.toString() === a.userId);
      expect(mine.snapshots.map((s) => s.code)).toEqual(['print(1)', 'print(2)']);
      expect(replay.timeline).toHaveLength(1);

      // Only the two players can open the replay.
      const ok = await request(app).get(`/api/matches/${end.matchId}/replay`).set('Authorization', `Bearer ${b.token}`);
      expect(ok.status).toBe(200);
      expect(ok.body.data.players).toHaveLength(2);
      const outsider = await register('nosyuser');
      const denied = await request(app)
        .get(`/api/matches/${end.matchId}/replay`)
        .set('Authorization', `Bearer ${outsider.token}`);
      expect(denied.status).toBe(403);

      const history = await request(app).get('/api/matches/me').set('Authorization', `Bearer ${a.token}`);
      expect(history.body.data.matches[0].hasReplay).toBe(true);
    },
    25000
  );

  it(
    'restores an in-progress battle after a restart and lets the player resume',
    async () => {
      const problem = await Problem.create(problemDoc('Restored', 'Easy'));
      const a = await register('restoreA');
      const b = await register('restoreB');
      const match = await Match.create({
        problem: problem._id,
        players: [
          { user: a.userId, ratingBefore: 1000 },
          { user: b.userId, ratingBefore: 1000 },
        ],
        durationMs: 15 * 60 * 1000,
        startedAt: new Date(Date.now() - 60_000),
      });
      await ActiveRoom.create({
        roomCode: 'RESTOR',
        players: [
          { userId: a.userId, username: 'restoreA', rating: 1000 },
          { userId: b.userId, username: 'restoreB', rating: 1000 },
        ],
        problem: problem._id,
        matchId: match._id,
        startedAt: new Date(Date.now() - 60_000),
        durationMs: 15 * 60 * 1000,
        results: {},
      });

      expect(await restoreActiveBattles()).toBe(1);
      expect(rooms.get('RESTOR').status).toBe('in_progress');

      const socket = ioClient(`http://localhost:${port}`, { auth: { token: a.token }, transports: ['websocket'], forceNew: true });
      sockets.push(socket);
      const resumed = await once(socket, 'battle:resume');
      expect(resumed.roomCode).toBe('RESTOR');
      expect(resumed.problem.title).toBe('Restored');
      expect(resumed.remainingMs).toBeLessThan(15 * 60 * 1000 - 50_000);
    },
    20000
  );
});

describe('several tabs', () => {
  it(
    'does not steal the battle when another tab connects, but hands it over on claim',
    async () => {
      await Problem.create(problemDoc('Tabs', 'Easy'));
      const { a, sa, start } = await startBattle('tabA', 'tabB');

      // A second tab (e.g. the dashboard) connects: no takeover.
      const second = await connect(a.token);
      let takenOver = false;
      sa.once('battle:takenOver', () => (takenOver = true));
      await new Promise((r) => setTimeout(r, 200));
      expect(takenOver).toBe(false);

      // The battle page in the second tab claims it.
      const takeover = once(sa, 'battle:takenOver');
      const resume = once(second, 'battle:resume');
      second.emit('battle:claim', { roomCode: start.roomCode });
      expect((await takeover).roomCode).toBe(start.roomCode);
      expect((await resume).roomCode).toBe(start.roomCode);
    },
    20000
  );
});

describe('rematch', () => {
  it(
    'starts a new battle when the opponent accepts',
    async () => {
      await Problem.create(problemDoc('Rematch', 'Easy'));
      const { a, sa, sb, start } = await startBattle('rematchA', 'rematchB');
      const ended = Promise.all([once(sa, 'battle:end'), once(sb, 'battle:end')]);
      await handleBattleSubmission(start.roomCode, a.userId, { verdict: 'Accepted', passedCount: 1, totalCount: 1 });
      await ended;

      const requested = once(sb, 'rematch:requested');
      sa.emit('rematch:request', { roomCode: start.roomCode });
      expect((await requested).from).toBe('rematchA');

      const startedA = once(sa, 'rematch:start');
      const startedB = once(sb, 'rematch:start');
      sb.emit('rematch:accept', { roomCode: start.roomCode });
      const [ra, rb] = await Promise.all([startedA, startedB]);
      expect(ra.roomCode).toBe(rb.roomCode);
      expect(ra.roomCode).not.toBe(start.roomCode);
      // New ratings are used: the winner went up.
      const room = rooms.get(ra.roomCode);
      expect(room.players.find((p) => p.userId === a.userId).rating).toBeGreaterThan(1000);
    },
    25000
  );

  it(
    'tells the requester when the opponent declines',
    async () => {
      await Problem.create(problemDoc('Decline', 'Easy'));
      const { a, sa, sb, start } = await startBattle('declineA', 'declineB');
      const ended = Promise.all([once(sa, 'battle:end'), once(sb, 'battle:end')]);
      await handleBattleSubmission(start.roomCode, a.userId, { verdict: 'Accepted', passedCount: 1, totalCount: 1 });
      await ended;

      const requested = once(sb, 'rematch:requested');
      sa.emit('rematch:request', { roomCode: start.roomCode });
      await requested;
      const declined = once(sa, 'rematch:declined');
      sb.emit('rematch:decline', { roomCode: start.roomCode });
      expect((await declined).by).toBe('declineB');
    },
    25000
  );
});

describe('spectators', () => {
  it(
    'see players, progress and the clock but no code',
    async () => {
      await Problem.create(problemDoc('Watched', 'Easy'));
      const { a, sa, start } = await startBattle('watchedA', 'watchedB');

      const live = await request(app).get('/api/matches/live').set('Authorization', `Bearer ${a.token}`);
      expect(live.body.data.battles.map((x) => x.roomCode)).toContain(start.roomCode);

      const viewer = await register('viewer');
      const sv = await connect(viewer.token);
      const state = once(sv, 'spectate:state');
      sv.emit('spectate:join', { roomCode: start.roomCode });
      const s = await state;
      expect(s.players).toHaveLength(2);
      expect(s.problem.title).toBe('Watched');
      expect(JSON.stringify(s)).not.toMatch(/snapshots|"code"/);

      const progress = once(sv, 'battle:progress');
      await handleBattleSubmission(start.roomCode, a.userId, { verdict: 'Wrong Answer', passedCount: 1, totalCount: 3 }, {
        language: 'python',
        code: 'secret()',
      });
      const p = await progress;
      expect(p).toEqual({ userId: a.userId, verdict: 'Wrong Answer', passedCount: 1, totalCount: 3 });

      // Players cannot spectate their own battle.
      const err = once(sa, 'spectate:error');
      sa.emit('spectate:join', { roomCode: start.roomCode });
      expect((await err).message).toMatch(/playing/);
    },
    25000
  );
});

describe('socket rate limits', () => {
  it(
    'stops chat floods',
    async () => {
      await Problem.create(problemDoc('Chatty', 'Easy'));
      const { sa, sb, start } = await startBattle('chatA', 'chatB');
      let received = 0;
      sb.on('chat:message', () => (received += 1));
      const limited = once(sa, 'chat:rateLimited');
      for (let i = 0; i < 7; i++) sa.emit('chat:send', { roomCode: start.roomCode, message: `hi ${i}` });
      await limited;
      await new Promise((r) => setTimeout(r, 200));
      expect(received).toBe(5);
    },
    20000
  );
});
