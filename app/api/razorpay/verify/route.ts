import { NextResponse } from 'next/server';
import { grantEntitlement } from '@/src/lib/grantEntitlement';
import { verifyPaymentSignature, getRazorpayKeys } from '@/src/lib/razorpay';
import { getRateLimiter, getClientIp } from '@/src/lib/rateLimit';

// Rate limit: 10 verify attempts per minute per IP
const verifyRateLimiter = getRateLimiter({ limit: 10, windowMs: 60_000 });

/**
 * Fetch the original order from Razorpay to read its notes (productId, userId).
 * This is the ONLY trustworthy source for what was purchased and by whom.
 */
async function fetchRazorpayOrder(orderId: string): Promise<{ notes?: Record<string, string> } | null> {
  try {
    const { keyId, keySecret } = getRazorpayKeys();
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const resp = await fetch(`https://api.razorpay.com/v1/orders/${orderId}`, {
      headers: { Authorization: `Basic ${auth}` },
    });
    if (!resp.ok) return null;
    return resp.json();
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!verifyRateLimiter.check(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait before trying again.' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment fields.' }, { status: 400 });
    }

    // ── Timing-safe HMAC-SHA256 signature verification ──
    const isValid = verifyPaymentSignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!isValid) {
      console.error('[Razorpay verify] Signature mismatch — possible tampered payment.');
      return NextResponse.json({ ok: false, error: 'Payment verification failed.' }, { status: 400 });
    }

    // ── Signature valid — fetch the original order to get productId & userId ──
    // We NEVER trust the client for plan or userId. The order notes were set
    // server-side in create-order and are immutable.
    const order = await fetchRazorpayOrder(razorpay_order_id);
    const productId = order?.notes?.productId;
    const userId = order?.notes?.userId;

    if (!userId) {
      console.warn('[Razorpay verify] No userId in order notes — cannot update Firestore.');
      return NextResponse.json({ ok: true, warning: 'Payment verified but no user to update.' });
    }

    // Shared with /api/razorpay/webhook. Both paths run for the same payment
    // in normal operation, so the grant must be idempotent — see
    // src/lib/grantEntitlement.ts.
    const result = await grantEntitlement({
      userId,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      productId,
      source: 'verify',
    });

    if (!result.ok) {
      console.warn('[Razorpay verify] Firebase Admin not configured — Firestore update skipped.');
      return NextResponse.json({ ok: true, warning: 'Payment verified but server update skipped.' });
    }

    return NextResponse.json({ ok: true, alreadyGranted: result.alreadyGranted });
  } catch (err: unknown) {
    console.error('[/api/razorpay/verify]', err);
    return NextResponse.json({ error: 'Verification error. Please contact support.' }, { status: 500 });
  }
}
