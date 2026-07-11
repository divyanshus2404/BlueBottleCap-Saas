import { NextResponse } from "next/server";
import { getRazorpayKeys } from "@/src/lib/razorpay";
import { getRateLimiter, getClientIp } from "@/src/lib/rateLimit";

// Small limit: this is a read-only status lookup, but it hits Razorpay's
// API so we don't want a page-reload loop hammering it either.
const statusLimiter = getRateLimiter({ limit: 30, windowMs: 60_000 });

/**
 * GET /api/razorpay/payment-status?payment_id=pay_xxx
 *
 * Server-side lookup of the actual Razorpay payment status. Used by the
 * /payment-success page to gate its "Welcome to Pro!" celebration behind
 * a real, captured payment — instead of trusting the URL parameter.
 *
 * Returns a minimal, safe subset of the Razorpay payment object.
 */
export async function GET(req: Request) {
  const ip = getClientIp(req);
  if (!statusLimiter.check(ip)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const paymentId = searchParams.get("payment_id") || searchParams.get("paymentId") || "";
  if (!paymentId.startsWith("pay_")) {
    return NextResponse.json({ error: "Invalid payment id." }, { status: 400 });
  }

  try {
    const { keyId, keySecret } = getRazorpayKeys();
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const resp = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`, {
      headers: { Authorization: `Basic ${auth}` },
      cache: "no-store",
    });
    if (!resp.ok) {
      return NextResponse.json(
        { verified: false, error: "Payment not found." },
        { status: resp.status === 404 ? 404 : 502 }
      );
    }
    const data = (await resp.json()) as {
      status?: string;
      amount?: number;
      currency?: string;
      method?: string;
      captured?: boolean;
      created_at?: number;
      notes?: Record<string, string>;
    };

    // We consider only "captured" as a real, spendable success. "authorized"
    // means the customer's issuer approved but funds haven't moved yet.
    const captured = data.status === "captured" || data.captured === true;

    return NextResponse.json({
      verified: captured,
      status: data.status,
      amount: data.amount,
      currency: data.currency,
      method: data.method,
      productId: data.notes?.productId ?? null,
      createdAt: data.created_at ?? null,
    });
  } catch (err) {
    console.error("[/api/razorpay/payment-status]", err);
    return NextResponse.json(
      { verified: false, error: "Could not verify payment. Please refresh." },
      { status: 500 }
    );
  }
}
