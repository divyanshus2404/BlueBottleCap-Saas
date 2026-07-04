import { NextResponse } from "next/server";
import { verifyUnsubscribe } from "@/src/lib/cron";
import { getAdmin } from "@/src/lib/firebaseAdmin";

export const runtime = "nodejs";

// One-click unsubscribe from the signed link in nudge emails. GET so it works
// straight from an email client. The signature (HMAC of uid) prevents opting
// other users out. Records email_prefs/{uid}.optOut = true.

function page(title: string, body: string): NextResponse {
  const html = `<!doctype html><html><body style="margin:0;background:#f5f4ef;font-family:ui-sans-serif,system-ui,sans-serif;">
    <div style="max-width:460px;margin:80px auto;background:#fff;border:1px solid #e5e2d6;border-radius:14px;padding:32px;text-align:center;">
      <div style="height:5px;background:#1B3FCB;border-radius:3px;width:44px;margin:0 auto 20px;"></div>
      <h1 style="font-size:20px;color:#181A1F;margin:0 0 10px;">${title}</h1>
      <p style="font-size:14px;color:#555;line-height:1.6;margin:0;">${body}</p>
      <p style="margin-top:22px;"><a href="/" style="color:#1B3FCB;text-decoration:none;font-weight:600;">← Back to BlueBottleCap</a></p>
    </div></body></html>`;
  return new NextResponse(html, { status: 200, headers: { "Content-Type": "text/html" } });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const uid = url.searchParams.get("uid") || "";
  const sig = url.searchParams.get("sig") || "";

  if (!verifyUnsubscribe(uid, sig)) {
    return page("Invalid link", "This unsubscribe link is invalid or expired. If you keep getting emails, reply to any of them and we'll remove you.");
  }

  const admin = getAdmin();
  if (!admin) {
    return page("Unsubscribe pending", "We couldn't reach the mail preferences service right now. Please reply to any email to be removed and we'll handle it.");
  }

  try {
    await admin.db.collection("email_prefs").doc(uid).set({ optOut: true, optOutAt: new Date().toISOString() }, { merge: true });
    return page("You're unsubscribed", "You won't get JEE countdown nudges anymore. Transactional emails (like payment receipts) will still be sent.");
  } catch (err) {
    console.error("unsubscribe failed:", err);
    return page("Something went wrong", "We couldn't update your preferences. Please reply to any email to be removed.");
  }
}
