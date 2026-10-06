/**
 * Credit-wallet enforcement. This is where a resource turns into a charge, so
 * the daily refill, the cost deduction, and the daily-before-purchased spend
 * order are all pinned.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Minimal Firestore stand-in holding one user doc, with a transaction that
// mirrors the real read-then-merge-write shape.
function makeFakeAdmin(initial: Record<string, unknown>) {
  const doc = { ...initial };
  const db = {
    collection: () => ({ doc: () => ({ __user: true }) }),
    runTransaction: async (fn: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        get: async () => ({ data: () => ({ ...doc }) }),
        set: (_ref: unknown, data: Record<string, unknown>) => {
          Object.assign(doc, data);
        },
      };
      return fn(tx);
    },
  };
  return { admin: { db }, doc };
}

const TODAY = (() => {
  const ist = new Date(Date.now() + 5.5 * 3600 * 1000);
  return `${ist.getUTCFullYear()}-${String(ist.getUTCMonth() + 1).padStart(2, "0")}-${String(ist.getUTCDate()).padStart(2, "0")}`;
})();

async function load(initial: Record<string, unknown>) {
  vi.resetModules();
  const fake = makeFakeAdmin(initial);
  vi.doMock("@/src/lib/firebaseAdmin", () => ({ getAdmin: () => fake.admin }));
  const { enforceUserQuota, FREE_DAILY_CREDITS } = await import("@/src/lib/userQuota");
  return { enforceUserQuota, FREE_DAILY_CREDITS, doc: fake.doc };
}

beforeEach(() => vi.resetModules());

describe("credit wallet", () => {
  it("refills the free allowance on a new day, then charges the resource cost", async () => {
    // Fresh user, no wallet fields yet. First chat (cost 1) refills to 25 then
    // spends 1 -> 24 left.
    const { enforceUserQuota, FREE_DAILY_CREDITS, doc } = await load({});
    const res = await enforceUserQuota("u1", "chat");
    expect(res.ok).toBe(true);
    expect(res.remaining).toBe(FREE_DAILY_CREDITS - 1);
    expect(doc.creditRefillDay).toBe(TODAY);
  });

  it("charges the catalog cost, not a flat 1 (a mock costs 5)", async () => {
    const { enforceUserQuota, FREE_DAILY_CREDITS } = await load({});
    const res = await enforceUserQuota("u1", "institute_generate_mock");
    expect(res.remaining).toBe(FREE_DAILY_CREDITS - 5);
  });

  it("does NOT refill when already spent today — balance carries down", async () => {
    const { enforceUserQuota } = await load({
      creditRefillDay: TODAY,
      dailyCredits: 3,
      purchasedCredits: 0,
    });
    const res = await enforceUserQuota("u1", "chat"); // cost 1
    expect(res.remaining).toBe(2);
  });

  it("blocks with a 402 when the student can't afford the resource", async () => {
    const { enforceUserQuota } = await load({
      creditRefillDay: TODAY,
      dailyCredits: 2,
      purchasedCredits: 0,
    });
    const res = await enforceUserQuota("u1", "institute_generate_mock"); // cost 5
    expect(res.ok).toBe(false);
    expect(res.error?.status).toBe(402);
  });

  it("spends the daily allowance before touching purchased credits", async () => {
    const { enforceUserQuota, doc } = await load({
      creditRefillDay: TODAY,
      dailyCredits: 2,
      purchasedCredits: 10,
    });
    // cost 5: 2 from daily, 3 from purchased.
    const res = await enforceUserQuota("u1", "institute_generate_mock");
    expect(res.ok).toBe(true);
    expect(doc.dailyCredits).toBe(0);
    expect(doc.purchasedCredits).toBe(7);
    expect(res.remaining).toBe(7);
  });

  it("keeps purchased credits across a daily refill (money isn't wiped)", async () => {
    // Last spend was an earlier day, so the daily bucket refills — but the 50
    // purchased credits must survive.
    const { enforceUserQuota, FREE_DAILY_CREDITS, doc } = await load({
      creditRefillDay: "2000-01-01",
      dailyCredits: 0,
      purchasedCredits: 50,
    });
    const res = await enforceUserQuota("u1", "chat"); // cost 1
    expect(doc.dailyCredits).toBe(FREE_DAILY_CREDITS - 1);
    expect(doc.purchasedCredits).toBe(50);
    expect(res.remaining).toBe(FREE_DAILY_CREDITS - 1 + 50);
  });

  it("gives Pro a much larger daily allowance", async () => {
    const { enforceUserQuota } = await load({ activePlan: "Pro" });
    const res = await enforceUserQuota("u1", "chat");
    expect(res.remaining).toBe(1000 - 1);
  });
});
