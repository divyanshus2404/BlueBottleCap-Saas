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
