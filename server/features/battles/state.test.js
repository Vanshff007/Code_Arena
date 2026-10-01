import { describe, it, expect, beforeEach } from 'vitest';
import { rooms, createRoomState, findRoomByUserId } from './state.js';

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
