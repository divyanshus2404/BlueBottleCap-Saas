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
  | "mock_generate_failed";

export function trackEvent(name: FunnelEvent, props: Record<string, string | number | null> = {}): void {
  try {
    if (typeof window === "undefined") return;

    const plausible = (window as any).plausible;
    if (typeof plausible === "function") {
      plausible(name, { props });
    }

    if (db) {
      addDoc(collection(db, "events"), {
        name,
        ...props,
        uid: auth?.currentUser?.uid || null,
        path: window.location.pathname,
        createdAt: new Date().toISOString(),
      }).catch(() => {
        // Swallow — rules may deny anonymous writes; checkout must proceed.
      });
    }
  } catch {
    // Never let analytics take down the purchase flow.
  }
}
