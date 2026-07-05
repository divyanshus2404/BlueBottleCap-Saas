import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'BlueBottleCap backend is active',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? '0.1.0',
    services: {
      gemini: !!process.env.GEMINI_API_KEY,
      razorpay: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
      firebase: !!(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
    },
  });
}
