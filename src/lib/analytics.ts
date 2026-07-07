// Lightweight revenue/funnel event tracking. Events land in the Firestore
// `events` collection (queryable for conversion analysis) and mirror to
// Plausible custom events when the script is loaded, so both dashboards
// see the same funnel without a third-party SDK.
//
// Fire-and-forget by design: analytics must never block or break checkout.

import { db, auth } from "../firebase";
import { addDoc, collection } from "firebase/firestore";

export type FunnelEvent =
  | "checkout_opened"
  | "checkout_dismissed"
  | "payment_success"
  | "payment_failed"
  | "free_streak_save_used"
  | "streak_banner_shown"
  | "mock_generate_started"
  | "mock_generate_success"
  | "mock_generate_failed"
  | "test_started"
  | "test_completed"
  | "flashcard_reviewed"
  | "study_session_completed"
  | "share_clicked"
  | "pwa_install_accepted"
  | "blog_post_read"
  | "question_attempted"
  | "pyq_paper_opened"
  | "tool_used";

export function trackEvent(name: FunnelEvent, props: Record<string, string | number | null> = {}): void {
  try {
    if (typeof window === "undefined") return;

    const plausible = (window as any).plausible;
    if (typeof plausible === "function") {
      plausible(name, { props });
    }

    // Vercel Analytics custom events
    if (typeof (window as any).va === "function") {
      (window as any).va("event", { name, ...props });
    }

    if (db) {
      addDoc(collection(db, "events"), {
        name,
        ...props,
        uid: auth?.currentUser?.uid || null,
        path: window.location.pathname,
        createdAt: new Date().toISOString(),
      }).catch(() => {});
    }

    // Local event log for debugging and on-device analytics
    const key = "bbc_events";
    const events = JSON.parse(localStorage.getItem(key) || "[]");
    events.push({ name, ts: new Date().toISOString(), props });
    if (events.length > 500) events.splice(0, events.length - 500);
    localStorage.setItem(key, JSON.stringify(events));
  } catch {
    // Never let analytics break the app.
  }
}

export function getEventCount(name: string, sinceDaysAgo = 7): number {
  if (typeof window === "undefined") return 0;
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - sinceDaysAgo);
    const cutoffStr = cutoff.toISOString();
    const events: Array<{ name: string; ts: string }> = JSON.parse(localStorage.getItem("bbc_events") || "[]");
    return events.filter((e) => e.name === name && e.ts >= cutoffStr).length;
  } catch {
    return 0;
  }
}
