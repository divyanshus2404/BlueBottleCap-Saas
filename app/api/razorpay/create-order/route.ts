import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

// Lazily instantiate so missing env vars only error at request time, not build time
function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials are not configured.');
  }
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export async function POST(req: Request) {
  try {
    const { amount } = await req.json();
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount.' }, { status: 400 });
    }

    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: Math.round(amount), // paise, must be integer
      currency: 'INR',
      receipt: `bbc_${Date.now()}`,
    });

    return NextResponse.json({
      order,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err: unknown) {
    console.error('[/api/razorpay/create-order]', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message.includes('credentials')) {
      return NextResponse.json(
        { error: 'Payment service is not configured. Contact support.' },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: 'Failed to create payment order.' }, { status: 500 });
  }
}
