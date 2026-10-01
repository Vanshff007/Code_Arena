import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'fs';

vi.mock('../../shared/api', () => ({ default: { get: vi.fn(async () => ({ data: 'ok' })) } }));

import api from '../../shared/api';
import { getMyMatches, getLiveBattles, getReplay } from './matchService';
import {
  EVENTS,
  splitPlayers,
  normalizeRoomCode,
  clockFraction,
  outcomeFor,
  summarizeMatches,
  OUTCOME_TEXT,
  progressFromResume,
} from './battleState';
import { codeAt, replayLength, submissionsUntil, advance } from './replay';

describe('matchService', () => {
  it('fetches my matches', async () => {
    await getMyMatches();
    expect(api.get).toHaveBeenCalledWith('/matches/me');
  });
});

describe('socket event contract', () => {
  // Every event name the client uses must exist in the server socket code,
  // so a rename on one side fails this test instead of silently breaking.
  const serverSource = ['battles/sockets.js', 'battles/roomManager.js', 'friends/friendSockets.js', 'friends/friends.controller.js']
    .map((f) => readFileSync(new URL(`../../../../server/features/${f}`, import.meta.url), 'utf8'))
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

describe('progressFromResume', () => {
  it('splits progress into self and opponent, null before a submission', () => {
    const progress = [
      { userId: 'me', verdict: 'Wrong Answer', passedCount: 2, totalCount: 5 },
      { userId: 'them', verdict: null, passedCount: 0, totalCount: 0 },
    ];
    expect(progressFromResume(progress, 'me')).toEqual({
      self: { passedCount: 2, totalCount: 5, verdict: 'Wrong Answer' },
      opponent: null,
    });
    expect(progressFromResume(undefined, 'me')).toEqual({ self: null, opponent: null });
  });
});

describe('replay helpers', () => {
  const snaps = [
    { t: 0, code: 'a', language: 'python' },
    { t: 5000, code: 'b', language: 'python' },
    { t: 9000, code: 'c', language: 'cpp' },
  ];

  it('finds the code at a moment', () => {
    expect(codeAt(snaps, 4999).code).toBe('a');
    expect(codeAt(snaps, 5000).code).toBe('b');
    expect(codeAt(snaps, 60_000).code).toBe('c');
    expect(codeAt([{ t: 100, code: 'x', language: 'cpp' }], 50)).toBeNull();
    expect(codeAt(undefined, 10)).toBeNull();
  });

  it('measures the replay up to the last event, capped by the battle length', () => {
    const players = [{ snapshots: snaps }, { snapshots: [] }];
    expect(replayLength(players, [{ t: 12_000 }], 900_000)).toBe(12_000);
    expect(replayLength(players, [{ t: 2_000_000 }], 900_000)).toBe(900_000);
    expect(replayLength([], [], 0)).toBe(1000);
  });

  it('lists submissions so far, newest first', () => {
    const timeline = [{ t: 1 }, { t: 5 }, { t: 9 }];
    expect(submissionsUntil(timeline, 6).map((e) => e.t)).toEqual([5, 1]);
  });

  it('advances playback and stops at the end', () => {
    expect(advance(1000, 100, 10, 60_000)).toBe(2000);
    expect(advance(59_500, 100, 10, 60_000)).toBe(60_000);
  });
});

describe('live and replay services', () => {
  it('fetches live battles and a replay', async () => {
    await getLiveBattles();
    expect(api.get).toHaveBeenCalledWith('/matches/live');
    await getReplay('m1');
    expect(api.get).toHaveBeenCalledWith('/matches/m1/replay');
  });
});

describe('replay length rounding', () => {
  it('rounds up to the slider step so the end includes the last event', () => {
    expect(replayLength([], [{ t: 12_123 }], 900_000)).toBe(12_500);
  });
});
