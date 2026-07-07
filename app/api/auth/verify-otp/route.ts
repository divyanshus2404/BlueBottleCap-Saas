import { NextResponse } from "next/server";
import { getAdmin } from "@/src/lib/firebaseAdmin";
import { validEmail } from "@/src/lib/email";
import { enforceRateLimit } from "@/src/lib/rateLimit";

export const runtime = "nodejs";

const MAX_ATTEMPTS = 5;

export async function POST(req: Request) {
  const limited = enforceRateLimit(req, { limit: 10, windowMs: 300_000, prefix: "otp-verify" });
  if (limited) return limited;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const email = validEmail(body.email);
  const code = typeof body.code === "string" ? body.code.trim() : "";
  if (!email || !code || code.length !== 6) {
    return NextResponse.json({ error: "Email and 6-digit code are required." }, { status: 400 });
  }

  const admin = getAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Auth service is not configured." }, { status: 503 });
  }

  const docRef = admin.db.collection("otpCodes").doc(email);
  const snap = await docRef.get();

  if (!snap.exists) {
    return NextResponse.json({ error: "No code was sent to this email. Request a new one." }, { status: 400 });
  }

  const data = snap.data()!;

  if (data.attempts >= MAX_ATTEMPTS) {
    await docRef.delete();
    return NextResponse.json({ error: "Too many wrong attempts. Request a new code." }, { status: 429 });
  }

  if (Date.now() > data.expiresAt) {
    await docRef.delete();
    return NextResponse.json({ error: "Code expired. Request a new one." }, { status: 400 });
  }

  if (data.otp !== code) {
    await docRef.update({ attempts: (data.attempts || 0) + 1 });
    const remaining = MAX_ATTEMPTS - (data.attempts + 1);
    return NextResponse.json(
      { error: `Incorrect code. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.` },
      { status: 400 }
    );
  }

  // OTP is correct — clean up
  await docRef.delete();

  // Get or create the Firebase user
  let uid: string;
  try {
    const existing = await admin.auth.getUserByEmail(email);
    uid = existing.uid;
    // Mark email as verified if not already
    if (!existing.emailVerified) {
      await admin.auth.updateUser(uid, { emailVerified: true });
    }
  } catch (err: any) {
    if (err.code === "auth/user-not-found") {
      const created = await admin.auth.createUser({
        email,
        emailVerified: true,
      });
      uid = created.uid;
      // Create Firestore user doc
      await admin.db.collection("users").doc(uid).set({
        email,
        createdAt: new Date().toISOString(),
        activePlan: "Free",
        creditsLeft: 25,
        creditsRemaining: 25,
      });
    } else {
      console.error("[verify-otp] getUserByEmail error:", err);
      return NextResponse.json({ error: "Authentication failed." }, { status: 500 });
    }
  }

  // Create a custom token the client can exchange for a full session
  const customToken = await admin.auth.createCustomToken(uid);

  return NextResponse.json({ ok: true, customToken });
}
