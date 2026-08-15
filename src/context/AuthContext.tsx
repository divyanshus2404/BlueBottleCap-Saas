"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onIdTokenChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  signInWithPopup,
  updateProfile,
  sendEmailVerification,
  signInWithCustomToken,
  reload,
} from "firebase/auth";
import { auth, googleProvider, db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";

export interface UserProfile {
  avatarSvg?: string;
  displayName?: string;
  email?: string;
  name?: string;
  onboardingComplete?: boolean;
  photoURL?: string;
  [key: string]: unknown;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  /** True once Firebase has resolved auth state on initial load */
  initialised: boolean;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithToken: (token: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}

// ── Cookie helpers ──
// The middleware reads these lightweight cookies to protect routes at the
// Edge before any React code runs. They are NOT a security boundary — the
// real security lives in Firestore Security Rules. They exist solely to
// prevent unauthenticated page renders.

async function setSessionCookies(user: User) {
  try {
    const token = await user.getIdToken();
    const maxAge = 60 * 60 * 24 * 7; // 7 days (middleware will keep them logged in, frontend will refresh token on load)
    const secure = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `__session=${token}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
  } catch (err) {
    console.error("Failed to set session cookie", err);
  }
}

function clearSessionCookies() {
  document.cookie = "__session=; path=/; max-age=0; SameSite=Lax";
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialised, setInitialised] = useState(false);

  const signUp = async (email: string, password: string, name?: string) => {
    if (!auth) throw new Error("Auth not initialized");
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (name && userCredential.user) {
      await updateProfile(userCredential.user, { displayName: name });
    }
    // Send verification email immediately after sign-up
    await sendEmailVerification(userCredential.user);
    await setSessionCookies(userCredential.user);
  };

  const signIn = async (email: string, password: string) => {
    if (!auth) throw new Error("Auth not initialized");
    const credential = await signInWithEmailAndPassword(auth, email, password);
    await setSessionCookies(credential.user);
  };

  const signInWithGoogle = async () => {
    if (!auth || !googleProvider) throw new Error("Auth not initialized");
    const credential = await signInWithPopup(auth, googleProvider);
    await setSessionCookies(credential.user);
  };

  const signInWithToken = async (token: string) => {
    if (!auth) throw new Error("Auth not initialized");
    const credential = await signInWithCustomToken(auth, token);
    await setSessionCookies(credential.user);
  };

  const signOutUser = async () => {
    // Wipe local storage to prevent data bleeding between accounts
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith("bluebottlecap_")) {
        localStorage.removeItem(key);
      }
    }
    clearSessionCookies();
    if (!auth) throw new Error("Auth not initialized");
    return signOut(auth);
  };

  const resetPassword = (email: string) => {
    if (!auth) throw new Error("Auth not initialized");
    return sendPasswordResetEmail(auth, email);
  };

  const resendVerificationEmail = async () => {
    if (!auth || !auth.currentUser) throw new Error("No user is signed in.");
    await sendEmailVerification(auth.currentUser);
  };

  useEffect(() => {
    let unsubProfile: (() => void) | undefined;

    if (!auth) {
      setLoading(false);
      setInitialised(true);
      return;
    }
    const unsubscribe = onIdTokenChanged(auth, (user) => {
      setCurrentUser(user);

      if (user && db) {
        // Keep session cookies fresh on every auth state change
        if (typeof document !== "undefined") {
          setSessionCookies(user);
        }

        const userRef = doc(db, "users", user.uid);
        unsubProfile = onSnapshot(userRef, (snap) => {
          if (snap.exists()) {
            setUserProfile(snap.data() as UserProfile);
          } else {
            setUserProfile(null);
          }
        });
      } else {
        setUserProfile(null);
        if (typeof document !== "undefined") {
          clearSessionCookies();
        }
        if (unsubProfile) unsubProfile();
      }

      setLoading(false);
      setInitialised(true);
    });

    return () => {
      unsubscribe();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    initialised,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithToken,
    signOutUser,
    resetPassword,
    resendVerificationEmail,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
