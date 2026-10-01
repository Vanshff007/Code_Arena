import { describe, it, expect, beforeEach } from 'vitest';
import {
  rooms,
  createRoomState,
  findRoomByUserId,
  difficultyForRatings,
  addSnapshot,
  MAX_SNAPSHOTS_PER_PLAYER,
  MAX_SNAPSHOT_CHARS,
} from './state.js';
import { createSocketLimiter } from '../../core/socketLimits.js';

beforeEach(() => rooms.clear());

const player = (userId) => ({ userId, socketId: `s-${userId}`, username: userId, rating: 1000, ready: false });

describe('room state', () => {
  it('finds the room a player is in', () => {
    const room = createRoomState('ROOM01', player('u1'));
    expect(findRoomByUserId('u1')).toBe(room);
    expect(findRoomByUserId('u2')).toBeNull();
  });

  // Regression: a finished room is kept for a minute for late events, and
  // used to block the player from queueing again ("already in a battle").
  it('ignores completed rooms so players can queue again right away', () => {
    const old = createRoomState('OLD001', player('u1'));
    old.status = 'completed';
    expect(findRoomByUserId('u1')).toBeNull();

    const next = createRoomState('NEW001', player('u1'));
    expect(findRoomByUserId('u1')).toBe(next);
  });
});

describe('difficultyForRatings', () => {
  it('picks difficulty from the average rating', () => {
    expect(difficultyForRatings([1000, 1000])).toBe('Easy');
    expect(difficultyForRatings([1100, 1300])).toBe('Medium');
    expect(difficultyForRatings([1500, 1600])).toBe('Hard');
    expect(difficultyForRatings([])).toBe('Easy');
  });
});

describe('addSnapshot', () => {
  it('skips unchanged code and caps the list without losing the newest code', () => {
    const list = [];
    expect(addSnapshot(list, { t: 1, code: 'a', language: 'python' })).toBe(true);
    expect(addSnapshot(list, { t: 2, code: 'a', language: 'python' })).toBe(false);
    expect(addSnapshot(list, { t: 3, code: 'a', language: 'cpp' })).toBe(true);
    for (let i = 0; i < MAX_SNAPSHOTS_PER_PLAYER + 10; i++) addSnapshot(list, { t: i, code: `v${i}`, language: 'cpp' });
    expect(list).toHaveLength(MAX_SNAPSHOTS_PER_PLAYER);
    expect(list.at(-1).code).toBe(`v${MAX_SNAPSHOTS_PER_PLAYER + 9}`);
  });

  it('truncates very long code', () => {
    const list = [];
    addSnapshot(list, { t: 0, code: 'x'.repeat(MAX_SNAPSHOT_CHARS + 50), language: 'python' });
    expect(list[0].code).toHaveLength(MAX_SNAPSHOT_CHARS);
  });
});

describe('socket rate limiter', () => {
  it('allows up to the limit per window, then blocks, then recovers', () => {
    let now = 0;
    const allow = createSocketLimiter({ 'chat:send': { limit: 2, windowMs: 1000 } }, () => now);
    expect(allow('chat:send')).toBe(true);
    expect(allow('chat:send')).toBe(true);
    expect(allow('chat:send')).toBe(false);
    now = 1001;
    expect(allow('chat:send')).toBe(true);
  });

  it('tracks events separately and has a default limit', () => {
    const allow = createSocketLimiter({ a: { limit: 1, windowMs: 1000 } }, () => 0);
    expect(allow('a')).toBe(true);
    expect(allow('a')).toBe(false);
    expect(allow('other')).toBe(true);
  });
});
