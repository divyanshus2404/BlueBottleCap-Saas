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
  updateProfile
} from "firebase/auth";
import { auth, googleProvider, db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";

export interface UserProfile {
  avatarSvg?: string;
  email?: string;
  [key: string]: any;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, name?: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signOutUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const signUp = async (email: string, password: string, name?: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (name && userCredential.user) {
      await updateProfile(userCredential.user, { displayName: name });
    }
    return userCredential;
  };

  const signIn = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = () => {
    return signInWithPopup(auth, googleProvider);
  };

  const signOutUser = async () => {
    // Wipe local storage to prevent data bleeding between accounts
    for (const key in localStorage) {
      if (key.startsWith("bluebottlecap_")) {
        localStorage.removeItem(key);
      }
    }
    return signOut(auth);
  };

  const resetPassword = (email: string) => {
    return sendPasswordResetEmail(auth, email);
  };

  useEffect(() => {
    let unsubProfile: (() => void) | undefined;

    // Firebase isn't configured (missing env vars) — skip auth wiring so the
    // app still renders instead of crashing on a null `auth`.
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        unsubProfile = onSnapshot(userRef, (snap) => {
          if (snap.exists()) {
            setUserProfile(snap.data() as UserProfile);
          } else {
            setUserProfile(null);
          }
        });
      } else {
        setUserProfile(null);
        if (unsubProfile) unsubProfile();
      }
      
      setLoading(false);
    });
    return () => {
      unsubscribe();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOutUser,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
