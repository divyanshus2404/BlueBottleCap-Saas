/**
 * Single place where a successful payment turns into an entitlement.
 *
 * Two independent things call this — the browser-side verify callback and the
 * Razorpay webhook — because either can be the one that actually arrives:
 * the user may close the tab before verify fires, and webhooks can be delayed
 * or retried. So this must be safe to run twice for the same payment.
 *
 * Idempotency is enforced with a `payments/{paymentId}` marker created inside a
 * transaction. The first caller wins and applies the entitlement; later callers
 * short-circuit. That marker doubles as a payment ledger, which is what you
 * actually want when a student emails saying "I paid and got nothing".
 */

import { FieldValue } from "firebase-admin/firestore";
import { getAdmin } from "./firebaseAdmin";
import { isProductId, productToPlan, isInstituteProductId, type ProductId } from "./razorpay";
import { activateInstituteLicence } from "./institute";

export interface FulfilOptions {
  paymentId: string;
  orderId: string;
  /** From order notes — set server-side at create-order, never from the client. */
  userId?: string;
  productId?: string;
  /** For institute licences: which institute code the licence applies to. */
  instituteCode?: string;
  /** How this fulfilment was triggered, for the ledger. */
  via: "verify" | "webhook";
}

export type FulfilResult =
  | { ok: true; applied: boolean; reason?: string }
  | { ok: false; reason: string };

export async function fulfilPayment(opts: FulfilOptions): Promise<FulfilResult> {
  const { paymentId, orderId, userId, productId, instituteCode, via } = opts;

  if (!paymentId) return { ok: false, reason: "Missing payment id." };

  const admin = getAdmin();
  if (!admin) {
    console.warn("[fulfilment] Firebase Admin not configured — entitlement skipped", { paymentId });
    return { ok: true, applied: false, reason: "admin-not-configured" };
  }

  const paymentRef = admin.db.collection("payments").doc(paymentId);

  // Claim this payment. If another caller already claimed it, stop here.
  const claimed = await admin.db.runTransaction(async (tx) => {
    const snap = await tx.get(paymentRef);
    if (snap.exists && snap.data()?.fulfilled === true) return false;
    tx.set(
      paymentRef,
      {
        paymentId,
        orderId,
        userId: userId ?? null,
        productId: productId ?? null,
        instituteCode: instituteCode ?? null,
        via,
        fulfilled: true,
        fulfilledAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  });

  if (!claimed) return { ok: true, applied: false, reason: "already-fulfilled" };

  if (!productId || !isProductId(productId)) {
    return { ok: true, applied: false, reason: "unknown-product" };
  }

  // ── Institute licences live on the institute doc, not the user doc ──
  if (isInstituteProductId(productId)) {
    if (!instituteCode) {
      console.error("[fulfilment] institute product with no code", { paymentId, productId });
      return { ok: false, reason: "Institute licence paid but no institute code was recorded." };
    }
    const activated = await activateInstituteLicence(instituteCode, productId);
    if (!activated) return { ok: false, reason: "Could not activate the institute licence." };
    if (userId) {
      await admin.db.collection("users").doc(userId).set(
        { institutes: FieldValue.arrayUnion(instituteCode), updatedAt: new Date().toISOString() },
        { merge: true }
      );
    }
    return { ok: true, applied: true };
  }

  // ── Consumer products ──
  if (!userId) return { ok: true, applied: false, reason: "no-user-in-order-notes" };

  const updates: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
    lastPaymentId: paymentId,
    lastOrderId: orderId,
  };

  const plan = productToPlan(productId as ProductId);
  if (plan) {
    updates.activePlan = plan;
    updates.plan = plan;
    // Basic grants 100 AI credits/month (as advertised on the pricing page);
    // Pro is effectively unlimited.
    updates.creditsRemaining = plan === "Basic" ? 100 : 99999;
  }
  if (productId === "chapter_test" || productId === "jee_bundle_2026") {
    updates.purchasedTests = FieldValue.arrayUnion(productId);
  }
  if (productId === "study_material") updates.purchasedMaterial = true;
  if (productId === "streak_save") {
    updates.streakSaved = true;
    updates.lastStreakSaveAt = new Date().toISOString();
  }

  await admin.db.collection("users").doc(userId).set(updates, { merge: true });
  return { ok: true, applied: true };
}
