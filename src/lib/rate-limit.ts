type Bucket = {
  hits: number[];
};

const store: Map<string, Bucket> = new Map();

function nowMs(): number {
  return Date.now();
}

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSec: number };

export function rateLimit(key: string, windowSec: number, maxHits: number): RateLimitResult {
  const now = nowMs();
  const windowMs = windowSec * 1000;

  const b: Bucket = store.get(key) ?? { hits: [] };
  b.hits = b.hits.filter((t) => now - t < windowMs);

  if (b.hits.length >= maxHits) {
    const oldest = b.hits[0];
    const retryAfterMs = windowMs - (now - oldest);
    const retryAfterSec = Math.max(1, Math.ceil(retryAfterMs / 1000));
    store.set(key, b);
    return { ok: false, retryAfterSec };
  }

  b.hits.push(now);
  store.set(key, b);
  return { ok: true };
}
