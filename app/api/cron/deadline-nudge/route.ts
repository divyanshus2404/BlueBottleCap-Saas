import { NextResponse } from "next/server";
import { isAuthorizedCron, unsubscribeToken } from "@/src/lib/cron";
import { getAdmin } from "@/src/lib/firebaseAdmin";
import { sendEmail, APP_URL } from "@/src/lib/email";
import { deadlineNudgeEmail } from "@/src/lib/emailTemplates";

export const runtime = "nodejs";
export const maxDuration = 60;

// Sends the "X days to JEE" nudge to all users who haven't opted out.
// Opt-outs are loaded in one query into a Set; each email carries a signed
// unsubscribe link. Capped per run so a huge list can't blow the timeout —
// re-runs continue where dedupe/scheduling leaves off.

export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const admin = getAdmin();
  if (!admin) return NextResponse.json({ ok: true, skipped: "no-admin" });

  try {
    // Opted-out uids in one read.
    const optSnap = await admin.db.collection("email_prefs").where("optOut", "==", true).get();
    const optedOut = new Set<string>(optSnap.docs.map((d) => d.id));

    let sent = 0, skipped = 0, scanned = 0;
    const MAX_PER_RUN = 400;
    let pageToken: string | undefined;

    outer: do {
      const list = await admin.auth.listUsers(1000, pageToken);
      pageToken = list.pageToken;
      for (const u of list.users) {
        scanned++;
        if (!u.email || optedOut.has(u.uid)) { skipped++; continue; }
        const sig = unsubscribeToken(u.uid);
        const unsubscribeUrl = `${APP_URL}/api/email/unsubscribe?uid=${encodeURIComponent(u.uid)}&sig=${sig}`;
        const { subject, html, text } = deadlineNudgeEmail({ name: u.displayName, unsubscribeUrl });
        const res = await sendEmail({ to: u.email, subject, html, text });
        if (res.ok) sent++; else skipped++;
        if (sent >= MAX_PER_RUN) break outer;
      }
    } while (pageToken);

    return NextResponse.json({ ok: true, scanned, sent, skipped });
  } catch (err) {
    console.error("deadline-nudge cron failed:", err);
    return NextResponse.json({ error: "Cron failed." }, { status: 500 });
  }
}
