import { NextResponse } from 'next/server';
import { PRODUCTS, isProductId, createRazorpayOrder, getRazorpayKeys } from '@/src/lib/razorpay';
import { getRateLimiter, getClientIp } from '@/src/lib/rateLimit';

// Rate limit: 10 order-creation attempts per minute per IP
const orderRateLimiter = getRateLimiter({ limit: 10, windowMs: 60_000 });

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!orderRateLimiter.check(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait before trying again.' },
      { status: 429 }
    );
  }

  try {
    const { productId, userId } = await req.json();

    // Validate the product ID — price is NEVER accepted from the client
    if (!productId || !isProductId(productId)) {
      return NextResponse.json(
        { error: 'Invalid product. Please select a valid plan.' },
        { status: 400 }
      );
    }

    const product = PRODUCTS[productId];
    const { keyId } = getRazorpayKeys();

    // Store productId and userId in Razorpay order notes so the verify
    // endpoint can derive the plan server-side without trusting the client.
    const order = await createRazorpayOrder(product.amount, {
      productId,
      ...(userId ? { userId: String(userId).slice(0, 128) } : {}),
    });

    return NextResponse.json({
      order,
      key_id: keyId,
    });
  } catch (err: unknown) {
    console.error('[/api/razorpay/create-order]', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message.includes('RAZORPAY') || message.includes('credentials') || message.includes('configured')) {
      return NextResponse.json(
        { error: 'Payment service is not configured. Contact support.' },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: 'Failed to create payment order.' }, { status: 500 });
  }
}
