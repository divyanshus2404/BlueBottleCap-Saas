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
      const res = await fetch("http://localhost:3001/api/auth/send-otp", {
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

  return (
    <div className="min-h-screen w-full bg-slate-950 flex font-sans overflow-hidden relative">
      {/* Absolute Header for Mobile / Back Button */}
      <div className="absolute top-6 left-6 z-50">
        <button 
          onClick={() => setCurrentView("landing")}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors duration-200"
        >
          <ArrowRight className="w-5 h-5 rotate-180" />
          <span className="text-sm font-medium">Back to Home</span>
        </button>
      </div>

      {/* LEFT PANE: Beautiful Visuals (Hidden on small screens) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 border-r border-slate-800/50 flex-col justify-between p-12 overflow-hidden">
        {/* Background Gradients & Constellation */}
        <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none">
          <ConstellationBackground />
        </div>
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-cobalt/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <Logo className="w-10 h-10 text-brand-cobalt" />
            <span className="text-xl font-black text-white font-display tracking-tight">BlueBottleCap</span>
          </div>
          <h1 className="mt-16 text-5xl font-black text-white leading-tight font-display tracking-tight">
            Supercharge your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cobalt to-purple-500">
              academic workflow
            </span>
          </h1>
          <p className="mt-6 text-lg text-slate-400 max-w-md">
            Join thousands of students and researchers using AI to read faster, synthesize better, and retain more knowledge.
          </p>
        </div>

        {/* Floating Feature Cards Animation */}
        <div className="relative z-10 w-full max-w-md mt-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 mb-4 shadow-xl"
          >
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-brand-cobalt/20 text-brand-cobalt">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-white font-bold mb-1">Instant PDF Co-pilot</h3>
                <p className="text-sm text-slate-400">Chat with your research papers and extract key insights in seconds.</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 shadow-xl ml-8"
          >
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-white font-bold mb-1">Smart Flashcards</h3>
                <p className="text-sm text-slate-400">Auto-generate study decks from any document to ace your exams.</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="relative z-10">
          <div className="flex -space-x-3 mt-8">
            <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-700"></div>
            <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-600"></div>
            <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-500"></div>
            <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-xs font-bold text-white">+2k</div>
          </div>
          <p className="text-sm text-slate-500 mt-3 font-medium">Loved by students worldwide</p>
        </div>
      </div>

      {/* RIGHT PANE: Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative z-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <Logo className="w-10 h-10 text-brand-cobalt" />
            <span className="text-2xl font-black text-white font-display tracking-tight">BlueBottleCap</span>
          </div>

          <motion.div
            key={mode}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-8">
              <h2 className="font-display text-3xl sm:text-4xl font-black text-white tracking-tight">
                {mode === "signin" && "Welcome back"}
                {mode === "signup" && !isVerifyingOTP && "Create your account"}
                {mode === "signup" && isVerifyingOTP && "Verify your email"}
                {mode === "forgot" && "Reset your password"}
              </h2>
              <p className="mt-3 text-slate-400">
                {mode === "signin" && "Sign in to access your dashboard"}
                {mode === "signup" && !isVerifyingOTP && "Unlock high-power AI academic tools in seconds"}
                {mode === "signup" && isVerifyingOTP && "We sent a 6-digit code to your email. Enter it below to verify."}
                {mode === "forgot" && "Enter your email to receive a password reset link"}
              </p>
            </div>

            {/* Error / Success Alerts */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
                  <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
                    {error}
                  </div>
                </motion.div>
              )}
              {successMsg && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
                  <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-400">
                    {successMsg}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === "signup" && !isVerifyingOTP && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-4 flex items-center text-slate-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                    </span>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full rounded-xl border border-slate-700 bg-slate-800/50 py-3.5 pl-12 pr-4 text-sm font-medium text-white placeholder-slate-500 focus:border-brand-cobalt focus:bg-slate-800 focus:ring-1 focus:ring-brand-cobalt focus:outline-none transition-all"
                    />
                  </div>
                </motion.div>
              )}

              {!isVerifyingOTP && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-4 flex items-center text-slate-500">
                      <Mail className="w-5 h-5" />
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@school.edu"
                      className="w-full rounded-xl border border-slate-700 bg-slate-800/50 py-3.5 pl-12 pr-4 text-sm font-medium text-white placeholder-slate-500 focus:border-brand-cobalt focus:bg-slate-800 focus:ring-1 focus:ring-brand-cobalt focus:outline-none transition-all disabled:opacity-50"
                    />
                  </div>
                </motion.div>
              )}

              {mode !== "forgot" && !isVerifyingOTP && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Password
                    </label>
                    {mode === "signin" && (
                      <button
                        type="button"
                        onClick={() => setMode("forgot")}
                        className="text-[11px] font-bold text-brand-cobalt hover:text-white transition-colors cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-4 flex items-center text-slate-500">
                      <Lock className="w-5 h-5" />
                    </span>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-700 bg-slate-800/50 py-3.5 pl-12 pr-4 text-sm font-medium text-white placeholder-slate-500 focus:border-brand-cobalt focus:bg-slate-800 focus:ring-1 focus:ring-brand-cobalt focus:outline-none transition-all"
                    />
                  </div>
                </motion.div>
              )}

              {mode === "signup" && isVerifyingOTP && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="pt-4 pb-2">
                  <div className="flex justify-between gap-2 sm:gap-3 mb-6">
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
                        className="w-10 h-12 sm:w-12 sm:h-14 text-center rounded-xl border border-slate-700 bg-slate-800/80 text-xl font-bold text-white focus:border-brand-cobalt focus:bg-slate-800 focus:ring-2 focus:ring-brand-cobalt focus:outline-none transition-all shadow-inner"
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-between px-1">
                    <button
                      type="button"
                      onClick={() => setIsVerifyingOTP(false)}
                      className="text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      Change email
                    </button>
                    
                    {timer > 0 ? (
                      <span className="text-xs font-bold text-slate-400 bg-slate-800 px-3 py-1.5 rounded-full">
                        Resend code in {timer}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResend}
                        className="text-xs font-bold text-brand-cobalt hover:text-brand-sky transition-colors bg-brand-cobalt/10 px-3 py-1.5 rounded-full"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                </motion.div>
              )}              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-cobalt to-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-cobalt/25 hover:shadow-brand-cobalt/40 hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span>
                    {mode === "signin" && "Sign In"}
                    {mode === "signup" && !isVerifyingOTP && "Continue"}
                    {mode === "signup" && isVerifyingOTP && "Verify & Create Account"}
                    {mode === "forgot" && "Send Reset Link"}
                  </span>
                )}
              </button>
            </form>

            {mode !== "forgot" && !isVerifyingOTP && (
              <>
                <div className="relative my-8 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-800"></div>
                  </div>
                  <span className="relative bg-slate-950 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Or continue with
                  </span>
                </div>

                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-700 bg-slate-800/30 hover:bg-slate-800 py-3.5 text-sm font-bold text-white transition-all cursor-pointer disabled:opacity-50"
                >
                  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.2-5.136 4.2A5.727 5.727 0 0 1 8.2 12.9a5.727 5.727 0 0 1 5.79-5.7 5.666 5.666 0 0 1 3.93 1.545l3.1-3.1A9.913 9.913 0 0 0 13.99 2.1a10.8 10.8 0 0 0-10.8 10.8 10.8 10.8 0 0 0 10.8 10.8c5.73 0 9.87-3.955 9.87-9.87a9.23 9.23 0 0 0-.21-2.145H12.24Z"/>
                  </svg>
                  <span>Google Account</span>
                </button>
              </>
            )}

            <div className="mt-8 text-center text-sm">
              {mode === "signin" && (
                <p className="text-slate-400">
                  New to BlueBottleCap?{" "}
                  <button onClick={() => setMode("signup")} className="font-bold text-brand-cobalt hover:text-white transition-colors cursor-pointer">
                    Create an account
                  </button>
                </p>
              )}
              {mode === "signup" && (
                <p className="text-slate-400">
                  Already have an account?{" "}
                  <button onClick={() => setMode("signin")} className="font-bold text-brand-cobalt hover:text-white transition-colors cursor-pointer">
                    Sign in
                  </button>
                </p>
              )}
              {mode === "forgot" && (
                <button onClick={() => setMode("signin")} className="font-bold text-brand-cobalt hover:text-white transition-colors cursor-pointer">
                  Back to Sign In
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
