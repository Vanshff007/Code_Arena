// Per-socket rate limits for Socket.io events. HTTP routes have
// express-rate-limit; sockets need their own, or one player could flood the
// other with chat or typing events. Sliding window, in memory, per socket
// and event (single process - see docs/architecture.md).

// limit = events allowed per windowMs.
export const SOCKET_LIMITS = {
  'chat:send': { limit: 5, windowMs: 10_000 },
  'battle:typing': { limit: 3, windowMs: 1_000 },
  'battle:snapshot': { limit: 2, windowMs: 2_000 },
  'room:create': { limit: 5, windowMs: 10_000 },
  'room:join': { limit: 10, windowMs: 10_000 },
  'room:ready': { limit: 10, windowMs: 10_000 },
  'matchmaking:join': { limit: 5, windowMs: 10_000 },
  'rematch:request': { limit: 3, windowMs: 10_000 },
  'friend:challenge': { limit: 5, windowMs: 30_000 },
  'spectate:join': { limit: 10, windowMs: 10_000 },
};

const DEFAULT_LIMIT = { limit: 20, windowMs: 10_000 };

// Returns allow(event): true if the event may run now, false if over limit.
export function createSocketLimiter(limits = SOCKET_LIMITS, now = () => Date.now()) {
  const hits = new Map(); // event -> timestamps within the window
  return function allow(event) {
    const { limit, windowMs } = limits[event] ?? DEFAULT_LIMIT;
    const t = now();
    const recent = (hits.get(event) ?? []).filter((at) => t - at < windowMs);
    if (recent.length >= limit) {
      hits.set(event, recent);
      return false;
    }
    recent.push(t);
    hits.set(event, recent);
    return true;
  };
}
