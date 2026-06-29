import { NextResponse } from "next/server";
import { verifyPaymentSignature } from "@/src/lib/razorpay";
import { enforceRateLimit } from "@/src/lib/rateLimit";

export async function POST(req: Request) {
  const limited = enforceRateLimit(req, { limit: 20, windowMs: 60_000, prefix: "rzp-verify" });
  if (limited) return limited;

  try {
    const body = await req.json().catch(() => ({}));
    const valid = verifyPaymentSignature(body);

    if (!valid) {
      return NextResponse.json({ ok: false, error: "Invalid payment signature." }, { status: 400 });
    }

    // Signature is authentic. The matching `order_id` was created server-side
    // with a fixed price, so the payment amount is trustworthy here.
    // TODO: persist the entitlement against the authenticated user (Firestore)
    // so unlocks survive refresh and can't be replayed client-side.
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("verify error:", err);
    return NextResponse.json({ ok: false, error: "Verification failed." }, { status: 500 });
  }
}
