"use client";

import React, { useEffect, useState } from "react";
import { Flame, Shield } from "lucide-react";
import { STREAK_SAVE_PRICE } from "../lib/streak";
import { trackEvent } from "../lib/analytics";
import { auth } from "../firebase";

// Dashboard banner that appears only when the user has a real streak in
// danger. Uses the shared Razorpay checkout pattern from Pricing/Bundle
// (UPI-first, ₹19 one-shot). On successful payment, calls onSaved() which
// pushes `lastLoggedDate=today` into GlobalStateContext + Firestore so the
// streak survives.

interface StreakSaveBannerProps {
  streakDays: number;
  onSaved: () => Promise<void> | void;
  /** One free save per month — when true, the banner offers it instead of the ₹19 checkout. */
  freeSaveAvailable?: boolean;
  onFreeSave?: () => Promise<void> | void;
  showToast?: (msg: string, kind?: "success" | "error" | "warning" | "info") => void;
}

export const StreakSaveBanner: React.FC<StreakSaveBannerProps> = ({ streakDays, onSaved, freeSaveAvailable, onFreeSave, showToast }) => {
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    trackEvent("streak_banner_shown", { streakDays, free: freeSaveAvailable ? 1 : 0 });
    // Impression only on mount — the banner unmounts once the streak is safe.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const useFreeSave = async () => {
    setBusy(true);
    try {
      await onFreeSave?.();
      trackEvent("free_streak_save_used", { streakDays });
      showToast?.("Streak protected with your free monthly save. See you tomorrow.", "success");
    } catch (e: any) {
      showToast?.(e?.message || "Could not save your streak.", "error");
    } finally {
      setBusy(false);
    }
  };

  const loadRazorpayScript = () =>
    new Promise<boolean>((resolve) => {
      if (document.querySelector("script[src='https://checkout.razorpay.com/v1/checkout.js']")) {
        return resolve(true);
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const save = async () => {
    setBusy(true);
    trackEvent("checkout_opened", { product: "streak_save", streakDays });
    try {
      const resp = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: "streak_save" }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Could not open checkout.");

      const ok = await loadRazorpayScript();
      if (!ok) throw new Error("Razorpay checkout script failed to load.");

      const options: any = {
        key: data.key_id,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "BlueBottleCap",
        description: `Save your ${streakDays}-day streak`,
        order_id: data.order.id,
        theme: { color: "#1B3FCB" },
        modal: { ondismiss: () => { trackEvent("checkout_dismissed", { product: "streak_save" }); setBusy(false); } },
        config: {
          display: {
            blocks: {
              upi_first: {
                name: "Pay using UPI",
                instruments: [{ method: "upi", flows: ["collect", "intent"] }],
              },
            },
            sequence: ["block.upi_first"],
            preferences: { show_default_blocks: true },
          },
        },
        handler: async function (response: any) {
          try {
            const idToken = await auth?.currentUser?.getIdToken().catch(() => undefined);
            const verifyResp = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...response, product: "streak_save", idToken }),
            });
            const verifyData = await verifyResp.json();
            if (verifyResp.ok && verifyData.ok) {
              trackEvent("payment_success", { product: "streak_save" });
              await onSaved();
              showToast?.(`Streak protected. See you tomorrow.`, "success");
            } else {
              trackEvent("payment_failed", { product: "streak_save", reason: "verify" });
              showToast?.("Payment verification failed. Contact support.", "error");
            }
          } catch (e: any) {
            showToast?.(e?.message || "Something went wrong after payment.", "error");
          } finally {
            setBusy(false);
          }
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error(err);
      trackEvent("payment_failed", { product: "streak_save", reason: "checkout_init" });
      showToast?.(err?.message || "Could not start payment.", "error");
      setBusy(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--color-blue-ink)] bg-[var(--color-blue-deep)] p-5 text-white shadow-[0_18px_40px_-20px_rgba(20,30,55,.35)] md:p-6">
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[var(--color-blue-ink)] opacity-40 blur-[70px]" />
      <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
            <Flame className="h-6 w-6 text-orange-300" fill="currentColor" />
          </div>
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-[.15em] text-white/60">Your streak is at risk</p>
            <h3 className="bbc-serif mt-1 text-[22px] leading-tight tracking-[-.01em] text-white">
              Save your <span className="text-orange-300">{streakDays}-day</span> streak for ₹{STREAK_SAVE_PRICE}.
            </h3>
            <p className="mt-1.5 max-w-md text-[13px] text-white/70">
              {freeSaveAvailable
                ? "You didn't log a session today. Use your free monthly save — we protect your streak so tomorrow still counts."
                : "You didn't log a session today. Pay once — we protect your streak so tomorrow still counts. No subscription. No auto-renewal."}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-1.5">
          <button
            onClick={freeSaveAvailable ? useFreeSave : save}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-[13.5px] font-bold text-[var(--color-blue-deep)] transition hover:scale-[1.02] disabled:opacity-50"
          >
            <Shield className="h-4 w-4" />
            {busy ? "Saving…" : freeSaveAvailable ? "Use free save" : `Save streak · ₹${STREAK_SAVE_PRICE}`}
          </button>
          <span className="text-[11px] text-white/50">
            {freeSaveAvailable ? "1 free save each month" : "Free save used this month"}
          </span>
        </div>
      </div>
    </div>
  );
};
