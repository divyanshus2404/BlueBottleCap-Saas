// Shared email infrastructure for transactional + lifecycle mail. Wraps the
// same nodemailer SMTP setup used by /api/feedback, adds a branded HTML shell,
// and degrades gracefully: if SMTP isn't configured, sendEmail() logs and
// reports delivery:"logged" instead of throwing, so no caller ever breaks.

import nodemailer from "nodemailer";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validEmail(s: unknown): string | null {
  if (typeof s !== "string") return null;
  const t = s.trim();
  return t && EMAIL_RE.test(t) && t.length <= 200 ? t : null;
}

export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function buildTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 0);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !port || !user || !pass) return null;
  return nodemailer.createTransport({
    host, port, secure: port === 465, auth: { user, pass },
    connectionTimeout: 10_000, greetingTimeout: 10_000, socketTimeout: 20_000,
  });
}

export function isEmailConfigured(): boolean {
  return buildTransport() !== null;
}

const APP_URL = (process.env.APP_URL || "https://bluebottlecap.com").replace(/\/$/, "");

/** Branded, email-client-safe HTML shell (inline styles, table-free body). */
export function emailShell(opts: { heading: string; bodyHtml: string; footerNote?: string }): string {
  return `<!doctype html><html><body style="margin:0;background:#f5f4ef;padding:28px 0;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e5e2d6;border-radius:14px;overflow:hidden;">
    <div style="height:5px;background:#1B3FCB;"></div>
    <div style="padding:28px 30px;">
      <div style="font-size:15px;font-weight:700;color:#181A1F;">BlueBottleCap</div>
      <h1 style="margin:18px 0 12px;font-size:22px;line-height:1.25;color:#181A1F;font-weight:700;">${opts.heading}</h1>
      <div style="font-size:14.5px;line-height:1.6;color:#3a3d42;">${opts.bodyHtml}</div>
    </div>
    <div style="padding:16px 30px;border-top:1px solid #eee;font-size:11.5px;color:#9a9a9a;">
      ${opts.footerNote || `You're receiving this because you have a BlueBottleCap account.`}
      <br/><a href="${APP_URL}" style="color:#1B3FCB;text-decoration:none;">bluebottlecap.com</a>
    </div>
  </div>
</body></html>`;
}

export function button(label: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;margin:8px 0;background:#1B3FCB;color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:11px 22px;border-radius:9px;">${label}</a>`;
}

export interface SendResult { ok: boolean; delivery: "email" | "logged" | "error" }

export async function sendEmail(opts: { to: string; subject: string; html: string; text?: string; replyTo?: string }): Promise<SendResult> {
  const to = validEmail(opts.to);
  if (!to) return { ok: false, delivery: "error" };

  const transport = buildTransport();
  if (!transport) {
    console.warn(`[email] SMTP not configured — would send "${opts.subject}" to ${to}`);
    return { ok: true, delivery: "logged" };
  }
  try {
    await transport.sendMail({
      from: `BlueBottleCap <${process.env.SMTP_USER}>`,
      to,
      replyTo: opts.replyTo,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
    });
    return { ok: true, delivery: "email" };
  } catch (err) {
    console.error("[email] sendMail failed:", err);
    return { ok: false, delivery: "error" };
  }
}

export { APP_URL };
