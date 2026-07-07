"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { CheckCircle, ArrowRight, Download, Crown, Sparkles, Zap, Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { Confetti } from "@/src/components/Confetti";

function PaymentSuccessContent() {
  const params = useSearchParams();
  const plan = params.get("plan") || "Pro";
  const billing = params.get("billing") || "monthly";
  const paymentId = params.get("paymentId") || "";
  const { currentUser } = useAuth();
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(t);
  }, []);

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
