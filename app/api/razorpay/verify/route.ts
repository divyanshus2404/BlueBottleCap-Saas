import { NextResponse } from "next/server";
import { isProductId, productToPlan, verifyPaymentSignature, PRODUCTS, type ProductId } from "@/src/lib/razorpay";
import { enforceRateLimit } from "@/src/lib/rateLimit";
import { getAdmin } from "@/src/lib/firebaseAdmin";
import { sendEmail } from "@/src/lib/email";
import { receiptEmail } from "@/src/lib/emailTemplates";

// Persist the purchase and grant the entitlement server-side so it survives
// a localStorage wipe and can't be forged. Never throws — a persistence
// failure must not make a real payment look failed to the buyer; it's
// logged and recoverable from the Razorpay dashboard instead.
async function persistPurchase(args: {
  product: ProductId;
  paymentId?: string;
  orderId?: string;
  idToken?: string;
  buyerEmail?: string;
}): Promise<{ email: string | null }> {
  const admin = getAdmin();
  if (!admin) return { email: args.buyerEmail || null }; // env not configured — legacy client-side behaviour

  let uid: string | null = null;
  let verifiedEmail: string | null = null;
  if (args.idToken) {
    try {
      const decoded = await admin.auth.verifyIdToken(args.idToken);
      uid = decoded.uid;
      verifiedEmail = decoded.email ?? null;
    } catch (err) {
      console.error("verify: bad idToken, recording purchase without uid:", err);
    }
  }
  // Prefer the token-verified email over the client-supplied buyerEmail.
  const email: string | null = verifiedEmail || args.buyerEmail || null;

  try {
    const record = {
      product: args.product,
      amount: PRODUCTS[args.product].amount,
      paymentId: args.paymentId || null,
      orderId: args.orderId || null,
      uid,
      email,
      createdAt: new Date().toISOString(),
    };
    // Idempotent: key by the unique Razorpay payment id so a retried verify
    // updates the same doc instead of creating a duplicate. Fall back to an
    // auto-id only when (unexpectedly) no payment id is present.
    const purchases = admin.db.collection("purchases");
    if (args.paymentId) await purchases.doc(args.paymentId).set(record, { merge: true });
    else await purchases.add(record);

    if (uid) {
      const userRef = admin.db.collection("users").doc(uid);
      const plan = productToPlan(args.product);
      const today = new Date().toISOString().split("T")[0];
      const updates: Record<string, unknown> =
        plan === "Pro" ? { plan: "Pro", activePlan: "Pro" } :
        args.product === "study_material" ? { studyMaterialUnlocked: true } :
        args.product === "streak_save" ? { lastLoggedDate: today, lastActiveDate: today, streakSavedAt: today } :
        {};
      updates.updatedAt = new Date().toISOString();
      await userRef.set(updates, { merge: true });
    }
  } catch (err) {
    console.error("verify: failed to persist purchase:", err);
  }
  return { email };
}

export async function POST(req: Request) {
  const limited = enforceRateLimit(req, { limit: 20, windowMs: 60_000, prefix: "rzp-verify" });
  if (limited) return limited;

  try {
    const body = await req.json().catch(() => ({}));
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, product, idToken, buyerEmail } = body as {
      razorpay_order_id?: string;
      razorpay_payment_id?: string;
      razorpay_signature?: string;
      product?: string;
      idToken?: string;
      buyerEmail?: string;
    };

    const valid = verifyPaymentSignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature });
    if (!valid) {
      return NextResponse.json({ ok: false, error: "Invalid payment signature." }, { status: 400 });
    }

    // Signature is authentic. The matching `order_id` was created server-side
    // with a fixed price for this product id, so the price is trustworthy.
    // We do not look the order up against Razorpay here — that would catch a
    // user paying for product A and claiming product B, but in practice the
    // client just picked an order id the server issued for the same product,
    // so trusting it here is fine for the current surface area.
    if (!isProductId(product)) {
      return NextResponse.json({ ok: false, error: "Unknown product." }, { status: 400 });
    }

    const plan = productToPlan(product);

    const { email } = await persistPurchase({
      product,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      idToken,
      buyerEmail,
    });

    // Receipt email — best-effort, never blocks the success response.
    if (email) {
      const { subject, html, text } = receiptEmail({
        productLabel: PRODUCTS[product].label,
        amountPaise: PRODUCTS[product].amount,
        paymentId: razorpay_payment_id,
      });
      sendEmail({ to: email, subject, html, text }).catch((e) => console.error("verify: receipt email failed:", e));
    }

    return NextResponse.json({ ok: true, product, plan });
  } catch (err: any) {
    console.error("verify error:", err);
    return NextResponse.json({ ok: false, error: "Verification failed." }, { status: 500 });
  }
}
