import crypto from "crypto";

// Server-side source of truth for prices. The client never sends an amount —
// it sends a product id and the server decides the price. This prevents a user
// from tampering with the amount in the browser.
export const PRODUCTS = {
  chapter_test: { amount: 12000, label: "Chapter Mock Test" }, // ₹120.00
  study_material: { amount: 28100, label: "Full Chapter-wise Study Material" }, // ₹281.00
  // Subscription plans (price in paise). Keep in sync with the Pricing page.
  // basic_annual is billed as a single ₹399 upfront charge (~₹33/mo equivalent).
  basic_monthly: { amount: 4900, label: "Basic plan — monthly" }, // ₹49
  basic_annual: { amount: 39900, label: "Basic plan — annual (₹399 / year)" }, // ₹399
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
  // Proctored test series. Priced above the one-off chapter test because the
  // attempt is invigilated and the result is meant to be comparable across
  // candidates — that is what a student is actually paying for.
  test_series_jee: { amount: 49900, label: "Proctored Test Series — JEE (10 tests)" }, // ₹499
  test_series_neet: { amount: 49900, label: "Proctored Test Series — NEET (10 tests)" }, // ₹499
  // ── Institute licences (B2B) ────────────────────────────────────────────
  // Billed annually and upfront: it matches a coaching centre's academic year,
  // and one ₹36,000 invoice is worth ~180 student subscriptions at ₹199 while
  // costing a fraction of the support load. Student caps are enforced in
  // src/lib/institute.ts, not here.
  inst_starter: { amount: 1200000, label: "Institute Starter — 1 year, up to 100 students" }, // ₹12,000
  inst_growth: { amount: 3600000, label: "Institute Growth — 1 year, up to 500 students" }, // ₹36,000
  inst_pro: { amount: 9000000, label: "Institute Pro — 1 year, unlimited students" }, // ₹90,000
} as const;

export type ProductId = keyof typeof PRODUCTS;

/** Institute licence products and the student cap each one buys. */
export const INSTITUTE_TIERS = {
  inst_starter: { tier: "starter" as const, studentCap: 100 },
  inst_growth: { tier: "growth" as const, studentCap: 500 },
  inst_pro: { tier: "pro" as const, studentCap: Number.MAX_SAFE_INTEGER },
} as const;

export type InstituteProductId = keyof typeof INSTITUTE_TIERS;
export type InstituteTier = (typeof INSTITUTE_TIERS)[InstituteProductId]["tier"];

export function isInstituteProductId(value: unknown): value is InstituteProductId {
  return typeof value === "string" && value in INSTITUTE_TIERS;
}

export function isProductId(value: unknown): value is ProductId {
  return typeof value === "string" && value in PRODUCTS;
}

/**
 * Map a product id to the subscription plan it unlocks, or null for one-shot
 * purchases (chapter_test, study_material). The verify endpoint returns this
 * to the client so the client cannot inflate its own plan after payment.
 */
export function productToPlan(product: ProductId): "Basic" | "Pro" | null {
  switch (product) {
    case "basic_monthly":
    case "basic_annual":
      return "Basic";
    case "pro_monthly":
    case "pro_annual":
      return "Pro";
    case "chapter_test":
    case "study_material":
    case "jee_bundle_2026":
    case "streak_save":
      return null;
    // Test-series access is recorded per-product on the user doc, not as a plan.
    case "test_series_jee":
    case "test_series_neet":
      return null;
    // Institute licences grant a tier on the institute doc, not a consumer plan
    // on the buyer's user doc — see activateInstituteLicence.
    case "inst_starter":
    case "inst_growth":
    case "inst_pro":
      return null;
  }
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
