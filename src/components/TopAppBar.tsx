import React from "react";
import { Search, Sparkles, Sun, Bell } from "lucide-react";
interface TopAppBarProps {
  userProfile: any | null;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({ userProfile }) => {
  return (
    <div className="h-20 bg-[#ebf0f7] flex items-center justify-between px-8 border-b border-transparent shrink-0">
      
      {/* Search Bar */}
      <div className="relative w-80">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search" 
          className="w-full bg-white/60 hover:bg-white focus:bg-white transition-colors border-none rounded-full py-3 pl-10 pr-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-200 outline-none"
        />
      </div>

      {/* Center AI Button */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <button className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-shadow border border-slate-100 group">
          <span className="font-bold text-slate-800 text-sm">AI Assistant</span>
          <Sparkles className="w-4 h-4 text-pink-500 group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-50 shadow-sm transition">
          <Sun className="w-5 h-5" />
        </button>
        <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-50 shadow-sm transition relative">
          <Bell className="w-5 h-5" />
          <div className="absolute top-0 right-0 w-3 h-3 bg-slate-900 border-2 border-white rounded-full"></div>
        </button>
        <div className="w-10 h-10 rounded-full bg-yellow-300 p-0.5 shadow-sm ml-2 cursor-pointer">
          <div className="w-full h-full rounded-full bg-slate-900 overflow-hidden flex items-center justify-center">
            {userProfile?.photoURL ? (
              <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-xs">🎓</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
