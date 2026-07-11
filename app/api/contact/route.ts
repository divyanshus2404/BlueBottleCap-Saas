import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getRateLimiter, getClientIp } from '@/src/lib/rateLimit';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Stricter rate limit for email — 3 per hour per IP
const emailRateLimiter = getRateLimiter({ limit: 3, windowMs: 60 * 60 * 1000 });

interface ContactRequest {
  name: string;
  email: string;
  message: string;
}

function getTransporter() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const host = process.env.SMTP_HOST ?? 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT ?? '587', 10);

  if (!user || !pass) {
    throw new Error('SMTP credentials not configured.');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!emailRateLimiter.check(ip)) {
    return NextResponse.json({ error: 'Too many contact requests. Please try again later.' }, { status: 429 });
  }

  try {
    const body: ContactRequest = await req.json();
    const { name, email, message } = body;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Name, email, and message are required.' }, { status: 400 });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    const transporter = getTransporter();
    const toEmail = process.env.CONTACT_EMAIL ?? process.env.SMTP_USER!;

    await transporter.sendMail({
      from: `"BlueBottleCap Contact" <${process.env.SMTP_USER}>`,
      to: toEmail,
      replyTo: email,
      subject: `[BlueBottleCap] New message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#1e3a5f;">New Contact Message</h2>
          <table style="border-collapse:collapse;width:100%;">
            <tr><td style="padding:8px;font-weight:bold;color:#555;">Name</td><td style="padding:8px;">${escapeHtml(name)}</td></tr>
            <tr style="background:#f9f9f9;"><td style="padding:8px;font-weight:bold;color:#555;">Email</td><td style="padding:8px;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
          </table>
          <div style="margin-top:16px;padding:16px;background:#f0f4ff;border-radius:8px;">
            <p style="margin:0;white-space:pre-wrap;">${escapeHtml(message)}</p>
          </div>
          <p style="color:#999;font-size:12px;margin-top:24px;">Sent via BlueBottleCap contact form</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true, message: 'Your message has been sent!' });
  } catch (err: unknown) {
    console.error('[/api/contact]', err);
    const message = err instanceof Error ? err.message : '';
    if (message.includes('SMTP')) {
      return NextResponse.json({ error: 'Email service is not configured. Contact us directly.' }, { status: 503 });
    }
    return NextResponse.json({ error: 'Failed to send message. Please try again.' }, { status: 500 });
  }
}
