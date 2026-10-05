import { NextResponse } from "next/server";
import { requireAuth } from "@/src/lib/authGuard";
import { enforceRateLimit } from "@/src/lib/rateLimit";
import { getAdmin } from "@/src/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import {
  computeProgress,
  REFERRAL_BONUS_PER_TIER,
} from "@/src/lib/referral";

/**
 * Grant referral-reward credits. This used to be a client Firestore write of
 * `creditsLeft`, which (a) the rules now reject because credits are a protected
 * field, and (b) let a user mint themselves unlimited credits from the console.
 *
 * The server is now the only place this happens, and it trusts NOTHING from the
 * client: the number of referrals and the already-claimed count both come from
 * the user's own Firestore doc. Credits land in `purchasedCredits` (the
 * persistent wallet bucket) via increment, and `referralRewardsClaimed` is
 * advanced in the same transaction — so a double-tap or a retry can't double-pay.
 */
export async function POST(req: Request) {
  const limited = await enforceRateLimit(req, { limit: 10, windowMs: 60_000, prefix: "claim-referral" });
  if (limited) return limited;

  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  const admin = getAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Rewards are temporarily unavailable." }, { status: 503 });
  }

  const userRef = admin.db.collection("users").doc(auth.userId);

  try {
    const result = await admin.db.runTransaction(async (tx) => {
      const snap = await tx.get(userRef);
      const data = snap.data() || {};

      // Authoritative counts from the user's own doc — never the request body.
      const referralCount = Number(data.referralCount ?? 0);
      const alreadyClaimed = Number(data.referralRewardsClaimed ?? 0);

      const { tiersEarned } = computeProgress(referralCount);
      const unclaimed = Math.max(0, tiersEarned - alreadyClaimed);
      if (unclaimed <= 0) {
        return { granted: 0, tiersEarned };
      }

      const bonus = unclaimed * REFERRAL_BONUS_PER_TIER;
      tx.set(
        userRef,
        {
          purchasedCredits: FieldValue.increment(bonus),
          referralRewardsClaimed: tiersEarned,
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );
      return { granted: bonus, tiersEarned };
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[claim-referral]", err);
    return NextResponse.json({ error: "Could not claim reward. Please try again." }, { status: 500 });
  }
}
