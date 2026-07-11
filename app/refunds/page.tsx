import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Refund Policy · BlueBottleCap",
  description:
    "How BlueBottleCap handles refunds for subscription and one-time purchases. 7-day money-back guarantee on subscriptions, clear rules for exam packs and micro-payments.",
};

const SUPPORT_EMAIL = "support@bluebottlecap.com";

export default function RefundsPage() {
  return (
    <div className="bbc mx-auto max-w-[760px] px-7 py-14">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-ink-soft)] hover:text-[var(--color-blue-ink)] transition mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back to home
      </Link>

      <p className="bbc-eyebrow">Legal</p>
      <h1 className="bbc-serif mt-3 text-[clamp(30px,4vw,44px)] leading-[1.1] tracking-[-.02em]">
        Refund policy
      </h1>
      <p className="mt-3 max-w-[52ch] text-[16px] text-[var(--color-ink-soft)]">
        A student who has genuinely tried BlueBottleCap and doesn&apos;t find it useful
        should never feel stuck. This page explains exactly when a refund applies,
        how to request one, and how quickly you&apos;ll get your money back.
      </p>

      <div className="mt-8 flex items-start gap-3 rounded-2xl border border-[var(--color-blue-ink)]/20 bg-[var(--color-blue-wash)] p-5">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-blue-ink)]" />
        <div>
          <p className="text-[14px] font-bold text-[var(--color-ink)]">
            7-day money-back guarantee on subscriptions
          </p>
          <p className="mt-1 text-[13.5px] text-[var(--color-ink-soft)]">
            If you subscribe to Pro (monthly or annual) and decide within
            <strong> 7 calendar days </strong>
            that it&apos;s not for you, email us and we&apos;ll refund the full amount to
            the original payment method. No questions asked.
          </p>
        </div>
      </div>

      <h2 className="mt-10 text-[20px] font-bold text-[var(--color-ink)]">
        Subscription plans (Pro monthly / annual)
      </h2>
      <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-[var(--color-ink-soft)] list-disc pl-5">
        <li>
          <strong className="text-[var(--color-ink)]">First 7 days:</strong> Full
          refund, processed within 5&ndash;7 business days to the payment method used
          at checkout.
        </li>
        <li>
          <strong className="text-[var(--color-ink)]">After 7 days:</strong> Refunds
          are not issued for periods you&apos;ve already used. You can cancel any time
          from your{" "}
          <Link href="/profile" className="font-semibold text-[var(--color-blue-ink)] underline">
            profile page
          </Link>{" "}
          and the plan will run until the end of the current billing cycle,
          then stop.
        </li>
        <li>
          <strong className="text-[var(--color-ink)]">Annual plans:</strong> If a
          documented technical issue prevents you from using Pro features for a
          significant portion of the year (e.g., the AI service is down for you
          alone for 14+ consecutive days), we&apos;ll pro-rate a refund for the
          affected period.
        </li>
      </ul>

      <h2 className="mt-10 text-[20px] font-bold text-[var(--color-ink)]">
        One-time purchases
      </h2>
      <p className="mt-3 text-[15px] leading-relaxed text-[var(--color-ink-soft)]">
        These are pay-once, consume-once items. Because delivery is instant and
        digital, refund windows are shorter and tighter.
      </p>
      <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-[var(--color-ink-soft)] list-disc pl-5">
        <li>
          <strong className="text-[var(--color-ink)]">Chapter mock tests, JEE
          2026 Bundle, study material:</strong> Refundable within
          <strong> 24 hours </strong>of purchase
          <em> if you have not opened or downloaded the content</em>. Once
          accessed, no refund is issued.
        </li>
        <li>
          <strong className="text-[var(--color-ink)]">Streak-save micro-payment
          (₹19):</strong> Non-refundable. The value delivered is your protected
          streak the moment payment succeeds.
        </li>
      </ul>

      <h2 className="mt-10 text-[20px] font-bold text-[var(--color-ink)]">
        How to request a refund
      </h2>
      <ol className="mt-3 space-y-2 text-[15px] leading-relaxed text-[var(--color-ink-soft)] list-decimal pl-5">
        <li>
          Email{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=Refund%20request`}
            className="font-semibold text-[var(--color-blue-ink)] underline"
          >
            {SUPPORT_EMAIL}
          </a>{" "}
          from the same email address you used to sign up.
        </li>
        <li>Include your Razorpay Payment ID (starts with <code>pay_</code>) — you can find it in your welcome email or on the payment success screen.</li>
        <li>Tell us in one line what didn&apos;t work for you. Feedback is optional but appreciated.</li>
      </ol>
      <p className="mt-3 text-[15px] leading-relaxed text-[var(--color-ink-soft)]">
        We reply within 48 hours. Once approved, refunds are initiated
        immediately via Razorpay and reach your bank / card / UPI account within
        5&ndash;7 business days depending on the payment method.
      </p>

      <h2 className="mt-10 text-[20px] font-bold text-[var(--color-ink)]">
        Not eligible for refund
      </h2>
      <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-[var(--color-ink-soft)] list-disc pl-5">
        <li>Requests made after the applicable window above.</li>
        <li>Accounts terminated for violating our{" "}
          <Link href="/terms" className="font-semibold text-[var(--color-blue-ink)] underline">terms of service</Link>{" "}
          (e.g., automated abuse of AI endpoints, resale of content).
        </li>
        <li>Refunds requested through a chargeback without first contacting support — we always try to resolve directly.</li>
      </ul>

      <div className="mt-12 flex items-start gap-3 rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-5">
        <Mail className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-ink-faint)]" />
        <div>
          <p className="text-[14px] font-bold text-[var(--color-ink)]">
            Still have questions?
          </p>
          <p className="mt-1 text-[13.5px] text-[var(--color-ink-soft)]">
            Write to{" "}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="font-semibold text-[var(--color-blue-ink)] underline"
            >
              {SUPPORT_EMAIL}
            </a>{" "}
            — a real human replies. We&apos;d always rather fix a problem than take money for something that isn&apos;t working for you.
          </p>
        </div>
      </div>

      <p className="mt-10 text-[11px] uppercase tracking-[0.14em] text-[var(--color-ink-faint)]">
        Last updated: July 2026
      </p>
    </div>
  );
}
