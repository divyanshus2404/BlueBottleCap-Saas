"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Zap, BookOpen, Layers, Menu, X, Map, Home, ChevronLeft, FileText, BarChart3, Brain, Clock, Newspaper, ScrollText, Download } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useGlobalState } from "../context/GlobalStateContext";
import { MagneticWrapper } from "./MagneticWrapper";

const Seal = ({ size = 24 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
    <circle cx="16" cy="16" r="15" fill="var(--color-blue-ink)" />
    <path d="M13.4 7.5h5.2v1.7h-1v2.2l1.5 2.8v8.8c0 .7-.5 1.2-1.2 1.2h-4.8c-.7 0-1.2-.5-1.2-1.2v-8.8l1.5-2.8V9.2h-1V7.5z" fill="none" stroke="#fff" strokeWidth="1.3" strokeLinejoin="round" />
    <path d="M13.5 7.5h5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const topLinks = [
  { href: "/", label: "Home", icon: <Home className="w-4 h-4" /> },
  { href: "/tools", label: "Tools", icon: <Layers className="w-4 h-4" /> },
  { href: "/mock-test", label: "Mocks", icon: <FileText className="w-4 h-4" /> },
  { href: "/dashboard", label: "Dashboard", icon: <Map className="w-4 h-4" /> },
];

const sidebarGroups = [
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
      { href: "/install", label: "Install App", icon: <Download className="w-4 h-4" /> },
    ],
  },
];

interface NavigationProps {
  onLoginClick: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ onLoginClick }) => {
  const { currentUser, userProfile, signOutUser } = useAuth();
  const { userStats } = useGlobalState();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  return (
    <>
      <header className="bbc sticky top-0 z-50 w-full border-b border-[var(--color-line)] bg-[var(--color-paper)]/82 backdrop-blur-md transition-colors duration-300">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* Left: Menu + Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center justify-center w-8 h-8 rounded-full border border-[var(--color-line)] bg-[var(--color-paper-card)] hover:bg-[var(--color-paper)] text-[var(--color-ink-soft)] transition-colors shadow-xs cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="w-4 h-4" />
            </button>
            {pathname !== "/" && pathname !== "/dashboard" && (
              <button
                onClick={() => router.back()}
                className="flex items-center justify-center w-8 h-8 rounded-full border border-[var(--color-line)] bg-[var(--color-paper-card)] hover:bg-[var(--color-paper)] text-[var(--color-ink-soft)] transition-colors shadow-xs cursor-pointer group"
                title="Go Back"
              >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
              </button>
            )}
            <MagneticWrapper strength={30}>
              <Link
                href="/"
                className="flex cursor-pointer items-center gap-[11px] transition-opacity hover:opacity-90"
                aria-label="BlueBottleCap home"
              >
                <span className="bbc-breathe inline-flex"><Seal size={28} /></span>
                <span className="text-[17px] font-semibold tracking-[-.01em] text-[var(--color-ink)]">
                  BlueBottleCap
                </span>
              </Link>
            </MagneticWrapper>
          </div>

          {/* Center: Primary nav (desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            {topLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`bbc-underline-fx flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-[var(--color-blue-wash)] text-[var(--color-blue-ink)]"
                      : "text-[var(--color-ink-soft)] hover:bg-[var(--color-paper-card)] hover:text-[var(--color-ink)]"
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right: Auth + streak */}
          <div className="flex items-center gap-3">
            {/* Streak badge */}
            <div className="flex items-center gap-1 rounded-full bg-[var(--color-blue-wash)] px-2.5 py-1 text-[11px] font-bold text-[var(--color-blue-ink)]">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2c.8 3.2-.6 5-2 6.5C8.6 10 7 11.6 7 14a5 5 0 0 0 10 0c0-1.1-.3-2.1-.8-3-.5 1-1.3 1.6-2.2 1.8.6-2.6.2-5.5-2-8.3A11 11 0 0 0 12 2z"/></svg>
              {userStats.streakDays}
            </div>

            {currentUser ? (
              <div className="hidden md:block relative group">
                <button className="flex items-center gap-2 rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)]/50 hover:bg-[var(--color-paper)]/50 px-3 h-9 text-xs font-bold text-brand-navy transition cursor-pointer">
                  {userProfile?.avatarSvg ? (
                    <div className="w-5 h-5 rounded-full shrink-0 overflow-hidden bg-brand-cobalt/10 flex items-center justify-center" dangerouslySetInnerHTML={{ __html: userProfile.avatarSvg }} />
                  ) : currentUser.photoURL ? (
                    <img src={currentUser.photoURL} alt="Avatar" className="w-5 h-5 rounded-full shrink-0" />
                  ) : (
                    <div className="flex w-5 h-5 items-center justify-center rounded-full bg-brand-cobalt text-white text-[9px] font-extrabold shrink-0">
                      {currentUser.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="max-w-24 truncate text-[var(--color-ink)]">{currentUser.displayName || currentUser.email}</span>
                </button>
                <div className="absolute right-0 top-[80%] pt-3.5 w-48 origin-top-right rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-2 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="px-3 py-2.5 border-b border-[var(--color-line)] mb-1">
                    <p className="text-[9px] font-extrabold uppercase tracking-wider text-[var(--color-ink-faint)] font-mono">Signed in as</p>
                    <p className="text-[11px] font-bold text-brand-navy truncate mt-0.5">{currentUser.email}</p>
                  </div>
                  <a href="/profile" className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-[var(--color-ink)] hover:bg-[var(--color-paper)] transition cursor-pointer">
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
                className="hidden md:flex items-center gap-1.5 px-2 h-9 text-[13px] font-medium text-[var(--color-ink-faint)] hover:text-[var(--color-ink)] transition cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── SIDEBAR OVERLAY ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[9999]" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
        </div>
      )}

      {/* ── SIDEBAR PANEL ── */}
      <aside
        className={`fixed left-0 top-0 z-[10000] flex h-full w-[280px] flex-col bg-[var(--color-paper-card)] border-r border-[var(--color-line)] shadow-2xl transition-transform duration-300 ease-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar header */}
        <div className="flex h-16 items-center justify-between border-b border-[var(--color-line)] px-5">
          <Link href="/" onClick={() => setSidebarOpen(false)} className="flex items-center gap-2.5">
            <Seal size={24} />
            <span className="text-[15px] font-semibold tracking-[-.01em] text-[var(--color-ink)]">BlueBottleCap</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-ink-faint)] hover:bg-[var(--color-paper)] hover:text-[var(--color-ink)] transition cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {sidebarGroups.map((group) => (
            <div key={group.label} className="mb-5">
              <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[.15em] text-[var(--color-ink-faint)]">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.links.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-all ${
                        isActive
                          ? "bg-[var(--color-blue-wash)] text-[var(--color-blue-ink)]"
                          : "text-[var(--color-ink-soft)] hover:bg-[var(--color-paper)] hover:text-[var(--color-ink)]"
                      }`}
                    >
                      {link.icon}
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className="border-t border-[var(--color-line)] px-4 py-4 space-y-3">
          {/* Plan badge */}
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-semibold text-[var(--color-ink-faint)]">Plan</span>
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
              userStats.activePlan === "Pro"
                ? "bg-purple-100 text-purple-700"
                : "bg-[var(--color-paper)] text-[var(--color-ink-soft)] border border-[var(--color-line)]"
            }`}>
              {userStats.activePlan}
            </span>
          </div>

          {currentUser ? (
            <div className="rounded-xl bg-[var(--color-paper)] p-3 space-y-2.5">
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
                <span className="text-[12px] font-semibold text-[var(--color-ink)] truncate grow">{currentUser.displayName || currentUser.email}</span>
              </div>
              <div className="flex gap-2">
                <Link
                  href="/profile"
                  onClick={() => setSidebarOpen(false)}
                  className="flex flex-1 items-center justify-center rounded-lg border border-[var(--color-line)] text-[11px] font-bold text-[var(--color-ink)] py-2 hover:bg-[var(--color-paper-card)] transition"
                >
                  Profile
                </Link>
                <button
                  onClick={() => { signOutUser(); setSidebarOpen(false); }}
                  className="flex flex-1 items-center justify-center rounded-lg bg-red-50 text-[11px] font-bold text-red-600 py-2 hover:bg-red-100/50 transition"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => { onLoginClick(); setSidebarOpen(false); }}
              className="flex w-full items-center justify-center rounded-xl border border-[var(--color-line)] py-2.5 text-[13px] font-semibold text-[var(--color-ink)] hover:bg-[var(--color-paper)] transition cursor-pointer"
            >
              Sign In
            </button>
          )}

          {userStats.activePlan === "Free" && (
            <button
              onClick={() => { router.push("/pricing"); setSidebarOpen(false); }}
              className="bbc-btn bbc-btn-primary flex w-full items-center justify-center gap-1.5 py-2.5 text-[13px] cursor-pointer"
            >
              <Zap className="h-4 w-4 fill-amber-300 text-amber-300" />
              Upgrade Plan
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
