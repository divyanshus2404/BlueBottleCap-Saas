import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { channel, target, otp } = body;

    if (!channel || !target || !otp) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const storeKey = `${channel}:${target}`;
    
    // Retrieve the shared store (Hack for local dev without Redis)
    const otpStore = (globalThis as any).__OTP_STORE as Map<string, { otp: string; expires: number; lastSent: number }> | undefined;
    
    if (!otpStore) {
      return NextResponse.json({ success: false, error: 'OTP store not initialized. Request a new code.' }, { status: 500 });
    }

    const record = otpStore.get(storeKey);

    if (!record) {
      return NextResponse.json({ success: false, error: 'No verification code found. Please request a new one.' }, { status: 400 });
    }

    if (Date.now() > record.expires) {
      otpStore.delete(storeKey);
      return NextResponse.json({ success: false, error: 'Verification code expired. Please request a new one.' }, { status: 400 });
    }

    // Constant-time comparison to prevent timing attacks
    // Both buffers must be exactly the same length
    const inputBuffer = Buffer.from(otp.toString().padStart(6, '0'));
    const recordBuffer = Buffer.from(record.otp.toString().padStart(6, '0'));

    if (inputBuffer.length !== recordBuffer.length || !crypto.timingSafeEqual(inputBuffer, recordBuffer)) {
      return NextResponse.json({ success: false, error: 'Invalid verification code.' }, { status: 400 });
    }

    // Success! Delete the OTP record so it cannot be reused (Single Use)
    otpStore.delete(storeKey);

    // Generate Session Token (HMAC-SHA256 signed with OTP_SECRET)
    const secret = process.env.OTP_SECRET || 'fallback_secret_do_not_use_in_prod';
    const payload = JSON.stringify({ target, channel, verifiedAt: Date.now() });
    
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload);
    const signature = hmac.digest('hex');
    
    // Base64 encode the payload and append the signature
    const token = `${Buffer.from(payload).toString('base64')}.${signature}`;

    // Set HTTP-Only Cookie
    cookies().set({
      name: 'session_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return NextResponse.json({ success: true, token });

  } catch (err: any) {
    console.error('Verify OTP Error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
