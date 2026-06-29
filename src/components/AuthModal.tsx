"use client";

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, X, Loader2 } from "lucide-react";
import { Logo } from "./Logo";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signUp, signIn, signInWithGoogle, resetPassword } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        await signUp(email, password, name);
        onClose();
      } else if (mode === "signin") {
        await signIn(email, password);
        onClose();
      } else if (mode === "forgot") {
        await resetPassword(email);
        setSuccessMsg("Password reset email sent! Check your inbox.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Google Sign-In failed.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-[var(--color-line-strong)] bg-white py-3 pl-10.5 pr-4 text-xs font-semibold text-[var(--color-ink)] placeholder-[var(--color-ink-faint)] focus:border-[var(--color-blue-ink)] focus:ring-1 focus:ring-[var(--color-blue-ink)] focus:outline-none transition";
  const labelClass = "bbc-eyebrow block text-[10px]";

  return (
    <div className="bbc fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[var(--color-ink)]/45 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-8 shadow-2xl fade-in">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-[var(--color-ink-faint)] transition hover:bg-[var(--color-paper)] hover:text-[var(--color-ink)]"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 text-center">
          <Logo className="mx-auto h-12 w-12 text-[var(--color-blue-ink)]" />
          <h2 className="bbc-serif mt-4 text-[26px] tracking-[-.01em] text-[var(--color-ink)]">
            {mode === "signin" && "Welcome back"}
            {mode === "signup" && "Create account"}
            {mode === "forgot" && "Reset password"}
          </h2>
          <p className="mt-1.5 text-xs text-[var(--color-ink-soft)]">
            {mode === "signin" && "Sign in to access your saved studies and premium plan"}
            {mode === "signup" && "Unlock AI-powered study tools in seconds"}
            {mode === "forgot" && "Enter your email to receive a password reset link"}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-normal text-red-600">{error}</div>
        )}
        {successMsg && (
          <div className="mb-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-blue-wash)] p-3 text-xs leading-normal text-[var(--color-blue-ink)]">{successMsg}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4.5">
          {mode === "signup" && (
            <div className="space-y-1">
              <label className={labelClass}>Full name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3.5 flex items-center text-[var(--color-ink-faint)]">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </span>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" className={inputClass} />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className={labelClass}>Email address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3.5 flex items-center text-[var(--color-ink-faint)]">
                <Mail className="h-4 w-4" />
              </span>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@school.edu" className={inputClass} />
            </div>
          </div>

          {mode !== "forgot" && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className={labelClass}>Password</label>
                {mode === "signin" && (
                  <button type="button" onClick={() => setMode("forgot")} className="text-[10px] font-bold text-[var(--color-blue-ink)] hover:underline">
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-3.5 flex items-center text-[var(--color-ink-faint)]">
                  <Lock className="h-4 w-4" />
                </span>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={inputClass} />
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} className="bbc-btn bbc-btn-primary w-full justify-center py-3.5 text-xs disabled:opacity-50">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span>
                {mode === "signin" && "Sign in"}
                {mode === "signup" && "Create account"}
                {mode === "forgot" && "Send reset link"}
              </span>
            )}
          </button>
        </form>

        {mode !== "forgot" && (
          <>
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--color-line)]"></div></div>
              <span className="bbc-eyebrow relative bg-[var(--color-paper-card)] px-3 text-[10px]">Or continue with</span>
            </div>

            <button onClick={handleGoogleSignIn} disabled={loading} className="bbc-btn bbc-btn-ghost w-full justify-center bg-white py-3 text-xs disabled:opacity-50">
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.2-5.136 4.2A5.727 5.727 0 0 1 8.2 12.9a5.727 5.727 0 0 1 5.79-5.7 5.666 5.666 0 0 1 3.93 1.545l3.1-3.1A9.913 9.913 0 0 0 13.99 2.1a10.8 10.8 0 0 0-10.8 10.8 10.8 10.8 0 0 0 10.8 10.8c5.73 0 9.87-3.955 9.87-9.87a9.23 9.23 0 0 0-.21-2.145H12.24Z"/>
              </svg>
              <span>Google account</span>
            </button>
          </>
        )}

        <div className="mt-6 text-center text-xs">
          {mode === "signin" && (
            <p className="text-[var(--color-ink-soft)]">
              New to BlueBottleCap?{" "}
              <button onClick={() => setMode("signup")} className="font-bold text-[var(--color-blue-ink)] hover:underline cursor-pointer">
                Create an account
              </button>
            </p>
          )}
          {mode === "signup" && (
            <p className="text-[var(--color-ink-soft)]">
              Already have an account?{" "}
              <button onClick={() => setMode("signin")} className="font-bold text-[var(--color-blue-ink)] hover:underline cursor-pointer">
                Sign in
              </button>
            </p>
          )}
          {mode === "forgot" && (
            <button onClick={() => setMode("signin")} className="font-bold text-[var(--color-blue-ink)] hover:underline cursor-pointer">
              Back to sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
