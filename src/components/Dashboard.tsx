"use client";

import React, { useState, useEffect } from "react";
import { ActiveView, UsageStats, UserStats, DailyActivity, StudyAchievement } from "../types";
import { Sparkles, ArrowRight, Zap, FileText, ImageIcon, HardDrive, Cpu, History, AlertTriangle, BookOpen, Layers, Award, Calendar, Trophy, CheckCircle, Clock, Flame, Activity, Target, Camera } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { db } from "../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

gsap.registerPlugin(useGSAP);


import { useGlobalState } from "../context/GlobalStateContext";
import { useRouter } from "next/navigation";
import { WeeklyWrapped } from "./WeeklyWrapped";
import { ReadinessCard } from "./ReadinessCard";
import { ReferralCard } from "./ReferralCard";
import { StreakSaveBanner } from "./StreakSaveBanner";
import { evaluateStreak, isFreeSaveAvailable } from "../lib/streak";

export const Dashboard: React.FC = () => {
  const {
    userStats,
    usageStats,
    dailyActivity,
    todayReviewsCount,
    handleIncrementReview: onIncrementReviewCount,
    showToast: onShowToast,
    loginCount,
    recentActivities,
    referralCount,
    referralRewardsClaimed,
    refreshReferralCount,
    claimReferralReward,
    lastLoggedDate,
    saveStreakToday,
    freeStreakSaveMonth,
  } = useGlobalState();
  const router = useRouter();
  const { currentUser } = useAuth();
  const [showWrapped, setShowWrapped] = useState(false);
  const [joinedWaitlist, setJoinedWaitlist] = useState<Record<string, boolean>>({});

  const joinWaitlist = async (feature: string) => {
    if (joinedWaitlist[feature]) return;
    setJoinedWaitlist((prev) => ({ ...prev, [feature]: true }));
    if (currentUser && db) {
      try {
        await addDoc(collection(db, "waitlist"), {
          feature,
          uid: currentUser.uid,
          email: currentUser.email || null,
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        console.error("waitlist write failed:", err);
      }
    }
    onShowToast && onShowToast(`✓ You're on the ${feature} waitlist. We'll email you.`, "success");
  };

  const onNavigateTo = (view: string) => {
    const paths: Record<string, string> = {
      landing: '/',
      dashboard: '/dashboard',
      about: '/about',
      pricing: '/pricing',
      'create-profile': '/create-profile',
      'pdf-editor': '/pdf-editor',
      diagnostic: '/diagnostic',
      'scan-notes': '/scan-notes',
      tools: '/tools',
    };
    router.push(paths[view] || `/${view}`);
  };

  const { userProfile } = useAuth();
  const userName = userProfile?.name || "Scholar";
  
  // Reactively calculate achievements (moved from App.tsx)
  const achievements = [
    { id: "ach-1", name: "First Light", description: "Log in to the application to sync your scholar profile.", icon: "🏆", unlocked: true },
    { id: "ach-2", name: "Consistent Scholar", description: "Maintain a study streak of 5 days or more.", icon: "🔥", unlocked: userStats.streakDays >= 5 },
    { id: "ach-3", name: "Retention Master", description: "Build your knowledge base with 5 or more active flashcards.", icon: "🧠", unlocked: true },
  ];
  const [activeTab, setActiveTab] = useState<"workspace" | "analytics">("workspace");
  const [isSyncing, setIsSyncing] = useState(true);

  // Skeleton loader effect
  useEffect(() => {
    const timer = setTimeout(() => setIsSyncing(false), 1200);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const containerRef = React.useRef<HTMLDivElement>(null);

  // Premium GSAP Welcome Animation
  useGSAP(() => {
    if (activeTab === "workspace") {
      const tl = gsap.timeline();

      tl.fromTo(".welcome-bg", 
        { opacity: 0, scale: 1.05 },
        { opacity: 1, scale: 1, duration: 1.2, ease: "power3.out" }
      );

      tl.fromTo(".welcome-text", 
        { y: 40, opacity: 0, filter: "blur(10px)" },
        { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.8, stagger: 0.2 },
        "-=0.6"
      );

      tl.fromTo(".stat-card", 
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: "power2.out" },
        "-=0.4"
      );

      tl.fromTo(".floating-icon",
        { y: 80, opacity: 0 },
        { y: 0, opacity: 0.5, duration: 1, stagger: 0.2, ease: "elastic.out(1, 0.6)" },
        "-=0.8"
      );

      // Banners + tab bar fade in alongside the header, not after the whole
      // timeline — appended at the end they left a visible hole for ~2s.
      gsap.fromTo(".dash-fade",
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.12, ease: "power2.out", delay: 0.35 }
      );
    }
  }, { scope: containerRef, dependencies: [activeTab] });

  // recentActivities is now passed as a prop from Firestore
  // If no activities exist, we will show an empty state.

  const quickTools: Array<{ name: string; desc: string; icon: React.ReactNode; view: string; waitlistKey?: string }> = [
    { name: "AI PDF Copilot", desc: "Interact with journals and papers", icon: <BookOpen className="h-5 w-5" strokeWidth={1.7} />, view: "pdf-editor" },
    { name: "File Tools", desc: "PNG↔JPG, PDF merge/split, compress", icon: <Layers className="h-5 w-5" strokeWidth={1.7} />, view: "tools" },
    { name: "JEE Diagnostic", desc: "2-min readiness check + weak topics", icon: <Target className="h-5 w-5" strokeWidth={1.7} />, view: "diagnostic" },
    { name: "Scan Notes", desc: "Snap handwritten notes → searchable", icon: <Camera className="h-5 w-5" strokeWidth={1.7} />, view: "scan-notes" },
    { name: "B.Tech Study Planner", desc: "Coming soon — join waitlist", icon: <Calendar className="h-5 w-5" strokeWidth={1.7} />, view: "waitlist", waitlistKey: "study-planner" },
    { name: "JEE Question Generator", desc: "Coming soon — join waitlist", icon: <FileText className="h-5 w-5" strokeWidth={1.7} />, view: "waitlist", waitlistKey: "jee-generator" },
  ];

  const calculatePercentage = (current: number, max: number) => {
    return Math.min(Math.round((current / max) * 100), 100);
  };

  const aiPercent = calculatePercentage(usageStats.aiQueries.current, usageStats.aiQueries.max);
  const pdfPercent = calculatePercentage(usageStats.pdfEdits.current, usageStats.pdfEdits.max);
  const storagePercent = calculatePercentage(usageStats.storage.current, usageStats.storage.max);

  const generateCalendarDays = () => {
    const days = [];
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 111);
    
    const startDayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - startDayOfWeek);

    for (let i = 0; i < 112; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      days.push({ date: d, dateStr, dayOfWeek: d.getDay() });
    }
    return days;
  };

  const last7Days = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - idx));
    return d;
  });

  const chartData = last7Days.map((d) => {
    const dateStr = d.toISOString().split("T")[0];
    const activity = dailyActivity.find((act) => act.date === dateStr);
    return {
      dayLabel: d.toLocaleDateString("en-US", { weekday: "short" }),
      hoursSaved: activity ? activity.hoursSaved : 0,
    };
  });

  const maxVal = Math.max(...chartData.map(cd => cd.hoursSaved), 2);
  const chartPointsArray = chartData.map((cd, idx) => {
    const x = (idx * 85) + 50;
    const y = 160 - (cd.hoursSaved / maxVal * 100);
    return { x, y, val: cd.hoursSaved };
  });

  const chartPointsStr = chartPointsArray.map((pt) => `${pt.x},${pt.y}`).join(" ");
  const chartLabels = chartData.map((cd) => cd.dayLabel);

  const hour = new Date().getHours();
  let timeGreeting = "Welcome";
  if (hour < 12) timeGreeting = "Good morning";
  else if (hour < 18) timeGreeting = "Good afternoon";
  else if (hour < 22) timeGreeting = "Good evening";
  else timeGreeting = "Late night session";
  const greetingPrefix = loginCount <= 1 ? timeGreeting : `${timeGreeting} back`;

  const scholarLevel = Math.floor(userStats.hoursSaved / 5) + 1;
  const levelProgress = ((userStats.hoursSaved % 5) / 5) * 100;

  return (
    <div ref={containerRef} className="bbc relative mx-auto min-h-screen w-full max-w-[1600px] px-4 py-12 pb-32 sm:px-8 lg:px-12">

      {/* Top Profile Banner — kept intentionally understated. The floating
          emoji were pulled because they read as decorative noise on a
          workspace that's meant to feel serious. Avatar falls back to the
          user's initial in the brand colour instead of a graduation cap. */}
      <div className="welcome-bg relative mb-8 flex flex-col items-center justify-between overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-6 md:flex-row">
        <div className="relative z-10 flex items-center gap-6">
          <div className="h-16 w-16 rounded-full bg-[var(--color-blue-ink)] p-[2px]">
            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white text-[22px] font-semibold text-[var(--color-blue-ink)]">
              {userProfile?.photoURL ? (
                <img src={userProfile.photoURL} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                (userName || userProfile?.displayName || "S").trim().charAt(0).toUpperCase()
              )}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="welcome-text bbc-serif text-[26px] tracking-[-.01em] text-[var(--color-ink)]">
                {greetingPrefix}, {userName || userProfile?.displayName || "Scholar"}
              </h1>
              <div className="welcome-text flex items-center gap-1.5 rounded-full border border-[var(--color-line)] bg-[var(--color-blue-wash)] px-2 py-0.5">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-blue-ink)]"></div>
                <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-blue-ink)]">Live</span>
              </div>
            </div>
            <p className="welcome-text mt-1 text-sm font-medium text-[var(--color-ink-soft)]">
              You've saved <span className="font-bold text-[var(--color-blue-ink)]">{userStats.hoursSaved} study hours</span> so far.
            </p>
          </div>
        </div>

        <div className="mt-4 flex gap-4 rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper)] p-3 md:mt-0">
          <div className="border-r border-[var(--color-line)] px-4 text-center">
            <p className="bbc-eyebrow text-[10px]">Active streak</p>
            <p className="mt-1 flex items-center justify-center gap-1 text-xl font-black text-[var(--color-blue-ink)]">
              <Flame className="h-4 w-4 fill-[var(--color-blue-ink)]" /> {userStats.streakDays}
            </p>
          </div>
          <div className="px-4 text-center">
            <p className="bbc-eyebrow text-[10px]">Scholar level {scholarLevel}</p>
            <div className="relative mt-2 h-2.5 w-24 overflow-hidden rounded-full bg-[var(--color-line)]">
              <div className="absolute left-0 top-0 h-full rounded-full bg-[var(--color-blue-ink)]" style={{ width: `${levelProgress}%` }}></div>
            </div>
            <p className="mt-1 text-[9px] font-bold text-[var(--color-ink-faint)]">{5 - (userStats.hoursSaved % 5)} hrs to level up</p>
          </div>
        </div>
      </div>

      {/* Streak-save banner — only when a real streak is one missed day
          away from breaking (evaluateStreak keeps it honest: never shown
          for streaks that are safe today or already broken). */}
      {evaluateStreak(userStats.streakDays, lastLoggedDate).saveable && (
        <div className="dash-fade mb-8">
          <StreakSaveBanner
            streakDays={userStats.streakDays}
            onSaved={saveStreakToday}
            freeSaveAvailable={isFreeSaveAvailable(freeStreakSaveMonth)}
            onFreeSave={() => saveStreakToday({ free: true })}
            showToast={onShowToast}
          />
        </div>
      )}

      {/* Weekly Wrapped Banner */}
      <button
        onClick={() => setShowWrapped(true)}
        className="dash-fade group relative mb-8 flex w-full flex-col items-center justify-between gap-6 overflow-hidden rounded-2xl border border-white/10 bg-[var(--color-blue-deep)] p-6 text-left transition-all hover:brightness-110 md:flex-row md:p-8"
      >
        <div className="pointer-events-none absolute -left-32 -top-32 h-64 w-64 rounded-full bg-[var(--color-blue-ink)] opacity-40 blur-[80px] transition-opacity group-hover:opacity-60"></div>

        <div className="relative z-10 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-white/70" />
            <span className="text-xs font-bold uppercase tracking-wider text-white/70">Your 2026 season</span>
          </div>
          <h2 className="bbc-serif text-[28px] tracking-[-.01em] text-white md:text-[34px]">
            Your Weekly Study Wrapped is ready!
          </h2>
          <p className="mt-2 max-w-xl font-medium text-white/70">
            See a vibrant recap of your week's studying. Share your ranking and time saved to flex your progress.
          </p>
        </div>

        <div className="relative z-10 shrink-0">
          <div className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-[var(--color-blue-deep)] transition-transform group-hover:scale-105">
            <ImageIcon className="h-5 w-5" />
            View &amp; share image
          </div>
        </div>
      </button>

      {/* Segment Tabs */}
      <div className="dash-fade mb-8 flex w-full gap-3 rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-2">
        {([["workspace", "Study workspace"], ["analytics", "Stats & streaks"]] as const).map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-[15px] font-bold transition-all ${
              activeTab === tab
                ? "bg-[var(--color-blue-wash)] text-[var(--color-blue-ink)]"
                : "text-[var(--color-ink-soft)] hover:bg-[var(--color-paper)] hover:text-[var(--color-ink)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "workspace" ? (
        <motion.div
          key="workspace"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Readiness + Today's Plan — the reason to come back tomorrow */}
          <ReadinessCard />

          {/* Usage Stats Linear Bars */}
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: <Cpu className="h-4 w-4" />, label: "AI Co-Pilot Credit", value: `${usageStats.aiQueries.current} / ${usageStats.aiQueries.max}`, pct: aiPercent },
              { icon: <FileText className="h-4 w-4" />, label: "PDF Spots", value: `${usageStats.pdfEdits.current} / ${usageStats.pdfEdits.max}`, pct: pdfPercent },
              { icon: <HardDrive className="h-4 w-4" />, label: "Cloud Storage", value: `${usageStats.storage.current} MB / ${usageStats.storage.max} MB`, pct: storagePercent },
            ].map((s) => (
              <div key={s.label} className="stat-card relative overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-6">
                <div className="relative z-10 mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-[var(--color-blue-wash)] p-1.5 text-[var(--color-blue-ink)]">{s.icon}</div>
                    <h3 className="bbc-eyebrow text-[11px]">{s.label}</h3>
                  </div>
                  <span className="text-sm font-black text-[var(--color-ink)]">{s.value}</span>
                </div>
                <div className="mb-2 h-2 w-full rounded-full bg-[var(--color-line)]">
                  <div className="h-2 rounded-full bg-[var(--color-blue-ink)] transition-all duration-1000" style={{ width: `${isSyncing ? 0 : s.pct}%` }}></div>
                </div>
                <p className="text-right text-[10px] font-medium text-[var(--color-ink-faint)]">{s.pct}% used</p>
              </div>
            ))}
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left 2 column: Activity Log */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="bbc-serif flex items-center gap-2 text-[20px] tracking-[-.01em] text-[var(--color-ink)]">
                  <History className="h-5 w-5 text-[var(--color-blue-ink)]" /> Recent activity log
                </h2>
                <button className="text-xs font-bold text-[var(--color-blue-ink)] hover:underline">View all</button>
              </div>

              <div className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)]">
                {recentActivities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                    <div className="relative mb-6">
                      <div className="relative z-10 flex h-20 w-20 rotate-3 items-center justify-center rounded-3xl bg-[var(--color-blue-ink)] transition-all duration-300 hover:rotate-6 hover:scale-105">
                        <Sparkles className="h-10 w-10 text-white" />
                      </div>
                    </div>
                    <h4 className="bbc-serif mb-2 text-[20px] text-[var(--color-ink)]">Ready to level up?</h4>
                    <p className="mx-auto mb-6 max-w-[280px] text-sm leading-relaxed text-[var(--color-ink-soft)]">
                      Your study journey begins here. Jump into an AI session and watch the hours saved pile up.
                    </p>
                    <button onClick={() => onNavigateTo('pdf-editor')} className="bbc-btn bbc-btn-primary px-6 py-3 text-sm">
                      Start your first AI session
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="min-w-full">
                    <div className="grid grid-cols-12 gap-4 border-b border-[var(--color-line)] bg-[var(--color-paper)] px-6 py-3">
                      <div className="bbc-eyebrow col-span-5 text-[11px]">Action</div>
                      <div className="bbc-eyebrow col-span-3 text-[11px]">Status</div>
                      <div className="bbc-eyebrow col-span-2 text-[11px]">Cost</div>
                      <div className="bbc-eyebrow col-span-2 text-right text-[11px]">Time</div>
                    </div>
                    <div className="divide-y divide-[var(--color-line)]">
                      {recentActivities.map((act, i) => (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          key={act.id}
                          className="grid cursor-default grid-cols-12 items-center gap-4 px-6 py-4 transition-colors hover:bg-[var(--color-paper)]"
                        >
                          <div className="col-span-5">
                            <p className="truncate text-sm font-bold text-[var(--color-ink)]">{act.tool}</p>
                            <p className="truncate text-xs text-[var(--color-ink-faint)]">{act.target}</p>
                          </div>
                          <div className="col-span-3">
                            <span className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-line)] bg-[var(--color-blue-wash)] px-2 py-1 text-[10px] font-bold text-[var(--color-blue-ink)]">
                              <CheckCircle className="h-3 w-3" /> {act.status}
                            </span>
                          </div>
                          <div className="col-span-2 text-xs font-medium text-[var(--color-ink-soft)]">{act.cost}</div>
                          <div className="col-span-2 text-right text-xs font-medium text-[var(--color-ink-faint)]">{act.date}</div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right column: Referral + Quick Tools. The referral card sits
                on top because it turns the dashboard into a growth surface
                — every load is a chance for the user to share their link. */}
            <div className="space-y-6">
              <ReferralCard
                totalReferrals={referralCount}
                onCountRefreshed={refreshReferralCount}
                onClaim={claimReferralReward}
                rewardsClaimed={referralRewardsClaimed}
              />

              <div className="flex items-center justify-between">
                <h2 className="bbc-serif flex items-center gap-2 text-[20px] tracking-[-.01em] text-[var(--color-ink)]">
                  <Zap className="h-5 w-5 text-[var(--color-blue-ink)]" /> Quick utilities
                </h2>
              </div>
              <div className="grid gap-3">
                {quickTools.map((tool, i) => {
                  const isWaitlist = tool.view === "waitlist";
                  const isJoined = !!(tool.waitlistKey && joinedWaitlist[tool.waitlistKey]);
                  return (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      key={i}
                      onClick={() => {
                        if (isWaitlist && tool.waitlistKey) {
                          joinWaitlist(tool.waitlistKey);
                        } else {
                          onNavigateTo(tool.view);
                        }
                      }}
                      className={`group flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition-all ${
                        isWaitlist
                          ? "border-[var(--color-line)] bg-[var(--color-paper)] opacity-80"
                          : "border-[var(--color-line)] bg-[var(--color-paper-card)] hover:border-[var(--color-line-strong)]"
                      }`}
                    >
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg transition-all duration-300 group-hover:scale-110 ${
                        isWaitlist ? "bg-[var(--color-line)] text-[var(--color-ink-faint)]" : "bg-[var(--color-blue-wash)] text-[var(--color-blue-ink)]"
                      }`}>
                        {tool.icon}
                      </div>
                      <div>
                        <h3 className={`text-sm font-bold transition-colors ${
                          isWaitlist ? "text-[var(--color-ink-faint)]" : "text-[var(--color-ink)] group-hover:text-[var(--color-blue-ink)]"
                        }`}>{tool.name}</h3>
                        <p className="text-[10px] font-medium text-[var(--color-ink-soft)]">
                          {isJoined ? "✓ On the waitlist — we'll email you" : tool.desc}
                        </p>
                      </div>
                      {isWaitlist ? (
                        <div className="ml-auto flex h-6 items-center justify-center rounded-full bg-[var(--color-line)] px-2 text-[10px] font-bold text-[var(--color-ink-soft)]">
                          {isJoined ? "✓" : "+ Join"}
                        </div>
                      ) : (
                        <ArrowRight className="ml-auto h-4 w-4 text-[var(--color-ink-faint)] transition-all duration-300 group-hover:translate-x-1 group-hover:text-[var(--color-blue-ink)]" />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          key="analytics"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Calendar & Chart Container */}
          <div className="grid gap-8 lg:grid-cols-2">
            
            {/* Contribution Calendar */}
            <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-8">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="bbc-serif flex items-center gap-2 text-[20px] tracking-[-.01em] text-[var(--color-ink)]">
                  <Calendar className="h-5 w-5 text-[var(--color-blue-ink)]" /> Study contribution map
                </h3>
                <span className="bbc-eyebrow text-[11px]">Past 16 weeks</span>
              </div>
              <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
                {Array.from({ length: 16 }).map((_, colIdx) => (
                  <div key={colIdx} className="flex flex-col gap-1">
                    {generateCalendarDays()
                      .slice(colIdx * 7, (colIdx + 1) * 7)
                      .map((day, rowIdx) => {
                        const hasActivity = dailyActivity.find(a => a.date === day.dateStr);
                        const points = hasActivity ? (hasActivity.queriesUsed + hasActivity.cardsCreated * 5) : 0;
                        let colorClass = "bg-[var(--color-line)] border-[var(--color-line)]";
                        if (points > 0 && points <= 20) colorClass = "bg-[#BFCBFF] border-[#BFCBFF]";
                        else if (points > 20 && points <= 50) colorClass = "bg-[#6E84E8] border-[#6E84E8]";
                        else if (points > 50 && points <= 100) colorClass = "bg-[var(--color-blue-ink)] border-[var(--color-blue-ink)]";
                        else if (points > 100) colorClass = "bg-[var(--color-blue-deep)] border-[var(--color-blue-deep)]";

                        return (
                          <div
                            key={rowIdx}
                            className={`h-3 w-3 rounded-[3px] border transition-colors duration-300 ${colorClass}`}
                            title={`${day.dateStr}: ${points} pts`}
                          ></div>
                        );
                      })}
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Hours SVG Chart */}
            <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-8">
              <div className="mb-6">
                <h3 className="bbc-serif flex items-center gap-2 text-[20px] tracking-[-.01em] text-[var(--color-ink)]">
                  <Activity className="h-5 w-5 text-[var(--color-blue-ink)]" /> Weekly hours saved
                </h3>
              </div>
              <div className="relative h-48 w-full border-b border-l border-[var(--color-line)]">
                <svg viewBox="0 0 600 180" className="h-full w-full overflow-visible">
                  <motion.polyline
                    fill="none"
                    stroke="var(--color-blue-ink)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={chartPointsStr}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                  />

                  {chartPointsArray.map((pt, i) => (
                    <motion.g key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 + i * 0.1 }}>
                      <circle cx={pt.x} cy={pt.y} r="5" fill="white" stroke="var(--color-blue-ink)" strokeWidth="3" className="transition-transform duration-200 hover:scale-150" />
                      <text x={pt.x} y={pt.y - 15} fill="#5B5F69" fontSize="12" fontWeight="bold" textAnchor="middle">{pt.val}h</text>
                      <text x={pt.x} y="195" fill="#8A8D95" fontSize="12" fontWeight="600" textAnchor="middle">{chartLabels[i]}</text>
                    </motion.g>
                  ))}
                </svg>
              </div>
            </div>
          </div>



        </motion.div>
      )}

      {/* Render the Wrapped modal */}
      {showWrapped && (
        <WeeklyWrapped 
          onClose={() => setShowWrapped(false)} 
          userStats={userStats} 
        />
      )}
    </div>
  );
};
