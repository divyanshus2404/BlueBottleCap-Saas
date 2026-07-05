"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { useRouter } from "next/navigation";
import { Mail, RefreshCw, CheckCircle, Loader2, ArrowLeft } from "lucide-react";
import { Logo } from "@/src/components/Logo";

export default function VerifyEmailPage() {
  const { currentUser, resendVerificationEmail, signOutUser } = useAuth();
  const router = useRouter();
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  // Poll for verification every 5s so user gets auto-redirected after clicking link
  useEffect(() => {
    if (!currentUser) {
      router.replace("/");
      return;
    }
    if (currentUser.emailVerified) {
      router.replace("/dashboard");
      return;
    }

    const interval = setInterval(async () => {
      try {
        await currentUser.reload();
        if (currentUser.emailVerified) {
          // Update the session cookie so middleware sees verified status
          document.cookie = `__email_verified=true; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
          router.replace("/dashboard");
        }
      } catch {
        // silent
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [currentUser, router]);

  const handleResend = async () => {
    setError(null);
    setResending(true);
    try {
      await resendVerificationEmail();
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to resend email.");
    } finally {
      setResending(false);
    }
  };

  const handleCheckNow = async () => {
    setChecking(true);
    try {
      await currentUser?.reload();
      if (currentUser?.emailVerified) {
        document.cookie = `__email_verified=true; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
        router.replace("/dashboard");
      } else {
        setError("Email not verified yet. Please check your inbox and click the link.");
      }
    } catch {
      setError("Could not check verification status. Try again.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 text-center space-y-6">
          {/* Logo */}
          <div className="flex justify-center">
            <Logo className="h-12 w-12 text-brand-cobalt" />
          </div>

          {/* Icon */}
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-2xl bg-blue-50 flex items-center justify-center">
              <Mail className="h-10 w-10 text-brand-cobalt" />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-brand-navy tracking-tight">
              Verify your email
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              We sent a verification link to{" "}
              <span className="font-semibold text-gray-700">{currentUser?.email}</span>.
              Click the link in that email to activate your account.
            </p>
          </div>

          {/* Auto-check indicator */}
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Checking automatically every 5 seconds…</span>
          </div>

          {/* Error */}
          {error && (
            <p className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600 font-medium">
              {error}
            </p>
          )}

          {/* Success */}
          {resent && (
            <p className="rounded-xl bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-700 font-medium flex items-center justify-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Verification email sent! Check your inbox.
            </p>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <button
              id="check-verification-btn"
              onClick={handleCheckNow}
              disabled={checking}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-cobalt text-white font-bold py-3 text-sm hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
            >
              {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              I&apos;ve verified my email
            </button>

            <button
              id="resend-verification-btn"
              onClick={handleResend}
              disabled={resending || resent}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-gray-200 text-gray-600 font-semibold py-3 text-sm hover:bg-gray-50 transition disabled:opacity-50 cursor-pointer"
            >
              {resending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Resend verification email
            </button>

            <button
              onClick={signOutUser}
              className="w-full flex items-center justify-center gap-2 rounded-xl text-gray-400 font-medium py-2 text-xs hover:text-gray-600 transition cursor-pointer"
            >
              <ArrowLeft className="h-3 w-3" />
              Sign in with a different account
            </button>
          </div>

          <p className="text-[11px] text-gray-400">
            Didn&apos;t receive it? Check your spam folder, or use the resend button above.
          </p>
        </div>
      </div>
    </div>
  );
}
