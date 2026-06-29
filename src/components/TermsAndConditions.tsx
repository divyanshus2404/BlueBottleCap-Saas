import React from "react";
import { ArrowLeft, Shield, AlertTriangle, FileText, Scale } from "lucide-react";

export function TermsAndConditions({ onBack }: { onBack: () => void }) {
  return (
    <div className="bbc relative min-h-screen overflow-hidden">
      <div className="bbc-grid" aria-hidden="true" />

      <div className="relative z-[2] mx-auto max-w-[860px] px-7 pt-16 pb-28">
        <button
          onClick={onBack}
          className="group mb-10 inline-flex items-center gap-2 text-[14px] text-[var(--color-ink-soft)] transition hover:text-[var(--color-ink)]"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to app
        </button>

        {/* Header */}
        <div className="mb-12">
          <p className="bbc-eyebrow flex items-center gap-2">
            <Scale className="h-3.5 w-3.5 text-[var(--color-blue-ink)]" /> Legal
          </p>
          <h1 className="bbc-serif mt-[18px] text-[clamp(34px,5vw,56px)] leading-[1.04] tracking-[-.02em]">
            Terms &amp; Conditions
          </h1>
          <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-[var(--color-ink-soft)]">
            Please read these terms carefully before using our platform. Your access to and use of the
            service is conditioned on your acceptance of and compliance with these terms.
          </p>
        </div>

        <div className="space-y-10 text-[16px] leading-relaxed text-[var(--color-ink-soft)]">
          {/* High-priority disclaimer */}
          <section className="relative overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-blue-wash)] p-6">
            <span className="absolute left-0 top-0 h-full w-1 bg-[var(--color-blue-ink)]" />
            <div className="flex items-start gap-4">
              <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-[var(--color-blue-ink)]" />
              <div>
                <h2 className="bbc-serif mb-2 text-[20px] tracking-[-.01em] text-[var(--color-ink)]">
                  Important disclaimer regarding rankings &amp; accuracy
                </h2>
                <p className="text-[15px] leading-relaxed text-[var(--color-ink-soft)]">
                  BlueBottleCap AI Suite is an educational tool designed for practice and learning.{" "}
                  <strong className="text-[var(--color-ink)]">All ranks, percentiles, predicted scores, and positions displayed on this website are entirely simulated</strong>{" "}
                  based on internal platform algorithms and historical datasets. They are{" "}
                  <strong className="text-[var(--color-ink)]">NOT</strong> affiliated with, endorsed by, or
                  related to the official NTA (National Testing Agency), JEE Main, JEE Advanced, or any
                  real-world examination body.
                </p>
                <p className="mt-3 text-[15px] leading-relaxed text-[var(--color-ink-soft)]">
                  Our platform does not guarantee or simulate the actual accuracy of achieving these ranks
                  in real examinations. These metrics are for motivational and self-assessment purposes
                  only. Do not rely on these simulated metrics as a definitive indicator of your
                  real-world exam performance.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="bbc-serif flex items-center gap-2 text-[22px] tracking-[-.01em] text-[var(--color-ink)]">
              <Shield className="h-5 w-5 text-[var(--color-blue-ink)]" />
              1. Acceptance of terms
            </h2>
            <p>
              By accessing or using the BlueBottleCap AI Suite ("the Service"), you agree to be bound by
              these Terms. If you disagree with any part of the terms, you may not access the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="bbc-serif flex items-center gap-2 text-[22px] tracking-[-.01em] text-[var(--color-ink)]">
              <FileText className="h-5 w-5 text-[var(--color-blue-ink)]" />
              2. Educational use only
            </h2>
            <p>
              The content provided by our AI models (including but not limited to roadmaps, solutions,
              flashcards, and study planners) is generated automatically and is intended for educational
              and supplementary purposes only. While we strive for accuracy, the AI can make mistakes.
              You must verify critical information, formulas, and concepts with official textbooks and
              instructors. We are not liable for any academic loss, incorrect learning, or exam failure
              resulting from the use of our Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="bbc-serif text-[22px] tracking-[-.01em] text-[var(--color-ink)]">
              3. User accounts &amp; data privacy
            </h2>
            <p>
              When you create an account, you must provide accurate and complete information. You are
              responsible for safeguarding your password and for all activities that occur under your
              account. We prioritize your privacy and do not sell your personal study data. However, your
              prompts and uploaded images may be processed by third-party AI providers (like Google
              Gemini) strictly for the purpose of generating educational responses.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="bbc-serif text-[22px] tracking-[-.01em] text-[var(--color-ink)]">
              4. Premium subscriptions &amp; refunds
            </h2>
            <p>
              Some features of the Service are billed on a subscription basis ("Premium"). You will be
              billed in advance on a recurring schedule. Due to the digital nature of AI credits and
              computing costs, all payments are non-refundable unless explicitly stated otherwise or
              required by law. We reserve the right to modify subscription fees at any time, with
              reasonable prior notice provided to active subscribers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="bbc-serif text-[22px] tracking-[-.01em] text-[var(--color-ink)]">
              5. Limitation of liability
            </h2>
            <p>
              In no event shall BlueBottleCap AI Suite, nor its directors, employees, partners, agents,
              suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or
              punitive damages, including without limitation, loss of profits, data, use, goodwill, or
              other intangible losses, resulting from (i) your access to or use of or inability to access
              or use the Service; (ii) any conduct or content of any third party on the Service; and
              (iii) unauthorized access, use or alteration of your transmissions or content.
            </p>
          </section>

          <section className="mt-12 space-y-2 border-t border-[var(--color-line)] pt-8 text-[14px] text-[var(--color-ink-faint)]">
            <p>Last updated: June 17, 2026</p>
            <p>
              If you have any questions about these Terms, please contact us at
              support@bluebottlecap.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
