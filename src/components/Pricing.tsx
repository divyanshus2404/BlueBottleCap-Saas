"use client";

import React, { useState } from "react";
import { UserStats } from "../types";
import { Check, Zap, ShieldCheck, Printer, ArrowRight, Loader2 } from "lucide-react";

interface PricingProps {
  userStats: UserStats;
  onUpgradeApproved: (plan: "Free" | "Pro") => void;
  onNavigateTo: (view: any) => void;
}

type PlanId = "Free" | "Pro";

export const Pricing: React.FC<PricingProps> = ({ userStats, onUpgradeApproved, onNavigateTo }) => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [loadingStep, setLoadingStep] = useState<number>(-1);
  const [showReceipt, setShowReceipt] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("Free");

  const plans = [
    {
      id: "Free" as const,
      name: "Free",
      desc: "Enough to feel the difference. Not enough to live on.",
      priceMonthly: 0,
      priceAnnual: 0,
      buttonText: "Start free",
      icon: "⚡",
      product: { monthly: null, annual: null },
      features: [
        "1 PDF upload",
        "5 chat messages per session",
        "Watermarked exports",
        "Study streak tracking",
      ],
    },
    {
      id: "Pro" as const,
      name: "Pro",
      desc: "The plan that actually gets you through exams.",
      priceMonthly: 199,
      // Annual: display ~₹125/mo, but the ACTUAL one-shot charge is ₹1,499.
      // Receipt + Razorpay use priceAnnualTotal; the per-month figure is UI only.
      priceAnnual: 125,
      priceAnnualTotal: 1499,
      buttonText: "Get Pro",
      isPopular: true,
      icon: "👑",
      product: { monthly: "pro_monthly", annual: "pro_annual" },
      features: [
        "Unlimited PDFs and chat",
        "Flashcards, summaries, mocks",
        "Day-by-day study plan",
        "No watermarks on exports",
        "Priority support",
      ],
    },
  ];

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

  const handleUpgradeTrigger = async (plan: PlanId) => {
    if (plan === "Free") {
      onUpgradeApproved("Free");
      onNavigateTo("dashboard");
      return;
    }

    const planObj = plans.find((pl) => pl.id === plan);
    if (!planObj) return;
    const product = billingCycle === "monthly" ? planObj.product.monthly : planObj.product.annual;
    if (!product) return;

    setSelectedPlan(plan);
    setLoadingStep(0);

    try {
      const resp = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Failed to create order");

      const ok = await loadRazorpayScript();
      if (!ok) throw new Error("Failed to load Razorpay checkout script");

      const options: any = {
        key: data.key_id,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "BlueBottleCap",
        description: `${plan} plan purchase`,
        order_id: data.order.id,
        handler: async function (response: any) {
          const verifyResp = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...response, product }),
          });
          const verifyData = await verifyResp.json();
          if (verifyResp.ok && verifyData.ok) {
            // Use the server-returned plan, not the client's local guess, so
            // a tampered client cannot claim Pro from a non-Pro signature.
            const grantedPlan: PlanId = verifyData.plan === "Pro" ? "Pro" : "Free";
            setLoadingStep(4);
            setShowReceipt(true);
            onUpgradeApproved(grantedPlan);
          } else {
            alert("Payment verification failed");
            setLoadingStep(-1);
          }
        },
        prefill: { name: "", email: "" },
        theme: { color: "#1B3FCB" },
        modal: { ondismiss: () => setLoadingStep(-1) },
        // Surface UPI at the top of the payment methods list. Students in
        // India overwhelmingly reach for UPI (Google Pay, PhonePe, Paytm,
        // BHIM) — burying it under cards costs conversion. Enabling both
        // `collect` and `intent` flows means mobile users can deep-link
        // straight into their UPI app while desktop users can still enter
        // a VPA and get a collect request. `show_default_blocks` keeps
        // cards/netbanking/wallets available below UPI for anyone who
        // needs them, so we don't lose users who prefer other methods.
        config: {
          display: {
            blocks: {
              upi_first: {
                name: "Pay using UPI",
                instruments: [
                  {
                    method: "upi",
                    flows: ["collect", "intent"],
                  },
                ],
              },
            },
            sequence: ["block.upi_first"],
            preferences: {
              show_default_blocks: true,
            },
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Payment failed to start");
      setLoadingStep(-1);
    }
  };

  const handleFinalizeUpgrade = () => {
    onUpgradeApproved(selectedPlan);
    setLoadingStep(-1);
    setShowReceipt(false);
    onNavigateTo("dashboard");
  };

  const getPlanPrice = (p: (typeof plans)[0]) =>
    billingCycle === "monthly" ? p.priceMonthly : p.priceAnnual;

  return (
    <div className="bbc relative min-h-screen overflow-hidden">
      <div className="bbc-grid" aria-hidden="true" />
      <div className="relative z-[2] mx-auto max-w-[1180px] px-7 py-16">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="bbc-eyebrow">Simple, transparent pricing</p>
          <h1 className="bbc-serif mx-auto mt-3 max-w-[18ch] text-[clamp(32px,4.4vw,52px)] leading-[1.06] tracking-[-.02em]">
            Choose the plan that's right for you
          </h1>
          <p className="mx-auto mt-4 max-w-md text-[16px] text-[var(--color-ink-soft)]">
            From PDF editing to AI-powered study tools — everything you need to prepare smarter.
          </p>

          {/* Billing toggle */}
          <div className="mt-7 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <div className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-1">
              {(["monthly", "annual"] as const).map((cycle) => (
                <button
                  key={cycle}
                  onClick={() => setBillingCycle(cycle)}
                  className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition ${
                    billingCycle === cycle
                      ? "bg-[var(--color-blue-ink)] text-white"
                      : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
                  }`}
                >
                  {cycle === "monthly" ? "Monthly billing" : "Annual billing"}
                </button>
              ))}
            </div>
            <span className="rounded-full border border-[var(--color-line)] bg-[var(--color-blue-wash)] px-3 py-1 text-[11px] font-semibold text-[var(--color-blue-ink)]">
              Save 37% with annual billing
            </span>
          </div>
        </div>

        {/* Plans */}
        <div className="mx-auto grid max-w-[760px] items-stretch gap-6 md:grid-cols-2">
          {plans.map((p) => {
            const isActive = userStats.activePlan === p.id;
            const priceToShow = getPlanPrice(p);
            return (
              <div
                key={p.id}
                className={`relative flex flex-col justify-between rounded-2xl border bg-[var(--color-paper-card)] p-7 transition-all hover:-translate-y-0.5 ${
                  p.isPopular
                    ? "border-[var(--color-blue-ink)] ring-1 ring-[var(--color-blue-ink)]"
                    : "border-[var(--color-line)] hover:border-[var(--color-line-strong)]"
                }`}
              >
                {p.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--color-blue-ink)] px-4 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    Most popular
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <span className="bbc-eyebrow text-[var(--color-ink)]">{p.name}</span>
                    <span className="text-lg">{p.icon}</span>
                  </div>
                  <p className="mt-4 text-[13px] text-[var(--color-ink-faint)]">{p.desc}</p>

                  <div className="mt-3 flex items-baseline">
                    <span className="bbc-serif text-[40px] tracking-[-.02em] text-[var(--color-ink)]">
                      ₹{priceToShow}
                    </span>
                    <span className="ml-1 text-[13px] text-[var(--color-ink-faint)]">
                      {p.id === "Free" ? "/ forever free" : "/month"}
                    </span>
                  </div>
                  {p.id !== "Free" && billingCycle === "annual" && "priceAnnualTotal" in p && (
                    <p className="mt-1 text-[11.5px] text-[var(--color-ink-faint)]">
                      ₹{p.priceAnnualTotal.toLocaleString("en-IN")} charged once, then ₹{p.priceAnnualTotal.toLocaleString("en-IN")}/year. Cancel anytime.
                    </p>
                  )}

                  <ul className="mt-6 space-y-3 border-t border-[var(--color-line)] pt-5 text-left">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-[13.5px] text-[var(--color-ink-soft)]">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-blue-ink)]" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  {isActive ? (
                    <div className="bbc-mono select-none rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] p-3 text-center text-[11px] uppercase tracking-widest text-[var(--color-ink-faint)]">
                      {p.id === "Free" ? "✓ Current (locked)" : "✓ Current plan"}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUpgradeTrigger(p.id)}
                      className={`bbc-btn w-full justify-center py-3 text-[13px] ${
                        p.isPopular ? "bbc-btn-primary" : "bbc-btn-ghost"
                      }`}
                    >
                      {p.id !== "Free" && <Zap className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />}
                      <span>{p.buttonText}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Discovery strip for coaching-center owners. The student plans
            above are per-user; per-seat institute pricing (₹49-99/seat)
            lives at /for-institutes. Owners comparing prices otherwise
            bounce, thinking ₹199/student × 200 students = too expensive. */}
        <div className="mx-auto mt-12 max-w-[760px] rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-6 md:flex md:items-center md:justify-between md:gap-6">
          <div className="text-left">
            <p className="bbc-eyebrow text-[10px]">For coaching institutes</p>
            <p className="mt-1.5 text-[14.5px] font-semibold text-[var(--color-ink)]">
              Pricing for 50+ students?
            </p>
            <p className="mt-1 text-[13px] text-[var(--color-ink-soft)]">
              Institute plans start at ₹49/seat/mo — with your branding, faculty dashboard, and bulk onboarding.
            </p>
          </div>
          <a href="/for-institutes" className="bbc-btn bbc-btn-ghost mt-4 justify-center whitespace-nowrap px-4 py-2.5 text-[13px] md:mt-0">
            See institute plans →
          </a>
        </div>

        {/* FAQ */}
        <div className="mt-20 border-t border-[var(--color-line)] pt-16">
          <h2 className="bbc-serif mb-8 text-center text-[clamp(26px,3.4vw,38px)] tracking-[-.02em]">
            Frequently asked questions
          </h2>
          <div className="mx-auto grid max-w-3xl gap-4 md:grid-cols-2">
            {[
              {
                q: "Can I switch plans anytime?",
                a: "Yes! You can upgrade, downgrade, or cancel your subscription at any time. Your billing will auto-adjust as requested.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards, debit cards, UPI, and net banking secure payments.",
              },
              {
                q: "Is there a student discount?",
                a: "Yes! Students get 30% off on all paid plans with a valid student ID card or educational institution email address.",
              },
              {
                q: "What happens if I cancel?",
                a: "You'll keep full access to your premium tier until the end of your billing period, then automatically shift back to Free.",
              },
            ].map((faq, i) => (
              <div key={i} className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-6">
                <h4 className="text-[14px] font-semibold text-[var(--color-ink)]">{faq.q}</h4>
                <p className="mt-2 text-[13px] leading-relaxed text-[var(--color-ink-soft)]">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Checkout overlay */}
      {loadingStep >= 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-6 shadow-2xl">
            {!showReceipt ? (
              <div className="space-y-4 py-10 text-center">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-[var(--color-blue-ink)]" />
                <h3 className="bbc-serif text-[22px] text-[var(--color-ink)]">Securing payment portal</h3>
                <p className="mx-auto max-w-xs text-[13px] italic text-[var(--color-ink-soft)]">
                  Connecting to the secure payment gateway…
                </p>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-line)]">
                  <div
                    className="h-1.5 rounded-full bg-[var(--color-blue-ink)] transition-all duration-300"
                    style={{ width: `${Math.max(loadingStep, 1) * 25}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-center fade-in">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-blue-wash)] text-[var(--color-blue-ink)]">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <h3 className="bbc-serif text-[26px] text-[var(--color-ink)]">Payment approved</h3>
                <p className="text-[13px] text-[var(--color-ink-soft)]">
                  Your license is securely upgraded. Below is your invoice:
                </p>

                <div className="bbc-mono space-y-2 rounded-2xl border border-dashed border-[var(--color-line-strong)] bg-[var(--color-paper)] p-5 text-left text-[12px]">
                  <div className="mb-2 flex justify-between border-b border-[var(--color-line)] pb-2 font-bold text-[var(--color-ink)]">
                    <span>BlueBottleCap Invoice</span>
                    <span>No. BBC-2026-X839</span>
                  </div>
                  <div className="flex justify-between text-[var(--color-ink-soft)]">
                    <span>Account Tier</span>
                    <span className="font-bold text-[var(--color-blue-ink)]">{selectedPlan} Scholar</span>
                  </div>
                  <div className="flex justify-between text-[var(--color-ink-soft)]">
                    <span>Duration</span>
                    <span className="text-[var(--color-ink)]">
                      {billingCycle === "monthly" ? "1 month (renewable)" : "12 months (renewable)"}
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between border-t border-dashed border-[var(--color-line)] pt-2 text-[14px] font-bold text-[var(--color-ink)]">
                    <span>Total charged</span>
                    <span>
                      ₹
                      {(() => {
                        const plan = plans.find((pl) => pl.id === selectedPlan);
                        if (!plan) return 0;
                        return billingCycle === "monthly"
                          ? plan.priceMonthly
                          : ("priceAnnualTotal" in plan ? plan.priceAnnualTotal : plan.priceAnnual);
                      })()}{" "}
                      INR
                    </span>
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <button
                    onClick={() => window.print()}
                    className="bbc-btn bbc-btn-ghost justify-center px-4 py-3 text-[12px]"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Print</span>
                  </button>
                  <button
                    onClick={handleFinalizeUpgrade}
                    className="bbc-btn bbc-btn-primary grow justify-center py-3 text-[12px]"
                  >
                    <span>Activate {selectedPlan} plan</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
