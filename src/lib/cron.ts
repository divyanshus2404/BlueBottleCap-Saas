// Helpers for scheduled (Vercel Cron) routes and email unsubscribe links.
//
// Vercel Cron automatically sends `Authorization: Bearer <CRON_SECRET>` when
// CRON_SECRET is set, so we gate cron routes on that. Unsubscribe links are
// signed with the same secret (HMAC) so they can't be forged to opt other
// users out, and need no stored token.

import crypto from "crypto";

export function isAuthorizedCron(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // unconfigured → refuse rather than run open
  const auth = req.headers.get("authorization") || "";
  const expected = `Bearer ${secret}`;
  // Constant-time compare on equal-length buffers.
  const a = Buffer.from(auth);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function unsubscribeToken(uid: string): string {
  const secret = process.env.CRON_SECRET || "";
  return crypto.createHmac("sha256", secret).update(`unsub:${uid}`).digest("hex").slice(0, 32);
}

export function verifyUnsubscribe(uid: string, sig: string): boolean {
  if (!uid || !sig) return false;
  const expected = unsubscribeToken(uid);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
