// Minimal in-memory sliding-window rate limiter.
//
// SCOPE: per-instance only. On serverless/multi-instance this bounds an attacker
// against a single warm instance, not globally — meaningful against a burst that
// hits a warm function, but for hard global limits use a shared store
// (Vercel KV / Upstash Ratelimit). Intentionally dependency-free for now.
//
// FAIL-OPEN: any internal error returns { ok:true } — a limiter bug must never
// take down a real login. Never wire this in front of the Stripe webhook (it is
// signature-verified and must accept Stripe's legitimate retries/bursts).

type Timestamps = number[];
const buckets = new Map<string, Timestamps>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: boolean; remaining: number; retryAfterMs: number } {
  try {
    const now = Date.now();
    const cutoff = now - windowMs;
    const hits = (buckets.get(key) ?? []).filter((t) => t > cutoff);

    if (hits.length >= limit) {
      buckets.set(key, hits);
      return { ok: false, remaining: 0, retryAfterMs: Math.max(0, hits[0] + windowMs - now) };
    }

    hits.push(now);
    buckets.set(key, hits);

    // Opportunistic memory bound: drop fully-expired buckets when the map grows.
    if (buckets.size > 5000) {
      for (const [k, v] of buckets) {
        if (!v.some((t) => t > cutoff)) buckets.delete(k);
      }
    }

    return { ok: true, remaining: limit - hits.length, retryAfterMs: 0 };
  } catch {
    return { ok: true, remaining: limit, retryAfterMs: 0 }; // fail-open
  }
}
