"use client";

import React, { useState, useEffect } from "react";
import { ActiveView, UsageStats, UserStats, DailyActivity, StudyAchievement } from "../types";
import { Sparkles, ArrowRight, Zap, FileText, ImageIcon, HardDrive, Cpu, History, AlertTriangle, BookOpen, Layers, Award, Calendar, Trophy, CheckCircle, Clock, Flame, Activity } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);


import { useGlobalState } from "../context/GlobalStateContext";
import { useRouter } from "next/navigation";
import { WeeklyWrapped } from "./WeeklyWrapped";

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
  } = useGlobalState();
  const router = useRouter();
  const [showWrapped, setShowWrapped] = useState(false);

  const onNavigateTo = (view: ActiveView | string) => {
    const paths: Record<string, string> = {
      landing: '/',
      dashboard: '/dashboard',
      about: '/about',
      'study-material-page': '/study-material',
      'virtual-test': '/virtual-test',
      tools: '/tools',
      pricing: '/pricing',
      flashcards: '/flashcards',
      'seniors-opinion': '/seniors',
      'create-profile': '/create-profile',
      'pdf-editor': '/pdf-editor'
    };
    router.push(paths[view as string] || `/${view}`);
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
    }
  }, { scope: containerRef, dependencies: [activeTab] });

  // recentActivities is now passed as a prop from Firestore
  // If no activities exist, we will show an empty state.

  const quickTools = [
    { name: "Smart Summarizer", desc: "Instantly compress full articles", icon: "📝", view: "tools" as ActiveView, toolId: "smart-summarizer" },
    { name: "AI PDF Reader", desc: "Interact with journals and papers", icon: "📖", view: "pdf-editor" as ActiveView },
    { name: "Math Formula Solver", desc: "Visual LaTeX mathematical OCR", icon: "📐", view: "tools" as ActiveView, toolId: "math-solver" },
    { name: "PDF to Speech", desc: "Convert text into voice lecture", icon: "🔊", view: "tools" as ActiveView, toolId: "pdf-to-speech" },
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
    <div ref={containerRef} className="mx-auto max-w-[1600px] w-full px-4 py-12 sm:px-8 lg:px-12 min-h-screen pb-32">
      
      {/* Top Profile Banner */}
      <div 
        className="welcome-bg relative overflow-hidden mb-8 flex flex-col md:flex-row items-center justify-between bg-white rounded-3xl p-6 border border-gray-100 shadow-xs"
      >
        {/* Floating Background Icons */}
        <div className="absolute top-2 left-1/4 floating-icon text-3xl pointer-events-none drop-shadow-sm blur-[1px]">📘</div>
        <div className="absolute bottom-2 left-1/3 floating-icon text-2xl pointer-events-none drop-shadow-sm blur-[0.5px]">🖊️</div>
        <div className="absolute top-6 right-[30%] floating-icon text-4xl pointer-events-none drop-shadow-sm blur-[1px]">💻</div>
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-brand-sky to-indigo-500 p-[2px] shadow-md">
            <div className="h-full w-full rounded-full bg-white flex items-center justify-center text-xl overflow-hidden">
              {userProfile?.photoURL ? (
                <img src={userProfile.photoURL} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                "🎓"
              )}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="welcome-text text-2xl font-black text-slate-900 font-display">
                {greetingPrefix}, {userName || userProfile?.displayName || "Scholar"}!
              </h1>
              <div className="welcome-text flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">Live</span>
              </div>
            </div>
            <p className="welcome-text text-sm text-text-muted font-medium mt-1">
              You've saved <span className="font-bold text-accent">{userStats.hoursSaved} study hours</span> using AI Co-pilots.
            </p>
          </div>
        </div>
        
        <div className="flex gap-4 mt-4 md:mt-0 bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <div className="text-center px-4 border-r border-gray-200">
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Active Streak</p>
            <p className="text-xl font-black text-orange-500 mt-1 flex items-center justify-center gap-1">
              <Flame className="w-4 h-4 fill-orange-500" /> {userStats.streakDays}
            </p>
          </div>
          <div className="text-center px-4">
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Scholar Level {scholarLevel}</p>
            <div className="mt-2 w-24 h-2.5 bg-slate-200 rounded-full overflow-hidden relative">
              <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${levelProgress}%` }}></div>
            </div>
            <p className="text-[9px] font-bold text-slate-400 mt-1">{5 - (userStats.hoursSaved % 5)} hrs to level up</p>
          </div>
        </div>
      </div>

      {/* Prominent Weekly Wrapped Banner */}
      <button
        onClick={() => setShowWrapped(true)}
        className="w-full text-left mb-8 relative overflow-hidden bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 rounded-3xl p-6 md:p-8 cursor-pointer shadow-lg shadow-fuchsia-500/20 hover:shadow-fuchsia-500/40 transition-all group border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 group-hover:opacity-40 transition-opacity"></div>
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-fuchsia-400 rounded-full mix-blend-screen filter blur-[80px] opacity-30 group-hover:opacity-60 transition-opacity"></div>
        <div className="absolute top-1/2 -right-32 w-80 h-80 bg-blue-400 rounded-full mix-blend-screen filter blur-[100px] opacity-30 group-hover:opacity-60 transition-opacity"></div>
        
        <div className="relative z-10 flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-fuchsia-200" />
            <span className="text-fuchsia-100 font-bold tracking-wider text-xs uppercase">Your 2026 Season</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white font-display">
            Your Weekly Study Wrapped is Ready!
          </h2>
          <p className="text-fuchsia-100 font-medium mt-2 max-w-xl">
            See a vibrant, Spotify-style recap of your week's studying. Share your ranking and time saved directly to Instagram or Snapchat to flex your progress!
          </p>
        </div>
        
        <div className="relative z-10 shrink-0">
          <div className="bg-white text-fuchsia-700 px-6 py-3 rounded-2xl font-black shadow-xl flex items-center gap-2 group-hover:scale-105 transition-transform">
            <ImageIcon className="w-5 h-5" />
            View & Share Image
          </div>
        </div>
      </button>

      {/* Segment Tab Controller - Beautiful Full-Width Buttons */}
      <div className="mb-8 flex w-full gap-4 bg-white p-2 rounded-[20px] shadow-sm border border-slate-100">
        <button
          onClick={() => setActiveTab("workspace")}
          className={`flex-1 py-3.5 rounded-xl text-[15px] font-bold transition-all flex items-center justify-center gap-2 border-2 ${
            activeTab === "workspace" 
              ? "bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm" 
              : "bg-transparent border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800"
          }`}
        >
          📚 Study Workspace
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex-1 py-3.5 rounded-xl text-[15px] font-bold transition-all flex items-center justify-center gap-2 border-2 ${
            activeTab === "analytics" 
              ? "bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm" 
              : "bg-transparent border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800"
          }`}
        >
          📊 Stats & Streaks
        </button>
      </div>

      {activeTab === "workspace" ? (
        <motion.div 
          key="workspace"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Usage Stats Linear Bars */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="stat-card rounded-2xl border border-yellow-200 bg-[#fef08a] p-6 shadow-[0_4px_20px_rgba(250,204,21,0.15)] relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-400 rounded-full mix-blend-multiply opacity-30 blur-[30px]"></div>
              <div className="flex justify-between items-center mb-4 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg"><Cpu className="w-4 h-4" /></div>
                  <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">AI Co-Pilot Credit</h3>
                </div>
                <span className="text-sm font-black text-slate-900">{usageStats.aiQueries.current} / {usageStats.aiQueries.max}</span>
              </div>
              <div className="w-full bg-surface-glass rounded-full h-2 mb-2">
                <div className="bg-indigo-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${isSyncing ? 0 : aiPercent}%` }}></div>
              </div>
              <p className="text-[10px] text-text-secondary font-medium text-right">{aiPercent}% Used</p>
            </div>

            <div className="stat-card rounded-2xl border border-emerald-200 bg-[#dcfce7] p-6 shadow-[0_4px_20px_rgba(52,211,153,0.15)] relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-400 rounded-full mix-blend-multiply opacity-30 blur-[30px]"></div>
              <div className="flex justify-between items-center mb-4 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-sky-50 text-sky-600 rounded-lg"><FileText className="w-4 h-4" /></div>
                  <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">PDF Spots</h3>
                </div>
                <span className="text-sm font-black text-slate-900">{usageStats.pdfEdits.current} / {usageStats.pdfEdits.max}</span>
              </div>
              <div className="w-full bg-surface-glass rounded-full h-2 mb-2">
                <div className="bg-sky-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${isSyncing ? 0 : pdfPercent}%` }}></div>
              </div>
              <p className="text-[10px] text-text-secondary font-medium text-right">{pdfPercent}% Used</p>
            </div>

            <div className="stat-card rounded-2xl border border-purple-200 bg-[#f3e8ff] p-6 shadow-[0_4px_20px_rgba(168,85,247,0.15)] relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-400 rounded-full mix-blend-multiply opacity-30 blur-[30px]"></div>
              <div className="flex justify-between items-center mb-4 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><HardDrive className="w-4 h-4" /></div>
                  <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Cloud Storage</h3>
                </div>
                <span className="text-sm font-black text-slate-900">{usageStats.storage.current} MB / {usageStats.storage.max} MB</span>
              </div>
              <div className="w-full bg-surface-glass rounded-full h-2 mb-2">
                <div className="bg-emerald-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${isSyncing ? 0 : storagePercent}%` }}></div>
              </div>
              <p className="text-[10px] text-text-secondary font-medium text-right">{storagePercent}% Used</p>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left 2 column: Activity Log */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-display text-lg font-black text-slate-900">
                  <History className="w-5 h-5 text-accent" /> Recent Activity Log
                </h2>
                <button className="text-xs font-bold text-accent hover:underline">View All</button>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                {recentActivities.length === 0 ? (
                  <div className="px-6 py-12 text-center flex flex-col items-center justify-center bg-gradient-to-b from-white to-slate-50">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-blue-200 blur-[30px] rounded-full opacity-50 mix-blend-multiply"></div>
                      <div className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-3xl shadow-xl flex items-center justify-center transform rotate-3 relative z-10 hover:rotate-6 hover:scale-105 transition-all duration-300">
                        <Sparkles className="w-10 h-10 text-white" />
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full border-4 border-white z-20 flex items-center justify-center shadow-sm">
                        <Zap className="w-4 h-4 text-yellow-900" />
                      </div>
                    </div>
                    <h4 className="text-lg font-black text-slate-900 mb-2">Ready to level up?</h4>
                    <p className="text-sm text-slate-500 max-w-[280px] mx-auto mb-6 leading-relaxed">
                      Your study journey begins here. Jump into an AI session and watch the hours saved pile up!
                    </p>
                    <button 
                      onClick={() => onNavigateTo('tools')}
                      className="px-6 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold shadow-lg hover:bg-indigo-600 hover:shadow-indigo-500/25 transition-all duration-300 flex items-center gap-2 group"
                    >
                      Start your first AI Session
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                ) : (
                  <div className="min-w-full">
                    <div className="bg-surface-solid border-b border-gray-100 px-6 py-3 grid grid-cols-12 gap-4">
                      <div className="col-span-5 text-xs font-bold text-text-muted uppercase tracking-wider">Action</div>
                      <div className="col-span-3 text-xs font-bold text-text-muted uppercase tracking-wider">Status</div>
                      <div className="col-span-2 text-xs font-bold text-text-muted uppercase tracking-wider">Cost</div>
                      <div className="col-span-2 text-right text-xs font-bold text-text-muted uppercase tracking-wider">Time</div>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {recentActivities.map((act, i) => (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          key={act.id} 
                          className="px-6 py-4 grid grid-cols-12 gap-4 items-center hover:bg-surface-solid transition-colors cursor-default"
                        >
                          <div className="col-span-5">
                            <p className="text-sm font-bold text-slate-900 truncate">{act.tool}</p>
                            <p className="text-xs text-text-muted truncate">{act.target}</p>
                          </div>
                          <div className="col-span-3">
                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
                              <CheckCircle className="w-3 h-3" /> {act.status}
                            </span>
                          </div>
                          <div className="col-span-2 text-xs font-medium text-slate-600">
                            {act.cost}
                          </div>
                          <div className="col-span-2 text-right text-xs text-text-muted font-medium">
                            {act.date}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right column: Quick Tools */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-display text-lg font-black text-slate-900">
                  <Zap className="w-5 h-5 text-amber-500" /> Quick Utilities
                </h2>
              </div>
              <div className="grid gap-3">
                {quickTools.map((tool, i) => {
                  const bgColors = ["bg-[#fce7f3] border-pink-200", "bg-[#e0e7ff] border-indigo-200", "bg-[#ffedd5] border-orange-200", "bg-[#ccfbf1] border-teal-200"];
                  const iconColors = ["bg-white text-pink-500", "bg-white text-indigo-500", "bg-white text-orange-500", "bg-white text-teal-500"];
                  return (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    key={i}
                    onClick={() => {
                      if (tool.toolId) {
                        localStorage.setItem("bluebottlecap_active_tool", tool.toolId);
                      }
                      onNavigateTo(tool.view);
                    }}
                    className={`flex items-center gap-4 rounded-2xl border ${bgColors[i % bgColors.length]} p-4 shadow-sm hover:shadow-lg transition-all cursor-pointer group`}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconColors[i % iconColors.length]} text-lg shadow-sm transform group-hover:scale-110 group-hover:-rotate-12 transition-all duration-300`}>
                      {tool.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors duration-300">{tool.name}</h3>
                      <p className="text-[10px] text-slate-600 font-medium">{tool.desc}</p>
                    </div>
                    <ArrowRight className="ml-auto w-4 h-4 text-slate-400 group-hover:text-indigo-500 transform group-hover:translate-x-1 transition-all duration-300" />
                  </motion.div>
                )})}
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
            <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-display text-lg font-black text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-500" /> Study Contribution Map
                </h3>
                <span className="text-xs font-bold text-text-secondary">Past 16 Weeks</span>
              </div>
              <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
                {Array.from({ length: 16 }).map((_, colIdx) => (
                  <div key={colIdx} className="flex flex-col gap-1">
                    {generateCalendarDays()
                      .slice(colIdx * 7, (colIdx + 1) * 7)
                      .map((day, rowIdx) => {
                        const hasActivity = dailyActivity.find(a => a.date === day.dateStr);
                        const points = hasActivity ? (hasActivity.queriesUsed + hasActivity.cardsCreated * 5) : 0;
                        let colorClass = "bg-surface-glass border-gray-100";
                        if (points > 0 && points <= 20) colorClass = "bg-emerald-100 border-emerald-200";
                        else if (points > 20 && points <= 50) colorClass = "bg-emerald-300 border-emerald-400";
                        else if (points > 50 && points <= 100) colorClass = "bg-emerald-500 border-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.4)]";
                        else if (points > 100) colorClass = "bg-emerald-700 border-emerald-800 shadow-[0_0_12px_rgba(4,120,87,0.6)]";
                        
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
            <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
              <div className="mb-6">
                <h3 className="font-display text-lg font-black text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-accent" /> Weekly Hours Saved
                </h3>
              </div>
              <div className="relative h-48 w-full border-b border-l border-border-subtle">
                <svg viewBox="0 0 600 180" className="h-full w-full overflow-visible drop-shadow-md">
                  <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#38BDF8" />
                      <stop offset="100%" stopColor="#2563EB" />
                    </linearGradient>
                  </defs>
                  
                  <motion.polyline
                    fill="none"
                    stroke="url(#lineGrad)"
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
                      <circle cx={pt.x} cy={pt.y} r="5" fill="white" stroke="#2563EB" strokeWidth="3" className="transition-transform hover:scale-150 duration-200" />
                      <text x={pt.x} y={pt.y - 15} fill="#64748b" fontSize="12" fontWeight="bold" textAnchor="middle">{pt.val}h</text>
                      <text x={pt.x} y="195" fill="#94a3b8" fontSize="12" fontWeight="600" textAnchor="middle">{chartLabels[i]}</text>
                    </motion.g>
                  ))}
                </svg>
              </div>
            </div>
          </div>

          {/* Reports & Data Exports */}
          <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
            <div className="mb-6">
              <h3 className="font-display text-lg font-black text-slate-900 flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-slate-700" /> Reports & Data Export
              </h3>
              <p className="text-sm text-text-muted mt-1">Download your raw study data, view your Spotify-style Wrapped, or generate deep AI-driven analysis reports.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-indigo-200 bg-[#e0e7ff] shadow-[0_4px_20px_rgba(99,102,241,0.15)] p-6 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-300 rounded-full mix-blend-multiply opacity-30 blur-[30px]"></div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 mb-1">Basic Progress Export</h4>
                  <p className="text-xs text-text-muted leading-relaxed mb-4">
                    Download a raw CSV file containing your daily study habits, tool usage statistics, and login history.
                  </p>
                </div>
                <button 
                  onClick={() => onShowToast && onShowToast("Downloading basic progress data...", "success")}
                  className="w-full py-2.5 rounded-xl bg-white border border-gray-200 text-slate-700 hover:bg-surface-solid text-sm font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <FileText className="w-4 h-4" /> Download CSV Data
                </button>
              </div>

              <div className={`rounded-2xl border p-6 flex flex-col justify-between relative overflow-hidden ${
                userStats.streakDays >= 30 ? "border-pink-300 bg-[#fce7f3] shadow-[0_4px_20px_rgba(236,72,153,0.15)]" : "border-pink-200 bg-[#fdf2f8] opacity-90"
              }`}>
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-300 rounded-full mix-blend-multiply opacity-30 blur-[30px]"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-base font-bold ${userStats.streakDays >= 30 ? "text-accent" : "text-slate-900"}`}>
                      Deep Analysis Report
                    </h4>
                    <span className="bg-white border border-gray-200 text-accent text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-xs">
                      1st Free, Then Paid
                    </span>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed mb-4">
                    Track your live progress, identify areas of weakness, pinpoint where you work most efficiently, and map your academic interests.
                  </p>
                </div>

                <div className="relative z-10">
                  {userStats.streakDays >= 30 ? (
                    <button 
                      onClick={() => onShowToast && onShowToast("Generating your AI Deep Analysis Report...", "success")}
                      className="w-full py-2.5 rounded-xl bg-accent text-white text-sm font-bold shadow-md hover:bg-brand-navy transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" /> Generate Detailed Report
                    </button>
                  ) : (
                    <div className="w-full">
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-3">
                        <div className="bg-accent h-1.5 rounded-full" style={{ width: `${Math.min((userStats.streakDays / 30) * 100, 100)}%` }}></div>
                      </div>
                      <button disabled className="w-full py-2.5 rounded-xl bg-white text-text-secondary text-sm font-bold flex items-center justify-center gap-2 cursor-not-allowed border border-gray-200">
                        🔒 Unlocks at 30-Day Streak ({userStats.streakDays}/30)
                      </button>
                    </div>
                  )}
                </div>
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
