import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { enforceRateLimit } from "@/src/lib/rateLimit";

export const runtime = "nodejs";

type FeedbackBody = {
  message?: string;
  email?: string;
  userId?: string | null;
  path?: string;
  userAgent?: string;
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
  });
}

export async function POST(req: Request) {
  const limited = enforceRateLimit(req, { limit: 5, windowMs: 60_000, prefix: "feedback" });
  if (limited) return limited;

  let body: FeedbackBody;
  try {
    body = (await req.json()) as FeedbackBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const message = (body.message || "").trim();
  if (message.length < 3 || message.length > 4000) {
    return NextResponse.json({ error: "Message must be 3–4000 characters." }, { status: 400 });
  }

  const email = (body.email || "").trim().slice(0, 200) || null;
  const userId = (body.userId || null) as string | null;
  const path = (body.path || "").slice(0, 200);
  const userAgent = (body.userAgent || req.headers.get("user-agent") || "").slice(0, 300);

  const transport = buildTransport();
  const to = process.env.FEEDBACK_TO || process.env.SMTP_USER;

  if (!transport || !to) {
    // Email isn't configured. Log the feedback so it isn't lost while the
    // operator finishes wiring SMTP, and still return success to the client.
    console.warn("[feedback] SMTP not configured — logging only.");
    console.log("[feedback]", JSON.stringify({ message, email, userId, path, userAgent }));
    return NextResponse.json({ ok: true, delivery: "logged" });
  }

  const safeMessage = escapeHtml(message);
  const subject = `BlueBottleCap feedback${email ? ` — ${email}` : ""}`;

  try {
    await transport.sendMail({
      from: `BlueBottleCap Feedback <${process.env.SMTP_USER}>`,
      to,
      replyTo: email || undefined,
      subject,
      text:
        `Message:\n${message}\n\n` +
        `From:    ${email || "(anonymous)"}\n` +
        `UserId:  ${userId || "(none)"}\n` +
        `Path:    ${path || "(none)"}\n` +
        `UA:      ${userAgent || "(none)"}\n`,
      html: `
        <div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:560px;margin:0 auto;">
          <h2 style="margin:0 0 12px;font-weight:600;">New BlueBottleCap feedback</h2>
          <div style="background:#f5f4ef;border:1px solid #e5e2d6;border-radius:10px;padding:14px 16px;white-space:pre-wrap;font-size:14px;line-height:1.55;">${safeMessage}</div>
          <table style="margin-top:14px;font-size:12.5px;color:#555;border-collapse:collapse;">
            <tr><td style="padding:3px 10px 3px 0;color:#888;">From</td><td>${escapeHtml(email || "(anonymous)")}</td></tr>
            <tr><td style="padding:3px 10px 3px 0;color:#888;">UserId</td><td>${escapeHtml(userId || "(none)")}</td></tr>
            <tr><td style="padding:3px 10px 3px 0;color:#888;">Path</td><td>${escapeHtml(path || "(none)")}</td></tr>
            <tr><td style="padding:3px 10px 3px 0;color:#888;">UA</td><td style="color:#999;">${escapeHtml(userAgent || "(none)")}</td></tr>
          </table>
        </div>
      `,
    });
  } catch (err) {
    console.error("[feedback] sendMail failed:", err);
    return NextResponse.json({ error: "Failed to deliver feedback. Please try again." }, { status: 502 });
  }

  return NextResponse.json({ ok: true, delivery: "email" });
}
