import { isIP } from 'node:net';

// A sliding one-hour window, bounded by both addresses and timestamps per address.
// Entries stay ordered by their most recent accepted attempt, allowing expiration
// without scanning all active addresses on every request.
export function createRateLimiter({
  limit = 5,
  windowMs = 3_600_000,
  maxEntries = 10_000,
  now = () => performance.now(),
} = {}) {
  if (!Number.isInteger(limit) || limit < 1 || !Number.isInteger(maxEntries) || maxEntries < 1
      || !Number.isFinite(windowMs) || windowMs <= 0) {
    throw new RangeError('Invalid rate limiter limits');
  }
  const hits = new Map();

  function expire(time) {
    for (const [ip, timestamps] of hits) {
      if (time - timestamps.at(-1) < windowMs) break;
      hits.delete(ip);
    }
  }

  return {
    isLimited(ip) {
      // Only actual IPs become keys: an arbitrary forwarded header must not
      // allocate a large string in the map.
      if (typeof ip !== 'string' || !isIP(ip)) return true;
      const time = now();
      expire(time);
      const timestamps = (hits.get(ip) || []).filter((t) => time - t < windowMs);
      if (timestamps.length >= limit) return true;
      // Do not evict active entries: rotating addresses must not reset limits.
      if (!hits.has(ip) && hits.size >= maxEntries) return true;
      timestamps.push(time);
      hits.delete(ip);
      hits.set(ip, timestamps);
      return false;
    },
    sweep() { expire(now()); },
    get size() { return hits.size; },
  };
}
