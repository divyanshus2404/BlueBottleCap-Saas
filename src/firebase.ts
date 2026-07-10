import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const isConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let app: FirebaseApp | undefined;
if (isConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  } catch (error) {
    console.warn("Firebase initialization failed:", error);
  }
} else if (typeof window !== "undefined") {
  console.warn(
    "Firebase env vars are missing — auth and Firestore features are disabled. " +
    "Set NEXT_PUBLIC_FIREBASE_* to enable them.",
  );
}

// getAuth/getFirestore throw on an invalid config, which would white-screen the
// entire app at module load. Guard them so the UI still renders without Firebase.
function safeAuth(): Auth | null {
  if (typeof window === "undefined" || !app) return null;
  try {
    return getAuth(app);
  } catch (error) {
    console.warn("getAuth failed:", error);
    return null;
  }
}

function safeDb(): Firestore | null {
  if (typeof window === "undefined" || !app) return null;
  try {
    return getFirestore(app);
  } catch (error) {
    console.warn("getFirestore failed:", error);
    return null;
  }
}

export const auth = safeAuth();
export const googleProvider = typeof window !== "undefined" ? new GoogleAuthProvider() : null;
export const db = safeDb();
