import { NextResponse } from "next/server";
import { requireAuth } from "@/src/lib/authGuard";
import { getAdmin } from "@/src/lib/firebaseAdmin";
import { getRateLimiter, getClientIp } from "@/src/lib/rateLimit";

// Rate limit so a compromised session can't spam cancel requests.
const cancelLimiter = getRateLimiter({ limit: 5, windowMs: 60_000 });

/**
 * POST /api/user/cancel-subscription
 *
 * Marks the user as opted-out of any future subscription auto-charge and
 * records the cancellation timestamp. Current access is NOT revoked — the
 * user keeps Pro for the period they've already paid for. This matches the
 * refund policy (see /refunds).
 *
 * The current checkout uses one-shot Razorpay orders, so there is no
 * recurring mandate to actually void. This endpoint therefore only writes
 * intent flags; downstream renewal reminders (email/UI) key off those flags
 * to stop prompting the user to re-pay.
 */
export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!cancelLimiter.check(ip)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  const admin = getAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Server is not configured to process cancellations. Please email support@bluebottlecap.com." },
      { status: 503 }
    );
  }

  try {
    await admin.db.collection("users").doc(auth.userId).set(
      {
        subscriptionCancelled: true,
        subscriptionCancelledAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/user/cancel-subscription]", err);
    return NextResponse.json(
      { error: "Could not cancel right now. Please email support@bluebottlecap.com." },
      { status: 500 }
    );
  }
}
