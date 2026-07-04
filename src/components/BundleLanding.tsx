"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { trackEvent } from "../lib/analytics";
import { auth } from "../firebase";

// One-shot exam-pack landing. Positioned as a panic-buy for JEE 2026 students
// — small enough (₹149) to feel like a snack, valuable enough that 100 sales
// puts real money in the bank. Delivery is manual for the first ~50 buyers
// (see razorpay.ts note); we email the mock-test PDFs within 24h. The
// purchase flow reuses the same /api/razorpay/create-order + /verify pattern
// as the Pro subscription in Pricing.tsx.

interface BundleLandingProps {
  product: string; // Razorpay product id (e.g. "jee_bundle_2026")
  price: string;   // Display price (e.g. "₹149")
  title: string;
  eyebrow: string;
  subhead: string;
  features: string[];
  bonusItems: string[];
  faqs: { q: string; a: string }[];
}

export const BundleLanding: React.FC<BundleLandingProps> = ({
  product, price, title, eyebrow, subhead, features, bonusItems, faqs,
}) => {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [purchased, setPurchased] = useState<{ email?: string } | null>(null);
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");

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

  const buy = async () => {
    setError(null);
    if (!buyerEmail || !buyerEmail.includes("@")) {
      setError("Please enter a valid email so we can deliver the mocks.");
      return;
    }
    if (!buyerName.trim()) {
      setError("Please enter your name.");
      return;
    }
    setBusy(true);
    trackEvent("checkout_opened", { product });
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
        description: title,
        order_id: data.order.id,
        prefill: { name: buyerName, email: buyerEmail, contact: buyerPhone },
        theme: { color: "#1B3FCB" },
        modal: { ondismiss: () => { trackEvent("checkout_dismissed", { product }); setBusy(false); } },
        // Same UPI-first config as the Pro checkout — Indian buyers reach
        // for UPI, cards are the fallback.
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
              body: JSON.stringify({ ...response, product, idToken, buyerEmail }),
            });
            const verifyData = await verifyResp.json();
            if (verifyResp.ok && verifyData.ok) {
              trackEvent("payment_success", { product });
              // Fire-and-forget: notify the founder so manual delivery can
              // start. Failure here shouldn't block the buyer seeing success.
              fetch("/api/bundle-purchase", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  product,
                  buyerEmail,
                  buyerName,
                  buyerPhone,
                  paymentId: response.razorpay_payment_id,
                  orderId: response.razorpay_order_id,
                }),
              }).catch(() => {});
              setPurchased({ email: buyerEmail });
            } else {
              trackEvent("payment_failed", { product, reason: "verify" });
              setError("Payment verification failed. Refund will be issued if we can't verify.");
            }
          } catch (e: any) {
            trackEvent("payment_failed", { product, reason: "verify_error" });
            setError(e?.message || "Post-payment verification failed.");
          } finally {
            setBusy(false);
          }
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error(err);
      trackEvent("payment_failed", { product, reason: "checkout_init" });
      setError(err?.message || "Payment failed to start.");
      setBusy(false);
    }
  };

  if (purchased) {
    return (
      <div className="bbc relative min-h-screen overflow-hidden">
        <div className="bbc-grid" aria-hidden="true" />
        <div className="relative z-[2] mx-auto max-w-[720px] px-7 py-24 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-blue-ink)] text-white">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5 9-11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <h1 className="bbc-serif mt-6 text-[clamp(28px,3.6vw,44px)] leading-[1.08] tracking-[-.02em]">Payment received. Thank you.</h1>
          <p className="mx-auto mt-4 max-w-[38em] text-[16px] text-[var(--color-ink-soft)]">
            Your 10 chapter-wise JEE mocks + weak-topic analysis will arrive at
            <span className="mx-1 font-semibold text-[var(--color-ink)]">{purchased.email}</span>
            within 24 hours. If you don't see it, check your spam folder or WhatsApp us on the number in the receipt email.
          </p>
          <div className="mt-8 rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-6 text-left">
            <p className="bbc-eyebrow text-[10px]">While you wait</p>
            <p className="mt-2 text-[14px] text-[var(--color-ink-soft)]">
              Take the 2-min <a href="/diagnostic" className="font-semibold text-[var(--color-blue-ink)] hover:underline">JEE diagnostic</a> now — the result maps your weak topics so we can prioritise those in the mocks we send you.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button onClick={() => router.push("/diagnostic")} className="bbc-btn bbc-btn-primary px-5 py-3 text-[14px]">Take the diagnostic →</button>
            <button onClick={() => router.push("/")} className="bbc-btn bbc-btn-ghost px-5 py-3 text-[14px]">Back to home</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bbc relative min-h-screen overflow-hidden">
      <div className="bbc-grid" aria-hidden="true" />

      {/* Hero */}
      <section className="relative z-[2] mx-auto max-w-[1080px] px-7 py-[72px]">
        <div className="grid gap-10 md:grid-cols-[1.15fr_1fr] md:items-center">
          <div>
            <p className="bbc-eyebrow">{eyebrow}</p>
            <h1 className="bbc-serif mt-4 text-[clamp(34px,4.6vw,58px)] leading-[1.05] tracking-[-.02em]">{title}</h1>
            <p className="mt-5 text-[17px] text-[var(--color-ink-soft)]">{subhead}</p>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="bbc-serif text-[46px] tracking-[-.02em] text-[var(--color-ink)]">{price}</span>
              <span className="text-[13px] text-[var(--color-ink-faint)]">one-time · no subscription · GST included</span>
            </div>

            <ul className="mt-6 space-y-3 border-t border-[var(--color-line)] pt-5">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-[14.5px] text-[var(--color-ink-soft)]">
                  <svg width="16" height="16" viewBox="0 0 16 16" className="mt-0.5 shrink-0" fill="none"><path d="M3 8.5l3 3 7-8" stroke="var(--color-blue-ink)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Buy card */}
          <div className="rounded-2xl border border-[var(--color-blue-ink)] bg-white p-6 shadow-[0_20px_50px_-25px_rgba(20,30,55,.25)]">
            <p className="bbc-eyebrow text-[var(--color-blue-ink)]">Grab yours</p>
            <p className="mt-2 text-[13px] text-[var(--color-ink-soft)]">Enter your details and we'll email the mocks within 24 hours.</p>

            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="bbc-eyebrow text-[10px]">Your name</span>
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="mt-1 w-full rounded-lg border border-[var(--color-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-blue-ink)]"
                />
              </label>
              <label className="block">
                <span className="bbc-eyebrow text-[10px]">Email (for delivery) *</span>
                <input
                  type="email"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1 w-full rounded-lg border border-[var(--color-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-blue-ink)]"
                />
              </label>
              <label className="block">
                <span className="bbc-eyebrow text-[10px]">WhatsApp (optional)</span>
                <input
                  type="tel"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="+91 98XXXXXXXX"
                  className="mt-1 w-full rounded-lg border border-[var(--color-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-blue-ink)]"
                />
              </label>
            </div>

            {error && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-[13px] text-red-800">{error}</div>
            )}

            <button
              onClick={buy}
              disabled={busy}
              className="bbc-btn bbc-btn-primary mt-5 w-full justify-center py-3.5 text-[15px] disabled:opacity-50"
            >
              {busy ? "Opening secure checkout…" : `Buy the bundle for ${price}`}
            </button>

            <p className="mt-3 text-center text-[11px] text-[var(--color-ink-faint)]">
              UPI · Cards · Netbanking via Razorpay. Refund within 3 days if you're unhappy.
            </p>
          </div>
        </div>
      </section>

      {/* What's included */}
      <section className="relative z-[2] border-t border-[var(--color-line)] bg-[var(--color-paper-card)]">
        <div className="mx-auto max-w-[1080px] px-7 py-[72px]">
          <div className="mx-auto mb-10 max-w-[42em] text-center">
            <p className="bbc-eyebrow">What lands in your inbox</p>
            <h2 className="bbc-serif mt-3 text-[clamp(24px,3.2vw,36px)] leading-[1.12] tracking-[-.02em]">
              Not a PDF dump. A real prep pack.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {bonusItems.map((b, i) => (
              <div key={i} className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper)] p-5">
                <p className="bbc-mono text-[11px] font-bold text-[var(--color-blue-ink)]">ITEM {String(i + 1).padStart(2, "0")}</p>
                <p className="mt-2 text-[14px] text-[var(--color-ink-soft)]">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative z-[2] mx-auto max-w-[1080px] px-7 py-[72px]">
        <div className="mb-10 text-center">
          <p className="bbc-eyebrow">Fair questions</p>
          <h2 className="bbc-serif mt-3 text-[clamp(22px,3vw,32px)] tracking-[-.02em]">Before you tap Buy</h2>
        </div>
        <div className="mx-auto grid max-w-3xl gap-4 md:grid-cols-2">
          {faqs.map((f) => (
            <div key={f.q} className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-5">
              <h4 className="text-[14px] font-semibold text-[var(--color-ink)]">{f.q}</h4>
              <p className="mt-2 text-[13px] leading-relaxed text-[var(--color-ink-soft)]">{f.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
