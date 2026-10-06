/**
 * Credit-wallet enforcement for metered resources.
 *
 * Every student has two credit balances, both server-authoritative in their
 * Firestore user doc (the client can never write them — see firestore.rules):
 *
 *   dailyCredits    — a free allowance that REFILLS to the plan's daily amount
 *                     at the start of each IST day. Use it or lose it.
 *   purchasedCredits — credits bought in a pack. PERSISTENT: never reset by the
 *                     daily refill, so a student's money is never wiped.
 *
 * A resource's cost comes from the catalog (resourceCredits.ts), so the price
 * charged here is always the price shown in the UI. Spending takes from the
 * daily allowance first, then from purchased credits — so free usage is used
 * up before a student's paid balance is ever touched.
 *
 * The whole read-refill-check-deduct cycle runs in one Firestore transaction,
 * so two concurrent requests can't both spend the last credit.
 */
import { NextResponse } from "next/server";
import { getAdmin } from "./firebaseAdmin";
import { creditCost } from "./resourceCredits";

type Tier = "free" | "pro";

interface QuotaResult {
  ok: boolean;
  error?: NextResponse;
  /** Credits left (daily + purchased) after this call, for the UI. */
  remaining?: number;
}

/** Daily free refill by plan. A free student gets enough for real daily study
 * (e.g. 25 chat turns, or 8 study plans, or 12 scans) without paying. Pro is
 * effectively unlimited for one person but still bounded against abuse. */
export const FREE_DAILY_CREDITS = 25;
export const PRO_DAILY_CREDITS = 1000;

/** The metered AI features. These keys ARE the QuotaFeature union, and the
 * credit catalog is compile-checked to contain every one of them. */
const FEATURES = [
  "chat",
  "summarize",
  "analyze_image",
  "study_plan",
  "generate_flashcards",
  "generate_roadmap",
  "scan_notes",
  "formula_sheet",
  "recommend_tool",
  "jee_generate_questions",
  "jee_analyze_solution",
  "institute_generate_mock",
] as const;

export type QuotaFeature = (typeof FEATURES)[number];

/** Local-date key so the free allowance refills at midnight IST. */
function todayKey(): string {
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  return `${ist.getUTCFullYear()}-${String(ist.getUTCMonth() + 1).padStart(2, "0")}-${String(ist.getUTCDate()).padStart(2, "0")}`;
}

function dailyAllowance(tier: Tier): number {
  return tier === "pro" ? PRO_DAILY_CREDITS : FREE_DAILY_CREDITS;
}

/**
 * Check the wallet for `feature`, refilling the daily allowance if a new day
 * has started, and deduct the resource's credit cost. Returns a 402 response
 * when the student can't afford it.
 *
 * No-op when the Admin SDK is unavailable (local dev without a service
 * account): we don't fail closed, or the whole app is unusable in dev.
 */
export async function enforceUserQuota(
  uid: string,
  feature: QuotaFeature,
): Promise<QuotaResult> {
  const admin = getAdmin();
  if (!admin) return { ok: true };

  const cost = creditCost(feature);
  // Free resources shouldn't be calling this, but if one does, don't charge.
  if (cost <= 0) return { ok: true };

  const userRef = admin.db.collection("users").doc(uid);
  const day = todayKey();

  try {
    const result = await admin.db.runTransaction(async (tx) => {
      const snap = await tx.get(userRef);
      const data = snap.data() || {};
      const plan = String(data.activePlan || data.plan || "Free").toLowerCase();
      const tier: Tier = plan.includes("pro") ? "pro" : "free";

      // Refill the daily bucket if this is the first spend of the IST day.
      const allot = dailyAllowance(tier);
      const sameDay = data.creditRefillDay === day;
      const daily = sameDay ? Number(data.dailyCredits ?? allot) : allot;
      const purchased = Number(data.purchasedCredits ?? 0);

      const total = daily + purchased;
      if (total < cost) {
        return { over: true as const, remaining: total, tier };
      }

      // Spend the daily allowance first, then purchased credits.
      const fromDaily = Math.min(daily, cost);
      const fromPurchased = cost - fromDaily;
      const newDaily = daily - fromDaily;
      const newPurchased = purchased - fromPurchased;

      tx.set(
        userRef,
        {
          dailyCredits: newDaily,
          creditRefillDay: day,
          purchasedCredits: newPurchased,
          lastQuotaCheck: new Date().toISOString(),
        },
        { merge: true },
      );

      return { over: false as const, remaining: newDaily + newPurchased, tier };
    });

    if (result.over) {
      const upgradeCopy =
        result.tier === "free"
          ? "You're out of credits for now. Your free credits refill tomorrow, or top up to keep going."
          : "You're out of credits. Top up to keep going, or try again tomorrow.";
      return {
        ok: false,
        error: NextResponse.json(
          { error: upgradeCopy, outOfCredits: true, remaining: result.remaining },
          { status: 402 },
        ),
      };
    }

    return { ok: true, remaining: result.remaining };
  } catch (err) {
    // Fail open: a wallet-service wobble shouldn't take the product down. Log
    // so we notice, and don't charge the student for a failed check.
    console.warn("[userQuota] transaction failed, allowing request", err);
    return { ok: true };
  }
}
