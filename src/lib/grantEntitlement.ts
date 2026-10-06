/**
 * Idempotent entitlement grant — the single place a payment turns into access.
 *
 * Two independent callers race for every payment:
 *   1. /api/razorpay/verify   — the browser, right after checkout
 *   2. /api/razorpay/webhook  — Razorpay's server, retried until it gets a 2xx
 *
 * Both are necessary: the browser can close mid-payment (so the webhook is the
 * only reliable path), and the webhook can lag a few seconds (so the browser
 * path is what makes the UI feel instant). That means the same payment WILL be
 * granted twice in normal operation, and Razorpay retries webhooks on any
 * non-2xx, so a payment can arrive many times over.
 *
 * Idempotency is enforced with a `payments/{paymentId}` marker document created
 * inside the same transaction as the grant. First writer wins; everyone else
 * sees the marker and returns `alreadyGranted` without touching the user doc.
 * The marker is the transaction's read set, so two concurrent runs cannot both
 * pass the check — Firestore aborts and retries the loser, which then sees it.
 */
import { getAdmin } from "./firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { isProductId, productToPlan, creditsForProduct } from "./razorpay";

export interface GrantInput {
  userId: string;
  paymentId: string;
  orderId: string;
  productId?: string;
  /** Which caller granted this, recorded on the marker for debugging. */
  source: "verify" | "webhook";
}

export type GrantResult =
  | { ok: true; alreadyGranted: boolean }
  | { ok: false; reason: "no-admin" };

export async function grantEntitlement(input: GrantInput): Promise<GrantResult> {
  const { userId, paymentId, orderId, productId, source } = input;

  const admin = getAdmin();
  if (!admin) return { ok: false, reason: "no-admin" };

  const paymentRef = admin.db.collection("payments").doc(paymentId);
  const userRef = admin.db.collection("users").doc(userId);

  const alreadyGranted = await admin.db.runTransaction(async (tx) => {
    const marker = await tx.get(paymentRef);
    if (marker.exists) return true;

    const updates: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
      lastPaymentId: paymentId,
      lastOrderId: orderId,
    };

    // The server decides what the user gets, derived from productId — never
    // from anything the client sent.
    if (productId && isProductId(productId)) {
      const plan = productToPlan(productId);
      if (plan) {
        updates.activePlan = plan;
        updates.plan = plan;
        updates.creditsRemaining = 99999;
      }

      if (productId === "chapter_test" || productId === "jee_bundle_2026") {
        updates.purchasedTests = FieldValue.arrayUnion(productId);
      }
      if (productId === "study_material") {
        updates.purchasedMaterial = true;
      }
      if (productId === "streak_save") {
        updates.streakSaved = true;
        updates.lastStreakSaveAt = new Date().toISOString();
      }

      // Credit packs add to the PERSISTENT purchased balance. increment() so
      // buying two packs stacks, and so the idempotency marker is what stops a
      // single payment from topping up twice (not an overwrite).
      const packCredits = creditsForProduct(productId);
      if (packCredits > 0) {
        updates.purchasedCredits = FieldValue.increment(packCredits);
      }
    }

    tx.set(userRef, updates, { merge: true });
    tx.set(paymentRef, {
      userId,
      orderId,
      productId: productId ?? null,
      source,
      grantedAt: new Date().toISOString(),
    });

    return false;
  });

  return { ok: true, alreadyGranted };
}
