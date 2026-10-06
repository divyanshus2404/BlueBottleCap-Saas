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
  // One-shot exam pack. Priced as an impulse buy — cheap enough to grab
  // during exam-prep panic, valuable enough that 100 sales = ₹14,900. Ships
  // 10 AI-generated chapter-wise mocks + weak-topic analysis to the buyer's
  // email within 24h. Delivery is manual for the first ~50 buyers
  // (do-things-that-don't-scale), then automated once the funnel proves out.
  jee_bundle_2026: { amount: 14900, label: "JEE 2026 Bundle — 10 mock tests" }, // ₹149
  // Streak protection micropayment. Priced deliberately below the mental
  // threshold where a student thinks twice about tapping "Pay". Duolingo
  // proved the mechanic works — panic + tiny price + one tap = pure margin.
  streak_save: { amount: 1900, label: "Save your study streak" }, // ₹19
  // Credit packs — the core monetisation for the wallet. Credits are spent on
  // metered resources (see resourceCredits.ts); packs top up the PERSISTENT
  // purchased balance, which never expires with the daily free refill. Priced
  // so a casual top-up is an impulse buy and the big pack is clear best value.
  credits_100: { amount: 4900, label: "100 credits" }, // ₹49
  credits_350: { amount: 14900, label: "350 credits (+17% bonus)" }, // ₹149
  credits_1000: { amount: 39900, label: "1000 credits (best value)" }, // ₹399
} as const;

export type ProductId = keyof typeof PRODUCTS;

export function isProductId(value: unknown): value is ProductId {
  return typeof value === "string" && value in PRODUCTS;
}

/**
 * Map a product id to the subscription plan it unlocks, or null for one-shot
 * purchases (chapter_test, study_material). The verify endpoint returns this
 * to the client so the client cannot inflate its own plan after payment.
 */
export function productToPlan(product: ProductId): "Pro" | null {
  switch (product) {
    case "pro_monthly":
    case "pro_annual":
      return "Pro";
    case "chapter_test":
    case "study_material":
    case "jee_bundle_2026":
    case "streak_save":
    case "credits_100":
    case "credits_350":
    case "credits_1000":
      return null;
  }
}

/**
 * Credits granted by a product, or 0 if it isn't a credit pack. Used by the
 * grant path to top up the student's persistent purchased balance.
 */
export const CREDIT_PACKS: Partial<Record<ProductId, number>> = {
  credits_100: 100,
  credits_350: 350,
  credits_1000: 1000,
};

export function creditsForProduct(product: ProductId): number {
  return CREDIT_PACKS[product] ?? 0;
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

/**
 * Verify a Razorpay *webhook* signature.
 *
 * Different scheme from checkout: HMAC-SHA256 over the RAW request body,
 * keyed on RAZORPAY_WEBHOOK_SECRET (a separate secret from the API key, set
 * in the Razorpay dashboard when the webhook is created). The body must be
 * the exact bytes received — re-serialising parsed JSON changes key order and
 * whitespace, and the signature will never match.
 */
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;

  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(signature);
  if (expectedBuf.length !== actualBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}
