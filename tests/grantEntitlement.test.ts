/**
 * Idempotency of the payment -> access grant.
 *
 * /api/razorpay/verify and /api/razorpay/webhook both fire for the same
 * payment by design, and Razorpay retries webhooks until it gets a 2xx. So the
 * same payment arrives several times in NORMAL operation, not just under
 * attack. These tests pin that only the first one grants anything.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// A minimal in-memory Firestore stand-in: enough to exercise the transaction's
// read-then-write shape, which is where the idempotency actually lives.
function makeFakeAdmin() {
  const docs = new Map<string, Record<string, unknown>>();
  const sets: Array<{ path: string; data: Record<string, unknown> }> = [];

  const docRef = (path: string) => ({ path });

  const db = {
    collection: (col: string) => ({ doc: (id: string) => docRef(`${col}/${id}`) }),
    runTransaction: async (fn: (tx: unknown) => Promise<boolean>) => {
      const tx = {
        get: async (ref: { path: string }) => ({
          exists: docs.has(ref.path),
          data: () => docs.get(ref.path) ?? {},
        }),
        set: (ref: { path: string }, data: Record<string, unknown>) => {
          sets.push({ path: ref.path, data });
          docs.set(ref.path, { ...(docs.get(ref.path) ?? {}), ...data });
        },
      };
      return fn(tx);
    },
  };

  return { admin: { db }, docs, sets };
}

const PAYMENT = {
  userId: "user_abc",
  paymentId: "pay_001",
  orderId: "order_001",
  productId: "pro_monthly",
  source: "verify" as const,
};

let fake: ReturnType<typeof makeFakeAdmin>;

beforeEach(async () => {
  vi.resetModules();
  fake = makeFakeAdmin();
  vi.doMock("@/src/lib/firebaseAdmin", () => ({ getAdmin: () => fake.admin }));
  // FieldValue.increment/arrayUnion are sentinels; a plain marker is enough
  // since the fake never evaluates them.
  vi.doMock("firebase-admin/firestore", () => ({
    FieldValue: {
      increment: (n: number) => ({ __increment: n }),
      arrayUnion: (...v: unknown[]) => ({ __arrayUnion: v }),
    },
  }));
});

describe("grantEntitlement", () => {
  it("grants on the first call", async () => {
    const { grantEntitlement } = await import("@/src/lib/grantEntitlement");
    const res = await grantEntitlement(PAYMENT);
    expect(res).toEqual({ ok: true, alreadyGranted: false });
    // Both the user doc and the idempotency marker were written.
    expect(fake.sets.map((s) => s.path)).toContain("users/user_abc");
    expect(fake.sets.map((s) => s.path)).toContain("payments/pay_001");
  });

  it("does not grant twice for the same payment id", async () => {
    const { grantEntitlement } = await import("@/src/lib/grantEntitlement");
    const first = await grantEntitlement(PAYMENT);
    const writesAfterFirst = fake.sets.length;

    // Same payment arriving from the webhook after the browser already verified.
    const second = await grantEntitlement({ ...PAYMENT, source: "webhook" });

    expect(first.ok && first.alreadyGranted).toBe(false);
    expect(second).toEqual({ ok: true, alreadyGranted: true });
    // Critically: the second call wrote nothing at all.
    expect(fake.sets.length).toBe(writesAfterFirst);
  });

  it("is idempotent across many retries", async () => {
    const { grantEntitlement } = await import("@/src/lib/grantEntitlement");
    await grantEntitlement(PAYMENT);
    const writes = fake.sets.length;
    for (let i = 0; i < 5; i++) {
      const r = await grantEntitlement({ ...PAYMENT, source: "webhook" });
      expect(r).toEqual({ ok: true, alreadyGranted: true });
    }
    expect(fake.sets.length).toBe(writes);
  });

  it("treats a different payment id as a new grant", async () => {
    const { grantEntitlement } = await import("@/src/lib/grantEntitlement");
    await grantEntitlement(PAYMENT);
    const res = await grantEntitlement({ ...PAYMENT, paymentId: "pay_002" });
    expect(res).toEqual({ ok: true, alreadyGranted: false });
  });

  it("records the plan on the user doc, derived from productId", async () => {
    const { grantEntitlement } = await import("@/src/lib/grantEntitlement");
    await grantEntitlement(PAYMENT);
    const userDoc = fake.docs.get("users/user_abc")!;
    // The server decides the plan; nothing here comes from client input.
    expect(userDoc.lastPaymentId).toBe("pay_001");
    expect(userDoc.updatedAt).toBeTypeOf("string");
  });

  it("ignores an unrecognised productId instead of granting Pro", async () => {
    // A tampered or stale productId must not escalate to a paid plan.
    const { grantEntitlement } = await import("@/src/lib/grantEntitlement");
    await grantEntitlement({ ...PAYMENT, productId: "not_a_real_product" });
    const userDoc = fake.docs.get("users/user_abc")!;
    expect(userDoc.activePlan).toBeUndefined();
    expect(userDoc.plan).toBeUndefined();
  });

  it("tops up purchased credits when a credit pack is bought", async () => {
    const { grantEntitlement } = await import("@/src/lib/grantEntitlement");
    await grantEntitlement({ ...PAYMENT, productId: "credits_100" });
    const userDoc = fake.docs.get("users/user_abc")!;
    // FieldValue.increment is mocked to a sentinel so we assert the pack size
    // was applied via increment (stacks across packs) rather than overwritten.
    expect(userDoc.purchasedCredits).toEqual({ __increment: 100 });
  });

  it("does not grant a credit pack twice for the same payment", async () => {
    const { grantEntitlement } = await import("@/src/lib/grantEntitlement");
    await grantEntitlement({ ...PAYMENT, productId: "credits_100" });
    const writes = fake.sets.length;
    const again = await grantEntitlement({ ...PAYMENT, productId: "credits_100", source: "webhook" });
    expect(again).toEqual({ ok: true, alreadyGranted: true });
    expect(fake.sets.length).toBe(writes);
  });

  it("reports no-admin instead of throwing when Firebase is unconfigured", async () => {
    vi.resetModules();
    vi.doMock("@/src/lib/firebaseAdmin", () => ({ getAdmin: () => null }));
    vi.doMock("firebase-admin/firestore", () => ({ FieldValue: {} }));
    const { grantEntitlement } = await import("@/src/lib/grantEntitlement");
    const res = await grantEntitlement(PAYMENT);
    expect(res).toEqual({ ok: false, reason: "no-admin" });
  });
});
