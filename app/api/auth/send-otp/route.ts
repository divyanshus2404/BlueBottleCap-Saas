import { NextResponse } from "next/server";
import { getAdmin } from "@/src/lib/firebaseAdmin";
import { sendEmail, validEmail, emailShell } from "@/src/lib/email";
import { enforceRateLimit } from "@/src/lib/rateLimit";

export const runtime = "nodejs";

function generateOtp(): string {
  const buf = new Uint32Array(1);
  require("crypto").getRandomValues(buf);
  return String(buf[0] % 1_000_000).padStart(6, "0");
}

export async function POST(req: Request) {
  const limited = enforceRateLimit(req, { limit: 5, windowMs: 300_000, prefix: "otp-send" });
  if (limited) return limited;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = validEmail((body as Record<string, unknown>).email);
  if (!email) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  const admin = getAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Auth service is not configured. Contact support." },
      { status: 503 }
    );
  }

  const otp = generateOtp();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  const docRef = admin.db.collection("otpCodes").doc(email);
  await docRef.set({ otp, expiresAt, attempts: 0, createdAt: Date.now() });

  const html = emailShell({
    heading: "Your verification code",
    bodyHtml: `
      <p>Use this code to sign in to BlueBottleCap:</p>
      <div style="margin:20px 0;text-align:center;">
        <span style="display:inline-block;letter-spacing:8px;font-size:32px;font-weight:800;color:#1B3FCB;background:#f0f4ff;padding:14px 28px;border-radius:12px;border:2px dashed #1B3FCB;">${otp}</span>
      </div>
      <p style="font-size:13px;color:#666;">This code expires in <strong>10 minutes</strong>. If you didn't request this, you can safely ignore this email.</p>
    `,
  });

  const result = await sendEmail({
    to: email,
    subject: `${otp} is your BlueBottleCap verification code`,
    html,
    text: `Your BlueBottleCap verification code is: ${otp}. It expires in 10 minutes.`,
  });

  if (!result.ok) {
    await docRef.delete();
    return NextResponse.json({ error: "Failed to send verification email." }, { status: 502 });
  }

  return NextResponse.json({ ok: true, delivery: result.delivery });
}
