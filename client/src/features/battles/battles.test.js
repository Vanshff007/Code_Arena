import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'fs';

vi.mock('../../shared/api', () => ({ default: { get: vi.fn(async () => ({ data: 'ok' })) } }));

import api from '../../shared/api';
import { getMyMatches } from './matchService';
import {
  EVENTS,
  splitPlayers,
  normalizeRoomCode,
  clockFraction,
  outcomeFor,
  summarizeMatches,
  OUTCOME_TEXT,
} from './battleState';

describe('matchService', () => {
  it('fetches my matches', async () => {
    await getMyMatches();
    expect(api.get).toHaveBeenCalledWith('/matches/me');
  });
});

describe('socket event contract', () => {
  // Every event name the client uses must exist in the server socket code,
  // so a rename on one side fails this test instead of silently breaking.
  const serverSource = ['sockets.js', 'roomManager.js']
    .map((f) => readFileSync(new URL(`../../../../server/features/battles/${f}`, import.meta.url), 'utf8'))
    .join('\n');

  it.each(Object.entries(EVENTS))('%s (%s) exists on the server', (_, name) => {
    expect(serverSource).toContain(`'${name}'`);
  });
});

describe('battle helpers', () => {
  const players = [
    { userId: 'me', username: 'ana' },
    { userId: 'them', username: 'raj' },
  ];

  it('splits players into self and opponent', () => {
    expect(splitPlayers(players, 'me')).toEqual({ self: players[0], opponent: players[1] });
    expect(splitPlayers([players[0]], 'me').opponent).toBeNull();
    expect(splitPlayers(undefined, 'me')).toEqual({ self: null, opponent: null });
  });

  it('normalizes room codes', () => {
    expect(normalizeRoomCode(' ab-12 cd ')).toBe('AB12CD');
    expect(normalizeRoomCode('abcdefgh')).toBe('ABCDEF');
    expect(normalizeRoomCode()).toBe('');
  });

  it('computes the remaining clock fraction', () => {
    expect(clockFraction(450_000, 900_000)).toBe(0.5);
    expect(clockFraction(-5, 900_000)).toBe(0);
    expect(clockFraction(10, 0)).toBe(0);
  });

  it('reads the outcome from the player point of view', () => {
    expect(outcomeFor({ winner: 'me', isDraw: false }, 'me')).toBe('win');
    expect(outcomeFor({ winner: 'them', isDraw: false }, 'me')).toBe('loss');
    expect(outcomeFor({ winner: null, isDraw: true }, 'me')).toBe('draw');
    expect(outcomeFor(null, 'me')).toBeNull();
    expect(OUTCOME_TEXT.win).toBe('You won');
  });

  it('summarizes a match list', () => {
    const summary = summarizeMatches([
      { result: 'Win', ratingChange: 16 },
      { result: 'Loss', ratingChange: -14 },
      { result: 'Draw', ratingChange: 0 },
      { result: 'Win', ratingChange: 10 },
    ]);
    expect(summary).toEqual({ played: 4, wins: 2, losses: 1, draws: 1, ratingChange: 12 });
    expect(summarizeMatches()).toEqual({ played: 0, wins: 0, losses: 0, draws: 0, ratingChange: 0 });
  });
});
