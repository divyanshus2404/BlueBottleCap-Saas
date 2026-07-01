// Referral primitives. Kept minimal so the mechanic ships this session and
// can be extended later without a full refactor.
//
// Model:
// - Every authed user has a stable referral code = first 8 chars of their
//   Firebase UID uppercased. No extra Firestore doc needed to mint one.
// - When a new user signs up with ?ref=CODE, we save it as `referredBy` on
//   their profile. That's the source of truth for who-referred-whom.
// - Rewards are earned at 3 / 6 / 9 successful referrals (+30 bonus AI
//   queries per tier). "Successful" = a real Firestore user doc with
//   referredBy === my_code. We count those live via Firestore's server-side
//   count aggregation so we never over-count self-referrals.

export const REFERRAL_STORAGE_KEY = "bluebottlecap_referred_by";
export const REFERRAL_BONUS_PER_TIER = 30;
export const REFERRALS_PER_TIER = 3;
export const MAX_REFERRAL_TIERS = 3;

/**
 * Turn a Firebase UID into a shareable referral code. Uppercase-alphanumeric,
 * 8 chars — long enough to feel unique, short enough to type from a poster.
 */
export function codeFromUid(uid: string): string {
  return uid.replace(/[^A-Za-z0-9]/g, "").slice(0, 8).toUpperCase();
}

export function referralLinkFor(uid: string, base?: string): string {
  const origin = base ?? (typeof window !== "undefined" ? window.location.origin : "https://bluebottlecap.com");
  return `${origin}/?ref=${codeFromUid(uid)}`;
}

export function getStoredReferrer(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFERRAL_STORAGE_KEY);
}

export function clearStoredReferrer() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(REFERRAL_STORAGE_KEY);
}

export interface ReferralProgress {
  totalReferrals: number;
  tiersEarned: number;
  bonusCreditsEarned: number;
  toNextTier: number; // count remaining until the next tier unlock; 0 if already maxed
  maxedOut: boolean;
}

export function computeProgress(totalReferrals: number): ReferralProgress {
  const tiersEarned = Math.min(MAX_REFERRAL_TIERS, Math.floor(totalReferrals / REFERRALS_PER_TIER));
  const bonusCreditsEarned = tiersEarned * REFERRAL_BONUS_PER_TIER;
  const maxedOut = tiersEarned >= MAX_REFERRAL_TIERS;
  const toNextTier = maxedOut
    ? 0
    : REFERRALS_PER_TIER - (totalReferrals % REFERRALS_PER_TIER);
  return { totalReferrals, tiersEarned, bonusCreditsEarned, toNextTier, maxedOut };
}

/**
 * Shareable message students can WhatsApp / paste. Kept short — every extra
 * word costs a WhatsApp swipe.
 */
export function shareMessage(link: string): string {
  return `hey, using this AI thing for JEE prep — mock tests, weak-topic map, PDF chat. free to try, use my link so I get bonus credits: ${link}`;
}
