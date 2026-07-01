"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Copy, Check, Share2, Users, Gift } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { collection, getCountFromServer, query, where } from "firebase/firestore";
import {
  codeFromUid,
  referralLinkFor,
  computeProgress,
  shareMessage,
  REFERRAL_BONUS_PER_TIER,
  REFERRALS_PER_TIER,
  MAX_REFERRAL_TIERS,
} from "../lib/referral";

// Dashboard card that surfaces the user's referral code + progress. Counting
// is live-queried from Firestore (`getCountFromServer` — aggregation only, no
// doc payload) so we never trust a stale cached number. Rewards get claimed
// through GlobalStateContext so the credits update in-sync with the rest of
// the plan/usage state.

interface ReferralCardProps {
  totalReferrals: number;
  onCountRefreshed: (n: number) => void;
  onClaim: (tiersEarned: number) => Promise<void>;
  rewardsClaimed: number;
}

export const ReferralCard: React.FC<ReferralCardProps> = ({ totalReferrals, onCountRefreshed, onClaim, rewardsClaimed }) => {
  const { currentUser } = useAuth();
  const [copied, setCopied] = useState(false);
  const [claiming, setClaiming] = useState(false);

  const code = currentUser?.uid ? codeFromUid(currentUser.uid) : "";
  const link = currentUser?.uid ? referralLinkFor(currentUser.uid) : "";
  const progress = useMemo(() => computeProgress(totalReferrals), [totalReferrals]);
  const unclaimedTiers = Math.max(0, progress.tiersEarned - rewardsClaimed);

  // Refresh the referral count from Firestore whenever this card mounts. The
  // count query only pulls an aggregation, so it's cheap; we don't need a
  // realtime subscription for this — a fresh number per dashboard visit is
  // plenty.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!currentUser || !db) return;
      try {
        const q = query(collection(db, "users"), where("referredBy", "==", code));
        const snap = await getCountFromServer(q);
        if (!cancelled) onCountRefreshed(snap.data().count);
      } catch (err) {
        // Firestore rules may reject the count query for un-verified users.
        // That's fine — we just leave whatever count we already had.
        console.warn("[referral] count refresh failed:", err);
      }
    })();
    return () => { cancelled = true; };
  }, [currentUser, code, onCountRefreshed]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Older browsers / Safari private mode
      window.prompt("Copy your referral link:", link);
    }
  };

  const shareWhatsapp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareMessage(link))}`;
    window.open(url, "_blank", "noopener");
  };

  const shareNative = async () => {
    if (typeof navigator === "undefined" || !(navigator as any).share) {
      shareWhatsapp();
      return;
    }
    try {
      await (navigator as any).share({
        title: "BlueBottleCap — AI for JEE prep",
        text: shareMessage(link),
        url: link,
      });
    } catch {
      // User cancelled — silent
    }
  };

  const claim = async () => {
    if (unclaimedTiers <= 0) return;
    setClaiming(true);
    try {
      await onClaim(progress.tiersEarned);
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-[var(--color-blue-ink)]" />
          <p className="bbc-eyebrow">Refer &amp; earn</p>
        </div>
        <span className="bbc-mono rounded-full bg-[var(--color-blue-wash)] px-2.5 py-0.5 text-[10.5px] font-bold text-[var(--color-blue-ink)]">
          {progress.totalReferrals} / {REFERRALS_PER_TIER * MAX_REFERRAL_TIERS}
        </span>
      </div>

      <h3 className="bbc-serif mt-2 text-[19px] tracking-[-.01em] text-[var(--color-ink)]">
        Bring a friend, get bonus credits.
      </h3>
      <p className="mt-1 text-[12.5px] text-[var(--color-ink-soft)]">
        Every {REFERRALS_PER_TIER} friends who sign up with your link unlock <strong className="text-[var(--color-ink)]">+{REFERRAL_BONUS_PER_TIER} AI queries</strong>. Max {MAX_REFERRAL_TIERS} tiers.
      </p>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-[var(--color-ink)]">
            {progress.tiersEarned} of {MAX_REFERRAL_TIERS} tiers unlocked
          </span>
          <span className="text-[var(--color-ink-faint)]">
            {progress.maxedOut ? "Maxed out — thanks!" : `${progress.toNextTier} to go`}
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--color-line)]">
          <div
            className="h-2 rounded-full bg-[var(--color-blue-ink)] transition-all duration-500"
            style={{ width: `${Math.min(100, (progress.totalReferrals / (REFERRALS_PER_TIER * MAX_REFERRAL_TIERS)) * 100)}%` }}
          />
        </div>
      </div>

      {/* Code + copy row */}
      <div className="mt-4 flex items-center gap-2 rounded-xl border border-[var(--color-line)] bg-white px-3 py-2.5">
        <span className="bbc-mono text-[10px] text-[var(--color-ink-faint)]">CODE</span>
        <span className="bbc-mono truncate text-[13px] font-bold tracking-[.06em] text-[var(--color-ink)]">{code || "…"}</span>
        <button
          onClick={copyLink}
          disabled={!link}
          className="ml-auto inline-flex items-center gap-1 rounded-lg border border-[var(--color-line)] bg-[var(--color-paper)] px-2 py-1 text-[11px] font-semibold text-[var(--color-ink-soft)] hover:bg-[var(--color-blue-wash)] hover:text-[var(--color-blue-ink)] disabled:opacity-50"
          title="Copy referral link"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          onClick={shareNative}
          className="bbc-btn bbc-btn-ghost justify-center py-2 text-[12px]"
        >
          <Share2 className="h-3.5 w-3.5" /> Share
        </button>
        <button
          onClick={shareWhatsapp}
          className="bbc-btn bbc-btn-primary justify-center py-2 text-[12px]"
        >
          Share on WhatsApp
        </button>
      </div>

      {/* Claim button appears when there's an unclaimed reward tier */}
      {unclaimedTiers > 0 && (
        <button
          onClick={claim}
          disabled={claiming}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--color-blue-ink)] bg-[var(--color-blue-wash)] px-3 py-2.5 text-[12.5px] font-bold text-[var(--color-blue-ink)] transition hover:brightness-95 disabled:opacity-50"
        >
          <Gift className="h-4 w-4" />
          {claiming ? "Claiming…" : `Claim +${unclaimedTiers * REFERRAL_BONUS_PER_TIER} bonus credits`}
        </button>
      )}
    </div>
  );
};
