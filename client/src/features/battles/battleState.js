// Pure helpers for battle screens. No React, no socket - covered by
// battles.test.js.

// Socket.io event names. Must match server/features/battles/sockets.js and
// roomManager.js (see docs/api.md).
export const EVENTS = {
  roomCreate: 'room:create',
  roomJoin: 'room:join',
  roomReady: 'room:ready',
  queueJoin: 'matchmaking:join',
  queueLeave: 'matchmaking:leave',
  chatSend: 'chat:send',
  typing: 'battle:typing',
  snapshot: 'battle:snapshot',
  claim: 'battle:claim',
  rematchRequest: 'rematch:request',
  rematchAccept: 'rematch:accept',
  rematchDecline: 'rematch:decline',
  spectateJoin: 'spectate:join',
  spectateLeave: 'spectate:leave',
  friendChallenge: 'friend:challenge',
  friendChallengeDecline: 'friend:challengeDecline',

  roomState: 'room:state',
  roomCreated: 'room:created',
  roomError: 'room:error',
  countdown: 'room:countdown',
  queueWaiting: 'matchmaking:waiting',
  queueFound: 'matchmaking:found',
  start: 'battle:start',
  timerSync: 'battle:timerSync',
  opponentSubmitted: 'battle:opponentSubmitted',
  opponentTyping: 'battle:opponentTyping',
  opponentDisconnected: 'battle:opponentDisconnected',
  opponentReconnected: 'battle:opponentReconnected',
  resume: 'battle:resume',
  end: 'battle:end',
  chatMessage: 'chat:message',
  chatRateLimited: 'chat:rateLimited',
  takenOver: 'battle:takenOver',
  rematchRequested: 'rematch:requested',
  rematchPending: 'rematch:pending',
  rematchDeclined: 'rematch:declined',
  rematchUnavailable: 'rematch:unavailable',
  rematchStart: 'rematch:start',
  spectateState: 'spectate:state',
  spectateError: 'spectate:error',
  progress: 'battle:progress',
  playerTyping: 'battle:typing',
  friendRequest: 'friend:request',
  friendAccepted: 'friend:accepted',
  friendChallenged: 'friend:challenged',
  friendChallengeSent: 'friend:challengeSent',
  friendChallengeDeclined: 'friend:challengeDeclined',
  friendChallengeError: 'friend:challengeError',
};

export const ROOM_CODE_LENGTH = 6;

export function splitPlayers(players = [], userId) {
  return {
    self: players.find((p) => p.userId === userId) ?? null,
    opponent: players.find((p) => p.userId !== userId) ?? null,
  };
}

// Normalizes what a player typed into a room code.
export function normalizeRoomCode(raw = '') {
  return raw.replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, ROOM_CODE_LENGTH);
}

// Battle clock: under one minute the clock turns to the warning color.
export const LOW_TIME_MS = 60 * 1000;

export function clockFraction(remainingMs, durationMs) {
  if (!durationMs) return 0;
  return Math.max(0, Math.min(1, remainingMs / durationMs));
}

// Headline for the result screen, from the player's point of view.
export function outcomeFor(result, userId) {
  if (!result) return null;
  if (result.isDraw) return 'draw';
  return result.winner === userId ? 'win' : 'loss';
}

// Win-loss-draw record and net rating change for a list of matches.
export function summarizeMatches(matches = []) {
  const summary = { played: matches.length, wins: 0, losses: 0, draws: 0, ratingChange: 0 };
  for (const m of matches) {
    if (m.result === 'Win') summary.wins += 1;
    else if (m.result === 'Loss') summary.losses += 1;
    else summary.draws += 1;
    summary.ratingChange += Number(m.ratingChange) || 0;
  }
  return summary;
}

// Splits the server's per-player progress (battle:resume, spectate:state)
// into this player's and the opponent's, in VersusBar's shape. A player
// who has not submitted yet has no progress (null).
export function progressFromResume(progress = [], userId) {
  const toBar = (p) => (p && p.totalCount ? { passedCount: p.passedCount, totalCount: p.totalCount, verdict: p.verdict } : null);
  return {
    self: toBar(progress.find((p) => p.userId === userId)),
    opponent: toBar(progress.find((p) => p.userId !== userId)),
  };
}

export const OUTCOME_TEXT = {
  win: 'You won',
  loss: 'You lost',
  draw: 'Draw',
};
