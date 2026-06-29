// Lightweight in-memory rate limiter.
//
// NOTE: This is per-instance state. On a single long-lived server it is solid;
// on horizontally-scaled / serverless platforms (e.g. multiple Vercel lambdas)
// each instance keeps its own counters, so it is a best-effort guard rather than
// a global limit. For strict global limits, back this with Upstash Redis later.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Fixed-window rate limiter.
 * @param key      Unique caller key (e.g. IP address or user id).
 * @param limit    Max requests allowed per window.
 * @param windowMs Window length in milliseconds.
 */
export function rateLimit(key: string, limit = 20, windowMs = 60_000): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt < now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { ok: true, remaining: limit - 1, resetAt };
  }

  existing.count += 1;
  const ok = existing.count <= limit;
  return { ok, remaining: Math.max(0, limit - existing.count), resetAt: existing.resetAt };
}

/** Best-effort client IP extraction from standard proxy headers. */
export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Guard helper for API routes. Returns a Response to short-circuit with when the
 * caller is over the limit, or null when the request may proceed.
 */
export function enforceRateLimit(
  req: Request,
  { limit = 20, windowMs = 60_000, prefix = "api" } = {},
): Response | null {
  const ip = getClientIp(req);
  const { ok, remaining, resetAt } = rateLimit(`${prefix}:${ip}`, limit, windowMs);
  if (ok) return null;

  const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
  return new Response(
    JSON.stringify({ error: "Too many requests. Please slow down and try again shortly." }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfter),
        "X-RateLimit-Remaining": String(remaining),
      },
    },
  );
}

// Periodically evict expired buckets so the map does not grow unbounded.
if (typeof setInterval !== "undefined") {
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt < now) buckets.delete(key);
    }
  }, 5 * 60_000);
  // Don't keep the event loop alive just for cleanup.
  (timer as any)?.unref?.();
}
