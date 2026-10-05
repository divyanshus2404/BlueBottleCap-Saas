import { checkRedisLimit } from './redisRateLimit';
/**
 * Simple in-memory rate limiter for Next.js API routes.
 *
 * Usage:
 *   const limiter = getRateLimiter({ limit: 20, windowMs: 60_000 });
 *   const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
 *   if (!limiter.check(ip)) {
 *     return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
 *   }
 *
 * NOTE: This is a per-process in-memory store. In a multi-instance
 * deployment (e.g., Vercel with many serverless functions), requests
 * are distributed across instances so the effective limit per IP is
 * higher. For strict multi-instance rate limiting, use a Redis-backed
 * solution such as @upstash/ratelimit.
 */

interface RateLimiterOptions {
  /** Max requests allowed per window */
  limit: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

interface RateLimiter {
  /** Returns true if the request is allowed, false if rate-limited */
  check: (key: string) => boolean;
}

// Global store so the same limiter instance is reused across requests in the same process
const stores = new Map<string, Map<string, { count: number; resetAt: number }>>();

export function getRateLimiter(options: RateLimiterOptions): RateLimiter {
  const storeKey = `${options.limit}:${options.windowMs}`;
  if (!stores.has(storeKey)) {
    stores.set(storeKey, new Map());
  }
  const store = stores.get(storeKey)!;

  return {
    check(key: string): boolean {
      const now = Date.now();
      const record = store.get(key);

      if (!record || now > record.resetAt) {
        store.set(key, { count: 1, resetAt: now + options.windowMs });
        return true;
      }

      if (record.count >= options.limit) {
        return false;
      }

      record.count += 1;
      return true;
    },
  };
}

/** Pre-built limiter: 20 AI requests per minute per IP */
export const aiRateLimiter = getRateLimiter({ limit: 20, windowMs: 60_000 });

/** Extracts the client IP from a Next.js Request */
export function getClientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}

/** Legacy compat for user routes */
/**
 * Enforce a rate limit for a request. Returns a 429 Response when the caller
 * is over the limit, or null to continue.
 *
 * ASYNC as of the Upstash change: it checks the distributed limiter first
 * (authoritative across serverless instances) and keeps the in-memory limiter
 * as a backstop for when Redis is unconfigured or down. Call sites must await
 * it — a bare Promise is always truthy and would 429 every request.
 */
export async function enforceRateLimit(
  req: Request,
  options?: { limit?: number; windowMs?: number; prefix?: string },
): Promise<Response | null> {
  const ip = getClientIp(req);
  const limit = options?.limit ?? 20;
  const windowMs = options?.windowMs ?? 60_000;
  const prefix = options?.prefix ?? "default";
  const identifier = `${prefix}:${ip}`;

  const redis = await checkRedisLimit(identifier, limit, windowMs);
  if (!redis.allowed) {
    return new Response(JSON.stringify({ error: "Too many requests" }), {
      status: 429,
      headers: { "Content-Type": "application/json", "Retry-After": String(redis.retryAfter) },
    });
  }

  // In-memory backstop. Skipped when Redis answered, so a request is never
  // counted twice against two different limiters.
  if (!redis.counted) {
    const limiter = getRateLimiter({ limit, windowMs });
    if (!limiter.check(identifier)) {
      return new Response(JSON.stringify({ error: "Too many requests" }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  return null;
}
