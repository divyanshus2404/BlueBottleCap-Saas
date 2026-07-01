import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { enforceRateLimit } from "@/src/lib/rateLimit";
import { isProductId } from "@/src/lib/razorpay";

export const runtime = "nodejs";

// Fire-and-forget notification endpoint the buy flow calls after Razorpay
// verifies a bundle purchase. Its only job is to alert the founder (via
// SMTP) so manual delivery can start within the 24h window promised on the
// landing page. If SMTP isn't configured, it logs the buyer details so we
// don't lose intel while waiting for the env vars to be set on Vercel.

type BundlePurchaseBody = {
  product?: string;
  buyerEmail?: string;
  buyerName?: string;
  buyerPhone?: string;
  paymentId?: string;
  orderId?: string;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 0);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !port || !user || !pass) return null;
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
}

export async function POST(req: Request) {
  const limited = enforceRateLimit(req, { limit: 5, windowMs: 60_000, prefix: "bundle-purchase" });
  if (limited) return limited;

  let body: BundlePurchaseBody;
  try {
    body = (await req.json()) as BundlePurchaseBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const product = (body.product || "").slice(0, 60);
  const buyerEmail = (body.buyerEmail || "").slice(0, 200);
  const buyerName = (body.buyerName || "").slice(0, 120);
  const buyerPhone = (body.buyerPhone || "").slice(0, 30);
  const paymentId = (body.paymentId || "").slice(0, 100);
  const orderId = (body.orderId || "").slice(0, 100);

  // Not a hard-fail — the endpoint is best-effort. But we reject clearly bad
  // product ids so the notification email isn't polluted with junk.
  if (!isProductId(product)) {
    console.warn("[bundle-purchase] unknown product id received:", product);
  }

  const transport = buildTransport();
  const to = process.env.BUNDLE_LEADS_TO || process.env.FEEDBACK_TO || process.env.SMTP_USER;

  if (!transport || !to) {
    console.warn("[bundle-purchase] SMTP not configured — logging only.");
    console.log("[bundle-purchase]", JSON.stringify({
      product,
      buyerNamePresent: Boolean(buyerName),
      buyerEmailPresent: Boolean(buyerEmail),
      buyerPhonePresent: Boolean(buyerPhone),
      paymentId,
      orderId,
    }));
    return NextResponse.json({ ok: true, delivery: "logged" });
  }

  const subject = `New bundle purchase — ${product}${buyerName ? ` (${buyerName})` : ""}`;

  try {
    await transport.sendMail({
      from: `BlueBottleCap Sales <${process.env.SMTP_USER}>`,
      to,
      replyTo: buyerEmail || undefined,
      subject,
      text:
        `BUNDLE PURCHASE — action required within 24h\n\n` +
        `Product:    ${product}\n` +
        `Buyer:      ${buyerName || "(not provided)"}\n` +
        `Email:      ${buyerEmail || "(not provided)"}\n` +
        `WhatsApp:   ${buyerPhone || "(not provided)"}\n` +
        `Payment ID: ${paymentId || "(none)"}\n` +
        `Order ID:   ${orderId || "(none)"}\n\n` +
        `Deliver the 10 mocks + solution keys + weak-topic map to the email above.\n`,
      html: `
        <div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:560px;margin:0 auto;">
          <h2 style="margin:0 0 4px;font-weight:600;">New bundle purchase</h2>
          <p style="margin:0 0 14px;color:#B54708;font-size:13px;">⚠️ Deliver mocks within 24 hours to fulfil the landing-page promise.</p>
          <table style="font-size:13.5px;color:#333;border-collapse:collapse;width:100%;">
            <tr><td style="padding:6px 10px 6px 0;color:#888;">Product</td><td style="font-weight:600;">${escapeHtml(product)}</td></tr>
            <tr><td style="padding:6px 10px 6px 0;color:#888;">Buyer</td><td>${escapeHtml(buyerName || "(not provided)")}</td></tr>
            <tr><td style="padding:6px 10px 6px 0;color:#888;">Email</td><td><a href="mailto:${escapeHtml(buyerEmail)}" style="color:#1B3FCB;">${escapeHtml(buyerEmail || "(not provided)")}</a></td></tr>
            <tr><td style="padding:6px 10px 6px 0;color:#888;">WhatsApp</td><td>${buyerPhone ? `<a href="https://wa.me/${escapeHtml(buyerPhone.replace(/[^\d+]/g, ""))}" style="color:#1B3FCB;">${escapeHtml(buyerPhone)}</a>` : "(not provided)"}</td></tr>
            <tr><td style="padding:6px 10px 6px 0;color:#888;">Payment ID</td><td style="font-family:ui-monospace,SFMono-Regular,monospace;font-size:12px;">${escapeHtml(paymentId || "(none)")}</td></tr>
            <tr><td style="padding:6px 10px 6px 0;color:#888;">Order ID</td><td style="font-family:ui-monospace,SFMono-Regular,monospace;font-size:12px;">${escapeHtml(orderId || "(none)")}</td></tr>
          </table>
        </div>
      `,
    });
  } catch (err) {
    console.error("[bundle-purchase] sendMail failed:", err);
    // Buyer already paid — we can't fail this. Log and move on.
    return NextResponse.json({ ok: true, delivery: "email_failed" });
  }

  return NextResponse.json({ ok: true, delivery: "email" });
}
