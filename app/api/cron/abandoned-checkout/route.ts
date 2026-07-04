import { NextResponse } from "next/server";
import { isAuthorizedCron } from "@/src/lib/cron";
import { getAdmin } from "@/src/lib/firebaseAdmin";
import { sendEmail } from "@/src/lib/email";
import { abandonedCheckoutEmail } from "@/src/lib/emailTemplates";
import { PRODUCTS, isProductId } from "@/src/lib/razorpay";

export const runtime = "nodejs";
export const maxDuration = 60;

// Emails logged-in users who opened checkout ≥1h ago but never paid.
// Reads the funnel `events` collection (checkout_opened vs payment_success),
// dedupes against `abandoned_sent`, and resolves emails via admin auth.
// Uses single-field equality queries only, so no composite index is needed.

const HOUR = 3_600_000;

export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const admin = getAdmin();
  if (!admin) return NextResponse.json({ ok: true, skipped: "no-admin" });

  const now = Date.now();
  // Chase checkouts from the last 24h that are at least 1h old.
  const windowStart = new Date(now - 24 * HOUR).toISOString();
  const oneHourAgo = now - HOUR;

  try {
    const [openedSnap, paidSnap] = await Promise.all([
      admin.db.collection("events").where("name", "==", "checkout_opened").limit(1000).get(),
      admin.db.collection("events").where("name", "==", "payment_success").limit(1000).get(),
    ]);

    // uid:product pairs that succeeded — these are not abandoned.
    const paid = new Set<string>();
    paidSnap.forEach((d) => { const x = d.data(); if (x.uid) paid.add(`${x.uid}:${x.product}`); });

    // Latest qualifying checkout_opened per uid:product.
    const candidates = new Map<string, { uid: string; product: string; at: string }>();
    openedSnap.forEach((d) => {
      const x = d.data();
      if (!x.uid || !x.product || typeof x.createdAt !== "string") return;
      if (x.createdAt < windowStart) return;                 // too old
      if (new Date(x.createdAt).getTime() > oneHourAgo) return; // too fresh, still deciding
      const key = `${x.uid}:${x.product}`;
      if (paid.has(key)) return;                              // already converted
      const prev = candidates.get(key);
      if (!prev || x.createdAt > prev.at) candidates.set(key, { uid: x.uid, product: x.product, at: x.createdAt });
    });

    let sent = 0, skipped = 0;
    for (const [key, c] of candidates) {
      if (!isProductId(c.product)) { skipped++; continue; }
      // Dedupe: one recovery email per uid:product ever (id is deterministic).
      const markerId = key.replace(/[^\w:-]/g, "_");
      const markerRef = admin.db.collection("abandoned_sent").doc(markerId);
      if ((await markerRef.get()).exists) { skipped++; continue; }

      let email: string | null = null;
      try { email = (await admin.auth.getUser(c.uid)).email ?? null; } catch { email = null; }
      if (!email) { skipped++; continue; }

      const { subject, html, text } = abandonedCheckoutEmail({ productLabel: PRODUCTS[c.product].label, product: c.product });
      const res = await sendEmail({ to: email, subject, html, text });
      await markerRef.set({ uid: c.uid, product: c.product, sentAt: new Date().toISOString(), delivery: res.delivery });
      if (res.ok) sent++; else skipped++;
    }

    return NextResponse.json({ ok: true, candidates: candidates.size, sent, skipped });
  } catch (err) {
    console.error("abandoned-checkout cron failed:", err);
    return NextResponse.json({ error: "Cron failed." }, { status: 500 });
  }
}
