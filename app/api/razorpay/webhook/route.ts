import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/src/lib/razorpay";
import { grantEntitlement } from "@/src/lib/grantEntitlement";
import { WebhookEventSchema } from "@/src/lib/validate";

/**
 * Razorpay webhook — the reliable half of payment confirmation.
 *
 * /api/razorpay/verify only runs if the user's browser survives the payment.
 * If they close the tab, lose signal, or the redirect fails, the money is
 * taken and nothing is granted. Razorpay calls this endpoint server-to-server
 * and retries until it gets a 2xx, so it is what guarantees delivery.
 *
 * Setup: Razorpay Dashboard → Settings → Webhooks → add
 *   URL:    https://<domain>/api/razorpay/webhook
 *   Events: payment.captured
 *   Secret: must match RAZORPAY_WEBHOOK_SECRET
 *
 * Status codes matter here — Razorpay retries anything non-2xx:
 *   200 — handled, or deliberately ignored (don't retry)
 *   400 — bad signature (don't retry; it will never become valid)
 *   500 — our fault, e.g. Firestore down (DO retry)
 *
 * No auth guard and no rate limiter: the caller is Razorpay, not a user, and
 * the HMAC over the raw body *is* the authentication. A limiter here would
 * drop legitimate retries during a burst of sales.
 */

// This route must see the exact bytes Razorpay signed, so it reads the body as
// text. Never add a body parser or re-serialise — signature checks would break.
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    console.error("[razorpay/webhook] Invalid signature — rejected.");
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  // The body is already proven authentic by the HMAC above; this parse is about
  // shape, so a malformed-but-signed payload can't reach the grant logic.
  let event: ReturnType<typeof WebhookEventSchema.parse>;
  try {
    event = WebhookEventSchema.parse(JSON.parse(rawBody));
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
  }

  // Only act on captured payments. Other subscribed events are acknowledged
  // with a 200 so Razorpay stops retrying them.
  if (event.event !== "payment.captured") {
    return NextResponse.json({ ok: true, ignored: event.event });
  }

  const payment = event.payload?.payment?.entity;
  const paymentId = payment?.id;
  const orderId = payment?.order_id;
  // Notes were attached at order creation, so they arrive on the payment and
  // there is no need to call back to the Razorpay API here.
  const userId = payment?.notes?.userId;
  const productId = payment?.notes?.productId;

  if (!paymentId || !userId) {
    // Nothing actionable, and retrying cannot add the missing notes. Log loudly
    // and 200 — a stuck webhook would mask later, healthy events.
    console.error(
      `[razorpay/webhook] payment.captured without ${!paymentId ? "payment id" : "userId note"} — cannot grant. order=${orderId ?? "?"}`,
    );
    return NextResponse.json({ ok: true, warning: "Missing payment id or userId note." });
  }

  try {
    const result = await grantEntitlement({
      userId,
      paymentId,
      orderId: orderId ?? "",
      productId,
      source: "webhook",
    });

    if (!result.ok) {
      // Admin SDK missing is a server misconfiguration, not a bad request.
      // Return 500 so Razorpay retries once the service account is in place.
      console.error("[razorpay/webhook] Firebase Admin unavailable — asking Razorpay to retry.");
      return NextResponse.json({ error: "Server not configured." }, { status: 500 });
    }

    console.log(
      `[razorpay/webhook] ${result.alreadyGranted ? "duplicate (already granted)" : "granted"} payment=${paymentId} user=${userId}`,
    );
    return NextResponse.json({ ok: true, alreadyGranted: result.alreadyGranted });
  } catch (err) {
    // Transient (Firestore contention/outage) — 500 so the retry can succeed.
    console.error("[razorpay/webhook] Grant failed:", err);
    return NextResponse.json({ error: "Grant failed." }, { status: 500 });
  }
}
