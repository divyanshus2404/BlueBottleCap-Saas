"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

// B2B landing page targeting coaching-center owners. Deliberately different
// vibe from the student landing: no emoji, outcomes-first language, per-seat
// pricing, single primary CTA (book a demo). Same BBC design tokens so it
// still feels like part of the product.

interface LeadForm {
  instituteName: string;
  contactName: string;
  whatsapp: string;
  expectedSeats: string;
  city: string;
  message: string;
}

const emptyLead: LeadForm = {
  instituteName: "",
  contactName: "",
  whatsapp: "",
  expectedSeats: "100-250",
  city: "",
  message: "",
};

export const InstituteLanding: React.FC = () => {
  const router = useRouter();
  const [lead, setLead] = useState<LeadForm>(emptyLead);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollToDemo = () => {
    document.getElementById("book-demo")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!lead.instituteName || !lead.contactName || !lead.whatsapp) {
      setError("Please fill institute name, your name, and WhatsApp number.");
      return;
    }
    setSubmitting(true);
    try {
      const resp = await fetch("/api/institute-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data?.error || "Something went wrong. Please try again.");
      }
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bbc relative min-h-screen overflow-hidden">
      <div className="bbc-grid" aria-hidden="true" />

      {/* HERO */}
      <section className="relative z-[2] mx-auto max-w-[1080px] px-7 py-[72px] text-center">
        <p className="bbc-eyebrow">For coaching centers · JEE · NEET · CUET</p>
        <h1 className="bbc-serif mx-auto mt-4 max-w-[18ch] text-[clamp(36px,5vw,60px)] leading-[1.05] tracking-[-.02em]">
          AI mock tests for your institute, <em className="not-italic italic font-medium text-[var(--color-blue-ink)]">your branding.</em>
        </h1>
        <p className="mx-auto mt-5 max-w-[44em] text-[17px] text-[var(--color-ink-soft)]">
          Give every student in your institute unlimited AI-generated mock tests, chapter-wise diagnostics, and a personalised weak-topic map — with your logo on every export. Per-seat pricing that fits Tier-2 economics.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button onClick={() => router.push("/for-institutes/mock-generator")} className="bbc-btn bbc-btn-primary px-[26px] py-[14px] text-[16px]">
            Generate a branded paper — free
          </button>
          <button onClick={scrollToDemo} className="bbc-btn bbc-btn-ghost px-[26px] py-[14px] text-[15px]">
            Book a 15-min demo
          </button>
        </div>
        <p className="mt-4 text-[13.5px] text-[var(--color-ink-soft)]">
          Or{" "}
          <button onClick={() => router.push("/for-institutes/batch-report")} className="font-semibold text-[var(--color-blue-ink)] hover:underline">
            see your batch's weakest topics
          </button>{" "}
          — share one link, get a ranked weak-topic map.
        </p>

        <div className="mx-auto mt-10 grid max-w-[820px] grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { k: "50-2000", v: "Seat range per institute" },
            { k: "₹49-99", v: "Per-seat per-month" },
            { k: "7 days", v: "From signup to student login" },
            { k: "0", v: "Setup or licence fee" },
          ].map((s) => (
            <div key={s.v} className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-4 text-left">
              <p className="bbc-serif text-[22px] tracking-[-.01em] text-[var(--color-ink)]">{s.k}</p>
              <p className="bbc-eyebrow mt-1 text-[10px]">{s.v}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PROBLEM */}
      <section className="relative z-[2] mx-auto max-w-[1080px] px-7 py-[64px]">
        <div className="mx-auto mb-10 max-w-[46em] text-center">
          <p className="bbc-eyebrow">The uncomfortable truth</p>
          <h2 className="bbc-serif mt-3 text-[clamp(24px,3.2vw,36px)] leading-[1.12] tracking-[-.02em]">
            Your students are already using ChatGPT.
            <br />
            <span className="text-[var(--color-blue-ink)]">You just don't get any of the credit.</span>
          </h2>
          <p className="mt-4 text-[15.5px] text-[var(--color-ink-soft)]">
            When a student clears JEE Advanced this year, you want them to say <em>"my coaching helped me"</em> — not <em>"I studied on ChatGPT."</em> Give them the AI, with your name on it.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            { t: "You can't scale personal attention", d: "You have 400 students and 12 teachers. Nobody gets a personal weak-topic plan." },
            { t: "Test-series prep eats your weekends", d: "One faculty spends 6 hours generating a chapter-wise mock. AI does it in 40 seconds." },
            { t: "Students churn to online platforms", d: "PW, Vedantu, Unacademy — they win on tech, not teaching. Match their tech, keep your teaching." },
          ].map((p) => (
            <div key={p.t} className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-6">
              <h3 className="text-[15px] font-bold text-[var(--color-ink)]">{p.t}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--color-ink-soft)]">{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="relative z-[2] border-t border-[var(--color-line)] bg-[var(--color-paper-card)]">
        <div className="mx-auto max-w-[1080px] px-7 py-[72px]">
          <div className="mx-auto mb-10 max-w-[46em] text-center">
            <p className="bbc-eyebrow">What every seat unlocks</p>
            <h2 className="bbc-serif mt-3 text-[clamp(24px,3.2vw,36px)] leading-[1.12] tracking-[-.02em]">
              Enterprise-grade AI, coaching-center price.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              { t: "Unlimited AI-generated mock tests", d: "Chapter-wise or full-length, JEE / NEET / CUET pattern. Your logo on every question paper and answer key PDF." },
              { t: "Personalised weak-topic map per student", d: "After every mock, each student sees the exact chapters to revise. You see the aggregate — plan a class around what the batch actually fails at." },
              { t: "AI PDF Copilot on your textbooks", d: "Upload your institute's own material once. Students ask questions and get answers cited from your notes — not a generic chatbot." },
              { t: "Batch weak-topic intel", d: "See exactly which chapters your entire batch struggles with, ranked by percentage. One link to share, live results as students take the diagnostic." },
              { t: "White-label branding", d: "Your logo, your colours, your domain (via CNAME on Pro+). Parents see your institute name, not ours." },
              { t: "Instant student onboarding", d: "One diagnostic link. Students log in without email, answer 12 questions in 2 minutes, see their personal weak-topic map. No CSV, no WhatsApp blasts." },
            ].map((f) => (
              <div key={f.t} className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper)] p-6">
                <h3 className="text-[15px] font-bold text-[var(--color-ink)]">{f.t}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--color-ink-soft)]">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative z-[2] mx-auto max-w-[1080px] px-7 py-[72px]">
        <div className="mx-auto mb-10 max-w-[46em] text-center">
          <p className="bbc-eyebrow">Onboarding</p>
          <h2 className="bbc-serif mt-3 text-[clamp(24px,3.2vw,36px)] leading-[1.12] tracking-[-.02em]">
            From demo to student login, one week.
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { n: "01", t: "15-min demo", d: "We show you the AI generating a mock in real-time on Zoom or WhatsApp video." },
            { n: "02", t: "1-day setup", d: "You share your logo and student list (CSV). We spin up your branded workspace." },
            { n: "03", t: "Faculty walkthrough", d: "30-min training call for your teachers. They learn to spot weak-topic patterns." },
            { n: "04", t: "Students log in", d: "SMS/WhatsApp login link goes to every student. They start with a diagnostic." },
          ].map((s) => (
            <div key={s.n} className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-6">
              <p className="bbc-mono text-[11px] font-bold text-[var(--color-blue-ink)]">STEP {s.n}</p>
              <h3 className="mt-3 text-[15px] font-bold text-[var(--color-ink)]">{s.t}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-[var(--color-ink-soft)]">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section className="relative z-[2] border-y border-[var(--color-line)] bg-[var(--color-paper-card)]">
        <div className="mx-auto max-w-[1080px] px-7 py-[72px]">
          <div className="mx-auto mb-10 max-w-[46em] text-center">
            <p className="bbc-eyebrow">Per-seat, transparent</p>
            <h2 className="bbc-serif mt-3 text-[clamp(24px,3.2vw,36px)] leading-[1.12] tracking-[-.02em]">
              Priced for Tier-2 economics.
            </h2>
            <p className="mt-4 text-[15px] text-[var(--color-ink-soft)]">
              No setup fee. No licence fee. Cancel any month with 30-day notice. Billed monthly, prepaid.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              { name: "Starter", seats: "50–150 seats", price: "₹99", per: "per seat / month", desc: "Ideal for a single-branch institute testing the waters.", features: ["Unlimited AI mocks", "Weak-topic maps", "Owner dashboard", "WhatsApp support"] },
              { name: "Growth", seats: "150–500 seats", price: "₹79", per: "per seat / month", featured: true, desc: "Most popular. What most coaching centers land on.", features: ["Everything in Starter", "White-label branding", "Faculty dashboard", "Bulk CSV onboarding", "Priority WhatsApp support"] },
              { name: "Scale", seats: "500+ seats", price: "₹49", per: "per seat / month", desc: "For chains and franchise networks.", features: ["Everything in Growth", "Custom domain (CNAME)", "Custom question banks", "Dedicated onboarding manager", "Quarterly business reviews"] },
            ].map((p) => (
              <div
                key={p.name}
                className={`relative flex flex-col justify-between rounded-2xl border bg-[var(--color-paper)] p-6 ${
                  p.featured ? "border-[var(--color-blue-ink)] ring-1 ring-[var(--color-blue-ink)]" : "border-[var(--color-line)]"
                }`}
              >
                {p.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--color-blue-ink)] px-4 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    Most institutes pick this
                  </div>
                )}
                <div>
                  <p className="bbc-eyebrow text-[var(--color-ink)]">{p.name}</p>
                  <p className="mt-1 text-[12px] font-semibold text-[var(--color-ink-faint)]">{p.seats}</p>
                  <p className="mt-4 text-[13px] text-[var(--color-ink-faint)]">{p.desc}</p>
                  <div className="mt-4 flex items-baseline">
                    <span className="bbc-serif text-[36px] tracking-[-.02em] text-[var(--color-ink)]">{p.price}</span>
                    <span className="ml-2 text-[12px] text-[var(--color-ink-faint)]">{p.per}</span>
                  </div>
                  <ul className="mt-5 space-y-2 border-t border-[var(--color-line)] pt-4 text-left">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-[13px] text-[var(--color-ink-soft)]">
                        <svg width="14" height="14" viewBox="0 0 16 16" className="mt-0.5 shrink-0" fill="none"><path d="M3 8.5l3 3 7-8" stroke="var(--color-blue-ink)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button onClick={scrollToDemo} className={`bbc-btn mt-6 w-full justify-center py-3 text-[13px] ${p.featured ? "bbc-btn-primary" : "bbc-btn-ghost"}`}>
                  Book a demo for {p.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PILOT OFFER */}
      <section className="relative z-[2] border-y border-[var(--color-blue-ink)]/15 bg-gradient-to-b from-[var(--color-blue-wash)] to-[var(--color-paper)]">
        <div className="mx-auto max-w-[820px] px-7 py-[72px] text-center">
          <p className="bbc-eyebrow text-[var(--color-blue-ink)]">Zero-risk pilot</p>
          <h2 className="bbc-serif mt-3 text-[clamp(26px,3.6vw,42px)] tracking-[-.02em]">
            50 seats free for 30 days.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-[var(--color-ink-soft)]">
            No credit card. No contract. No demo call required. Fill out one form, get your branded workspace in 24 hours, and let your students try it. If it doesn't work — walk away.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href="https://forms.gle/YOUR_FORM_ID"
              target="_blank"
              rel="noopener noreferrer"
              className="bbc-btn bbc-btn-primary px-8 py-3.5 text-[15px]"
            >
              Start my free pilot
            </a>
            <button onClick={scrollToDemo} className="bbc-btn bbc-btn-ghost px-6 py-3.5 text-[13px]">
              I'd rather see a demo first
            </button>
          </div>
          <div className="mx-auto mt-8 grid max-w-md grid-cols-3 gap-4">
            <div>
              <p className="bbc-serif text-[28px] tracking-[-.02em] text-[var(--color-ink)]">50</p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[.12em] text-[var(--color-ink-faint)]">Free seats</p>
            </div>
            <div>
              <p className="bbc-serif text-[28px] tracking-[-.02em] text-[var(--color-ink)]">30</p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[.12em] text-[var(--color-ink-faint)]">Days to try</p>
            </div>
            <div>
              <p className="bbc-serif text-[28px] tracking-[-.02em] text-[var(--color-ink)]">₹0</p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[.12em] text-[var(--color-ink-faint)]">Until you decide</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative z-[2] mx-auto max-w-[1080px] px-7 py-[72px]">
        <div className="mb-10 text-center">
          <p className="bbc-eyebrow">FAQ</p>
          <h2 className="bbc-serif mt-3 text-[clamp(22px,3vw,32px)] tracking-[-.02em]">Common questions from institute owners</h2>
        </div>
        <div className="mx-auto grid max-w-3xl gap-4 md:grid-cols-2">
          {[
            { q: "Do students need to install anything?", a: "No. They log in through a browser link sent over WhatsApp. Works on any phone with a browser." },
            { q: "How is this different from Unacademy / PW?", a: "You keep the student relationship, brand, and revenue. We're your AI tech layer — not your competitor." },
            { q: "What happens to my data if I stop?", a: "You get a CSV export of every student's activity and mock scores. Then your data is deleted within 30 days." },
            { q: "Can we upload our own question bank?", a: "Yes, on Scale. Our AI uses your questions as the seed and generates variants in the same style." },
            { q: "Is billing GST-compliant?", a: "Yes. We issue a GST invoice every month. Registered under the SaaS software services category." },
            { q: "Can I pilot with 50 students first?", a: "Absolutely. Starter tier is designed for that — no long-term commitment, cancel with 30-day notice." },
          ].map((f) => (
            <div key={f.q} className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-5">
              <h4 className="text-[14px] font-semibold text-[var(--color-ink)]">{f.q}</h4>
              <p className="mt-2 text-[13px] leading-relaxed text-[var(--color-ink-soft)]">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BOOK DEMO */}
      <section id="book-demo" className="relative z-[2] border-t border-[var(--color-line)] bg-[var(--color-blue-wash)]">
        <div className="mx-auto max-w-[720px] px-7 py-[72px]">
          <div className="mb-8 text-center">
            <p className="bbc-eyebrow">Book a demo</p>
            <h2 className="bbc-serif mt-3 text-[clamp(24px,3.4vw,38px)] tracking-[-.02em]">
              15 minutes. Zoom or WhatsApp video. Zero pitch — just a live demo.
            </h2>
            <p className="mt-3 text-[14px] text-[var(--color-ink-soft)]">
              We'll show you the AI generating a chapter-wise mock in real time. If it's not for you, no follow-up email.
            </p>
          </div>

          {submitted ? (
            <div className="rounded-2xl border border-[var(--color-blue-ink)] bg-[var(--color-paper-card)] p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-blue-ink)] text-white">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5 9-11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <h3 className="bbc-serif mt-4 text-[24px] tracking-[-.01em]">Thanks — we've got it.</h3>
              <p className="mt-3 text-[14px] text-[var(--color-ink-soft)]">
                A founder will WhatsApp you within 24 hours to schedule the 15-min demo. If it's after 9 PM in India, expect a reply tomorrow morning.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="bbc-eyebrow text-[10px]">Institute name *</span>
                  <input
                    type="text"
                    value={lead.instituteName}
                    onChange={(e) => setLead({ ...lead, instituteName: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[var(--color-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-blue-ink)]"
                    placeholder="e.g. Aakash Nagpur Branch"
                  />
                </label>
                <label className="block">
                  <span className="bbc-eyebrow text-[10px]">Your name *</span>
                  <input
                    type="text"
                    value={lead.contactName}
                    onChange={(e) => setLead({ ...lead, contactName: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[var(--color-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-blue-ink)]"
                    placeholder="Founder / Owner / Head of Academics"
                  />
                </label>
                <label className="block">
                  <span className="bbc-eyebrow text-[10px]">WhatsApp number *</span>
                  <input
                    type="tel"
                    value={lead.whatsapp}
                    onChange={(e) => setLead({ ...lead, whatsapp: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[var(--color-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-blue-ink)]"
                    placeholder="+91 98XXXXXXXX"
                  />
                </label>
                <label className="block">
                  <span className="bbc-eyebrow text-[10px]">City</span>
                  <input
                    type="text"
                    value={lead.city}
                    onChange={(e) => setLead({ ...lead, city: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[var(--color-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-blue-ink)]"
                    placeholder="Nagpur / Kota / Bhopal…"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="bbc-eyebrow text-[10px]">Expected number of seats</span>
                  <select
                    value={lead.expectedSeats}
                    onChange={(e) => setLead({ ...lead, expectedSeats: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[var(--color-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-blue-ink)]"
                  >
                    <option>Under 50</option>
                    <option>50-150</option>
                    <option>100-250</option>
                    <option>250-500</option>
                    <option>500-1000</option>
                    <option>1000+</option>
                  </select>
                </label>
                <label className="block sm:col-span-2">
                  <span className="bbc-eyebrow text-[10px]">Anything you want us to know? (optional)</span>
                  <textarea
                    value={lead.message}
                    onChange={(e) => setLead({ ...lead, message: e.target.value })}
                    rows={3}
                    className="mt-1 w-full rounded-lg border border-[var(--color-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-blue-ink)]"
                    placeholder="Which exam(s) you prep for, any specific pain point, best time to call…"
                  />
                </label>
              </div>

              {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-[13px] text-red-800">{error}</div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="bbc-btn bbc-btn-primary mt-5 w-full justify-center py-3 text-[14px] disabled:opacity-50"
              >
                {submitting ? "Sending…" : "Request my 15-min demo"}
              </button>

              <p className="mt-3 text-center text-[11px] text-[var(--color-ink-faint)]">
                We only reach out on WhatsApp. No cold-call spam. No shared with third parties.
              </p>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
