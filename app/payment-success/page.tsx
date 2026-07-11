"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { CheckCircle, ArrowRight, Crown, Sparkles, Zap, Copy, Check, Loader2, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { Confetti } from "@/src/components/Confetti";

type VerifyState =
  | { status: "checking" }
  | { status: "ok"; productId: string | null }
  | { status: "invalid"; message: string };

function PaymentSuccessContent() {
  const params = useSearchParams();
  const plan = params.get("plan") || "Pro";
  const billing = params.get("billing") || "monthly";
  const paymentId = params.get("paymentId") || "";
  const { currentUser } = useAuth();
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);
  const [verify, setVerify] = useState<VerifyState>({ status: "checking" });

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(t);
  }, []);

  // Server-verify the paymentId before rendering "You're Pro". Without this,
  // anyone can visit /payment-success?plan=Pro and see a legit-looking
  // success screen — a screenshot-fraud vector even though it doesn't
  // actually grant Pro.
  useEffect(() => {
    if (!paymentId) {
      setVerify({ status: "invalid", message: "No payment id in the URL." });
      return;
    }
    if (!paymentId.startsWith("pay_")) {
      setVerify({ status: "invalid", message: "This link doesn't look like a real payment." });
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const resp = await fetch(`/api/razorpay/payment-status?payment_id=${encodeURIComponent(paymentId)}`);
        const data = await resp.json();
        if (cancelled) return;
        if (resp.ok && data?.verified) {
          setVerify({ status: "ok", productId: data.productId ?? null });
        } else {
          setVerify({
            status: "invalid",
            message: data?.error || "We couldn't confirm this payment yet.",
          });
        }
      } catch {
        if (cancelled) return;
        setVerify({ status: "invalid", message: "Network error while verifying payment." });
      }
    })();
    return () => { cancelled = true; };
  }, [paymentId]);

  const copyPaymentId = () => {
    if (paymentId) {
      navigator.clipboard.writeText(paymentId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const planFeatures: Record<string, string[]> = {
    Basic: [
      "100 AI credits per month",
      "Unlimited PDF uploads",
      "Notes to flashcards conversion",
      "Email support",
    ],
    Pro: [
      "Unlimited AI exam tool runs",
      "JEE & NEET mock test series",
      "AI-generated study roadmaps",
      "Day-by-day exam timetables",
      "Priority support",
    ],
  };

  const features = planFeatures[plan] || planFeatures.Pro;

  const priceDisplay: Record<string, Record<string, string>> = {
    Basic: { monthly: "₹49/mo", annual: "₹39/mo (₹468/yr)" },
    Pro: { monthly: "₹199/mo", annual: "₹125/mo (₹1,499/yr)" },
  };

  // Checking Razorpay — render a neutral "verifying" state instead of the
  // celebratory Welcome screen. This is what someone visiting the URL
  // directly (without a real payment) will always see.
  if (verify.status === "checking") {
    return (
      <div className="bbc min-h-screen">
        <div className="bbc-grid" aria-hidden="true" />
        <div className="relative z-[2] mx-auto flex min-h-screen max-w-[520px] flex-col items-center justify-center px-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-blue-ink)]" />
          <p className="mt-4 text-[14px] font-semibold text-[var(--color-ink)]">Confirming your payment…</p>
          <p className="mt-2 text-[13px] text-[var(--color-ink-soft)]">
            This usually takes a second or two.
          </p>
        </div>
      </div>
    );
  }

  if (verify.status === "invalid") {
    return (
      <div className="bbc min-h-screen">
        <div className="bbc-grid" aria-hidden="true" />
        <div className="relative z-[2] mx-auto flex min-h-screen max-w-[520px] flex-col items-center justify-center px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
          </div>
          <h1 className="bbc-serif mt-5 text-[clamp(24px,3.6vw,32px)] leading-[1.15] tracking-[-0.02em]">
            We couldn&apos;t confirm this payment.
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-[var(--color-ink-soft)]">
            {verify.message} If you did just pay, refresh the page — Razorpay
            can take a few seconds to settle. Otherwise, email us with your
            payment id and we&apos;ll sort it in minutes.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/pricing" className="bbc-btn bbc-btn-ghost px-5 py-2.5 text-[13px]">
              Back to pricing
            </Link>
            <a
              href="mailto:support@bluebottlecap.com?subject=Payment%20verification%20problem"
              className="bbc-btn bbc-btn-primary px-5 py-2.5 text-[13px]"
            >
              Email support
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bbc min-h-screen">
      {showConfetti && <Confetti active />}
      <div className="bbc-grid" aria-hidden="true" />

      <div className="relative z-[2] mx-auto max-w-[600px] px-6 py-16 sm:py-24">
        {/* Success icon */}
        <div className="text-center">
          <div className="relative mx-auto mb-6 inline-flex">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle className="h-10 w-10 text-emerald-600" />
            </div>
            <div className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-blue-ink)] text-white shadow-lg">
              {plan === "Pro" ? <Crown className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
            </div>
          </div>

          <h1 className="bbc-serif text-[clamp(28px,4.5vw,40px)] leading-[1.08] tracking-[-0.02em] text-[var(--color-ink)]">
            Welcome to {plan}!
          </h1>
          <p className="mx-auto mt-3 max-w-md text-[15px] text-[var(--color-ink-soft)] leading-relaxed">
            Your payment was successful and your plan is now active.
            {currentUser?.email && (
              <> A confirmation has been sent to <strong className="text-[var(--color-ink)]">{currentUser.email}</strong>.</>
            )}
          </p>
        </div>

        {/* Plan card */}
        <div className="mt-10 rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--color-line)] pb-4 mb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--color-ink-faint)]">Your plan</p>
              <p className="mt-1 text-[20px] font-bold text-[var(--color-ink)]">
                {plan} Scholar
              </p>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-700">
              Active
            </span>
          </div>

          <ul className="space-y-3">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-[14px] text-[var(--color-ink-soft)]">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          {/* Invoice details */}
          <div className="mt-5 rounded-xl bg-[var(--color-paper)] border border-[var(--color-line)] p-4 space-y-2">
            <div className="flex justify-between text-[12px]">
              <span className="text-[var(--color-ink-faint)]">Billing</span>
              <span className="font-semibold text-[var(--color-ink)]">
                {priceDisplay[plan]?.[billing] || `${billing} billing`}
              </span>
            </div>
            {paymentId && (
              <div className="flex justify-between items-center text-[12px]">
                <span className="text-[var(--color-ink-faint)]">Payment ID</span>
                <button
                  onClick={copyPaymentId}
                  className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[var(--color-ink-soft)] hover:text-[var(--color-blue-ink)] transition cursor-pointer"
                >
                  {paymentId.slice(0, 20)}{paymentId.length > 20 ? "…" : ""}
                  {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
            )}
            <div className="flex justify-between text-[12px]">
              <span className="text-[var(--color-ink-faint)]">Date</span>
              <span className="font-semibold text-[var(--color-ink)]">
                {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="bbc-btn bbc-btn-primary flex-1 justify-center py-3.5 text-[13px] gap-2"
          >
            Go to Dashboard <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/mock-test"
            className="bbc-btn bbc-btn-ghost flex-1 justify-center py-3.5 text-[13px] gap-2"
          >
            <Zap className="h-4 w-4 text-amber-500" />
            Take a Mock Test
          </Link>
        </div>

        {/* Help note */}
        <p className="mt-8 text-center text-[12px] text-[var(--color-ink-faint)]">
          Questions about your plan? Email us at{" "}
          <a href="mailto:support@bluebottlecap.com" className="text-[var(--color-blue-ink)] hover:underline">
            support@bluebottlecap.com
          </a>
        </p>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="bbc flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-line)] border-t-[var(--color-blue-ink)]" />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
