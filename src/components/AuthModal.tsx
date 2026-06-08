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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-bg-primary/60 backdrop-blur-xs" onClick={onClose}></div>

      {/* Modal Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-gray-150 bg-white/90 p-8 shadow-2xl backdrop-blur-md fade-in">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 rounded-xl p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo & Header */}
        <div className="mb-6 text-center">
          <Logo className="mx-auto h-12 w-12 text-accent" />
          <h2 className="mt-4 font-display text-2xl font-black text-white">
            {mode === "signin" && "Welcome Back"}
            {mode === "signup" && "Create Account"}
            {mode === "forgot" && "Reset Password"}
          </h2>
          <p className="mt-1.5 text-xs text-gray-400">
            {mode === "signin" && "Sign in to access your saved studies and premium plan"}
            {mode === "signup" && "Unlock high-power AI academic tools in seconds"}
            {mode === "forgot" && "Enter your email to receive a password reset link"}
          </p>
        </div>

        {/* Error / Success Alerts */}
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-100 p-3 text-xs text-red-600 leading-normal">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-xs text-emerald-600 leading-normal">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4.5">
          {mode === "signup" && (
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 font-mono">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3.5 flex items-center text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full rounded-xl border border-gray-200 bg-surface-solid py-3 pl-10.5 pr-4 text-xs font-semibold text-white focus:border-accent focus:bg-white focus:outline-hidden transition"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 font-mono">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3.5 flex items-center text-gray-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.edu"
                className="w-full rounded-xl border border-gray-200 bg-surface-solid py-3 pl-10.5 pr-4 text-xs font-semibold text-white focus:border-accent focus:bg-white focus:outline-hidden transition"
              />
            </div>
          </div>

          {/* Password (only for Sign In / Sign Up) */}
          {mode !== "forgot" && (
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 font-mono">
                  Password
                </label>
                {mode === "signin" && (
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="text-[10px] font-extrabold text-accent hover:underline font-mono"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-3.5 flex items-center text-gray-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-gray-200 bg-surface-solid py-3 pl-10.5 pr-4 text-xs font-semibold text-white focus:border-accent focus:bg-white focus:outline-hidden transition"
                />
              </div>
            </div>
          )}

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-brand-cobalt to-indigo-600 py-3.5 text-xs font-bold text-white shadow-lg shadow-brand-cobalt/25 hover:opacity-95 transition cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span>
                {mode === "signin" && "Sign In"}
                {mode === "signup" && "Create Account"}
                {mode === "forgot" && "Send Reset Link"}
              </span>
            )}
          </button>
        </form>

        {/* Auth Provider Dividers */}
        {mode !== "forgot" && (
          <>
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-150"></div></div>
              <span className="relative bg-white px-3 text-[10px] font-extrabold uppercase tracking-wider text-gray-400 font-mono">
                Or Continue With
              </span>
            </div>

            {/* Google Sign In */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-gray-200 bg-white hover:bg-surface-solid py-3 text-xs font-bold text-gray-600 transition cursor-pointer disabled:opacity-50"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.2-5.136 4.2A5.727 5.727 0 0 1 8.2 12.9a5.727 5.727 0 0 1 5.79-5.7 5.666 5.666 0 0 1 3.93 1.545l3.1-3.1A9.913 9.913 0 0 0 13.99 2.1a10.8 10.8 0 0 0-10.8 10.8 10.8 10.8 0 0 0 10.8 10.8c5.73 0 9.87-3.955 9.87-9.87a9.23 9.23 0 0 0-.21-2.145H12.24Z"/>
              </svg>
              <span>Google Account</span>
            </button>
          </>
        )}

        {/* Toggle Mode Link */}
        <div className="mt-6 text-center text-xs">
          {mode === "signin" && (
            <p className="text-gray-400">
              New to BlueBottleCap?{" "}
              <button onClick={() => setMode("signup")} className="font-extrabold text-accent hover:underline cursor-pointer">
                Create an account
              </button>
            </p>
          )}
          {mode === "signup" && (
            <p className="text-gray-400">
              Already have an account?{" "}
              <button onClick={() => setMode("signin")} className="font-extrabold text-accent hover:underline cursor-pointer">
                Sign in
              </button>
            </p>
          )}
          {mode === "forgot" && (
            <button onClick={() => setMode("signin")} className="font-extrabold text-accent hover:underline cursor-pointer">
              Back to Sign In
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
