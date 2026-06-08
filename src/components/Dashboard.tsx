"use client";

import React, { useState, useEffect } from "react";
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
  userName?: string;
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
  const [isSyncing, setIsSyncing] = useState(true);

  // Skeleton loader effect
  useEffect(() => {
    const timer = setTimeout(() => setIsSyncing(false), 1200);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const recentActivities = [
    { id: 1, tool: "AI PDF Reader", target: "cognitive_science_ch4.pdf", status: "Completed", cost: "1 Credit", date: "2 mins ago" },
    { id: 2, tool: "Smart Summarizer", target: "Neuroplasticity Overview", status: "Success", cost: "1 Credit", date: "45 mins ago" },
    { id: 3, tool: "Math Formula Solver", target: "calc_assignment_2.png", status: "Completed", cost: "Free", date: "2 hrs ago" },
    { id: 4, tool: "AI Co-Pilot", target: "Drafted introduction", status: "Success", cost: "2 Credits", date: "Yesterday" }
  ];

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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Top Profile Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col md:flex-row items-center justify-between bg-white rounded-3xl p-6 border border-gray-100 shadow-xs"
      >
        <div className="flex items-center gap-6">
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
              <h1 className="text-2xl font-black text-slate-900 font-display">
                Welcome back, {userName || userProfile?.displayName || "Scholar"}
              </h1>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">Live</span>
              </div>
            </div>
            <p className="text-sm text-slate-500 font-medium mt-1">
              You've saved <span className="font-bold text-brand-cobalt">{userStats.hoursSaved} study hours</span> using AI Co-pilots.
            </p>
          </div>
        </div>
        
        <div className="flex gap-4 mt-4 md:mt-0">
          <div className="text-center px-6 border-r border-gray-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Streak</p>
            <p className="text-xl font-black text-orange-500 mt-1 flex items-center justify-center gap-1">
              <Flame className="w-4 h-4 fill-orange-500" /> {userStats.streakDays}
            </p>
          </div>
          <div className="text-center px-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Study Plan</p>
            <p className="text-lg font-black text-brand-cobalt mt-1">
              {userStats.activePlan}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Segment Tab Controller */}
      <div className="mb-8 flex gap-2 border-b border-gray-100 pb-px">
        <button
          onClick={() => setActiveTab("workspace")}
          className={`px-5 py-3 text-sm font-bold transition-all relative ${
            activeTab === "workspace" ? "text-brand-cobalt" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          📚 Study Workspace
          {activeTab === "workspace" && (
            <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-cobalt" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-5 py-3 text-sm font-bold transition-all relative ${
            activeTab === "analytics" ? "text-brand-cobalt" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          📊 Stats & Streaks
          {activeTab === "analytics" && (
            <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-cobalt" />
          )}
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
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg"><Cpu className="w-4 h-4" /></div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Co-Pilot Credit</h3>
                </div>
                <span className="text-sm font-black text-slate-900">{usageStats.aiQueries.current} / {usageStats.aiQueries.max}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                <div className="bg-indigo-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${isSyncing ? 0 : aiPercent}%` }}></div>
              </div>
              <p className="text-[10px] text-slate-400 font-medium text-right">{aiPercent}% Used</p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-sky-50 text-sky-600 rounded-lg"><FileText className="w-4 h-4" /></div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">PDF Spots</h3>
                </div>
                <span className="text-sm font-black text-slate-900">{usageStats.pdfEdits.current} / {usageStats.pdfEdits.max}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                <div className="bg-sky-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${isSyncing ? 0 : pdfPercent}%` }}></div>
              </div>
              <p className="text-[10px] text-slate-400 font-medium text-right">{pdfPercent}% Used</p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><HardDrive className="w-4 h-4" /></div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cloud Storage</h3>
                </div>
                <span className="text-sm font-black text-slate-900">{usageStats.storage.current} MB / {usageStats.storage.max} MB</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                <div className="bg-emerald-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${isSyncing ? 0 : storagePercent}%` }}></div>
              </div>
              <p className="text-[10px] text-slate-400 font-medium text-right">{storagePercent}% Used</p>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left 2 column: Activity Log */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-display text-lg font-black text-slate-900">
                  <History className="w-5 h-5 text-brand-sky" /> Recent Activity Log
                </h2>
                <button className="text-xs font-bold text-brand-cobalt hover:underline">View All</button>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                <div className="min-w-full">
                  <div className="bg-slate-50 border-b border-gray-100 px-6 py-3 grid grid-cols-12 gap-4">
                    <div className="col-span-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Action</div>
                    <div className="col-span-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</div>
                    <div className="col-span-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Cost</div>
                    <div className="col-span-2 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Time</div>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {recentActivities.map((act, i) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={act.id} 
                        className="px-6 py-4 grid grid-cols-12 gap-4 items-center hover:bg-slate-50 transition-colors cursor-default"
                      >
                        <div className="col-span-5">
                          <p className="text-sm font-bold text-slate-900 truncate">{act.tool}</p>
                          <p className="text-xs text-slate-500 truncate">{act.target}</p>
                        </div>
                        <div className="col-span-3">
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
                            <CheckCircle className="w-3 h-3" /> {act.status}
                          </span>
                        </div>
                        <div className="col-span-2 text-xs font-medium text-slate-600">
                          {act.cost}
                        </div>
                        <div className="col-span-2 text-right text-xs text-slate-400">
                          {act.date}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
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
                {quickTools.map((tool, i) => (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    key={i}
                    onClick={() => {
                      if (tool.toolId) {
                        localStorage.setItem("bluebottlecap_active_tool", tool.toolId);
                      }
                      onNavigateTo(tool.view);
                    }}
                    className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md hover:border-brand-cobalt/30 transition-all cursor-pointer"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 border border-gray-100 text-lg">
                      {tool.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{tool.name}</h3>
                      <p className="text-[10px] text-slate-500">{tool.desc}</p>
                    </div>
                    <ArrowRight className="ml-auto w-4 h-4 text-slate-300" />
                  </motion.div>
                ))}
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
                <span className="text-xs font-bold text-slate-400">Past 16 Weeks</span>
              </div>
              <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
                {Array.from({ length: 16 }).map((_, colIdx) => (
                  <div key={colIdx} className="flex flex-col gap-1">
                    {generateCalendarDays()
                      .slice(colIdx * 7, (colIdx + 1) * 7)
                      .map((day, rowIdx) => {
                        const hasActivity = dailyActivity.find(a => a.date === day.dateStr);
                        const points = hasActivity ? (hasActivity.queriesUsed + hasActivity.cardsCreated * 5) : 0;
                        let colorClass = "bg-slate-100 border-gray-100";
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
                  <Activity className="w-5 h-5 text-brand-cobalt" /> Weekly Hours Saved
                </h3>
              </div>
              <div className="relative h-48 w-full border-b border-l border-slate-100">
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
              <p className="text-sm text-slate-500 mt-1">Download your raw study data or generate deep AI-driven analysis reports.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-gray-100 bg-slate-50 p-6 flex flex-col justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-900 mb-1">Basic Progress Export</h4>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    Download a raw CSV file containing your daily study habits, tool usage statistics, and login history.
                  </p>
                </div>
                <button 
                  onClick={() => onShowToast && onShowToast("Downloading basic progress data...", "success")}
                  className="w-full py-2.5 rounded-xl bg-white border border-gray-200 text-slate-700 hover:bg-slate-50 text-sm font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <FileText className="w-4 h-4" /> Download CSV Data
                </button>
              </div>

              <div className={`rounded-2xl border p-6 flex flex-col justify-between relative overflow-hidden ${
                userStats.streakDays >= 30 ? "border-brand-cobalt bg-brand-cobalt/5" : "border-gray-100 bg-slate-50"
              }`}>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-base font-bold ${userStats.streakDays >= 30 ? "text-brand-cobalt" : "text-slate-900"}`}>
                      Deep Analysis Report
                    </h4>
                    <span className="bg-white border border-gray-200 text-brand-cobalt text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-xs">
                      1st Free, Then Paid
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    Track your live progress, identify areas of weakness, pinpoint where you work most efficiently, and map your academic interests.
                  </p>
                </div>

                <div className="relative z-10">
                  {userStats.streakDays >= 30 ? (
                    <button 
                      onClick={() => onShowToast && onShowToast("Generating your AI Deep Analysis Report...", "success")}
                      className="w-full py-2.5 rounded-xl bg-brand-cobalt text-white text-sm font-bold shadow-md hover:bg-brand-navy transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" /> Generate Detailed Report
                    </button>
                  ) : (
                    <div className="w-full">
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-3">
                        <div className="bg-brand-cobalt h-1.5 rounded-full" style={{ width: `${Math.min((userStats.streakDays / 30) * 100, 100)}%` }}></div>
                      </div>
                      <button disabled className="w-full py-2.5 rounded-xl bg-white text-slate-400 text-sm font-bold flex items-center justify-center gap-2 cursor-not-allowed border border-gray-200">
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
    </div>
  );
};
