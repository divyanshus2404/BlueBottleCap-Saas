import React from "react";
import { ActiveView } from "../types";
import { 
  LayoutDashboard, 
  Map, 
  Lightbulb, 
  Briefcase, 
  GraduationCap, 
  Users, 
  MessageSquare, 
  Settings, 
  LifeBuoy,
  Sparkles
} from "lucide-react";

interface SidebarProps {
  currentView: ActiveView;
  onViewChange: (view: ActiveView) => void;
  isPro: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, isPro }) => {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: "roadmaps", label: "Explore Careers", icon: <Map className="w-5 h-5" /> },
    { id: "tools", label: "My Skills", icon: <Lightbulb className="w-5 h-5" /> },
    { id: "flashcards", label: "Job Board", icon: <Briefcase className="w-5 h-5" /> },
    { id: "study-material-page", label: "Learning", icon: <GraduationCap className="w-5 h-5" /> },
    { id: "seniors-opinion", label: "Networking", icon: <Users className="w-5 h-5" /> },
    { id: "chat", label: "Chat", icon: <MessageSquare className="w-5 h-5" /> },
  ];

  return (
    <div className="w-64 bg-white h-full flex flex-col border-r border-slate-100 flex-shrink-0 relative overflow-hidden">
      {/* Logo Area */}
      <div className="h-20 flex items-center px-8 border-b border-transparent">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-sm" />
          </div>
          <span className="text-xl font-bold text-slate-900 font-display">Alvance</span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as ActiveView)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${
                isActive 
                  ? "bg-slate-100 text-slate-900 font-bold shadow-sm" 
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium"
              }`}
            >
              {item.icon}
              <span className="text-[15px]">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Upgrade to Pro Card */}
      {!isPro && (
        <div className="px-6 mb-6">
          <div className="bg-yellow-100/80 rounded-[2rem] p-6 text-center relative overflow-hidden shadow-inner">
            <div className="absolute top-2 left-2 w-8 h-8 bg-green-200 rounded-full blur-md opacity-60"></div>
            <div className="absolute top-4 right-4 w-10 h-10 bg-pink-300 rounded-full blur-md opacity-60"></div>
            
            <div className="relative z-10">
              <h4 className="text-lg font-black text-slate-900 leading-tight">
                Upgrade to Pro
              </h4>
              <p className="text-[11px] text-slate-600 mt-2 font-medium">
                Get 1 month free and unlock all Pro features
              </p>
              
              <div className="bg-yellow-400 text-yellow-900 text-[10px] font-bold px-3 py-1 rounded-full inline-flex mx-auto mt-4 mb-4 shadow-sm">
                4.9 out of 5 ⭐
              </div>
              
              <button 
                onClick={() => onViewChange("pricing")}
                className="w-full py-3 bg-slate-900 text-white rounded-full text-xs font-bold hover:bg-slate-800 transition shadow-lg"
              >
                Upgrade now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="px-4 pb-8 space-y-1">
        <button className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium transition-all">
          <LifeBuoy className="w-5 h-5" />
          <span className="text-[15px]">Support Center</span>
        </button>
        <button className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium transition-all">
          <Settings className="w-5 h-5" />
          <span className="text-[15px]">Settings</span>
        </button>
      </div>
    </div>
  );
};
