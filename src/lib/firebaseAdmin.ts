// Server-side Firebase (firebase-admin). Used by API routes to persist
// purchases so entitlements survive a localStorage wipe and cannot be
// forged client-side.
//
// Configuration: set FIREBASE_SERVICE_ACCOUNT_JSON to the full JSON of a
// service-account key (Firebase console → Project settings → Service
// accounts → Generate new private key). On Vercel, paste it as a single-
// line env var. If unset, getAdmin() returns null and callers degrade to
// the previous client-side-only behaviour instead of failing checkout.

import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";

let cachedApp: App | null | undefined;

function getApp(): App | null {
  if (cachedApp !== undefined) return cachedApp;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    console.warn("FIREBASE_SERVICE_ACCOUNT_JSON not set — purchases will not be persisted server-side.");
    cachedApp = null;
    return cachedApp;
  }
  try {
    const creds = JSON.parse(raw);
    cachedApp = getApps()[0] ?? initializeApp({ credential: cert(creds) });
  } catch (err) {
    console.error("firebase-admin init failed:", err);
    cachedApp = null;
  }
  return cachedApp;
}

export function getAdmin(): { db: Firestore; auth: Auth } | null {
  const app = getApp();
  if (!app) return null;
  return { db: getFirestore(app), auth: getAuth(app) };
}
