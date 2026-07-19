import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { enforceRateLimit } from "@/src/lib/rateLimit";

export const runtime = "nodejs";

type LeadBody = {
  instituteName?: string;
  contactName?: string;
  whatsapp?: string;
  city?: string;
  expectedSeats?: string;
  message?: string;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Accepts +91 followed by 10 digits, or a bare 10-digit Indian mobile, or
// generic international with digits/dashes/spaces/parens. Strict enough to
// reject spam junk but lenient about formatting.
const PHONE_RE = /^[+\d][\d\s\-()]{7,20}$/;
function validPhone(s: unknown): string | null {
  if (typeof s !== "string") return null;
  const trimmed = s.trim();
  if (!trimmed || trimmed.length > 30) return null;
  return PHONE_RE.test(trimmed) ? trimmed : null;
}

function trimmedString(s: unknown, maxLen: number): string {
  if (typeof s !== "string") return "";
  return s.trim().slice(0, maxLen);
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
  // Lower limit than feedback — institute leads are higher-value and shouldn't
  // fire more than a handful of times per minute per IP.
  const limited = enforceRateLimit(req, { limit: 3, windowMs: 60_000, prefix: "institute-lead" });
  if (limited) return limited;

  let body: LeadBody;
  try {
    body = (await req.json()) as LeadBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const instituteName = trimmedString(body.instituteName, 200);
  const contactName = trimmedString(body.contactName, 120);
  const whatsapp = validPhone(body.whatsapp);
  const city = trimmedString(body.city, 80);
  const expectedSeats = trimmedString(body.expectedSeats, 40);
  const message = trimmedString(body.message, 2000);

  if (!instituteName) {
    return NextResponse.json({ error: "Institute name is required." }, { status: 400 });
  }
  if (!contactName) {
    return NextResponse.json({ error: "Contact name is required." }, { status: 400 });
  }
  if (!whatsapp) {
    return NextResponse.json({ error: "A valid WhatsApp number is required." }, { status: 400 });
  }

  const transport = buildTransport();
  // Route institute leads to INSTITUTE_LEADS_TO if configured, otherwise fall
  // back to FEEDBACK_TO or the SMTP account owner.
  const to = process.env.INSTITUTE_LEADS_TO || process.env.FEEDBACK_TO || process.env.SMTP_USER;

  if (!transport || !to) {
    // No SMTP yet. Log presence flags only (PII redacted) so we know a lead
    // came in and can wire SMTP without losing intel. Set
    // INSTITUTE_LEADS_DEBUG=1 briefly if you need to inspect the payload.
    console.warn("[institute-lead] SMTP not configured — logging only.");
    if (process.env.INSTITUTE_LEADS_DEBUG === "1") {
      console.log("[institute-lead:debug]", JSON.stringify({ instituteName, contactName, whatsapp, city, expectedSeats, message }));
    } else {
      console.log("[institute-lead]", JSON.stringify({
        hasInstitute: Boolean(instituteName),
        hasName: Boolean(contactName),
        hasPhone: Boolean(whatsapp),
        hasCity: Boolean(city),
        seatsBand: expectedSeats || "(none)",
        messageLength: message.length,
      }));
    }
    return NextResponse.json({ ok: true, delivery: "logged" });
  }

  const subject = `New institute lead — ${instituteName}${city ? ` (${city})` : ""}`;

  try {
    await transport.sendMail({
      from: `BlueBottleCap Institutes <${process.env.SMTP_USER}>`,
      to,
      subject,
      text:
        `INSTITUTE LEAD\n\n` +
        `Institute:  ${instituteName}\n` +
        `Contact:    ${contactName}\n` +
        `WhatsApp:   ${whatsapp}\n` +
        `City:       ${city || "(not provided)"}\n` +
        `Seats:      ${expectedSeats || "(not provided)"}\n\n` +
        `Message:\n${message || "(none)"}\n`,
      html: `
        <div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:560px;margin:0 auto;">
          <h2 style="margin:0 0 12px;font-weight:600;">New institute lead</h2>
          <table style="font-size:13.5px;color:#333;border-collapse:collapse;width:100%;">
            <tr><td style="padding:6px 10px 6px 0;color:#888;">Institute</td><td style="font-weight:600;">${escapeHtml(instituteName)}</td></tr>
            <tr><td style="padding:6px 10px 6px 0;color:#888;">Contact</td><td>${escapeHtml(contactName)}</td></tr>
            <tr><td style="padding:6px 10px 6px 0;color:#888;">WhatsApp</td><td>
              <a href="https://wa.me/${escapeHtml(whatsapp.replace(/[^\d+]/g, ""))}" style="color:#1B3FCB;">${escapeHtml(whatsapp)}</a>
            </td></tr>
            <tr><td style="padding:6px 10px 6px 0;color:#888;">City</td><td>${escapeHtml(city || "(not provided)")}</td></tr>
            <tr><td style="padding:6px 10px 6px 0;color:#888;">Seats</td><td>${escapeHtml(expectedSeats || "(not provided)")}</td></tr>
          </table>
          ${message ? `<div style="margin-top:14px;background:#f5f4ef;border:1px solid #e5e2d6;border-radius:10px;padding:14px 16px;white-space:pre-wrap;font-size:13.5px;line-height:1.55;">${escapeHtml(message)}</div>` : ""}
        </div>
      `,
    });
  } catch (err) {
    console.error("[institute-lead] sendMail failed:", err);
    return NextResponse.json({ error: "Could not send. Please email support@bluebottlecap.com directly." }, { status: 502 });
  }

  return NextResponse.json({ ok: true, delivery: "email" });
}
