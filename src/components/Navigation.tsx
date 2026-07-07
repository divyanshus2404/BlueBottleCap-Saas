"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Zap, BookOpen, Layers, Menu, X, Lock, Map, Home, ChevronLeft, ChevronDown, FileText, BarChart3, Brain, Clock, Newspaper, ScrollText } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useGlobalState } from "../context/GlobalStateContext";
import { MagneticWrapper } from "./MagneticWrapper";

const Seal = ({ size = 26 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <circle cx="16" cy="16" r="15" stroke="var(--color-ink)" strokeWidth="1.3" />
    <path d="M13.4 7.5h5.2v1.7h-1v2.2l1.5 2.8v8.8c0 .7-.5 1.2-1.2 1.2h-4.8c-.7 0-1.2-.5-1.2-1.2v-8.8l1.5-2.8V9.2h-1V7.5z" stroke="var(--color-blue-ink)" strokeWidth="1.3" strokeLinejoin="round" />
    <path d="M13.5 7.5h5" stroke="var(--color-blue-ink)" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

interface NavigationProps {
  onLoginClick: () => void;
}

const primaryLinks = [
  { href: "/", label: "Home", icon: <Home className="w-4 h-4" /> },
  { href: "/tools", label: "Tools", icon: <Layers className="w-4 h-4" /> },
  { href: "/mock-test", label: "Mocks", icon: <FileText className="w-4 h-4" /> },
  { href: "/dashboard", label: "Dashboard", icon: <Map className="w-4 h-4" /> },
];

const moreLinks = [
  { href: "/question-bank", label: "Question Bank", icon: <BookOpen className="w-4 h-4" /> },
  { href: "/flashcards", label: "Flashcards", icon: <Brain className="w-4 h-4" /> },
  { href: "/my-progress", label: "Progress", icon: <BarChart3 className="w-4 h-4" /> },
  { href: "/study-timer", label: "Study Timer", icon: <Clock className="w-4 h-4" /> },
  { href: "/blog", label: "Blog", icon: <Newspaper className="w-4 h-4" /> },
  { href: "/previous-year-papers", label: "Past Papers", icon: <ScrollText className="w-4 h-4" /> },
];

const mobileGroups = [
  {
    label: "Study",
    links: [
      { href: "/mock-test", label: "Mock Tests", icon: <FileText className="w-4 h-4" /> },
      { href: "/question-bank", label: "Question Bank", icon: <BookOpen className="w-4 h-4" /> },
      { href: "/flashcards", label: "Flashcards", icon: <Brain className="w-4 h-4" /> },
      { href: "/previous-year-papers", label: "Past Papers", icon: <ScrollText className="w-4 h-4" /> },
    ],
  },
  {
    label: "Tools & Resources",
    links: [
      { href: "/tools", label: "AI Tools", icon: <Layers className="w-4 h-4" /> },
      { href: "/study-timer", label: "Study Timer", icon: <Clock className="w-4 h-4" /> },
      { href: "/blog", label: "Blog & Tips", icon: <Newspaper className="w-4 h-4" /> },
    ],
  },
  {
    label: "Account",
    links: [
      { href: "/my-progress", label: "My Progress", icon: <BarChart3 className="w-4 h-4" /> },
      { href: "/dashboard", label: "Dashboard", icon: <Map className="w-4 h-4" /> },
    ],
  },
];

const NavLink = ({ href, label, icon, pathname, onClick }: { href: string; label: string; icon: React.ReactNode; pathname: string; onClick?: () => void }) => {
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-200 ${
        isActive
          ? "bg-[var(--color-blue-wash)] text-[var(--color-blue-ink)]"
          : "text-[var(--color-ink-soft)] hover:bg-[var(--color-paper-card)] hover:text-[var(--color-ink)]"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

export const Navigation: React.FC<NavigationProps> = ({ onLoginClick }) => {
  const { currentUser, userProfile, signOutUser } = useAuth();
  const { userStats } = useGlobalState();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    if (moreOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [moreOpen]);

  const isMoreActive = moreLinks.some((l) => pathname === l.href);

  return (
    <header className="bbc sticky top-0 z-50 w-full border-b border-[var(--color-line)] bg-[rgba(245,244,239,.82)] backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Left: Back + Logo */}
        <div className="flex items-center gap-3">
          {pathname !== "/" && pathname !== "/dashboard" && (
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-colors shadow-xs cursor-pointer group"
              title="Go Back"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </button>
          )}
          <MagneticWrapper strength={30}>
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex cursor-pointer items-center gap-[11px] transition-opacity hover:opacity-90"
              aria-label="BlueBottleCap home"
            >
              <Seal size={28} />
              <span className="text-[17px] font-semibold tracking-[-.01em] text-[var(--color-ink)]">
                BlueBottleCap
              </span>
            </Link>
          </MagneticWrapper>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {primaryLinks.map((link) => (
            <NavLink key={link.href} {...link} pathname={pathname} />
          ))}

          {/* More dropdown */}
          <div className="relative" ref={moreRef}>
            <button
              onClick={() => setMoreOpen((o) => !o)}
              className={`flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                moreOpen || isMoreActive
                  ? "bg-[var(--color-blue-wash)] text-[var(--color-blue-ink)]"
                  : "text-[var(--color-ink-soft)] hover:bg-[var(--color-paper-card)] hover:text-[var(--color-ink)]"
              }`}
            >
              More
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${moreOpen ? "rotate-180" : ""}`} />
            </button>

            {moreOpen && (
              <div className="absolute right-0 top-[calc(100%+6px)] w-52 rounded-2xl border border-[var(--color-line)] bg-white p-1.5 shadow-xl z-50 fade-in">
                {moreLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMoreOpen(false)}
                      className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold transition-all ${
                        isActive
                          ? "bg-[var(--color-blue-wash)] text-[var(--color-blue-ink)]"
                          : "text-[var(--color-ink-soft)] hover:bg-gray-50 hover:text-[var(--color-ink)]"
                      }`}
                    >
                      {link.icon}
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="hidden md:block relative group">
              <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-slate-50/50 hover:bg-slate-100/50 px-3 h-9 text-xs font-bold text-brand-navy transition cursor-pointer">
                {userProfile?.avatarSvg ? (
                  <div className="w-5 h-5 rounded-full shrink-0 overflow-hidden bg-brand-cobalt/10 flex items-center justify-center" dangerouslySetInnerHTML={{ __html: userProfile.avatarSvg }} />
                ) : currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt="Avatar" className="w-5 h-5 rounded-full shrink-0" />
                ) : (
                  <div className="flex w-5 h-5 items-center justify-center rounded-full bg-brand-cobalt text-white text-[9px] font-extrabold shrink-0">
                    {currentUser.email?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="max-w-24 truncate text-gray-700">{currentUser.displayName || currentUser.email}</span>
              </button>
              <div className="absolute right-0 top-[80%] pt-3.5 w-48 origin-top-right rounded-2xl border border-gray-150 bg-white p-2 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="px-3 py-2.5 border-b border-gray-100 mb-1">
                  <p className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400 font-mono">Signed in as</p>
                  <p className="text-[11px] font-bold text-brand-navy truncate mt-0.5">{currentUser.email}</p>
                </div>
                <a href="/profile" className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-gray-700 hover:bg-gray-50 transition cursor-pointer">
                  Edit Profile
                </a>
                <button onClick={signOutUser} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 transition cursor-pointer">
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="hidden md:flex items-center gap-1.5 px-2 h-9 text-[13px] font-medium text-gray-500 hover:text-gray-900 transition cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>

        {/* Mobile: streak + hamburger */}
        <div className="flex items-center md:hidden gap-3 ml-3">
          <div className="flex items-center gap-1 rounded-full bg-[var(--color-blue-wash)] px-2.5 py-1 text-[11px] font-bold text-[var(--color-blue-ink)]">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2c.8 3.2-.6 5-2 6.5C8.6 10 7 11.6 7 14a5 5 0 0 0 10 0c0-1.1-.3-2.1-.8-3-.5 1-1.3 1.6-2.2 1.8.6-2.6.2-5.5-2-8.3A11 11 0 0 0 12 2z"/></svg>
            {userStats.streakDays}
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer — grouped */}
      {mobileMenuOpen && (
        <div className="border-t border-[var(--color-line)] bg-[var(--color-paper)] px-4 py-3 md:hidden fade-in shadow-xl max-h-[calc(100vh-4rem)] overflow-y-auto">
          {mobileGroups.map((group) => (
            <div key={group.label} className="mb-3">
              <p className="px-4 pt-2 pb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-ink-faint)]">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.links.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-4 py-2.5 text-[13px] font-semibold transition-all ${
                        isActive
                          ? "bg-[var(--color-blue-wash)] text-[var(--color-blue-ink)]"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      {link.icon}
                      <span className="grow text-left">{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Bottom section: auth + plan */}
          <div className="border-t border-gray-100 pt-3 mt-1 space-y-3">
            <div className="flex items-center justify-between px-4">
              <span className="text-xs text-gray-500">Plan</span>
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                userStats.activePlan === "Pro"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-slate-100 text-slate-700"
              }`}>
                {userStats.activePlan}
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
                <div className="flex gap-2">
                  <a
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex flex-1 items-center justify-center rounded-xl border border-gray-200 text-xs font-bold text-gray-700 py-2 hover:bg-gray-50 transition cursor-pointer"
                  >
                    Profile
                  </a>
                  <button
                    onClick={() => { signOutUser(); setMobileMenuOpen(false); }}
                    className="flex flex-1 items-center justify-center rounded-xl bg-red-50 text-xs font-bold text-red-600 py-2 hover:bg-red-100/50 transition cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => { onLoginClick(); setMobileMenuOpen(false); }}
                className="flex w-full items-center justify-center rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Sign In
              </button>
            )}

            {userStats.activePlan === "Free" && (
              <button
                onClick={() => { router.push("/pricing"); setMobileMenuOpen(false); }}
                className="bbc-btn bbc-btn-primary flex w-full items-center justify-center gap-1.5 py-2.5 text-sm cursor-pointer"
              >
                <Zap className="h-4 w-4 fill-amber-300 text-amber-300" />
                Upgrade Plan
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
