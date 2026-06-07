"use client";

import React from "react";
import { ActiveView, UserStats } from "../types";
import { Zap, Sparkles, BookOpen, Layers, Menu, X, Check, Award, Lock, Timer, Sun, Moon, CreditCard, Info } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Logo } from "./Logo";
import { MagneticWrapper } from "./MagneticWrapper";

interface NavigationProps {
  currentView: ActiveView;
  onViewChange: (view: ActiveView) => void;
  userStats: UserStats;
  onLoginClick: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentView,
  onViewChange,
  userStats,
  onLoginClick,
}) => {
  const { currentUser, userProfile, signOutUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  React.useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme === "dark" || (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDarkMode(false);
    } else {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDarkMode(true);
    }
  };

  const navLinks: { view: ActiveView; label: string; icon: React.ReactNode }[] = [
    { view: "dashboard", label: "Dashboard", icon: <Layers className="w-4 h-4" /> },
    { view: "about", label: "About", icon: <Info className="w-4 h-4" /> },
    { view: "study-material-page", label: "Study Material", icon: <BookOpen className="w-4 h-4" /> },
    { view: "virtual-test", label: "Virtual Test Mode", icon: <Timer className="w-4 h-4" /> },
  ];

  const handleLinkClick = (view: ActiveView) => {
    onViewChange(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 dark:border-slate-800 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo Section */}
        <MagneticWrapper strength={30}>
          <div 
            onClick={() => handleLinkClick("landing")} 
            className="flex cursor-pointer items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            <Logo className="h-10 w-10 text-brand-cobalt" />
            <div>
              <span className="font-display text-lg font-bold tracking-tight text-brand-navy dark:text-white transition-colors duration-300">
                Blue<span className="text-brand-cobalt dark:text-blue-400 bg-linear-to-r from-brand-cobalt to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">BottleCap</span>
              </span>
              <span className="block text-[10px] uppercase tracking-wider font-mono text-gray-400 dark:text-slate-500 font-medium leading-none transition-colors duration-300">
                STUDENT AI SUITE
              </span>
            </div>
          </div>
        </MagneticWrapper>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => {
            const isActive = currentView === link.view;
            const isLocked = false;
            return (
              <button
                key={link.view}
                onClick={() => handleLinkClick(link.view)}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-300 ${
                  isActive
                    ? "bg-brand-cobalt/5 dark:bg-brand-cobalt/20 text-brand-cobalt dark:text-blue-400"
                    : "text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-900 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
                {isLocked && (
                  <Lock className="w-3 h-3 text-gray-400/80 ml-0.5 shrink-0" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {/* Dark Mode Toggle */}
          <button 
            onClick={toggleDarkMode}
            className={`flex relative items-center h-7 w-[52px] rounded-full p-1 transition-colors duration-500 shadow-inner shrink-0 ${
              isDarkMode ? 'bg-white' : 'bg-[#2A2B2E]'
            }`}
            aria-label="Toggle Dark Mode"
          >
            <div 
              className={`absolute flex items-center justify-center w-5 h-5 rounded-full transition-transform duration-500 shadow-sm ${
                isDarkMode ? 'translate-x-[26px] bg-black text-white' : 'translate-x-0 bg-white text-black'
              }`}
            >
              {isDarkMode ? <Moon className="w-3 h-3" strokeWidth={3} /> : <Sun className="w-3 h-3" strokeWidth={3} />}
            </div>
          </button>

          {/* Authentication Menu */}
          {currentUser ? (
            <div className="hidden md:block relative group">
              <button className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 px-3 h-9 text-xs font-bold text-brand-navy dark:text-white transition cursor-pointer">
                {userProfile?.avatarSvg ? (
                  <div className="w-5 h-5 rounded-full shrink-0 overflow-hidden bg-brand-cobalt/10 dark:bg-brand-cobalt/20 flex items-center justify-center" dangerouslySetInnerHTML={{ __html: userProfile.avatarSvg }} />
                ) : currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt="Avatar" className="w-5 h-5 rounded-full shrink-0" />
                ) : (
                  <div className="flex w-5 h-5 items-center justify-center rounded-full bg-brand-cobalt dark:bg-blue-600 text-white text-[9px] font-extrabold shrink-0">
                    {currentUser.email?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="max-w-24 truncate text-gray-700 dark:text-slate-300">{currentUser.displayName || currentUser.email}</span>
              </button>
              {/* Dropdown Menu */}
              <div className="absolute right-0 top-[80%] pt-3.5 w-48 origin-top-right rounded-2xl border border-gray-150 dark:border-slate-800 bg-white dark:bg-slate-950 p-2 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="px-3 py-2.5 border-b border-gray-100 dark:border-slate-800 mb-1">
                  <p className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-slate-500 font-mono">Signed in as</p>
                  <p className="text-[11px] font-bold text-brand-navy dark:text-white truncate mt-0.5">{currentUser.email}</p>
                </div>
                <button
                  onClick={signOutUser}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={onLoginClick}
              className="hidden md:flex items-center gap-1.5 px-2 h-9 text-[13px] font-medium text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200 transition cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>

        {/* Mobile Menu Button & Mobile Toggle */}
        <div className="flex items-center md:hidden gap-3 ml-3">
          <div className="flex items-center gap-1 rounded-full bg-orange-50 dark:bg-orange-950/30 px-2.5 py-1 text-[11px] font-bold text-orange-600 dark:text-orange-400">
            🔥 {userStats.streakDays}
          </div>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 md:hidden fade-in shadow-xl transition-colors duration-300">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const isActive = currentView === link.view;
              const isLocked = false;
              return (
                <button
                  key={link.view}
                  onClick={() => handleLinkClick(link.view)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? "bg-brand-cobalt/5 dark:bg-brand-cobalt/20 text-brand-cobalt dark:text-blue-400"
                      : "text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-900 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {link.icon}
                  <span className="grow text-left">{link.label}</span>
                  {isLocked && (
                    <Lock className="w-3.5 h-3.5 text-gray-400/80 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 border-t border-gray-100 pt-4 space-y-3">
            <div className="flex items-center justify-between px-4">
              <span className="text-xs text-gray-500">Plan Status</span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                userStats.activePlan === "Pro" || userStats.activePlan === "Elite"
                  ? "bg-purple-100 text-purple-700"
                  : userStats.activePlan === "Basic"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-slate-100 text-slate-700"
              }`}>
                {userStats.activePlan} Scholar
              </span>
            </div>

            {currentUser ? (
              <div className="px-4 py-2 bg-slate-50 rounded-2xl space-y-2">
                <div className="flex items-center gap-2">
                  {userProfile?.avatarSvg ? (
                    <div className="w-6 h-6 rounded-full shrink-0 overflow-hidden bg-brand-cobalt/10 flex items-center justify-center" dangerouslySetInnerHTML={{ __html: userProfile.avatarSvg }} />
                  ) : currentUser.photoURL ? (
                    <img src={currentUser.photoURL} alt="Avatar" className="w-6 h-6 rounded-full shrink-0" />
                  ) : (
                    <div className="flex w-6 h-6 items-center justify-center rounded-full bg-brand-cobalt text-white text-[10px] font-extrabold shrink-0">
                      {currentUser.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-brand-navy truncate grow">{currentUser.displayName || currentUser.email}</span>
                </div>
                <button
                  onClick={() => {
                    signOutUser();
                    setMobileMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-red-50 text-xs font-bold text-red-600 py-2.5 hover:bg-red-100/50 transition cursor-pointer"
                >
                  Sign Out Account
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onLoginClick();
                  setMobileMenuOpen(false);
                }}
                className="flex w-full items-center justify-center rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Sign In to Account
              </button>
            )}

            {userStats.activePlan === "Free" || userStats.activePlan === "Basic" ? (
              <button
                onClick={() => handleLinkClick("pricing")}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-linear-to-r from-brand-cobalt to-indigo-600 py-3 text-sm font-semibold text-white shadow-md cursor-pointer"
              >
                <Zap className="h-4 w-4 fill-amber-400 text-amber-400" />
                Upgrade Subscription Plan
              </button>
            ) : (
              <button
                onClick={() => handleLinkClick("dashboard")}
                className="flex w-full items-center justify-center rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700"
              >
                Go to Dashboard
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
