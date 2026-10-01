import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import http from 'http';
import { Server } from 'socket.io';
import { io as ioClient } from 'socket.io-client';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../app.js';
import { registerSocketHandlers } from '../battles/sockets.js';
import { rooms, matchmakingQueue } from '../battles/state.js';
import { resetPresence } from '../../core/presence.js';
import User from '../auth/User.model.js';
import Friendship from './Friendship.model.js';
import { groupFriendships } from './friends.service.js';

let server;
let port;
let sockets = [];

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  server = http.createServer(app);
  registerSocketHandlers(new Server(server, { cors: { origin: '*' } }));
  await new Promise((resolve) => server.listen(0, resolve));
  port = server.address().port;
});

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
  await mongoose.connection.close();
});

beforeEach(async () => {
  await Promise.all([User.deleteMany({}), Friendship.deleteMany({})]);
});

afterEach(() => {
  for (const s of sockets) s.close();
  sockets = [];
  rooms.clear();
  matchmakingQueue.length = 0;
  resetPresence();
});

async function register(username) {
  const reg = await request(app)
    .post('/api/auth/register')
    .send({ username, email: `${username}@test.com`, password: 'password123' });
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
const as = (token) => ({ Authorization: `Bearer ${token}` });

async function makeFriends(a, b, bName) {
  await request(app).post('/api/friends/requests').set(as(a.token)).send({ username: bName });
  const list = await request(app).get('/api/friends').set(as(b.token));
  await request(app).post(`/api/friends/requests/${list.body.data.incoming[0].requestId}/accept`).set(as(b.token));
}

describe('friend requests', () => {
  it('sends, lists and accepts a request', async () => {
    const ann = await register('annfriend');
    const bob = await register('bobfriend');

    const sent = await request(app).post('/api/friends/requests').set(as(ann.token)).send({ username: 'bobfriend' });
    expect(sent.status).toBe(201);

    const annView = (await request(app).get('/api/friends').set(as(ann.token))).body.data;
    expect(annView.outgoing.map((r) => r.username)).toEqual(['bobfriend']);
    const bobView = (await request(app).get('/api/friends').set(as(bob.token))).body.data;
    expect(bobView.incoming.map((r) => r.username)).toEqual(['annfriend']);

    const accepted = await request(app)
      .post(`/api/friends/requests/${bobView.incoming[0].requestId}/accept`)
      .set(as(bob.token));
    expect(accepted.status).toBe(200);

    const after = (await request(app).get('/api/friends').set(as(ann.token))).body.data;
    expect(after.friends).toMatchObject([{ username: 'bobfriend', online: false, inBattle: false }]);
    expect(after.outgoing).toEqual([]);
  });

  it('only lets the recipient accept', async () => {
    const ann = await register('annonly');
    await register('bobonly');
    await request(app).post('/api/friends/requests').set(as(ann.token)).send({ username: 'bobonly' });
    const { outgoing } = (await request(app).get('/api/friends').set(as(ann.token))).body.data;
    const res = await request(app).post(`/api/friends/requests/${outgoing[0].requestId}/accept`).set(as(ann.token));
    expect(res.status).toBe(404);
  });

  it('accepts automatically when the other player already asked', async () => {
    const ann = await register('annmutual');
    const bob = await register('bobmutual');
    await request(app).post('/api/friends/requests').set(as(ann.token)).send({ username: 'bobmutual' });
    const res = await request(app).post('/api/friends/requests').set(as(bob.token)).send({ username: 'annmutual' });
    expect(res.status).toBe(200);
    expect((await request(app).get('/api/friends').set(as(ann.token))).body.data.friends).toHaveLength(1);
  });

  it('rejects requests to yourself, unknown players and duplicates', async () => {
    const ann = await register('annerrors');
    await register('boberrors');
    expect((await request(app).post('/api/friends/requests').set(as(ann.token)).send({ username: 'annerrors' })).status).toBe(400);
    expect((await request(app).post('/api/friends/requests').set(as(ann.token)).send({ username: 'nobodyhere' })).status).toBe(404);
    await request(app).post('/api/friends/requests').set(as(ann.token)).send({ username: 'boberrors' });
    expect((await request(app).post('/api/friends/requests').set(as(ann.token)).send({ username: 'boberrors' })).status).toBe(409);
  });

  it('declines a request and removes a friend', async () => {
    const ann = await register('anndecline');
    const bob = await register('bobdecline');
    await request(app).post('/api/friends/requests').set(as(ann.token)).send({ username: 'bobdecline' });
    const { incoming } = (await request(app).get('/api/friends').set(as(bob.token))).body.data;
    expect((await request(app).delete(`/api/friends/requests/${incoming[0].requestId}`).set(as(bob.token))).status).toBe(200);
    expect(await Friendship.countDocuments()).toBe(0);

    await makeFriends(ann, bob, 'bobdecline');
    expect((await request(app).delete(`/api/friends/${bob.userId}`).set(as(ann.token))).status).toBe(200);
    expect((await request(app).get('/api/friends').set(as(bob.token))).body.data.friends).toEqual([]);
  });

  it('pushes a live notification for a new request', async () => {
    const ann = await register('annpush');
    const bob = await register('bobpush');
    const sb = await connect(bob.token);
    const pushed = once(sb, 'friend:request');
    await request(app).post('/api/friends/requests').set(as(ann.token)).send({ username: 'bobpush' });
    expect((await pushed).username).toBe('annpush');
  });
});

describe('friend challenges', () => {
  it('creates a room for the challenger and invites the friend', async () => {
    const ann = await register('annchal');
    const bob = await register('bobchal');
    await makeFriends(ann, bob, 'bobchal');
    const sa = await connect(ann.token);
    const sb = await connect(bob.token);

    const online = (await request(app).get('/api/friends').set(as(ann.token))).body.data.friends[0];
    expect(online.online).toBe(true);

    const invited = once(sb, 'friend:challenged');
    const sent = once(sa, 'friend:challengeSent');
    sa.emit('friend:challenge', { userId: bob.userId });
    const invite = await invited;
    expect(invite.from).toBe('annchal');
    expect((await sent).roomCode).toBe(invite.roomCode);
    expect(rooms.get(invite.roomCode).players[0].username).toBe('annchal');

    // Declining tells the challenger.
    const declined = once(sa, 'friend:challengeDeclined');
    sb.emit('friend:challengeDecline', { fromId: ann.userId, roomCode: invite.roomCode });
    expect((await declined).by).toBe('bobchal');
  });

  it('refuses to challenge someone who is not a friend or is offline', async () => {
    const ann = await register('annnot');
    const bob = await register('bobnot');
    const sa = await connect(ann.token);

    const notFriend = once(sa, 'friend:challengeError');
    sa.emit('friend:challenge', { userId: bob.userId });
    expect((await notFriend).message).toMatch(/only challenge friends/);

    await makeFriends(ann, bob, 'bobnot');
    const offline = once(sa, 'friend:challengeError');
    sa.emit('friend:challenge', { userId: bob.userId });
    expect((await offline).message).toMatch(/offline/);
  });
});

describe('groupFriendships', () => {
  it('splits documents into friends, incoming and outgoing', () => {
    const me = 'u1';
    const docs = [
      { _id: 'f1', requester: { _id: 'u1', username: 'me' }, recipient: { _id: 'u2', username: 'zed' }, status: 'accepted' },
      { _id: 'f2', requester: { _id: 'u3', username: 'amy' }, recipient: { _id: 'u1', username: 'me' }, status: 'accepted' },
      { _id: 'f3', requester: { _id: 'u4', username: 'in' }, recipient: { _id: 'u1', username: 'me' }, status: 'pending' },
      { _id: 'f4', requester: { _id: 'u1', username: 'me' }, recipient: { _id: 'u5', username: 'out' }, status: 'pending' },
    ];
    const g = groupFriendships(me, docs);
    expect(g.friends.map((f) => f.username)).toEqual(['amy', 'zed']);
    expect(g.incoming.map((f) => f.username)).toEqual(['in']);
    expect(g.outgoing.map((f) => f.username)).toEqual(['out']);
  });
});
