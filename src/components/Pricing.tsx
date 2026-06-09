"use client";

import React, { useState } from "react";
import { UserStats } from "../types";
import { Check, Sparkles, Zap, ShieldCheck, Printer, ArrowRight, Loader2 } from "lucide-react";

interface PricingProps {
  userStats: UserStats;
  onUpgradeApproved: (plan: 'Free' | 'Basic' | 'Pro' | 'Elite') => void;
  onNavigateTo: (view: any) => void;
}

export const Pricing: React.FC<PricingProps> = ({
  userStats,
  onUpgradeApproved,
  onNavigateTo,
}) => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [loadingStep, setLoadingStep] = useState<number>(-1);
  const [showReceipt, setShowReceipt] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<'Free' | 'Basic' | 'Pro' | 'Elite'>("Free");

  // Plans data mirroring the user assets exactly!
  const plans = [
    {
      id: "Free" as const,
      name: "Free",
      desc: "Ideal for trying out the exam workspace",
      priceMonthly: 0,
      priceAnnual: 0,
      buttonText: "Start Free",
      color: "border-slate-200 bg-white ",
      badgeColor: "bg-slate-100 text-slate-700",
      icon: "⚡",
      features: [
        "3 daily AI tool runs limits",
        "Access to 6 flagship exam tools",
        "Real client-side PDF optimization",
        "Real client-side image compression",
        "Active student study streaks"
      ]
    },
    {
      id: "Pro" as const,
      name: "Pro",
      desc: "Perfect for active exam preparation",
      priceMonthly: 149,
      priceAnnual: 119,
      buttonText: "Get Pro",
      color: "border-purple-200 bg-purple-50/5 ring-2 ring-purple-500/20",
      badgeColor: "bg-purple-600 text-white",
      isPopular: true,
      icon: "👑",
      features: [
        "Everything in Free",
        "Infinite AI exam tool runs",
        "JEE MCQ Card practice sets",
        "Day-by-day exam timetables",
        "Notes to study flashcards",
        "24/7 Priority support key"
      ]
    },
    {
      id: "Elite" as const,
      name: "Power",
      desc: "For serious scholars & power users",
      priceMonthly: 349,
      priceAnnual: 279,
      buttonText: "Get Power",
      color: "border-orange-200 bg-orange-50/5",
      badgeColor: "bg-orange-500 text-white",
      icon: "🚀",
      features: [
        "Everything in Pro",
        "Full AI PDF Co-Pilot workspace",
        "Highest-speed AI generations",
        "B.Tech semester study blueprints",
        "Early access to exam mocks"
      ]
    }
  ];

  // Checkout simulation script
  const loadRazorpayScript = () => {
    return new Promise<boolean>((resolve) => {
      if (document.querySelector("script[src='https://checkout.razorpay.com/v1/checkout.js']")) {
        return resolve(true);
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUpgradeTrigger = async (plan: 'Free' | 'Basic' | 'Pro' | 'Elite') => {
    if (plan === "Free") {
      onUpgradeApproved("Free");
      onNavigateTo("dashboard");
      return;
    }

    const planObj = plans.find((pl) => pl.id === plan);
    if (!planObj) return;
    const amountINR = billingCycle === "monthly" ? planObj.priceMonthly : planObj.priceAnnual;
    const amountPaise = amountINR * 100;
    setSelectedPlan(plan);
    setLoadingStep(0);

    // Create order on server
    try {
      const resp = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountPaise }),
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
          // Verify payment on server
          const verifyResp = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          const verifyData = await verifyResp.json();
          if (verifyResp.ok && verifyData.ok) {
            setLoadingStep(4);
            setShowReceipt(true);
            onUpgradeApproved(plan);
          } else {
            alert("Payment verification failed");
            setLoadingStep(-1);
          }
        },
        prefill: {
          name: "",
          email: "",
        },
        theme: { color: "#5B21B6" },
        modal: {
          ondismiss: function () {
            setLoadingStep(-1);
          }
        }
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

  const getPlanPrice = (p: typeof plans[0]) => {
    return billingCycle === "monthly" ? p.priceMonthly : p.priceAnnual;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 fade-in">
      
      {/* Dynamic Header */}
      <div className="mb-12 text-center">
        <span className="rounded-full bg-blue-50 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-brand-cobalt">
          Simple, transparent pricing
        </span>
        <h1 className="mt-3 font-display text-3xl font-black text-brand-navy md:text-4.5xl tracking-tight">
          Choose the plan that's right for you
        </h1>
        <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
          From PDF editing to AI-powered writing, image processing to career tools—everything you need to succeed.
        </p>

        {/* Toggle billing period */}
        <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
          <div className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 p-1">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
                billingCycle === "monthly" ? "bg-white text-brand-navy shadow-xs" : "text-gray-500 hover:text-gray-900 "
              }`}
            >
              Monthly billing
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
                billingCycle === "annual" ? "bg-white text-brand-navy shadow-xs" : "text-gray-500 hover:text-gray-950"
              }`}
            >
              Annual billing
            </button>
          </div>
          <span className="rounded-full bg-emerald-50 border border-emerald-150 px-3 py-1 text-[11px] font-bold text-emerald-700">
            💰 Save 20% with annual billing
          </span>
        </div>
      </div>

      {/* Plans comparison layout */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch">
        {plans.map((p) => {
          const isActive = userStats.activePlan === p.id;
          const priceToShow = getPlanPrice(p);
          
          return (
            <div 
              key={p.id}
              className={`relative flex flex-col justify-between rounded-3xl border p-6.5 shadow-2xs transition-all hover:shadow-xs hover:border-gray-350 ${p.color} ${p.isPopular ? "scale-[1.01]" : ""}`}
            >
              {p.isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-purple-600 border-2 border-white px-4 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider shadow-xs">
                  Most Popular
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] rounded-full px-2.5 py-0.5 uppercase tracking-widest font-black ${p.badgeColor}`}>
                    {p.name}
                  </span>
                  <span className="text-lg">{p.icon}</span>
                </div>
                
                <h3 className="mt-4 font-display font-light text-xs text-gray-400">
                  {p.desc}
                </h3>

                <div className="mt-3 flex items-baseline">
                  <span className="font-display text-3.5xl font-black tracking-tight text-brand-navy ">
                    ₹{priceToShow}
                  </span>
                  <span className="ml-1 text-xs text-gray-400">
                    {p.id === "Free" ? "/ forever free" : "/month"}
                  </span>
                </div>

                <ul className="mt-6 space-y-3 border-t border-gray-100 pt-5 text-left">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-gray-600 ">
                      <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-2">
                {isActive ? (
                  <div className="rounded-xl bg-slate-50 font-bold p-3 text-center text-xs text-gray-400 border border-slate-100 uppercase tracking-widest font-mono select-none">
                    {p.id === "Free" ? "✓ Current (Locked)" : "✓ Current Plan"}
                  </div>
                ) : (
                  <button
                    onClick={() => handleUpgradeTrigger(p.id)}
                    className={`w-full flex items-center justify-center gap-1.5 rounded-xl py-3 text-xs font-bold transition cursor-pointer select-none border ${
                      p.isPopular 
                        ? "bg-purple-600 hover:bg-purple-700 text-white border-purple-600" 
                        : "bg-slate-50 hover:bg-slate-100 text-brand-navy border-slate-200 "
                    }`}
                  >
                    {p.id !== "Free" && <Zap className="h-3.5 w-3.5 fill-amber-300 text-amber-300 mr-0.5" />}
                    <span>{p.buttonText}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Frequently Asked Questions */}
      <div className="mt-20 border-t border-gray-250 pt-16">
        <h2 className="text-center font-display text-2xl font-black text-brand-navy tracking-tight md:text-3xl mb-8">
          Frequently asked questions
        </h2>
        <div className="mx-auto max-w-3xl grid gap-6 md:grid-cols-2">
          {[
            {
              q: "Can I switch plans anytime?",
              a: "Yes! You can upgrade, downgrade, or cancel your subscription at any time. Your billing will auto-adjust as requested."
            },
            {
              q: "What payment methods do you accept?",
              a: "We accept all major credit cards, debit cards, UPI, and net banking secure payments."
            },
            {
              q: "Is there a student discount?",
              a: "Yes! Students get 30% off on all paid plans with a valid student ID card or educational institution email address."
            },
            {
              q: "What happens if I cancel?",
              a: "You'll keep absolute full access to your premium folder tier until the end of your billing period, then automatically shift back to Free."
            }
          ].map((faq, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 p-6 bg-white shadow-3xs">
              <h4 className="font-extrabold text-sm text-brand-navy ">{faq.q}</h4>
              <p className="mt-2 text-xs text-slate-505 font-medium leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CHECKOUT EMULATOR PROCESS LOADING SCREEN */}
      {loadingStep >= 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-xs fade-in">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl relative border border-slate-100">
            
            {!showReceipt ? (
              <div className="text-center py-10 space-y-4">
                <Loader2 className="mx-auto h-12 w-12 text-brand-cobalt animate-spin" />
                <h3 className="font-display text-xl font-bold text-brand-navy ">Securing payment portal</h3>
                <p className="text-xs text-gray-500 italic max-w-xs mx-auto">
                  {loadingStep === 1 && "Connecting secure gateway servers..."}
                  {loadingStep === 2 && "Validating Student ID with regional database registers..."}
                  {loadingStep === 3 && `Configuring license credentials for ${selectedPlan} Scholar...`}
                  {loadingStep === 4 && "Generating transaction token and billing receipt..."}
                </p>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-brand-cobalt h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${loadingStep * 25}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-center fade-in">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <h3 className="font-display text-2xl font-black text-brand-navy ">Payment Approved!</h3>
                <p className="text-xs text-gray-500 font-medium">Your license is securely upgraded. Below is your compiled invoice:</p>

                {/* Stylized academic purchases invoice */}
                <div className="rounded-2xl border border-dashed border-gray-200 bg-slate-50 p-5 text-left text-xs font-mono space-y-2">
                  <div className="flex justify-between border-b border-gray-150 pb-2 mb-2 font-bold text-slate-700">
                    <span>BlueBottleCap Invoice</span>
                    <span>No. BBC-2026-X839</span>
                  </div>
                  <div className="flex justify-between text-gray-550">
                    <span>Student User</span>
                    <span className="text-right text-gray-700 font-semibold font-sans">Alex Mercer (MIT)</span>
                  </div>
                  <div className="flex justify-between text-gray-550">
                    <span>Account Tier</span>
                    <span className="text-right text-brand-cobalt font-bold">{selectedPlan} Scholar License</span>
                  </div>
                  <div className="flex justify-between text-gray-500 ">
                    <span>Duration</span>
                    <span className="text-right text-gray-700">1 calendar month (Renewable)</span>
                  </div>
                  <div className="flex justify-between text-gray-550">
                    <span>Auth Token</span>
                    <span className="text-right text-slate-700">BBC_Pro_Lic_591AF19</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-brand-navy border-t border-dashed border-gray-150 pt-2 mt-2 leading-none">
                    <span>Total Charged</span>
                    <span>₹{billingCycle === "monthly" ? plans.find(pl => pl.id === selectedPlan)?.priceMonthly : plans.find(pl => pl.id === selectedPlan)?.priceAnnual} INR</span>
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 hover:bg-slate-50 px-4 py-3 text-xs font-bold text-gray-600 transition"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print</span>
                  </button>
                  <button
                    onClick={handleFinalizeUpgrade}
                    className="grow flex items-center justify-center gap-1.5 rounded-xl bg-brand-navy hover:bg-brand-cobalt py-3 text-xs font-black text-white shadow-md transition cursor-pointer leading-none"
                  >
                    <span>Activate {selectedPlan} Plan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
