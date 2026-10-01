// Pure helpers for the battle replay (covered by battles.test.js).

// Slider granularity on the replay page.
export const REPLAY_STEP_MS = 500;

// The code a player had at time t: their last snapshot at or before t.
export function codeAt(snapshots = [], t) {
  let current = null;
  for (const s of snapshots) {
    if (s.t <= t) current = s;
    else break;
  }
  return current;
}

// How long the replay runs: until the last recorded event, or the battle's
// end if it ended earlier than that.
export function replayLength(players = [], timeline = [], durationMs = 0) {
  const times = [
    ...players.flatMap((p) => p.snapshots.map((s) => s.t)),
    ...timeline.map((e) => e.t),
  ];
  const last = times.length ? Math.max(...times) : 0;
  // Rounded up to the slider step, so its end includes the last event.
  const end = Math.ceil(Math.max(last, 1000) / REPLAY_STEP_MS) * REPLAY_STEP_MS;
  return durationMs ? Math.min(end, durationMs) : end;
}

// Submissions made up to time t, newest first.
export function submissionsUntil(timeline = [], t) {
  return timeline.filter((e) => e.t <= t).reverse();
}

// Next playback position: `speed` times real time, clamped to the end.
export function advance(t, elapsedMs, speed, length) {
  return Math.min(length, t + elapsedMs * speed);
}
