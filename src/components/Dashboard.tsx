"use client";

import React, { useState } from "react";
import { ActiveView, UsageStats, UserStats, DailyActivity, StudyAchievement } from "../types";
import { Sparkles, ArrowRight, Zap, FileText, ImageIcon, HardDrive, Cpu, History, AlertTriangle, BookOpen, Layers, Award, Calendar, Trophy, CheckCircle, Clock, Flame } from "lucide-react";
import { useAuth } from "../context/AuthContext";


interface DashboardProps {
  onNavigateTo: (view: ActiveView) => void;
  userStats: UserStats;
  usageStats: UsageStats;
  dailyActivity: DailyActivity[];
  achievements: StudyAchievement[];
  onIncrementReviewCount: () => void;
  todayReviewsCount: number;
  /** Real display name or email prefix from Firebase auth */
  userName?: string;
  /** Fires a global toast notification */
  onShowToast?: (message: string, type?: "success" | "error" | "info" | "warning") => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigateTo,
  userStats,
  usageStats,
  dailyActivity,
  achievements,
  onIncrementReviewCount,
  todayReviewsCount,
  userName,
  onShowToast,
}) => {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<"workspace" | "analytics">("workspace");

  // Mock recent files and logs database
  const recentActivities = [] as any[];

  const quickTools: { name: string; desc: string; icon: string; view: ActiveView }[] = [
    { name: "Smart Summarizer", desc: "Instantly compress full articles", icon: "📝", view: "tools" },
    { name: "AI PDF Reader", desc: "Interact with journals and papers", icon: "📖", view: "pdf-editor" },
    { name: "Math Formula Solver", desc: "Visual LaTeX mathematical OCR", icon: "📐", view: "tools" },
    { name: "PDF to Speech", desc: "Convert text into voice lecture", icon: "🔊", view: "tools" },
  ];

  // Helper inside dashboard layout
  const calculatePercentage = (current: number, max: number) => {
    return Math.min(Math.round((current / max) * 100), 100);
  };

  const aiPercent = calculatePercentage(usageStats.aiQueries.current, usageStats.aiQueries.max);
  const pdfPercent = calculatePercentage(usageStats.pdfEdits.current, usageStats.pdfEdits.max);
  const storagePercent = calculatePercentage(usageStats.storage.current, usageStats.storage.max);

  // Generate days for GitHub-style 16-week contribution calendar
  const generateCalendarDays = () => {
    const days = [];
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 111);
    
    // Align starting cell to Sunday
    const startDayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - startDayOfWeek);

    for (let i = 0; i < 112; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      days.push({
        date: d,
        dateStr,
        dayOfWeek: d.getDay(),
      });
    }
    return days;
  };

  // Generate days and points for SVG weekly chart
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 fade-in">
      
      {/* Segment Tab Controller */}
      <div className="mb-6 inline-flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1.5 shadow-inner">
        <button
          onClick={() => setActiveTab("workspace")}
          className={`rounded-xl px-5 py-2.5 text-xs font-bold transition-all cursor-pointer ${
            activeTab === "workspace"
              ? "bg-white dark:bg-slate-900 text-brand-navy dark:text-white shadow-xs"
              : "text-gray-500 dark:text-slate-400 hover:text-brand-navy dark:text-white"
          }`}
        >
          📚 Study Workspace
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`rounded-xl px-5 py-2.5 text-xs font-bold transition-all cursor-pointer ${
            activeTab === "analytics"
              ? "bg-white dark:bg-slate-900 text-brand-navy dark:text-white shadow-xs"
              : "text-gray-500 dark:text-slate-400 hover:text-brand-navy dark:text-white"
          }`}
        >
          📊 Stats & Streaks
        </button>
      </div>

      {activeTab === "workspace" ? (
        <div className="fade-in">
          {/* Welcome Banner */}
          <div className="mb-8 rounded-2xl bg-linear-to-r from-brand-navy via-slate-800 to-indigo-950 p-6 text-white shadow-md md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  {/* User avatar bubble */}
                  {userProfile?.avatarSvg ? (
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-full overflow-hidden bg-brand-cobalt/20 flex items-center justify-center shadow-sm shrink-0 border-2 border-white/10" dangerouslySetInnerHTML={{ __html: userProfile.avatarSvg }} />
                    </div>
                  ) : userName && (
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-brand-cobalt to-indigo-400 flex items-center justify-center text-xs font-black text-white shadow-sm shrink-0">
                        {userName.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  )}
                  <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300">
                    ⚡ Scholar Workspace Active
                  </span>
                  <span className="text-xs text-gray-400">🔥 Day {userStats.streakDays} Streak</span>
                </div>
                <h1 className="mt-2 text-2.5xl font-bold tracking-tight md:text-3.5xl font-display">
                  Welcome back, {userName ? <span className="text-brand-sky">{userName}</span> : "Scholar"}!
                </h1>
                <p className="mt-2 text-sm text-slate-300 max-w-xl">
                  You've saved <strong className="font-semibold text-white">{userStats.hoursSaved} study hours</strong> using BlueBottleCap co-pilots. Your research accuracy is up 48%.
                </p>
              </div>
              <div>
                <button
                  onClick={() => onNavigateTo("pdf-editor")}
                  className="group flex items-center gap-2 rounded-xl bg-white dark:bg-slate-900 px-5 py-3 text-sm font-bold text-brand-navy dark:text-white shadow-sm transition hover:bg-blue-50 cursor-pointer text-center w-full md:w-auto"
                >
                  <span>Resume Study Session</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>

          {/* Core Limits and Progress Rings Section */}
          <div className="mb-8 grid gap-6 md:grid-cols-3">
            {/* Card 1: AI Queries */}
            <div className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">AI Co-Pilot Credit</span>
                  <h3 className="mt-1 font-display text-2xl font-bold text-brand-navy dark:text-white">
                    {usageStats.aiQueries.current} <span className="text-sm font-medium text-gray-400">/ {usageStats.aiQueries.max} remaining</span>
                  </h3>
                </div>
                <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                  <Cpu className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400 mb-1">
                  <span>Monthly Refresh Cycle</span>
                  <span>{Math.round((usageStats.aiQueries.current / usageStats.aiQueries.max) * 100)}% Available</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${(usageStats.aiQueries.current / usageStats.aiQueries.max) * 100}%` }}
                  ></div>
                </div>
              </div>

              {usageStats.aiQueries.current <= 5 && (
                <div className="mt-3.5 flex items-center gap-1.5 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-800">
                  <AlertTriangle className="h-4.5 w-4.5 text-amber-600 shrink-0" />
                  <span>Credits running low. Go Pro for limitless queries.</span>
                </div>
              )}
            </div>

            {/* Card 2: PDF Editors */}
            <div className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">PDF Document Spots</span>
                  <h3 className="mt-1 font-display text-2xl font-bold text-brand-navy dark:text-white">
                    {usageStats.pdfEdits.current} <span className="text-sm font-medium text-gray-400">/ {usageStats.pdfEdits.max} used</span>
                  </h3>
                </div>
                <div className="rounded-lg bg-sky-50 p-2 text-sky-600">
                  <FileText className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400 mb-1">
                  <span>Active Files Limit</span>
                  <span>{pdfPercent}% Full</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-2.5 rounded-full transition-all duration-500 ${pdfPercent >= 80 ? "bg-rose-500" : "bg-sky-500"}`}
                    style={{ width: `${pdfPercent}%` }}
                  ></div>
                </div>
              </div>

              {pdfPercent >= 80 && (
                <div className="mt-3.5 flex items-center gap-1.5 rounded-lg bg-rose-50 p-2.5 text-xs text-rose-800">
                  <AlertTriangle className="h-4.5 w-4.5 text-rose-600 shrink-0" />
                  <span>Full quota reached! Upgrade to save more annotated PDFs.</span>
                </div>
              )}
            </div>

            {/* Card 3: Cloud Storage */}
            <div className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Cloud Scholar Drive</span>
                  <h3 className="mt-1 font-display text-2xl font-bold text-brand-navy dark:text-white">
                    {usageStats.storage.current} MB <span className="text-sm font-medium text-gray-400">/ {usageStats.storage.max} MB</span>
                  </h3>
                </div>
                <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                  <HardDrive className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400 mb-1">
                  <span>Drive Capacity</span>
                  <span>{storagePercent}% Used</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${storagePercent}%` }}
                  ></div>
                </div>
              </div>

              <p className="mt-4.5 text-center text-xs text-gray-400 font-mono">
                Synced via secure Cloud Sandbox
              </p>
            </div>
          </div>

          {userStats.activePlan !== "Pro" && userStats.activePlan !== "Elite" && (
            <div className="mb-8 rounded-2xl border border-amber-200 bg-linear-to-r from-amber-500/5 via-amber-500/10 to-transparent p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <h4 className="text-sm font-extrabold text-amber-900 tracking-tight">UPGRADE CORE: UNLEASH RESEARCH WITH PRO ACTIONS</h4>
                  </div>
                  <p className="mt-1 text-xs text-amber-800 leading-normal max-w-2xl">
                    Unlock <strong>Unlimited AI Assistant requests</strong>, 10 GB cloud storage, direct Google Workspace drive integration, and premium Gemini Pro academic speeds.
                  </p>
                </div>
                <button
                  onClick={() => onNavigateTo("pricing")}
                  className="rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-amber-600 transition cursor-pointer shrink-0"
                >
                  Unlock Pro Scholar - View Plans
                </button>
              </div>
            </div>
          )}

          {/* Main Grid: Quick Tools & Recent Files */}
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left 2 column: Quick Access & Table */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Quick Access Tools */}
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-display text-lg font-bold text-brand-navy dark:text-white">Core Scholar Utilities</h2>
                  <button 
                    onClick={() => onNavigateTo("tools")}
                    className="text-xs font-bold text-brand-cobalt hover:underline"
                  >
                    View all 12 tools →
                  </button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {quickTools.map((t) => (
                    <div
                      key={t.name}
                      onClick={() => onNavigateTo(t.view)}
                      className="flex cursor-pointer items-center gap-4 rounded-xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs transition hover:border-brand-cobalt hover:shadow-md hover:bg-slate-50 dark:bg-slate-950/20"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-950 text-xl shadow-inner leading-none">
                        {t.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-brand-navy dark:text-white text-sm leading-tight">{t.name}</h3>
                        <p className="mt-0.5 text-xs text-gray-400">{t.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Logs & File Runs */}
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <History className="w-4.5 h-4.5 text-gray-400" />
                  <h2 className="font-display text-lg font-bold text-brand-navy dark:text-white">Recent Study Activity Database</h2>
                </div>
                <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-md border-collapse text-left text-sm">
                      <thead className="border-b border-gray-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">
                        <tr>
                          <th className="px-5 py-3">Scholar Tool run</th>
                          <th className="px-5 py-3">Associated Target</th>
                          <th className="px-5 py-3">Status</th>
                          <th className="px-5 py-3">Cost</th>
                          <th className="px-5 py-3">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {recentActivities.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-5 py-8 text-center text-xs text-gray-400 font-sans">
                              No recent activity. Use any tool in the "Tools Suite" or "AI PDF Reader" to log actions.
                            </td>
                          </tr>
                        ) : (
                          recentActivities.map((act) => (
                            <tr key={act.id} className="hover:bg-slate-50 dark:bg-slate-950/50">
                              <td className="px-5 py-4 font-semibold text-brand-navy dark:text-white">{act.tool}</td>
                              <td className="px-5 py-4 text-xs text-gray-500 dark:text-slate-400 font-mono truncate">{act.target}</td>
                              <td className="px-5 py-4">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold leading-none ${
                                  act.status.includes("Success") || act.status === "Completed"
                                    ? "bg-teal-50 text-teal-700"
                                    : "bg-amber-50 text-amber-700"
                                }`}>
                                  ● {act.status}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-xs text-gray-500 dark:text-slate-400 font-bold">{act.cost}</td>
                              <td className="px-5 py-4 text-xs text-gray-400">{act.date}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            </div>

            {/* Right 1 column: Scholar Insight Sidebar */}
            <div className="space-y-6">
              {/* Faux Profile Card */}
              <div className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm text-center">
                <div className="relative mx-auto h-20 w-20 rounded-full bg-linear-to-tr from-brand-cobalt to-indigo-600 p-0.5 shadow-sm">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-white dark:bg-slate-900 font-extrabold text-2xl text-brand-navy dark:text-white overflow-hidden">
                    {userProfile?.avatarSvg ? (
                      <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: userProfile.avatarSvg }} />
                    ) : (
                      "🎓"
                    )}
                  </div>
                  <span className="absolute bottom-0 right-0 rounded-full bg-orange-500 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase border-2 border-white">
                    Online
                  </span>
                </div>

                <h3 className="mt-4 font-display font-extrabold text-brand-navy dark:text-white text-lg">{userName || "Guest Scholar"}</h3>
                <p className="text-xs text-gray-400 font-medium">
                  {userName ? "Undergraduate Researcher" : "Sandbox Demo Profile"}
                </p>
                
                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-gray-100 dark:border-slate-800 pt-4 text-left">
                  <div className="rounded-xl bg-orange-50/30 p-3 text-center">
                    <span className="block text-xs text-orange-600 font-bold leading-none">🔥 {userStats.streakDays} Days</span>
                    <span className="mt-1 block text-[10px] text-gray-400 font-medium font-mono uppercase tracking-widest">Streak</span>
                  </div>
                  <div className="rounded-xl bg-brand-cobalt/5 p-3 text-center">
                    <span className="block text-xs text-brand-cobalt font-bold leading-none">⚡ {userStats.hoursSaved} Hours</span>
                    <span className="mt-1 block text-[10px] text-gray-400 font-medium font-mono uppercase tracking-widest">Saved</span>
                  </div>
                </div>
              </div>

              {/* Homework Help Banner / OCR Widget */}
              <div className="rounded-2xl border border-indigo-100 bg-linear-to-b from-indigo-50/20 to-white p-6 shadow-xs">
                <h3 className="font-display font-extrabold text-brand-navy dark:text-white">Visual OCR solver widget</h3>
                <p className="mt-1.5 text-xs text-gray-500 dark:text-slate-400 leading-normal">
                  Snap, paste, or upload a blurred equation chart from your textbook to format it into accurate LaTeX and receive a detailed Socratic analysis instantly.
                </p>
                <button
                  onClick={() => onNavigateTo("tools")}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-navy hover:bg-brand-cobalt px-4 py-3 text-xs font-bold text-white shadow-sm transition cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Launch Camera OCR Tool</span>
                </button>
              </div>

              {/* Quick study metrics summary */}
              <div className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 p-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Study Session Intelligence</h4>
                <div className="mt-3.5 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-slate-400">Peak Research Hour</span>
                    <span className="font-semibold text-brand-navy dark:text-white">10:00 PM - 12:00 AM</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-slate-400">Favored AI Co-Pilot Tool</span>
                    <span className="font-semibold text-brand-navy dark:text-white">Highlighter Explanation</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-slate-400">Average Summarized Score</span>
                    <span className="font-semibold text-brand-navy dark:text-white">92% Retention</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="fade-in space-y-8 animate-in fade-in-50 duration-200">
          
          {/* Top Row: Analytics Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Streak card */}
            <div className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex items-center gap-4">
              <div className="rounded-xl bg-orange-50 p-3 text-orange-600">
                <Flame className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 font-mono">Current Streak</span>
                <h3 className="text-2xl font-black text-brand-navy dark:text-white font-display">{userStats.streakDays} Days</h3>
                <p className="text-[11px] text-gray-400 font-medium">You are in the top 5% of active scholars.</p>
              </div>
            </div>

            {/* Daily goals progress bar card */}
            <div className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 font-mono">Daily Review Goal</span>
                  <h3 className="text-xl font-black text-brand-navy dark:text-white font-display leading-none mt-1">
                    {todayReviewsCount} <span className="text-xs text-gray-400 font-medium font-sans">/ 15 flashcards</span>
                  </h3>
                </div>
                <button
                  onClick={onIncrementReviewCount}
                  className="rounded-xl bg-brand-navy hover:bg-brand-cobalt text-[10px] font-extrabold text-white px-3 py-1.5 transition cursor-pointer"
                >
                  + Review Card
                </button>
              </div>
              <div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mb-1.5">
                  <div
                    className="bg-brand-cobalt h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((todayReviewsCount / 15) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-gray-400 font-medium">
                  {todayReviewsCount >= 15 ? "🏆 Daily study goal achieved!" : `${15 - todayReviewsCount} more flashcard reviews to hit today's target.`}
                </p>
              </div>
            </div>

            {/* Total hours saved card */}
            <div className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex items-center gap-4">
              <div className="rounded-xl bg-blue-50 p-3 text-brand-cobalt">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 font-mono">Total Hours Saved</span>
                <h3 className="text-2xl font-black text-brand-navy dark:text-white font-display">{userStats.hoursSaved} Hours</h3>
                <p className="text-[11px] text-gray-400 font-medium">Accumulated research time optimizations.</p>
              </div>
            </div>
          </div>

          {/* Second Row: Calendar Grid & SVG Stats Chart */}
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Contribution Grid */}
            <div className="lg:col-span-2 rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
              <div className="mb-4">
                <h3 className="font-display text-lg font-bold text-brand-navy dark:text-white">Study Contribution Calendar</h3>
                <p className="text-xs text-gray-400">Your visual log of active daily study events over the last 16 weeks</p>
              </div>

              {/* Grid of days */}
              <div className="border border-slate-100 rounded-xl p-4 bg-slate-50 dark:bg-slate-950/50">
                <div className="grid grid-rows-7 grid-flow-col gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                  {generateCalendarDays().map((day) => {
                    const activity = dailyActivity.find((act) => act.date === day.dateStr);
                    const totalActions = activity ? (activity.queriesUsed + activity.cardsCreated) : 0;

                    let colorClass = "bg-slate-200/60 hover:bg-slate-300";
                    if (totalActions > 0 && totalActions <= 2) colorClass = "bg-indigo-200 hover:bg-indigo-300";
                    else if (totalActions > 2 && totalActions <= 5) colorClass = "bg-brand-cobalt/35 hover:bg-brand-cobalt/45";
                    else if (totalActions > 5 && totalActions <= 8) colorClass = "bg-brand-cobalt/65 hover:bg-brand-cobalt/75";
                    else if (totalActions > 8) colorClass = "bg-brand-cobalt hover:opacity-90";

                    const formattedDate = day.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

                    return (
                      <div
                        key={day.dateStr}
                        className={`h-3.5 w-3.5 rounded-xs transition-colors duration-150 relative group cursor-pointer ${colorClass}`}
                      >
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-50 bg-slate-900 text-white text-[10px] rounded-lg px-2.5 py-1 whitespace-nowrap shadow-md">
                          <strong>{totalActions} study actions</strong> on {formattedDate}
                          {activity && (activity.queriesUsed > 0 || activity.cardsCreated > 0) && (
                            <span className="block text-gray-300 text-[9px] mt-0.5">
                              ({activity.queriesUsed} AI queries, {activity.cardsCreated} cards)
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Legend */}
                <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-gray-400">
                  <span>Less</span>
                  <div className="h-2.5 w-2.5 rounded-xs bg-slate-200/60"></div>
                  <div className="h-2.5 w-2.5 rounded-xs bg-indigo-200"></div>
                  <div className="h-2.5 w-2.5 rounded-xs bg-brand-cobalt/35"></div>
                  <div className="h-2.5 w-2.5 rounded-xs bg-brand-cobalt/65"></div>
                  <div className="h-2.5 w-2.5 rounded-xs bg-brand-cobalt"></div>
                  <span>More</span>
                </div>
              </div>
            </div>

            {/* SVG Weekly Stats Chart */}
            <div className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-brand-navy dark:text-white">Weekly Stats</h3>
                <p className="text-xs text-gray-400">Study hours saved per day</p>
              </div>

              {/* Pure SVG line chart */}
              <div className="my-4 relative h-36 flex items-center justify-center">
                <svg viewBox="0 0 600 200" className="w-full h-full">
                  {/* Grid Lines */}
                  <line x1="40" y1="40" x2="580" y2="40" stroke="#F1F5F9" strokeWidth="2" />
                  <line x1="40" y1="100" x2="580" y2="100" stroke="#F1F5F9" strokeWidth="2" />
                  <line x1="40" y1="160" x2="580" y2="160" stroke="#E2E8F0" strokeWidth="2" />

                  <polyline
                    fill="none"
                    stroke="#4F46E5"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={chartPointsStr}
                    style={{ strokeDasharray: 1000, strokeDashoffset: 0, animation: "dash 1.5s ease-in-out" }}
                  />

                  {/* Interactive Dot Markers */}
                  {chartPointsArray.map((pt, idx) => (
                    <g 
                      key={idx} 
                      className="group cursor-pointer animate-fade-in"
                      style={{ animationDelay: `${1 + idx * 0.1}s`, animationFillMode: 'both' }}
                    >
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="6"
                        fill="#4F46E5"
                        stroke="#FFFFFF"
                        strokeWidth="2.5"
                        className="transition hover:r-8"
                      />
                      {/* Tooltip on hover */}
                      <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        <rect
                          x={pt.x - 30}
                          y={pt.y - 35}
                          width="60"
                          height="20"
                          rx="4"
                          fill="#1E293B"
                        />
                        <text
                          x={pt.x}
                          y={pt.y - 22}
                          fill="#FFFFFF"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {pt.val}h
                        </text>
                      </g>
                    </g>
                  ))}

                  {/* X Axis Labels */}
                  {chartLabels.map((lbl, idx) => {
                    const x = (idx * 85) + 50;
                    return (
                      <text
                        key={idx}
                        x={x}
                        y="185"
                        fill="#94A3B8"
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {lbl}
                      </text>
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>

          {/* Third Row: Achievement Badges */}
          <div>
            <div className="mb-4">
              <h3 className="font-display text-lg font-bold text-brand-navy dark:text-white">Academic Achievements</h3>
              <p className="text-xs text-gray-400">Unlock these badges as you hit key study and research targets</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`rounded-2xl border p-5 text-center shadow-xs transition-all ${
                    ach.unlocked
                      ? "border-emerald-100 bg-emerald-50/5 ring-1 ring-emerald-500/10 scale-[1.01]"
                      : "border-slate-100 bg-white dark:bg-slate-900 opacity-70"
                  }`}
                >
                  <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl text-2xl shadow-sm ${
                    ach.unlocked ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  }`}>
                    {ach.icon}
                  </div>
                  <h4 className="mt-3 text-sm font-bold text-brand-navy dark:text-white leading-tight">{ach.name}</h4>
                  <p className="mt-1.5 text-xs text-gray-400 leading-normal max-w-[200px] mx-auto">{ach.description}</p>
                  <span className={`mt-3.5 inline-block rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${
                    ach.unlocked ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  }`}>
                    {ach.unlocked ? "Unlocked" : "Locked"}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
