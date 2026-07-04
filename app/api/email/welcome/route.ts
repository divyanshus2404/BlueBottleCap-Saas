import { NextResponse } from "next/server";
import { enforceRateLimit } from "@/src/lib/rateLimit";
import { sendEmail, validEmail } from "@/src/lib/email";
import { welcomeEmail } from "@/src/lib/emailTemplates";

// Fire-and-forget welcome email, called by the client right after signup.
// Graceful without SMTP (delivery:"logged"). Not security-sensitive — it
// only ever sends the same generic welcome to whatever address is given,
// so there's nothing to leak, and rate-limiting caps abuse.

export const runtime = "nodejs";

export async function POST(req: Request) {
  const limited = enforceRateLimit(req, { limit: 5, windowMs: 60_000, prefix: "email-welcome" });
  if (limited) return limited;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const to = validEmail(body.email);
  if (!to) return NextResponse.json({ error: "A valid email is required." }, { status: 400 });

  const { subject, html, text } = welcomeEmail(typeof body.name === "string" ? body.name : undefined);
  const result = await sendEmail({ to, subject, html, text });
  return NextResponse.json({ ok: result.ok, delivery: result.delivery });
}
