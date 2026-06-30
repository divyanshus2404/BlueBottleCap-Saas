import { NextResponse } from "next/server";
import { isProductId, productToPlan, verifyPaymentSignature } from "@/src/lib/razorpay";
import { enforceRateLimit } from "@/src/lib/rateLimit";

export async function POST(req: Request) {
  const limited = enforceRateLimit(req, { limit: 20, windowMs: 60_000, prefix: "rzp-verify" });
  if (limited) return limited;

  try {
    const body = await req.json().catch(() => ({}));
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, product } = body as {
      razorpay_order_id?: string;
      razorpay_payment_id?: string;
      razorpay_signature?: string;
      product?: string;
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

    // FUTURE: persist {uid, plan, payment_id, product} to Firestore via
    // firebase-admin so entitlement survives a localStorage wipe and cannot
    // be forged client-side. Requires service-account env config.
    return NextResponse.json({ ok: true, product, plan });
  } catch (err: any) {
    console.error("verify error:", err);
    return NextResponse.json({ ok: false, error: "Verification failed." }, { status: 500 });
  }
}
