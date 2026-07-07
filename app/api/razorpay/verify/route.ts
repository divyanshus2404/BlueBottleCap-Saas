import { NextResponse } from 'next/server';
import { verifyPaymentSignature, isProductId, productToPlan, PRODUCTS, getRazorpayKeys } from '@/src/lib/razorpay';
import { getAdmin } from '@/src/lib/firebaseAdmin';
import { getRateLimiter, getClientIp } from '@/src/lib/rateLimit';
import { FieldValue } from 'firebase-admin/firestore';

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

    const admin = getAdmin();
    if (!admin) {
      console.warn('[Razorpay verify] Firebase Admin not configured — Firestore update skipped.');
      return NextResponse.json({ ok: true, warning: 'Payment verified but server update skipped.' });
    }

    const updates: Record<string, any> = {
      updatedAt: new Date().toISOString(),
      lastPaymentId: razorpay_payment_id,
      lastOrderId: razorpay_order_id,
    };

    // Derive plan from productId — the server decides what the user gets
    if (productId && isProductId(productId)) {
      const plan = productToPlan(productId);
      if (plan) {
        const creditsMap: Record<string, number> = { Pro: 99999 };
        updates.activePlan = plan;
        updates.plan = plan;
        updates.creditsRemaining = creditsMap[plan] ?? 99999;
      }

      // Handle one-shot purchases
      if (productId === 'chapter_test' || productId === 'jee_bundle_2026') {
        updates.purchasedTests = FieldValue.arrayUnion(productId);
      }
      if (productId === 'study_material') {
        updates.purchasedMaterial = true;
      }
      if (productId === 'streak_save') {
        updates.streakSaved = true;
        updates.lastStreakSaveAt = new Date().toISOString();
      }
    }

    await admin.db.collection('users').doc(userId).update(updates);

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error('[/api/razorpay/verify]', err);
    return NextResponse.json({ error: 'Verification error. Please contact support.' }, { status: 500 });
  }
}
