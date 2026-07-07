"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, X, Loader2, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "./Logo";
import { ActiveView } from "../types";

// Ultra-lightweight White Constellation Background Component
const ConstellationBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: { x: number; y: number; vx: number; vy: number }[] = [];
    let animationFrameId: number;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        initParticles();
      }
    };

    const initParticles = () => {
      particles = [];
      const numParticles = window.innerWidth < 768 ? 40 : 80;
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
        });
      }
    };

    let mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.lineWidth = 0.5;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Mouse repulsion
        const dxMouse = p.x - mouse.x;
        const dyMouse = p.y - mouse.y;
        const distMouseSq = dxMouse * dxMouse + dyMouse * dyMouse;
        if (distMouseSq < 20000) {
          p.x += dxMouse * 0.01;
          p.y += dyMouse * 0.01;
        }

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Connect to mouse
        if (distMouseSq < 20000) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 * (1 - distMouseSq / 20000)})`;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < 15000) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 * (1 - distSq / 15000)})`;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener("resize", resize);
    resize();
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full block" />;
};

interface SignUpPageProps {
  setCurrentView: (view: ActiveView) => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({ setCurrentView }) => {
  const { signUp, signIn, signInWithGoogle, resetPassword } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signup");
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // OTP State
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [otpArray, setOtpArray] = useState<string[]>(Array(6).fill(""));
  const [timer, setTimer] = useState(60);
  const otpInputsRef = React.useRef<(HTMLInputElement | null)[]>([]);

  // Timer Effect
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isVerifyingOTP && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isVerifyingOTP, timer]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpArray];
    // If user pastes a full code
    if (value.length > 1) {
      const pasted = value.slice(0, 6).split("");
      for (let i = 0; i < pasted.length; i++) {
        if (index + i < 6) newOtp[index + i] = pasted[i];
      }
      setOtpArray(newOtp);
      const nextIndex = Math.min(index + pasted.length, 5);
      otpInputsRef.current[nextIndex]?.focus();
      return;
    }

    newOtp[index] = value;
    setOtpArray(newOtp);

    if (value !== "" && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpArray[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch("/api/email/welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { error: text }; }
      if (!res.ok) throw new Error(data.error || "Failed to resend OTP");
      setSuccessMsg("OTP resent successfully!");
      setTimer(60);
    } catch (err: any) {
      setError(err.message || "Failed to resend OTP");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        await signUp(email, password, name);
        setCurrentView("create-profile");
      } else if (mode === "signin") {
        await signIn(email, password);
        setCurrentView("dashboard");
      } else if (mode === "forgot") {
        await resetPassword(email);
        setSuccessMsg("Password reset email sent! Check your inbox.");
      }
    } catch (err: any) {
      console.error(err);
      let errorMsg = err.message || "An authentication error occurred.";
      if (errorMsg.includes("auth/email-already-in-use")) {
        errorMsg = "This email is already registered. Please sign in instead.";
      } else if (errorMsg.includes("auth/invalid-credential") || errorMsg.includes("auth/wrong-password")) {
        errorMsg = "Invalid email or password.";
      } else if (errorMsg.includes("auth/weak-password")) {
        errorMsg = "Password should be at least 6 characters.";
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      setCurrentView("dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Google Sign-In failed.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-[var(--color-line-strong)] bg-white py-3.5 pl-12 pr-4 text-sm font-medium text-[var(--color-ink)] placeholder-[var(--color-ink-faint)] focus:border-[var(--color-blue-ink)] focus:ring-1 focus:ring-[var(--color-blue-ink)] focus:outline-none transition-all disabled:opacity-50";
  const labelClass = "bbc-eyebrow block text-[11px]";

  return (
    <div className="bbc relative flex min-h-screen w-full overflow-hidden">
      {/* Back button */}
      <div className="absolute left-6 top-6 z-50">
        <button
          onClick={() => setCurrentView("landing")}
          className="flex items-center gap-2 text-[var(--color-ink-soft)] transition-colors hover:text-[var(--color-ink)] lg:text-white/70 lg:hover:text-white"
        >
          <ArrowRight className="h-5 w-5 rotate-180" />
          <span className="text-sm font-medium">Back to home</span>
        </button>
      </div>

      {/* LEFT PANE: deep-blue brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[var(--color-blue-deep)] p-12 lg:flex">
        <div className="pointer-events-none absolute inset-0 z-0 opacity-50 mix-blend-screen">
          <ConstellationBackground />
        </div>
        <div className="pointer-events-none absolute left-[-10%] top-[-10%] h-[50%] w-[50%] rounded-full bg-[var(--color-blue-ink)]/40 blur-[120px]" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <Logo className="h-10 w-10 text-white" />
            <span className="bbc-serif text-xl tracking-[-.01em] text-white">BlueBottleCap</span>
          </div>
          <h1 className="bbc-serif mt-16 text-[clamp(36px,3.6vw,52px)] leading-[1.05] tracking-[-.02em] text-white">
            Supercharge your <br />
            <em className="not-italic italic text-[#BFCBFF]">academic workflow.</em>
          </h1>
          <p className="mt-6 max-w-md text-[17px] text-white/70">
            Join thousands of students using AI to read faster, synthesize better, and retain more
            knowledge.
          </p>
        </div>

        <div className="relative z-10 mt-12 w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-4 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-white/15 p-2.5 text-white">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-white">Instant PDF Co-pilot</h3>
                <p className="text-sm text-white/70">Chat with your notes and extract key insights in seconds.</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="ml-8 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-white/15 p-2.5 text-white">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-white">Smart Flashcards</h3>
                <p className="text-sm text-white/70">Auto-generate study decks from any document to ace your exams.</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="relative z-10">
          <div className="mt-8 flex -space-x-3">
            <div className="h-10 w-10 rounded-full border-2 border-[var(--color-blue-deep)] bg-white/30" />
            <div className="h-10 w-10 rounded-full border-2 border-[var(--color-blue-deep)] bg-white/20" />
            <div className="h-10 w-10 rounded-full border-2 border-[var(--color-blue-deep)] bg-white/15" />
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--color-blue-deep)] bg-white/10 text-xs font-bold text-white">
              +2k
            </div>
          </div>
          <p className="mt-3 text-sm font-medium text-white/60">Loved by students across India</p>
        </div>
      </div>

      {/* RIGHT PANE: paper form */}
      <div className="relative z-10 flex w-full items-center justify-center bg-[var(--color-paper)] p-8 sm:p-12 lg:w-1/2">
        <div className="bbc-grid" aria-hidden="true" />
        <div className="relative z-[2] w-full max-w-md">
          <div className="mb-10 flex items-center justify-center gap-3 lg:hidden">
            <Logo className="h-10 w-10 text-[var(--color-blue-ink)]" />
            <span className="bbc-serif text-2xl tracking-[-.01em] text-[var(--color-ink)]">BlueBottleCap</span>
          </div>

          <motion.div
            key={mode}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-8">
              <h2 className="bbc-serif text-[clamp(28px,4vw,38px)] tracking-[-.02em] text-[var(--color-ink)]">
                {mode === "signin" && "Welcome back"}
                {mode === "signup" && !isVerifyingOTP && "Create your account"}
                {mode === "signup" && isVerifyingOTP && "Verify your email"}
                {mode === "forgot" && "Reset your password"}
              </h2>
              <p className="mt-3 text-[var(--color-ink-soft)]">
                {mode === "signin" && "Sign in to access your dashboard"}
                {mode === "signup" && !isVerifyingOTP && "Unlock AI-powered study tools in seconds"}
                {mode === "signup" && isVerifyingOTP && "We sent a 6-digit code to your email. Enter it below to verify."}
                {mode === "forgot" && "Enter your email to receive a password reset link"}
              </p>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>
                </motion.div>
              )}
              {successMsg && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
                  <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-blue-wash)] p-4 text-sm text-[var(--color-blue-ink)]">{successMsg}</div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === "signup" && !isVerifyingOTP && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-1.5">
                  <label className={labelClass}>Full name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-4 flex items-center text-[var(--color-ink-faint)]">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </span>
                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" className={inputClass} />
                  </div>
                </motion.div>
              )}

              {!isVerifyingOTP && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-1.5">
                  <label className={labelClass}>Email address</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-4 flex items-center text-[var(--color-ink-faint)]">
                      <Mail className="h-5 w-5" />
                    </span>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@school.edu" className={inputClass} />
                  </div>
                </motion.div>
              )}

              {mode !== "forgot" && !isVerifyingOTP && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className={labelClass}>Password</label>
                    {mode === "signin" && (
                      <button type="button" onClick={() => setMode("forgot")} className="text-[11px] font-bold text-[var(--color-blue-ink)] transition-colors hover:text-[var(--color-blue-deep)] cursor-pointer">
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-4 flex items-center text-[var(--color-ink-faint)]">
                      <Lock className="h-5 w-5" />
                    </span>
                    <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={inputClass} />
                  </div>
                </motion.div>
              )}

              {mode === "signup" && isVerifyingOTP && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="pb-2 pt-4">
                  <div className="mb-6 flex justify-between gap-2 sm:gap-3">
                    {otpArray.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => {
                          otpInputsRef.current[i] = el;
                        }}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className="h-12 w-10 rounded-xl border border-[var(--color-line-strong)] bg-white text-center text-xl font-bold text-[var(--color-ink)] transition-all focus:border-[var(--color-blue-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-blue-ink)] sm:h-14 sm:w-12"
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-between px-1">
                    <button type="button" onClick={() => setIsVerifyingOTP(false)} className="text-xs font-bold text-[var(--color-ink-faint)] transition-colors hover:text-[var(--color-ink)]">
                      Change email
                    </button>
                    {timer > 0 ? (
                      <span className="rounded-full bg-[var(--color-paper-card)] px-3 py-1.5 text-xs font-bold text-[var(--color-ink-soft)]">
                        Resend code in {timer}s
                      </span>
                    ) : (
                      <button type="button" onClick={handleResend} className="rounded-full bg-[var(--color-blue-wash)] px-3 py-1.5 text-xs font-bold text-[var(--color-blue-ink)] transition-colors">
                        Resend OTP
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
              <button type="submit" disabled={loading} className="bbc-btn bbc-btn-primary w-full justify-center py-3.5 text-sm disabled:opacity-50">
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <span>
                    {mode === "signin" && "Sign in"}
                    {mode === "signup" && !isVerifyingOTP && "Continue"}
                    {mode === "signup" && isVerifyingOTP && "Verify & create account"}
                    {mode === "forgot" && "Send reset link"}
                  </span>
                )}
              </button>
            </form>

            {mode !== "forgot" && !isVerifyingOTP && (
              <>
                <div className="relative my-8 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[var(--color-line)]" />
                  </div>
                  <span className="bbc-eyebrow relative bg-[var(--color-paper)] px-4 text-[11px]">Or continue with</span>
                </div>

                <button onClick={handleGoogleSignIn} disabled={loading} className="bbc-btn bbc-btn-ghost w-full justify-center bg-white py-3.5 text-sm disabled:opacity-50">
                  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.2-5.136 4.2A5.727 5.727 0 0 1 8.2 12.9a5.727 5.727 0 0 1 5.79-5.7 5.666 5.666 0 0 1 3.93 1.545l3.1-3.1A9.913 9.913 0 0 0 13.99 2.1a10.8 10.8 0 0 0-10.8 10.8 10.8 10.8 0 0 0 10.8 10.8c5.73 0 9.87-3.955 9.87-9.87a9.23 9.23 0 0 0-.21-2.145H12.24Z" />
                  </svg>
                  <span>Google account</span>
                </button>
              </>
            )}

            <div className="mt-8 text-center text-sm">
              {mode === "signin" && (
                <p className="text-[var(--color-ink-soft)]">
                  New to BlueBottleCap?{" "}
                  <button onClick={() => setMode("signup")} className="font-bold text-[var(--color-blue-ink)] transition-colors hover:text-[var(--color-blue-deep)] cursor-pointer">
                    Create an account
                  </button>
                </p>
              )}
              {mode === "signup" && (
                <p className="text-[var(--color-ink-soft)]">
                  Already have an account?{" "}
                  <button onClick={() => setMode("signin")} className="font-bold text-[var(--color-blue-ink)] transition-colors hover:text-[var(--color-blue-deep)] cursor-pointer">
                    Sign in
                  </button>
                </p>
              )}
              {mode === "forgot" && (
                <button onClick={() => setMode("signin")} className="font-bold text-[var(--color-blue-ink)] transition-colors hover:text-[var(--color-blue-deep)] cursor-pointer">
                  Back to sign in
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
