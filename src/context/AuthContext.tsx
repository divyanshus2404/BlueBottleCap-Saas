"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  signInWithPopup,
  updateProfile,
  sendEmailVerification,
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

function setSessionCookies(user: User) {
  const maxAge = 60 * 60 * 24 * 7; // 7 days
  document.cookie = `__session=${user.uid}; path=/; max-age=${maxAge}; SameSite=Lax`;
  document.cookie = `__email_verified=${user.emailVerified}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function clearSessionCookies() {
  document.cookie = "__session=; path=/; max-age=0";
  document.cookie = "__email_verified=; path=/; max-age=0";
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialised, setInitialised] = useState(false);

  const signUp = async (email: string, password: string, name?: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (name && userCredential.user) {
      await updateProfile(userCredential.user, { displayName: name });
    }
    // Send verification email immediately after sign-up
    await sendEmailVerification(userCredential.user);
    setSessionCookies(userCredential.user);
  };

  const signIn = async (email: string, password: string) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    setSessionCookies(credential.user);
  };

  const signInWithGoogle = async () => {
    const credential = await signInWithPopup(auth, googleProvider);
    // Google accounts are pre-verified
    setSessionCookies(credential.user);
  };

  const signOutUser = async () => {
    // Wipe local storage to prevent data bleeding between accounts
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith("bluebottlecap_")) {
        localStorage.removeItem(key);
      }
    }
    clearSessionCookies();
    return signOut(auth);
  };

  const resetPassword = (email: string) => {
    return sendPasswordResetEmail(auth, email);
  };

  const resendVerificationEmail = async () => {
    if (!auth.currentUser) throw new Error("No user is signed in.");
    await sendEmailVerification(auth.currentUser);
  };

  useEffect(() => {
    let unsubProfile: (() => void) | undefined;

    if (!auth) {
      setInitialised(true);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);

      if (user) {
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
