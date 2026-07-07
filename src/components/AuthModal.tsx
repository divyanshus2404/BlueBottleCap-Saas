"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, X, Loader2, ArrowLeft, ShieldCheck } from "lucide-react";
import { Logo } from "./Logo";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Mode = "entry" | "otp-sent" | "email-signin" | "email-signup" | "forgot";

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signUp, signIn, signInWithGoogle, signInWithToken, resetPassword } = useAuth();
  const [mode, setMode] = useState<Mode>("entry");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  useEffect(() => {
    if (mode === "otp-sent") {
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  }, [mode]);

  if (!isOpen) return null;

  const resetState = () => {
    setError(null);
    setSuccessMsg(null);
    setOtpDigits(["", "", "", "", "", ""]);
  };

  const closeAndReset = () => {
    setMode("entry");
    setName("");
    setEmail("");
    setPassword("");
    setError(null);
    setSuccessMsg(null);
    setOtpDigits(["", "", "", "", "", ""]);
    setLoading(false);
    onClose();
  };

  const goBack = () => {
    resetState();
    setMode("entry");
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send code.");
      setMode("otp-sent");
      setResendCooldown(60);
      setSuccessMsg(data.delivery === "email" ? null : "SMTP not configured — check server logs for the code.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otpDigits];
    if (value.length > 1) {
      const chars = value.slice(0, 6).split("");
      chars.forEach((c, i) => {
        if (index + i < 6) next[index + i] = c;
      });
      setOtpDigits(next);
      const focusIdx = Math.min(index + chars.length, 5);
      otpRefs.current[focusIdx]?.focus();
      if (next.every((d) => d !== "")) verifyOtp(next.join(""));
      return;
    }
    next[index] = value;
    setOtpDigits(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
    if (next.every((d) => d !== "")) verifyOtp(next.join(""));
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const verifyOtp = async (code: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpDigits(["", "", "", "", "", ""]);
        otpRefs.current[0]?.focus();
        throw new Error(data.error || "Verification failed.");
      }
      await signInWithToken(data.customToken);
      closeAndReset();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "email-signup") {
        await signUp(email, password, name);
        closeAndReset();
      } else if (mode === "email-signin") {
        await signIn(email, password);
        closeAndReset();
      } else if (mode === "forgot") {
        await resetPassword(email);
        setSuccessMsg("Password reset email sent! Check your inbox.");
      }
    } catch (err: any) {
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
      closeAndReset();
    } catch (err: any) {
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
      <div className="absolute inset-0 bg-[var(--color-ink)]/45 backdrop-blur-sm" onClick={closeAndReset} />

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-8 shadow-2xl fade-in">
        <button
          onClick={closeAndReset}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-[var(--color-ink-faint)] transition hover:bg-[var(--color-paper)] hover:text-[var(--color-ink)] cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* OTP Entry — primary flow */}
        {mode === "entry" && (
          <>
            <div className="mb-6 text-center">
              <Logo className="mx-auto h-12 w-12 text-[var(--color-blue-ink)]" />
              <h2 className="bbc-serif mt-4 text-[26px] tracking-[-.01em] text-[var(--color-ink)]">
                Sign in with email
              </h2>
              <p className="mt-1.5 text-xs text-[var(--color-ink-soft)]">
                We'll send a 6-digit verification code to your email — no password needed.
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-normal text-red-600">{error}</div>
            )}

            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1">
                <label className={labelClass}>Email address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3.5 flex items-center text-[var(--color-ink-faint)]">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@school.edu"
                    className={inputClass}
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="bbc-btn bbc-btn-primary w-full justify-center py-3.5 text-xs disabled:opacity-50 cursor-pointer">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Send verification code</span>}
              </button>
            </form>

            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--color-line)]" /></div>
              <span className="bbc-eyebrow relative bg-[var(--color-paper-card)] px-3 text-[10px]">Or continue with</span>
            </div>

            <button onClick={handleGoogleSignIn} disabled={loading} className="bbc-btn bbc-btn-ghost w-full justify-center bg-white py-3 text-xs disabled:opacity-50 cursor-pointer">
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.2-5.136 4.2A5.727 5.727 0 0 1 8.2 12.9a5.727 5.727 0 0 1 5.79-5.7 5.666 5.666 0 0 1 3.93 1.545l3.1-3.1A9.913 9.913 0 0 0 13.99 2.1a10.8 10.8 0 0 0-10.8 10.8 10.8 10.8 0 0 0 10.8 10.8c5.73 0 9.87-3.955 9.87-9.87a9.23 9.23 0 0 0-.21-2.145H12.24Z"/>
              </svg>
              <span>Google account</span>
            </button>

            <div className="mt-5 text-center">
              <button
                onClick={() => { resetState(); setMode("email-signin"); }}
                className="text-[11px] text-[var(--color-ink-faint)] hover:text-[var(--color-blue-ink)] transition cursor-pointer"
              >
                Use email & password instead
              </button>
            </div>
          </>
        )}

        {/* OTP Verification */}
        {mode === "otp-sent" && (
          <>
            <div className="mb-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-blue-wash)]">
                <ShieldCheck className="h-7 w-7 text-[var(--color-blue-ink)]" />
              </div>
              <h2 className="bbc-serif mt-4 text-[24px] tracking-[-.01em] text-[var(--color-ink)]">
                Check your email
              </h2>
              <p className="mt-1.5 text-xs text-[var(--color-ink-soft)]">
                We sent a 6-digit code to <strong className="text-[var(--color-ink)]">{email}</strong>
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-normal text-red-600">{error}</div>
            )}
            {successMsg && (
              <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-normal text-amber-700">{successMsg}</div>
            )}

            <div className="flex justify-center gap-2.5 mb-5">
              {otpDigits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={i === 0 ? 6 : 1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="w-11 h-13 text-center text-xl font-bold rounded-xl border-2 border-[var(--color-line-strong)] bg-white text-[var(--color-ink)] focus:border-[var(--color-blue-ink)] focus:ring-1 focus:ring-[var(--color-blue-ink)] focus:outline-none transition"
                  disabled={loading}
                />
              ))}
            </div>

            {loading && (
              <div className="flex justify-center mb-4">
                <Loader2 className="h-5 w-5 animate-spin text-[var(--color-blue-ink)]" />
              </div>
            )}

            <div className="text-center space-y-3">
              <p className="text-xs text-[var(--color-ink-faint)]">
                Didn't receive it?{" "}
                {resendCooldown > 0 ? (
                  <span className="text-[var(--color-ink-soft)]">Resend in {resendCooldown}s</span>
                ) : (
                  <button
                    onClick={() => handleSendOtp()}
                    disabled={loading}
                    className="font-bold text-[var(--color-blue-ink)] hover:underline cursor-pointer"
                  >
                    Resend code
                  </button>
                )}
              </p>
              <button
                onClick={goBack}
                className="inline-flex items-center gap-1 text-xs text-[var(--color-ink-faint)] hover:text-[var(--color-ink)] transition cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" /> Use a different email
              </button>
            </div>
          </>
        )}

        {/* Email/password sign in */}
        {mode === "email-signin" && (
          <>
            <div className="mb-6 text-center">
              <Logo className="mx-auto h-12 w-12 text-[var(--color-blue-ink)]" />
              <h2 className="bbc-serif mt-4 text-[26px] tracking-[-.01em] text-[var(--color-ink)]">Welcome back</h2>
              <p className="mt-1.5 text-xs text-[var(--color-ink-soft)]">Sign in with your email and password</p>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-normal text-red-600">{error}</div>
            )}

            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="space-y-1">
                <label className={labelClass}>Email address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3.5 flex items-center text-[var(--color-ink-faint)]">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@school.edu" className={inputClass} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className={labelClass}>Password</label>
                  <button type="button" onClick={() => { resetState(); setMode("forgot"); }} className="text-[10px] font-bold text-[var(--color-blue-ink)] hover:underline cursor-pointer">
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3.5 flex items-center text-[var(--color-ink-faint)]">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={inputClass} />
                </div>
              </div>
              <button type="submit" disabled={loading} className="bbc-btn bbc-btn-primary w-full justify-center py-3.5 text-xs disabled:opacity-50 cursor-pointer">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Sign in</span>}
              </button>
            </form>

            <div className="mt-5 text-center space-y-2">
              <p className="text-xs text-[var(--color-ink-soft)]">
                New here?{" "}
                <button onClick={() => { resetState(); setMode("email-signup"); }} className="font-bold text-[var(--color-blue-ink)] hover:underline cursor-pointer">
                  Create an account
                </button>
              </p>
              <button onClick={goBack} className="inline-flex items-center gap-1 text-[11px] text-[var(--color-ink-faint)] hover:text-[var(--color-ink)] transition cursor-pointer">
                <ArrowLeft className="w-3 h-3" /> Back to OTP sign-in
              </button>
            </div>
          </>
        )}

        {/* Email/password sign up */}
        {mode === "email-signup" && (
          <>
            <div className="mb-6 text-center">
              <Logo className="mx-auto h-12 w-12 text-[var(--color-blue-ink)]" />
              <h2 className="bbc-serif mt-4 text-[26px] tracking-[-.01em] text-[var(--color-ink)]">Create account</h2>
              <p className="mt-1.5 text-xs text-[var(--color-ink-soft)]">Unlock AI-powered study tools in seconds</p>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-normal text-red-600">{error}</div>
            )}

            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="space-y-1">
                <label className={labelClass}>Full name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3.5 flex items-center text-[var(--color-ink-faint)]">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </span>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" className={inputClass} />
                </div>
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Email address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3.5 flex items-center text-[var(--color-ink-faint)]">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@school.edu" className={inputClass} />
                </div>
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3.5 flex items-center text-[var(--color-ink-faint)]">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={inputClass} />
                </div>
              </div>
              <button type="submit" disabled={loading} className="bbc-btn bbc-btn-primary w-full justify-center py-3.5 text-xs disabled:opacity-50 cursor-pointer">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Create account</span>}
              </button>
            </form>

            <div className="mt-5 text-center space-y-2">
              <p className="text-xs text-[var(--color-ink-soft)]">
                Already have an account?{" "}
                <button onClick={() => { resetState(); setMode("email-signin"); }} className="font-bold text-[var(--color-blue-ink)] hover:underline cursor-pointer">
                  Sign in
                </button>
              </p>
              <button onClick={goBack} className="inline-flex items-center gap-1 text-[11px] text-[var(--color-ink-faint)] hover:text-[var(--color-ink)] transition cursor-pointer">
                <ArrowLeft className="w-3 h-3" /> Back to OTP sign-in
              </button>
            </div>
          </>
        )}

        {/* Forgot password */}
        {mode === "forgot" && (
          <>
            <div className="mb-6 text-center">
              <Logo className="mx-auto h-12 w-12 text-[var(--color-blue-ink)]" />
              <h2 className="bbc-serif mt-4 text-[26px] tracking-[-.01em] text-[var(--color-ink)]">Reset password</h2>
              <p className="mt-1.5 text-xs text-[var(--color-ink-soft)]">Enter your email to receive a reset link</p>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-normal text-red-600">{error}</div>
            )}
            {successMsg && (
              <div className="mb-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-blue-wash)] p-3 text-xs leading-normal text-[var(--color-blue-ink)]">{successMsg}</div>
            )}

            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="space-y-1">
                <label className={labelClass}>Email address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3.5 flex items-center text-[var(--color-ink-faint)]">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@school.edu" className={inputClass} />
                </div>
              </div>
              <button type="submit" disabled={loading} className="bbc-btn bbc-btn-primary w-full justify-center py-3.5 text-xs disabled:opacity-50 cursor-pointer">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Send reset link</span>}
              </button>
            </form>

            <div className="mt-5 text-center">
              <button onClick={goBack} className="inline-flex items-center gap-1 text-xs text-[var(--color-ink-faint)] hover:text-[var(--color-ink)] transition cursor-pointer">
                <ArrowLeft className="w-3 h-3" /> Back to sign in
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
