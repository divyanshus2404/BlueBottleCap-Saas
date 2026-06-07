"use client";

import React, { useState } from "react";
import { ActiveView, UsageStats, UserStats, DailyActivity, StudyAchievement } from "../types";
import { Sparkles, ArrowRight, Zap, FileText, ImageIcon, HardDrive, Cpu, History, AlertTriangle, BookOpen, Layers, Award, Calendar, Trophy, CheckCircle, Clock, Flame, Activity } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";


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

  // Realistic Recent Activity Logs based on usage
  const recentActivities = [
    { id: 1, tool: "AI PDF Reader", target: "cognitive_science_ch4.pdf", status: "Completed", cost: "1 Credit", date: "2 hrs ago" },
    { id: 2, tool: "Smart Summarizer", target: "Neuroplasticity Overview", status: "Success", cost: "1 Credit", date: "5 hrs ago" },
    { id: 3, tool: "Math Formula Solver", target: "calc_assignment_2.png", status: "Completed", cost: "Free", date: "Yesterday" }
  ];

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
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 inline-flex rounded-2xl bg-slate-900/80 p-1.5 border border-slate-800 shadow-inner backdrop-blur-md"
      >
        <button
          onClick={() => setActiveTab("workspace")}
          className={`rounded-xl px-5 py-2.5 text-xs font-bold transition-all cursor-pointer ${
            activeTab === "workspace"
              ? "bg-gradient-to-r from-brand-cobalt to-indigo-600 text-white shadow-lg shadow-brand-cobalt/20"
              : "text-slate-400 hover:text-white"
          }`}
        >
          📚 Study Workspace
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`rounded-xl px-5 py-2.5 text-xs font-bold transition-all cursor-pointer ${
            activeTab === "analytics"
              ? "bg-gradient-to-r from-brand-cobalt to-indigo-600 text-white shadow-lg shadow-brand-cobalt/20"
              : "text-slate-400 hover:text-white"
          }`}
        >
          📊 Stats & Streaks
        </button>
      </motion.div>

      {activeTab === "workspace" ? (
        <motion.div 
          key="workspace"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="space-y-8"
        >
          {/* Welcome Banner */}
          <div className="relative overflow-hidden mb-8 rounded-3xl bg-slate-900 border border-slate-800 p-6 text-white shadow-2xl md:p-10 group">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-cobalt/10 blur-[100px] rounded-full pointer-events-none transform translate-x-1/3 -translate-y-1/3 transition-transform duration-1000 group-hover:translate-x-1/4"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  {/* User avatar bubble */}
                  {userProfile?.avatarSvg ? (
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="h-12 w-12 rounded-full overflow-hidden bg-slate-800 flex items-center justify-center shadow-lg shrink-0 border-2 border-brand-cobalt/50" 
                      dangerouslySetInnerHTML={{ __html: userProfile.avatarSvg }} 
                    />
                  ) : userName && (
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="h-10 w-10 rounded-full bg-gradient-to-tr from-brand-cobalt to-indigo-400 flex items-center justify-center text-sm font-black text-white shadow-lg shrink-0 border-2 border-brand-cobalt/50"
                    >
                      {userName.charAt(0).toUpperCase()}
                    </motion.div>
                  )}
                  <span className="rounded-full bg-brand-cobalt/20 border border-brand-cobalt/30 px-3 py-1.5 text-xs font-semibold text-brand-sky flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" /> Workspace Active
                  </span>
                  <span className="rounded-full bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 text-xs font-semibold text-orange-400 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5" /> Day {userStats.streakDays} Streak
                  </span>
                </div>
                <h1 className="mt-5 text-3xl font-black tracking-tight md:text-5xl font-display">
                  Welcome back, {userName ? <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-sky to-indigo-400">{userName}</span> : "Scholar"}!
                </h1>
                <p className="mt-3 text-sm text-slate-400 max-w-xl leading-relaxed">
                  You've saved <strong className="font-bold text-white bg-slate-800 px-1.5 py-0.5 rounded">{userStats.hoursSaved} study hours</strong> using BlueBottleCap co-pilots. Your research efficiency is looking great today.
                </p>
              </div>
              <div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onNavigateTo("pdf-editor")}
                  className="group flex items-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-black text-brand-navy shadow-xl shadow-white/10 transition-all hover:bg-slate-50 cursor-pointer text-center w-full md:w-auto"
                >
                  <span>Resume Study Session</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Core Limits and Progress Rings Section */}
          <div className="mb-8 grid gap-6 md:grid-cols-3">
            {/* Card 1: AI Queries */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-md p-6 shadow-xl relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-cobalt to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">AI Co-Pilot Credit</span>
                  <h3 className="mt-1 font-display text-3xl font-black text-white">
                    {usageStats.aiQueries.current} <span className="text-sm font-medium text-slate-500">/ {usageStats.aiQueries.max}</span>
                  </h3>
                </div>
                <div className="rounded-2xl bg-brand-cobalt/20 p-3 text-brand-sky ring-1 ring-brand-cobalt/30">
                  <Cpu className="w-6 h-6" />
                </div>
              </div>

              <div className="mt-6">
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  <span>Usage Level</span>
                  <span className="text-brand-sky">{Math.round((usageStats.aiQueries.current / usageStats.aiQueries.max) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-brand-cobalt to-indigo-400 h-2.5 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${(usageStats.aiQueries.current / usageStats.aiQueries.max) * 100}%` }}
                  ></div>
                </div>
              </div>

              {usageStats.aiQueries.current <= 5 && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-400">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>Credits running low. Go Pro for limitless queries.</span>
                </div>
              )}
            </motion.div>

            {/* Card 2: PDF Editors */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-md p-6 shadow-xl relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">PDF Document Spots</span>
                  <h3 className="mt-1 font-display text-3xl font-black text-white">
                    {usageStats.pdfEdits.current} <span className="text-sm font-medium text-slate-500">/ {usageStats.pdfEdits.max}</span>
                  </h3>
                </div>
                <div className="rounded-2xl bg-sky-500/20 p-3 text-sky-400 ring-1 ring-sky-500/30">
                  <FileText className="w-6 h-6" />
                </div>
              </div>

              <div className="mt-6">
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  <span>Active Limit</span>
                  <span className="text-sky-400">{pdfPercent}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className={`h-2.5 rounded-full transition-all duration-1000 ease-out ${pdfPercent >= 80 ? "bg-gradient-to-r from-rose-500 to-red-400" : "bg-gradient-to-r from-sky-600 to-sky-400"}`}
                    style={{ width: `${pdfPercent}%` }}
                  ></div>
                </div>
              </div>

              {pdfPercent >= 80 && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>Full quota reached! Upgrade to save more.</span>
                </div>
              )}
            </motion.div>

            {/* Card 3: Cloud Storage */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-md p-6 shadow-xl relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Cloud Scholar Drive</span>
                  <h3 className="mt-1 font-display text-3xl font-black text-white">
                    {usageStats.storage.current} <span className="text-sm font-medium text-slate-500">MB</span>
                  </h3>
                </div>
                <div className="rounded-2xl bg-emerald-500/20 p-3 text-emerald-400 ring-1 ring-emerald-500/30">
                  <HardDrive className="w-6 h-6" />
                </div>
              </div>

              <div className="mt-6">
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  <span>Drive Capacity</span>
                  <span className="text-emerald-400">{storagePercent}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-2.5 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${storagePercent}%` }}
                  ></div>
                </div>
              </div>

              <p className="mt-4 text-center text-[10px] text-slate-500 font-mono uppercase tracking-widest font-bold">
                Synced via secure Cloud
              </p>
            </motion.div>
          </div>

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
                <div className="mb-6 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-brand-cobalt/20 text-brand-sky border border-brand-cobalt/30">
                    <Activity className="w-5 h-5" />
                  </div>
                  <h2 className="font-display text-xl font-black text-white">Recent Study Activity Database</h2>
                </div>
                <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-md shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-md border-collapse text-left text-sm">
                      <thead className="border-b border-slate-800 bg-slate-900 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                        <tr>
                          <th className="px-6 py-4">Scholar Tool Run</th>
                          <th className="px-6 py-4">Associated Target</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Cost</th>
                          <th className="px-6 py-4 text-right">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {recentActivities.map((act, index) => (
                          <motion.tr 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            key={act.id} 
                            className="hover:bg-slate-800/50 transition-colors cursor-default"
                          >
                            <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                              {act.tool}
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-400 font-mono truncate max-w-[200px]">{act.target}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                                act.status === "Success" || act.status === "Completed"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              }`}>
                                <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current"></span>
                                {act.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-500 font-bold">{act.cost}</td>
                            <td className="px-6 py-4 text-xs text-slate-500 text-right">{act.date}</td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            </div>

            {/* Right 1 column: Scholar Insight Sidebar */}
            <div className="space-y-6">
              {/* Faux Profile Card */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-md p-8 shadow-xl text-center relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-[50px] rounded-full pointer-events-none"></div>
                
                <div className="relative mx-auto h-24 w-24 rounded-full bg-gradient-to-tr from-brand-cobalt to-indigo-600 p-1 shadow-lg">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-900 font-extrabold text-3xl text-white overflow-hidden">
                    {userProfile?.avatarSvg ? (
                      <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: userProfile.avatarSvg }} />
                    ) : userName ? userName.charAt(0).toUpperCase() : (
                      "🎓"
                    )}
                  </div>
                  <span className="absolute bottom-1 right-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-black text-white uppercase border-2 border-slate-900 shadow-sm animate-pulse">
                    Online
                  </span>
                </div>

                <h3 className="mt-5 font-display font-black text-white text-2xl tracking-tight">{userName || "Guest Scholar"}</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  {userName ? "Undergraduate Researcher" : "Sandbox Demo Profile"}
                </p>
                
                <div className="mt-6 grid grid-cols-2 gap-3 pt-6 border-t border-slate-800 text-left">
                  <div className="rounded-2xl bg-orange-500/10 border border-orange-500/20 p-4 text-center">
                    <span className="block text-xl text-orange-400 font-black leading-none">{userStats.streakDays}</span>
                    <span className="mt-2 block text-[9px] text-orange-500 font-black font-mono uppercase tracking-widest">Days Streak</span>
                  </div>
                  <div className="rounded-2xl bg-brand-cobalt/10 border border-brand-cobalt/20 p-4 text-center">
                    <span className="block text-xl text-brand-sky font-black leading-none">{userStats.hoursSaved}</span>
                    <span className="mt-2 block text-[9px] text-brand-cobalt font-black font-mono uppercase tracking-widest">Hours Saved</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          key="analytics"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-8"
        >
          {/* Top Row: Analytics Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Streak card */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-md p-6 shadow-xl flex items-center gap-5 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 blur-[40px] rounded-full pointer-events-none group-hover:scale-150 transition-transform"></div>
              <div className="rounded-2xl bg-orange-500/20 p-4 text-orange-400 border border-orange-500/30">
                <Flame className="w-8 h-8 animate-pulse drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
              </div>
              <div className="relative z-10">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono">Current Streak</span>
                <h3 className="text-3xl font-black text-white font-display mt-1">{userStats.streakDays} Days</h3>
                <p className="text-[11px] text-emerald-400 font-bold mt-1 bg-emerald-500/10 inline-block px-2 py-0.5 rounded border border-emerald-500/20">Top 5% scholar</p>
              </div>
            </motion.div>

            {/* Daily goals progress bar card */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-md p-6 shadow-xl flex flex-col justify-between relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-cobalt/10 blur-[40px] rounded-full pointer-events-none group-hover:scale-150 transition-transform"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono">Daily Review Goal</span>
                  <h3 className="text-2xl font-black text-white font-display leading-none mt-2">
                    {todayReviewsCount} <span className="text-sm text-slate-500 font-medium font-sans">/ 15 flashcards</span>
                  </h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onIncrementReviewCount}
                  className="rounded-xl bg-gradient-to-r from-brand-cobalt to-indigo-600 text-[10px] font-black text-white px-4 py-2 shadow-lg shadow-brand-cobalt/20 transition cursor-pointer flex items-center gap-1 border border-indigo-400/30"
                >
                  <Award className="w-3.5 h-3.5" /> Review
                </motion.button>
              </div>
              <div className="relative z-10">
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden mb-2 shadow-inner">
                  <div
                    className="bg-gradient-to-r from-brand-cobalt to-indigo-400 h-3 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min((todayReviewsCount / 15) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-[11px] text-slate-400 font-bold">
                  {todayReviewsCount >= 15 ? (
                    <span className="text-emerald-400">🏆 Daily study goal achieved! Excellent work.</span>
                  ) : (
                    <span>{15 - todayReviewsCount} more flashcard reviews to hit today's target.</span>
                  )}
                </p>
              </div>
            </motion.div>

            {/* Total hours saved card */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-md p-6 shadow-xl flex items-center gap-5 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 blur-[40px] rounded-full pointer-events-none group-hover:scale-150 transition-transform"></div>
              <div className="rounded-2xl bg-sky-500/20 p-4 text-sky-400 border border-sky-500/30">
                <Clock className="w-8 h-8 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
              </div>
              <div className="relative z-10">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono">Total Hours Saved</span>
                <h3 className="text-3xl font-black text-white font-display mt-1">{userStats.hoursSaved} <span className="text-lg text-slate-500">Hrs</span></h3>
                <p className="text-[11px] text-slate-400 font-medium mt-1">Accumulated research time optimizations.</p>
              </div>
            </motion.div>
          </div>

          {/* Second Row: Calendar Grid & SVG Stats Chart */}
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Contribution Grid */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2 rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-md p-8 shadow-xl flex flex-col justify-between"
            >
              <div className="mb-6">
                <h3 className="font-display text-xl font-black text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-brand-sky" /> Study Contribution Calendar
                </h3>
                <p className="text-sm text-slate-400 mt-1">Your visual log of active daily study events over the last 16 weeks</p>
              </div>

              {/* Grid of days */}
              <div className="border border-slate-800/50 rounded-2xl p-5 bg-slate-950/50 shadow-inner">
                <div className="grid grid-rows-7 grid-flow-col gap-2 overflow-x-auto pb-3 scrollbar-none">
                  {generateCalendarDays().map((day) => {
                    const activity = dailyActivity.find((act) => act.date === day.dateStr);
                    const totalActions = activity ? (activity.queriesUsed + activity.cardsCreated) : 0;

                    let colorClass = "bg-slate-800 hover:bg-slate-700";
                    if (totalActions > 0 && totalActions <= 2) colorClass = "bg-brand-cobalt/40 hover:bg-brand-cobalt/50 border border-brand-cobalt/30";
                    else if (totalActions > 2 && totalActions <= 5) colorClass = "bg-brand-cobalt/60 hover:bg-brand-cobalt/70 border border-brand-cobalt/40";
                    else if (totalActions > 5 && totalActions <= 8) colorClass = "bg-brand-cobalt/80 hover:bg-brand-cobalt/90 border border-brand-sky/30";
                    else if (totalActions > 8) colorClass = "bg-gradient-to-tr from-brand-cobalt to-brand-sky hover:brightness-110 shadow-[0_0_8px_rgba(56,189,248,0.5)]";

                    const formattedDate = day.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

                    return (
                      <motion.div
                        whileHover={{ scale: 1.2, zIndex: 10 }}
                        key={day.dateStr}
                        className={`h-4 w-4 rounded-sm transition-colors duration-150 relative group cursor-pointer ${colorClass}`}
                      >
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 bg-slate-800 border border-slate-700 text-white text-[11px] rounded-lg px-3 py-1.5 whitespace-nowrap shadow-xl">
                          <strong className="text-brand-sky">{totalActions} study actions</strong> on {formattedDate}
                          {activity && (activity.queriesUsed > 0 || activity.cardsCreated > 0) && (
                            <span className="block text-slate-400 text-[10px] mt-1 font-mono">
                              ({activity.queriesUsed} AI queries, {activity.cardsCreated} cards)
                            </span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                {/* Legend */}
                <div className="mt-4 flex items-center justify-end gap-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
                  <span>Less</span>
                  <div className="h-3 w-3 rounded-xs bg-slate-800"></div>
                  <div className="h-3 w-3 rounded-xs bg-brand-cobalt/40 border border-brand-cobalt/30"></div>
                  <div className="h-3 w-3 rounded-xs bg-brand-cobalt/60 border border-brand-cobalt/40"></div>
                  <div className="h-3 w-3 rounded-xs bg-brand-cobalt/80 border border-brand-sky/30"></div>
                  <div className="h-3 w-3 rounded-xs bg-gradient-to-tr from-brand-cobalt to-brand-sky"></div>
                  <span>More</span>
                </div>
              </div>
            </motion.div>

            {/* SVG Weekly Stats Chart */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-md p-8 shadow-xl flex flex-col justify-between"
            >
              <div>
                <h3 className="font-display text-xl font-black text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-400" /> Weekly Stats
                </h3>
                <p className="text-sm text-slate-400 mt-1">Study hours saved per day</p>
              </div>

              {/* Pure SVG line chart */}
              <div className="my-6 relative h-40 flex items-center justify-center">
                <svg viewBox="0 0 600 200" className="w-full h-full drop-shadow-xl">
                  {/* Grid Lines */}
                  <line x1="40" y1="40" x2="580" y2="40" stroke="#1E293B" strokeWidth="2" strokeDasharray="4 4" />
                  <line x1="40" y1="100" x2="580" y2="100" stroke="#1E293B" strokeWidth="2" strokeDasharray="4 4" />
                  <line x1="40" y1="160" x2="580" y2="160" stroke="#334155" strokeWidth="2" />

                  <polyline
                    fill="none"
                    stroke="url(#lineGradient)"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={chartPointsStr}
                    style={{ strokeDasharray: 1000, strokeDashoffset: 0, animation: "dash 1.5s ease-in-out" }}
                  />
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#38BDF8" />
                      <stop offset="100%" stopColor="#4F46E5" />
                    </linearGradient>
                  </defs>

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
                        r="8"
                        fill="#0F172A"
                        stroke="#38BDF8"
                        strokeWidth="3"
                        className="transition-all duration-300 group-hover:r-10 group-hover:fill-[#38BDF8] drop-shadow-[0_0_5px_rgba(56,189,248,0.8)]"
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
            </motion.div>
          </div>

          {/* Third Row: Reports & Data Exports */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-md p-8 shadow-xl"
          >
            <div className="mb-6">
              <h3 className="font-display text-xl font-black text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" /> Reports & Data Export
              </h3>
              <p className="text-sm text-slate-400 mt-1">Download your raw study data or generate deep AI-driven analysis reports.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Basic Progress Download */}
              <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6 flex flex-col justify-between">
                <div>
                  <h4 className="text-lg font-bold text-white mb-2">Basic Progress Export</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Download a raw CSV file containing your daily study habits, tool usage statistics, and login history.
                  </p>
                </div>
                <button 
                  onClick={() => {
                    if (onShowToast) onShowToast("Downloading basic progress data...", "success");
                  }}
                  className="w-full py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold transition flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" /> Download CSV Data
                </button>
              </div>

              {/* 30-Day Deep Analysis Report */}
              <div className={`rounded-2xl border p-6 flex flex-col justify-between relative overflow-hidden group ${
                userStats.streakDays >= 30 
                  ? "border-emerald-500/40 bg-emerald-950/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                  : "border-slate-800 bg-slate-900/80"
              }`}>
                {userStats.streakDays >= 30 && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[40px] rounded-full pointer-events-none group-hover:scale-150 transition-transform"></div>
                )}
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className={`text-lg font-bold ${userStats.streakDays >= 30 ? "text-emerald-400" : "text-white"}`}>
                      Deep Analysis Report
                    </h4>
                    <span className="bg-brand-cobalt/20 border border-brand-cobalt/30 text-brand-sky text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-sm">
                      1st Free, Then Paid
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Track your live progress, identify areas of weakness, pinpoint where you work most efficiently, and map your academic interests.
                  </p>
                </div>

                <div className="relative z-10">
                  {userStats.streakDays >= 30 ? (
                    <button 
                      onClick={() => {
                        if (onShowToast) onShowToast("Generating your AI Deep Analysis Report...", "success");
                      }}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-sm font-black shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" /> Generate Detailed Report
                    </button>
                  ) : (
                    <div className="w-full">
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
                        <div className="bg-slate-500 h-2 rounded-full" style={{ width: `${Math.min((userStats.streakDays / 30) * 100, 100)}%` }}></div>
                      </div>
                      <button disabled className="w-full py-3 rounded-xl bg-slate-800/50 text-slate-500 text-sm font-bold flex items-center justify-center gap-2 cursor-not-allowed border border-slate-700/50">
                        🔒 Unlocks at 30-Day Streak ({userStats.streakDays}/30)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

        </motion.div>
      )}
    </div>
  );
};
