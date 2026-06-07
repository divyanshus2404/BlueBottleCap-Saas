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

let app: FirebaseApp | undefined;
try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
} catch (error) {
  console.warn("Firebase initialization skipped (expected during SSR/build without env vars).");
}

export const auth = typeof window !== "undefined" && app ? getAuth(app) : null as unknown as Auth;
export const googleProvider = typeof window !== "undefined" ? new GoogleAuthProvider() : null as unknown as GoogleAuthProvider;
export const db = typeof window !== "undefined" && app ? getFirestore(app) : null as unknown as Firestore;
