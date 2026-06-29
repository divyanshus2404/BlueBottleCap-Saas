import { NextResponse } from "next/server";
import { createRazorpayOrder, getRazorpayKeys, isProductId, PRODUCTS } from "@/src/lib/razorpay";
import { enforceRateLimit } from "@/src/lib/rateLimit";

export async function POST(req: Request) {
  const limited = enforceRateLimit(req, { limit: 10, windowMs: 60_000, prefix: "rzp-order" });
  if (limited) return limited;

  try {
    const body = await req.json().catch(() => ({}));
    const { product } = body as { product?: string };

    if (!isProductId(product)) {
      return NextResponse.json(
        { error: "Unknown product. Expected one of: " + Object.keys(PRODUCTS).join(", ") },
        { status: 400 },
      );
    }

    const { amount, label } = PRODUCTS[product];
    const { keyId } = getRazorpayKeys();
    const order = await createRazorpayOrder(amount, { product, label });

    return NextResponse.json({
      key_id: keyId,
      product,
      order: { id: order.id, amount: order.amount, currency: order.currency },
    });
  } catch (err: any) {
    console.error("create-order error:", err);
    const isConfig = err?.message?.includes("environment variables");
    return NextResponse.json(
      { error: isConfig ? "Payment gateway is not configured." : "Failed to create checkout order." },
      { status: isConfig ? 503 : 500 },
    );
  }
}
