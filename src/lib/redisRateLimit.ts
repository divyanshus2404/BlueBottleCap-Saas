/**
 * Distributed rate limiting backed by Upstash Redis over its REST API.
 *
 * Why this exists: the in-memory limiter in ./rateLimit.ts keeps counters in a
 * per-process Map. On Vercel every serverless instance gets its own Map, so a
 * "20 per minute" cap is really 20 x (number of warm instances) — and instance
 * count rises exactly when you are under load or under attack. The limits were
 * decorative in production.
 *
 * Upstash is used over its HTTP REST API rather than the @upstash/redis SDK on
 * purpose: no new dependency, and plain fetch works in both the Node and Edge
 * runtimes. Free tier is 10k commands/day, which is ample here.
 *
 * Algorithm: fixed window. One INCR per request on a key that includes the
 * window number, with an EXPIRE so keys self-clean. Fixed windows allow a
 * burst at a window boundary (up to 2x the limit across two adjacent windows);
 * that is an accepted trade for one round trip per request. A sliding log
 * would be exact but costs more commands and latency than this app needs.
 *
 * Fails OPEN. If Upstash is unreachable we allow the request rather than lock
 * every user out of the app over a rate-limiter outage. The in-memory limiter
 * still runs underneath as a backstop, so a failure degrades to today's
 * behaviour instead of to no limiting at all.
 */

const REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

/** True when Upstash credentials are present, so callers can skip the hop. */
export function isRedisConfigured(): boolean {
  return Boolean(REST_URL && REST_TOKEN);
}

// Don't let a slow or hanging Redis add latency to every API call.
const TIMEOUT_MS = 1_500;

/**
 * Increment the counter for `key` and return the new count, or null if Redis
 * is unconfigured/unreachable (caller should then fail open).
 */
async function incrWithExpiry(key: string, windowSeconds: number): Promise<number | null> {
  if (!REST_URL || !REST_TOKEN) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    // Pipeline both commands in one round trip. EXPIRE is unconditional: it
    // refreshes the TTL on a key that is already scoped to this window, so the
    // window end does not drift the way `EXPIRE NX` plus a shared key would.
    const resp = await fetch(`${REST_URL}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REST_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, String(windowSeconds)],
      ]),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!resp.ok) {
      console.error(`[redisRateLimit] Upstash returned ${resp.status} — failing open.`);
      return null;
    }

    // Pipeline response shape: [{ result: <incr> }, { result: <expire> }]
    const data = (await resp.json()) as Array<{ result?: unknown; error?: string }>;
    const count = data?.[0]?.result;
    return typeof count === "number" ? count : null;
  } catch (err) {
    // Includes the AbortError from the timeout above.
    console.error("[redisRateLimit] Upstash unreachable — failing open:", err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export interface RedisLimitResult {
  /** False only when Redis answered AND the caller is over the limit. */
  allowed: boolean;
  /** Seconds until the current window ends, for the Retry-After header. */
  retryAfter: number;
  /** True when Redis actually answered; false means we failed open. */
  counted: boolean;
}

/**
 * Check a distributed rate limit. `identifier` should already include the
 * route prefix and the client IP, e.g. "chat:1.2.3.4".
 */
export async function checkRedisLimit(
  identifier: string,
  limit: number,
  windowMs: number,
): Promise<RedisLimitResult> {
  const windowSeconds = Math.max(1, Math.ceil(windowMs / 1000));
  const windowNumber = Math.floor(Date.now() / windowMs);
  const key = `bbc:rl:${identifier}:${windowNumber}`;

  const count = await incrWithExpiry(key, windowSeconds);

  if (count === null) {
    return { allowed: true, retryAfter: 0, counted: false };
  }

  // Seconds remaining in this fixed window.
  const windowEnd = (windowNumber + 1) * windowMs;
  const retryAfter = Math.max(1, Math.ceil((windowEnd - Date.now()) / 1000));

  return { allowed: count <= limit, retryAfter, counted: true };
}
