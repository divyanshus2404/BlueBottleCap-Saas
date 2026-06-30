import crypto from "crypto";

// Server-side source of truth for prices. The client never sends an amount —
// it sends a product id and the server decides the price. This prevents a user
// from tampering with the amount in the browser.
export const PRODUCTS = {
  chapter_test: { amount: 12000, label: "Chapter Mock Test" }, // ₹120.00
  study_material: { amount: 28100, label: "Full Chapter-wise Study Material" }, // ₹281.00
  // Subscription plans (price in paise). Keep in sync with the Pricing page.
  // pro_annual is billed as a single ₹1,499 upfront charge (~₹125/mo equivalent).
  pro_monthly: { amount: 19900, label: "Pro plan — monthly" }, // ₹199
  pro_annual: { amount: 149900, label: "Pro plan — annual (₹1,499 / year)" }, // ₹1,499
} as const;

export type ProductId = keyof typeof PRODUCTS;

export function isProductId(value: unknown): value is ProductId {
  return typeof value === "string" && value in PRODUCTS;
}

export function getRazorpayKeys() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error("RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET environment variables are not configured.");
  }
  return { keyId, keySecret };
}

/** Create a Razorpay order via the REST API (no SDK dependency needed). */
export async function createRazorpayOrder(amount: number, notes: Record<string, string> = {}) {
  const { keyId, keySecret } = getRazorpayKeys();
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  const resp = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({
      amount,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes,
    }),
  });

  if (!resp.ok) {
    const detail = await resp.text();
    throw new Error(`Razorpay order creation failed: ${resp.status} ${detail}`);
  }
  return resp.json() as Promise<{ id: string; amount: number; currency: string }>;
}

/**
 * Verify the payment signature returned by Razorpay Checkout.
 * Uses a timing-safe comparison of HMAC-SHA256(order_id|payment_id, key_secret).
 */
export function verifyPaymentSignature(params: {
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
}): boolean {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = params;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) return false;

  const { keySecret } = getRazorpayKeys();
  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(razorpay_signature);
  if (expectedBuf.length !== actualBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}
