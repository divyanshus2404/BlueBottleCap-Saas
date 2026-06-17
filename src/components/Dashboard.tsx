"use client";

import React, { useState } from "react";
import { useGlobalState } from "../context/GlobalStateContext";
import { useRouter } from "next/navigation";
import { ActiveView } from "../types";
import { WeeklyWrapped } from "./WeeklyWrapped";
import { 
  TrendingUp, 
  Calendar as CalendarIcon, 
  ChevronRight, 
  ChevronLeft,
  ChevronDown,
  MoreVertical,
  Play,
  UploadCloud,
  ArrowRight,
  BookOpen,
  Zap,
  Sparkles,
  HardDrive
} from "lucide-react";
import { motion } from "framer-motion";

export const Dashboard: React.FC = () => {
  const { userStats, dailyActivity, recentActivities } = useGlobalState();
  const router = useRouter();
  const [showWrapped, setShowWrapped] = useState(false);

  const onNavigateTo = (view: ActiveView | string) => {
    const paths: Record<string, string> = {
      dashboard: '/dashboard',
      'study-material-page': '/study-material',
      'virtual-test': '/virtual-test',
      tools: '/tools',
      pricing: '/pricing',
      flashcards: '/flashcards',
      roadmaps: '/roadmaps',
      'pdf-editor': '/pdf-editor'
    };
    router.push(paths[view as string] || `/${view}`);
  };

  const chartData = dailyActivity.slice(-7).reverse();
  const maxVal = Math.max(...chartData.map(cd => cd.hoursSaved), 2);
  const chartPointsStr = chartData.map((cd, idx) => {
    const x = (idx * (150 / 6));
    const y = 60 - (cd.hoursSaved / maxVal * 60);
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="w-full max-w-[1400px] mx-auto px-6 md:px-8 py-8 font-sans pb-32">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* ROW 1 */}
        {/* Study Hours Saved */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-white rounded-[24px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between border border-slate-100">
          <div className="flex justify-between items-start">
            <span className="font-bold text-slate-900 text-[15px]">Hours Saved</span>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full cursor-pointer hover:bg-slate-200">Details</span>
          </div>
          <div className="mt-8 flex items-end gap-3">
            <h2 className="text-5xl font-black tracking-tight text-slate-900">{userStats.hoursSaved}</h2>
            <div className="flex items-center text-orange-500 text-xs font-bold mb-2 bg-orange-50 px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3 mr-1" /> +12%
            </div>
          </div>
          <div className="mt-6 h-16 w-full relative">
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 150 60">
              <path d={`M0,60 ${chartPointsStr} 150,60`} fill="url(#gradientGradient)" opacity="0.2" />
              <polyline points={chartPointsStr} fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <defs>
                <linearGradient id="gradientGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="1" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </motion.div>

        {/* AI Limits Tracker */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="bg-white rounded-[24px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] lg:col-span-2 border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <span className="font-bold text-slate-900 text-[15px]">Usage tracker</span>
            <div className="flex gap-4">
              <div className="w-full space-y-4">
                <div className="flex items-center gap-8 justify-end w-64">
                  <span className="text-[13px] font-medium text-slate-600 w-24">AI Co-pilot</span>
                  <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full rounded-full" style={{ width: '100%' }}></div>
                  </div>
                  <span className="text-[13px] font-bold text-slate-900">100%</span>
                </div>
                <div className="flex items-center gap-8 justify-end w-64">
                  <span className="text-[13px] font-medium text-slate-600 w-24">PDF Spots</span>
                  <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: '0%' }}></div>
                  </div>
                  <span className="text-[13px] font-bold text-slate-900">0%</span>
                </div>
                <div className="flex items-center gap-8 justify-end w-64">
                  <span className="text-[13px] font-medium text-slate-600 w-24">Cloud Storage</span>
                  <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-yellow-400 h-full rounded-full" style={{ width: '24%' }}></div>
                  </div>
                  <span className="text-[13px] font-bold text-slate-900">24%</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-end justify-between mt-auto">
            <div className="flex items-end gap-3">
              <h2 className="text-5xl font-black tracking-tight text-slate-900">{userStats.streakDays}</h2>
              <div className="text-slate-500 text-[13px] font-medium mb-2">Day streak</div>
              <div className="flex items-center text-emerald-500 text-xs font-bold mb-2 ml-2 bg-emerald-50 px-2 py-0.5 rounded-full">
                <TrendingUp className="w-3 h-3 mr-1" /> Active
              </div>
            </div>
            <button className="text-blue-500 text-[13px] font-bold hover:text-blue-600 transition flex items-center">
              + view detailed limits
            </button>
          </div>
        </motion.div>

        {/* Mini Calendar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="bg-white rounded-[24px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center cursor-pointer hover:bg-slate-200 transition">
              <CalendarIcon className="w-4 h-4 text-slate-600" />
            </div>
            <div className="bg-slate-100 px-4 py-1.5 rounded-full text-[13px] font-bold text-slate-800 flex items-center gap-2 cursor-pointer hover:bg-slate-200 transition">
              Jun <ChevronDown className="w-3 h-3" />
            </div>
          </div>
          <div className="grid grid-cols-7 gap-y-3 gap-x-1 text-center">
            {['S','M','T','W','T','F','S'].map((day, i) => (
              <div key={i} className="text-[10px] font-bold text-slate-400 mb-1">{day}</div>
            ))}
            {[30,31,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,1,2,3].map((date, i) => {
              const isFaded = i < 2 || i > 31;
              const isStreak = [7, 8, 22, 24, 29].includes(date) && !isFaded;
              const isToday = date === 9 && !isFaded;
              
              return (
                <div key={i} className="flex justify-center">
                  <div className={`w-7 h-7 flex items-center justify-center rounded-full text-[11px] font-bold transition-all ${
                    isFaded ? 'text-slate-300' :
                    isToday ? 'border-2 border-slate-900 text-slate-900' :
                    isStreak ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 cursor-pointer'
                  }`}>
                    {date}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ROW 2 */}
        {/* Job Feed -> Weekly Wrapped Black Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }} className="bg-slate-900 rounded-[24px] p-6 shadow-xl relative overflow-hidden flex flex-col text-white cursor-pointer group" onClick={() => setShowWrapped(true)}>
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-fuchsia-500 rounded-full mix-blend-screen blur-[40px] opacity-40 group-hover:opacity-60 transition-opacity"></div>
          
          <h3 className="text-[13px] font-bold text-slate-400 mb-6 relative z-10">Weekly Report</h3>
          
          <div className="bg-white rounded-2xl p-4 flex gap-4 items-center relative z-10 shadow-lg transform group-hover:-translate-y-1 transition-transform">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-fuchsia-600 to-indigo-600 flex items-center justify-center text-white shrink-0">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-slate-900 font-black text-[15px] leading-tight mb-1">Your Weekly Study Wrapped</h4>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-slate-400 h-full w-2/3"></div>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
          
          <div className="mt-auto relative z-10 text-center pt-6">
            <button className="text-[11px] font-bold text-slate-300 flex items-center justify-center mx-auto gap-2 group-hover:text-white transition-colors">
              <Sparkles className="w-3 h-3 text-yellow-400" /> Tap on card to view
            </button>
          </div>
        </motion.div>

        {/* Mock Interview -> Virtual Test */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }} className="bg-white rounded-[24px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col relative overflow-hidden group">
          <div className="flex justify-between items-center mb-6">
            <div className="w-10 h-10 rounded-full bg-purple-100 p-0.5 overflow-hidden">
              <div className="w-full h-full bg-purple-500 rounded-full flex items-center justify-center text-white text-lg">👩🏻‍🏫</div>
            </div>
            <div className="bg-indigo-50 text-indigo-700 font-bold text-[10px] px-3 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider">
              <Play className="w-3 h-3 fill-indigo-700" /> Practice
            </div>
          </div>
          
          <h3 className="text-slate-900 font-black text-lg leading-tight mb-2">Try out our Virtual Test mode</h3>
          <p className="text-slate-500 text-[13px] leading-relaxed mb-6 font-medium">
            Practice for exams in a timed, realistic environment with no stress.
          </p>
          
          <div className="mt-auto flex justify-between items-center">
            <span className="text-blue-500 font-bold text-[14px]">Schedule</span>
            <button 
              onClick={() => onNavigateTo('virtual-test')}
              className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 hover:bg-blue-500 hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Upload CV -> PDF Reader Dropzone */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.5 }} className="bg-white rounded-[24px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col text-center group cursor-pointer" onClick={() => onNavigateTo('pdf-editor')}>
          <h3 className="text-slate-900 font-black text-[17px] mb-1">Upload Study Material</h3>
          <p className="text-slate-500 text-[12px] font-medium leading-relaxed px-4 mb-4">
            We will scan your PDF and generate an interactive AI tutor.
          </p>
          
          <div className="flex-1 border-2 border-dashed border-blue-200 rounded-[20px] flex flex-col items-center justify-center bg-blue-50/50 group-hover:bg-blue-50 transition-colors m-2">
            <div className="w-12 h-12 bg-blue-500 rounded-xl mb-3 shadow-[0_8px_16px_rgba(59,130,246,0.3)] flex items-center justify-center group-hover:scale-110 transition-transform">
              <UploadCloud className="w-6 h-6 text-white" />
            </div>
            <span className="text-blue-500 font-bold text-[13px]">Drag & Drop file here</span>
          </div>
        </motion.div>

        {/* Upcoming Lessons -> Recent Activity */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.6 }} className="bg-white rounded-[24px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-900 text-[15px]">Recent Activity</h3>
            <span className="text-blue-500 text-[13px] font-bold cursor-pointer hover:underline">View all</span>
          </div>
          
          <div className="flex-1 bg-slate-50 rounded-[20px] p-5 relative overflow-hidden border border-slate-100">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-indigo-500" />
              </div>
              <button className="text-slate-400 hover:text-slate-600"><MoreVertical className="w-4 h-4" /></button>
            </div>
            
            <h4 className="text-slate-900 font-black text-[17px] mb-1">Physics Chapter 4</h4>
            <p className="text-slate-500 text-[12px] font-medium mb-4">Real-world AI querying</p>
            
            <div className="flex items-center justify-between mb-2">
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mr-4">
                <div className="bg-emerald-400 h-full w-[62%]"></div>
              </div>
              <span className="text-slate-900 font-bold text-[12px]">62%</span>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button className="flex-1 bg-slate-900 text-white font-bold text-[13px] py-2.5 rounded-full hover:bg-slate-800 transition">Resume</button>
              <button className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center hover:bg-slate-800 transition"><BookOpen className="w-4 h-4" /></button>
            </div>
          </div>
        </motion.div>

        {/* ROW 3 */}
        {/* Course Recommendations */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="font-bold text-slate-900 text-[15px]">Recommended Roadmaps</h3>
            <span className="text-blue-500 text-[13px] font-bold cursor-pointer hover:underline">View all</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.7 }} onClick={() => onNavigateTo('roadmaps')} className="bg-[#fce7f3] rounded-[24px] p-6 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all group relative overflow-hidden border border-pink-200">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-300 rounded-full mix-blend-multiply opacity-50 blur-[30px]"></div>
              <div className="flex justify-between items-start mb-16 relative z-10">
                <h4 className="text-slate-900 font-black text-xl leading-tight">Physics<br/>Mastery</h4>
                <div className="w-8 h-8 bg-white/50 rounded-full flex items-center justify-center backdrop-blur-md">
                  <MoreVertical className="w-4 h-4 text-pink-700" />
                </div>
              </div>
              <p className="text-pink-900/70 text-[12px] font-semibold mb-4 leading-relaxed relative z-10">Advanced mechanics & electromagnetism</p>
              <div className="flex gap-2 relative z-10">
                <span className="bg-white/40 text-pink-800 text-[10px] font-bold px-2 py-1 rounded-md">#physics</span>
                <span className="bg-white/40 text-pink-800 text-[10px] font-bold px-2 py-1 rounded-md">#advanced</span>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.8 }} onClick={() => onNavigateTo('roadmaps')} className="bg-[#e0e7ff] rounded-[24px] p-6 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all group relative overflow-hidden border border-indigo-200">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-300 rounded-full mix-blend-multiply opacity-50 blur-[30px]"></div>
              <div className="flex justify-between items-start mb-16 relative z-10">
                <h4 className="text-slate-900 font-black text-xl leading-tight">Organic<br/>Chemistry</h4>
                <div className="w-8 h-8 bg-white/50 rounded-full flex items-center justify-center backdrop-blur-md">
                  <MoreVertical className="w-4 h-4 text-indigo-700" />
                </div>
              </div>
              <p className="text-indigo-900/70 text-[12px] font-semibold mb-4 leading-relaxed relative z-10">Reactions and structures that engage</p>
              <div className="flex gap-2 relative z-10">
                <span className="bg-white/40 text-indigo-800 text-[10px] font-bold px-2 py-1 rounded-md">#chemistry</span>
                <span className="bg-white/40 text-indigo-800 text-[10px] font-bold px-2 py-1 rounded-md">#beginner</span>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.9 }} onClick={() => onNavigateTo('roadmaps')} className="bg-[#fef08a] rounded-[24px] p-6 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all group relative overflow-hidden border border-yellow-300">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-400 rounded-full mix-blend-multiply opacity-50 blur-[30px]"></div>
              <div className="flex justify-between items-start mb-16 relative z-10">
                <h4 className="text-slate-900 font-black text-xl leading-tight">Calculus<br/>Advance</h4>
                <div className="w-8 h-8 bg-white/50 rounded-full flex items-center justify-center backdrop-blur-md">
                  <MoreVertical className="w-4 h-4 text-yellow-800" />
                </div>
              </div>
              <p className="text-yellow-900/70 text-[12px] font-semibold mb-4 leading-relaxed relative z-10">Unleash the power of limits and derivatives</p>
              <div className="flex gap-2 relative z-10">
                <span className="bg-white/40 text-yellow-800 text-[10px] font-bold px-2 py-1 rounded-md">#math</span>
                <span className="bg-white/40 text-yellow-800 text-[10px] font-bold px-2 py-1 rounded-md">#advance</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Community Card */}
        <div className="col-span-1 flex flex-col justify-end mt-10 md:mt-0">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 1 }} className="bg-white rounded-[24px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col justify-between h-full min-h-[220px]">
            <div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">1350+</h2>
              <p className="text-slate-500 font-medium text-[13px] mt-1">Scholars in our community</p>
            </div>
            
            <div className="flex items-center justify-between mt-auto">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-2 border-white bg-pink-100 flex items-center justify-center text-lg z-30">👩🏻</div>
                <div className="w-10 h-10 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-lg z-20">👨🏽</div>
                <div className="w-10 h-10 rounded-full border-2 border-white bg-yellow-100 flex items-center justify-center text-lg z-10">👦🏼</div>
                <div className="w-10 h-10 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center text-lg z-0">👨🏻‍𱈕</div>
              </div>
              <button className="bg-slate-50 hover:bg-slate-100 text-slate-900 font-bold px-5 py-2.5 rounded-full text-[13px] transition border border-slate-200 shadow-sm">
                Join
              </button>
            </div>
          </motion.div>
        </div>

      </div>

      {showWrapped && (
        <WeeklyWrapped 
          onClose={() => setShowWrapped(false)} 
          userStats={userStats} 
        />
      )}
    </div>
  );
};
