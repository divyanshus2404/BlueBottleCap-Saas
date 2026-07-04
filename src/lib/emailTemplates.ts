// Content for each lifecycle/transactional email, kept separate from the
// transport so copy is easy to tweak. Each returns { subject, html, text }.

import { emailShell, button, escapeHtml, APP_URL } from "./email";

// Next JEE Main session 1 (approx) — used for the countdown line. Update as
// the official date firms up so the "X days to JEE" line stays accurate.
export const JEE_DATE = new Date("2027-01-22T00:00:00+05:30");

export function daysToJee(now: Date = new Date()): number {
  return Math.max(0, Math.ceil((JEE_DATE.getTime() - now.getTime()) / 86_400_000));
}

export function welcomeEmail(name?: string) {
  const first = (name || "").trim().split(" ")[0];
  const hi = first ? `Hi ${escapeHtml(first)},` : "Hi there,";
  return {
    subject: "Welcome to BlueBottleCap — here's where to start",
    html: emailShell({
      heading: "You're in. Let's make prep quieter.",
      bodyHtml: `<p>${hi}</p>
        <p>BlueBottleCap turns your own material into study firepower — chat with your PDFs, generate mocks, and see exactly where you're weak.</p>
        <p><strong>Fastest win:</strong> take the 2-minute diagnostic and get a personalised weak-topic map — no more guessing what to revise.</p>
        <p>${button("Take the 2-min diagnostic", `${APP_URL}/diagnostic`)}</p>
        <p style="color:#6a6d72;font-size:13px;">Or jump straight into the <a href="${APP_URL}/tools" style="color:#1B3FCB;">file tools</a> or <a href="${APP_URL}/dashboard" style="color:#1B3FCB;">your dashboard</a>.</p>`,
    }),
    text: `${hi}\n\nWelcome to BlueBottleCap. Fastest win: take the 2-minute diagnostic for a personalised weak-topic map — ${APP_URL}/diagnostic`,
  };
}

export function receiptEmail(opts: { productLabel: string; amountPaise: number; paymentId?: string }) {
  const amount = `₹${(opts.amountPaise / 100).toLocaleString("en-IN")}`;
  return {
    subject: `Payment confirmed — ${opts.productLabel}`,
    html: emailShell({
      heading: "Payment received. You're all set.",
      bodyHtml: `<p>Thanks for your purchase. Here's your receipt:</p>
        <div style="background:#f5f4ef;border:1px solid #e5e2d6;border-radius:10px;padding:14px 16px;margin:10px 0;font-size:14px;">
          <div style="display:flex;justify-content:space-between;"><span>${escapeHtml(opts.productLabel)}</span><strong>${amount}</strong></div>
          ${opts.paymentId ? `<div style="margin-top:6px;color:#8a8d92;font-size:12px;">Payment ID: ${escapeHtml(opts.paymentId)}</div>` : ""}
        </div>
        <p>${button("Open your dashboard", `${APP_URL}/dashboard`)}</p>`,
      footerNote: "This is a payment receipt for your BlueBottleCap purchase.",
    }),
    text: `Payment received: ${opts.productLabel} — ${amount}${opts.paymentId ? `\nPayment ID: ${opts.paymentId}` : ""}\n\nOpen your dashboard: ${APP_URL}/dashboard`,
  };
}

export function abandonedCheckoutEmail(opts: { productLabel: string; product: string }) {
  return {
    subject: "Still thinking it over?",
    html: emailShell({
      heading: "Your checkout is waiting.",
      bodyHtml: `<p>You started to get <strong>${escapeHtml(opts.productLabel)}</strong> but didn't finish. No pressure — it'll be here when you're ready.</p>
        <p>Pay by UPI in one tap. No subscription traps, cancel anytime.</p>
        <p>${button("Finish checkout", `${APP_URL}/pricing`)}</p>`,
      footerNote: "You opened a checkout on BlueBottleCap and we saved your spot.",
    }),
    text: `You started to get ${opts.productLabel} but didn't finish. Pick up where you left off: ${APP_URL}/pricing`,
  };
}

export function deadlineNudgeEmail(opts: { name?: string; unsubscribeUrl: string; now?: Date }) {
  const first = (opts.name || "").trim().split(" ")[0];
  const hi = first ? `Hi ${escapeHtml(first)},` : "Hi there,";
  const days = daysToJee(opts.now);
  return {
    subject: `${days} days to JEE — where are you weak?`,
    html: emailShell({
      heading: `${days} days to JEE Main 2027.`,
      bodyHtml: `<p>${hi}</p>
        <p>Close counts fastest when you drill the right topics. Re-run your 2-minute diagnostic and see what's moved — and what still needs work.</p>
        <p>${button("Check my weak topics", `${APP_URL}/diagnostic`)}</p>`,
      footerNote: `You're getting JEE countdown nudges. <a href="${opts.unsubscribeUrl}" style="color:#9a9a9a;">Unsubscribe</a>.`,
    }),
    text: `${hi}\n\n${days} days to JEE Main 2027. Re-run your diagnostic: ${APP_URL}/diagnostic\n\nUnsubscribe: ${opts.unsubscribeUrl}`,
  };
}
