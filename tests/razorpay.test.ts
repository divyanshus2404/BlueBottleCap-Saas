/**
 * Payment signature verification.
 *
 * This is the boundary between "a stranger sent us a POST" and "we grant a
 * paid plan". A regression here is worth real money in either direction, so
 * both the accept and the reject paths are pinned.
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import crypto from "crypto";

const KEY_SECRET = "test_secret_key";
const WEBHOOK_SECRET = "test_webhook_secret";

let razorpay: typeof import("@/src/lib/razorpay");

beforeEach(async () => {
  process.env.RAZORPAY_KEY_ID = "rzp_test_abc";
  process.env.RAZORPAY_KEY_SECRET = KEY_SECRET;
  process.env.RAZORPAY_WEBHOOK_SECRET = WEBHOOK_SECRET;
  // The module reads env at call time for keys, but re-import keeps each test
  // independent of module-level caching.
  razorpay = await import("@/src/lib/razorpay");
});

afterEach(() => {
  delete process.env.RAZORPAY_WEBHOOK_SECRET;
});

function checkoutSignature(orderId: string, paymentId: string, secret = KEY_SECRET) {
  return crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
}

describe("verifyPaymentSignature (checkout)", () => {
  it("accepts a correctly signed payment", () => {
    const order = "order_123";
    const payment = "pay_456";
    expect(
      razorpay.verifyPaymentSignature({
        razorpay_order_id: order,
        razorpay_payment_id: payment,
        razorpay_signature: checkoutSignature(order, payment),
      }),
    ).toBe(true);
  });

  it("rejects a signature made with the wrong secret", () => {
    const order = "order_123";
    const payment = "pay_456";
    expect(
      razorpay.verifyPaymentSignature({
        razorpay_order_id: order,
        razorpay_payment_id: payment,
        razorpay_signature: checkoutSignature(order, payment, "attacker_secret"),
      }),
    ).toBe(false);
  });

  it("rejects a valid signature replayed onto a different payment id", () => {
    // The classic attack: pay 1 rupee, then reuse that signature to claim a
    // more expensive order. The payment id is inside the HMAC, so it fails.
    const sig = checkoutSignature("order_123", "pay_456");
    expect(
      razorpay.verifyPaymentSignature({
        razorpay_order_id: "order_123",
        razorpay_payment_id: "pay_DIFFERENT",
        razorpay_signature: sig,
      }),
    ).toBe(false);
  });

  it("rejects missing fields instead of throwing", () => {
    expect(razorpay.verifyPaymentSignature({})).toBe(false);
    expect(
      razorpay.verifyPaymentSignature({ razorpay_order_id: "o", razorpay_payment_id: "p" }),
    ).toBe(false);
  });

  it("rejects a signature of the wrong length without throwing", () => {
    // crypto.timingSafeEqual throws on length mismatch, so the length guard
    // ahead of it is load-bearing, not cosmetic.
    expect(() =>
      razorpay.verifyPaymentSignature({
        razorpay_order_id: "order_123",
        razorpay_payment_id: "pay_456",
        razorpay_signature: "tooshort",
      }),
    ).not.toThrow();
  });
});

describe("verifyWebhookSignature", () => {
  const body = JSON.stringify({ event: "payment.captured", payload: {} });
  const sign = (b: string, secret = WEBHOOK_SECRET) =>
    crypto.createHmac("sha256", secret).update(b).digest("hex");

  it("accepts a correctly signed body", () => {
    expect(razorpay.verifyWebhookSignature(body, sign(body))).toBe(true);
  });

  it("rejects a tampered body", () => {
    const sig = sign(body);
    const tampered = JSON.stringify({ event: "payment.captured", payload: { hacked: true } });
    expect(razorpay.verifyWebhookSignature(tampered, sig)).toBe(false);
  });

  it("rejects when the signature header is absent", () => {
    expect(razorpay.verifyWebhookSignature(body, null)).toBe(false);
  });

  it("rejects everything when the webhook secret is unset", async () => {
    // Guards against a deploy that forgets RAZORPAY_WEBHOOK_SECRET silently
    // accepting unsigned calls — it must fail closed.
    // verifyWebhookSignature reads the secret at call time, so clearing the
    // env var is enough — no module cache to work around.
    delete process.env.RAZORPAY_WEBHOOK_SECRET;
    expect(razorpay.verifyWebhookSignature(body, sign(body))).toBe(false);
  });

  it("uses the webhook secret, not the API key secret", () => {
    expect(razorpay.verifyWebhookSignature(body, sign(body, KEY_SECRET))).toBe(false);
  });
});
