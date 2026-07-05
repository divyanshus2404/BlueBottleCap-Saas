import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// ── Firebase Admin initialisation ──
// Uses service-account credentials stored as an env variable (server-only,
// never exposed to the client). If the variable is absent the verify endpoint
// will still validate the Razorpay signature; it just won't update Firestore.
function getAdminDb() {
  if (!getApps().length) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (serviceAccount) {
      try {
        initializeApp({ credential: cert(JSON.parse(serviceAccount)) });
      } catch {
        console.warn('[Razorpay verify] Firebase admin init failed — Firestore update skipped.');
        return null;
      }
    } else {
      return null;
    }
  }
  try {
    return getFirestore();
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
      userId,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment fields.' }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: 'Payment service is not configured. Contact support.' },
        { status: 503 }
      );
    }

    // ── HMAC-SHA256 signature verification ──
    // Razorpay specifies: HMAC = SHA256(order_id + "|" + payment_id, secret)
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error('[Razorpay verify] Signature mismatch — possible tampered payment.');
      return NextResponse.json({ ok: false, error: 'Payment verification failed.' }, { status: 400 });
    }

    // ── Signature is valid — upgrade the plan in Firestore server-side ──
    // ── Signature is valid — handle unlock logic securely on server ──
    if (userId) {
      const db = getAdminDb();
      if (db) {
        const updates: Record<string, any> = {
          updatedAt: new Date().toISOString(),
          lastPaymentId: razorpay_payment_id,
          lastOrderId: razorpay_order_id,
        };

        if (plan) {
          const validPlans = ['Basic', 'Pro', 'Elite'];
          if (validPlans.includes(plan)) {
            const creditsMap: Record<string, number> = { Basic: 100, Pro: 99999, Elite: 99999 };
            updates.activePlan = plan;
            updates.plan = plan;
            updates.creditsRemaining = creditsMap[plan as string] ?? 99999;
          }
        }
        
        if (body.testId) {
          const FieldValue = require('firebase-admin/firestore').FieldValue;
          updates.purchasedTests = FieldValue.arrayUnion(body.testId);
        }

        await db.collection('users').doc(userId as string).update(updates);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error('[/api/razorpay/verify]', err);
    return NextResponse.json({ error: 'Verification error. Please contact support.' }, { status: 500 });
  }
}
