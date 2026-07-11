/**
 * Per-user daily quota enforcement for AI routes.
 *
 * The IP-based rate limiter alone can't stop a single logged-in user from
 * burning your Gemini bill in a weekend. This adds a Firestore-backed daily
 * counter keyed on uid + feature, incremented atomically via Admin SDK
 * transactions, so limits survive across serverless cold starts.
 *
 * Users on Pro get an effectively unlimited cap. Free/anonymous get a small
 * daily budget so viral moments don't turn into surprise invoices.
 */

import { NextResponse } from "next/server";
import { getAdmin } from "./firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

type Tier = "free" | "pro";

interface QuotaResult {
  ok: boolean;
  error?: NextResponse;
  remaining?: number;
}

/** Local-date key so limits reset at midnight in the user's day (IST-ish). */
function todayKey(): string {
  const now = new Date();
  // UTC+5:30 offset — good enough for India, doesn't drift.
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  return `${ist.getUTCFullYear()}-${String(ist.getUTCMonth() + 1).padStart(2, "0")}-${String(ist.getUTCDate()).padStart(2, "0")}`;
}

const LIMITS: Record<string, { free: number; pro: number }> = {
  chat: { free: 20, pro: 500 },
  summarize: { free: 10, pro: 200 },
  analyze_image: { free: 8, pro: 200 },
  study_plan: { free: 5, pro: 100 },
  generate_flashcards: { free: 5, pro: 200 },
  generate_roadmap: { free: 3, pro: 100 },
  scan_notes: { free: 5, pro: 200 },
};

/**
 * Check + increment the user's daily counter for a feature. Returns an error
 * response if over-quota. When Admin SDK is unavailable (dev without service
 * account), the check is a no-op — do not fail-closed, that would make the
 * whole app unusable in dev.
 */
export async function enforceUserQuota(
  uid: string,
  feature: keyof typeof LIMITS
): Promise<QuotaResult> {
  const admin = getAdmin();
  if (!admin) return { ok: true };

  const limits = LIMITS[feature];
  if (!limits) return { ok: true };

  const userRef = admin.db.collection("users").doc(uid);
  const day = todayKey();
  const field = `dailyUsage.${day}.${feature}`;

  try {
    const result = await admin.db.runTransaction(async (tx) => {
      const snap = await tx.get(userRef);
      const data = snap.data() || {};
      const plan = String(data.activePlan || data.plan || "Free").toLowerCase();
      const tier: Tier = plan.includes("pro") ? "pro" : "free";
      const cap = limits[tier];

      const used = (data?.dailyUsage?.[day]?.[feature] as number | undefined) ?? 0;
      if (used >= cap) {
        return { over: true as const, remaining: 0, tier };
      }

      tx.set(
        userRef,
        {
          dailyUsage: { [day]: { [feature]: FieldValue.increment(1) } },
          lastQuotaCheck: new Date().toISOString(),
        },
        { merge: true }
      );
      return { over: false as const, remaining: cap - used - 1, tier };
    });

    if (result.over) {
      const upgradeCopy =
        result.tier === "free"
          ? "You've hit today's free limit. Upgrade to Pro for a much higher cap."
          : "You've hit today's Pro limit. Please try again tomorrow or contact support.";
      return {
        ok: false,
        error: NextResponse.json(
          { error: upgradeCopy, quotaExceeded: true },
          { status: 429 }
        ),
      };
    }

    return { ok: true, remaining: result.remaining };
  } catch (err) {
    // Never fail-closed on a Firestore hiccup — better a burst of AI cost
    // than the whole product going down. But log so we notice.
    console.warn("[userQuota] transaction failed, allowing request", err);
    return { ok: true };
  }
}
