import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// In-memory OTP Store
// TODO(PRODUCTION): Replace this global Map with Upstash Redis or similar persistent KV store.
// In a serverless environment (like Vercel), this Map will reset on cold starts and won't be shared across edge nodes.
const otpStore = new Map<string, { otp: string; expires: number; lastSent: number }>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { channel, target } = body;

    if (!channel || !target || !['email', 'sms'].includes(channel)) {
      return NextResponse.json({ success: false, error: 'Invalid channel or target' }, { status: 400 });
    }

    // Rate Limiting (60 seconds)
    // TODO(PRODUCTION): Use @upstash/ratelimit for IP-based and target-based rate limiting
    const storeKey = `${channel}:${target}`;
    const existing = otpStore.get(storeKey);
    const now = Date.now();

    if (existing && now - existing.lastSent < 60000) {
      return NextResponse.json(
        { success: false, error: 'Please wait 60 seconds before requesting a new code.' },
        { status: 429 }
      );
    }

    // Generate cryptographically secure 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expires = now + 5 * 60 * 1000; // 5 minutes

    // Store OTP
    otpStore.set(storeKey, { otp, expires, lastSent: now });

    if (channel === 'email') {
      // Lazy-load Resend to avoid build errors if not installed/configured properly
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      const { error } = await resend.emails.send({
        from: 'VaultID <noreply@vaultid.dev>', // Replace with your verified domain
        to: target,
        subject: `Your verification code: ${otp}`,
        html: `
          <div style="font-family: sans-serif; text-align: center; padding: 40px; background-color: #f8f9fa;">
            <div style="max-width: 400px; margin: 0 auto; background: #fff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
              <h2 style="color: #1a1a2e; margin-bottom: 8px;">Verification Code</h2>
              <p style="color: #64748b; font-size: 14px; margin-bottom: 24px;">Enter the following code to verify your identity. Valid for 5 minutes.</p>
              <div style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #534AB7; background: rgba(83, 74, 183, 0.05); padding: 16px; border-radius: 8px;">
                ${otp}
              </div>
            </div>
          </div>
        `,
      });

      if (error) {
        console.error('Resend Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to send email' }, { status: 500 });
      }

    } else if (channel === 'sms') {
      // Lazy-load Twilio
      const twilio = (await import('twilio')).default;
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

      try {
        await client.messages.create({
          body: `Your VaultID verification code is ${otp}. Valid for 5 minutes. Do not share it.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: target,
        });
      } catch (error) {
        console.error('Twilio Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to send SMS' }, { status: 500 });
      }
    }

    // Since we are not using a real DB in this example, we need to export the store 
    // so verify-otp can read it if they are on the same server instance.
    // In Next.js App Router, global variables sometimes get cleared between hot reloads in dev.
    // We attach it to globalThis as a hack for dev, but Redis is mandatory for production.
    (globalThis as any).__OTP_STORE = otpStore;

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error('Send OTP Error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
