"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, BookOpen, Layers, Menu, X, Map, Home, FileText, BarChart3, Brain, Clock, Newspaper, ScrollText, Download, FlaskConical, Camera, Target, Sparkles, ChevronDown, ClipboardCheck, type LucideIcon } from "lucide-react";
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

interface NavItem {
  href: string;
  label: string;
  desc: string;
  Icon: LucideIcon;
}

/**
 * Desktop nav model. Previously only four links sat in the bar and everything
 * else — flashcards, question bank, formula sheets, scan notes — was reachable
 * only by opening the hamburger drawer, even on a 1400px screen. These grouped
 * menus surface every destination in one click. `sidebarGroups` below still
 * drives the mobile drawer.
 */
const navMenus: { label: string; items: NavItem[] }[] = [
  {
    label: "Study",
    items: [
      { href: "/mock-test", label: "Mock Tests", desc: "Timed papers, real marking", Icon: FileText },
      { href: "/question-bank", label: "Question Bank", desc: "Practice by topic", Icon: BookOpen },
      { href: "/flashcards", label: "Flashcards", desc: "Spaced repetition decks", Icon: Brain },
      { href: "/previous-year-papers", label: "Past Papers", desc: "Previous year sets", Icon: ScrollText },
      { href: "/diagnostic", label: "Diagnostic", desc: "Find your weak topics", Icon: Target },
    ],
  },
  {
    label: "Tools",
    items: [
      { href: "/pdf-editor", label: "PDF Copilot", desc: "Chat with your PDFs", Icon: Sparkles },
      { href: "/formula-sheet", label: "Formula Sheets", desc: "One-page cheat sheets", Icon: FlaskConical },
      { href: "/scan-notes", label: "Scan Notes", desc: "Handwriting to text", Icon: Camera },
      { href: "/tools", label: "File Tools", desc: "Convert, merge, compress", Icon: Layers },
      { href: "/planner", label: "Study Planner", desc: "Track the whole syllabus", Icon: ClipboardCheck },
      { href: "/study-timer", label: "Study Timer", desc: "Focused study sessions", Icon: Clock },
    ],
  },
];

/**
 * Click-activated dropdown. Deliberately not hover-only: the previous account
 * menu used `group-hover`, which is unreachable by keyboard and unusable on
 * touch. Closes on Escape, outside click, and route change.
 */
const NavMenu: React.FC<{ label: string; items: NavItem[]; pathname: string }> = ({ label, items, pathname }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const groupActive = items.some((i) => i.href === pathname);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); btnRef.current?.focus(); }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className={`flex cursor-pointer items-center gap-1 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-200 ${
          groupActive || open
            ? "bg-[var(--color-blue-wash)] text-[var(--color-blue-ink)]"
            : "text-[var(--color-ink-soft)] hover:bg-[var(--color-paper-card)] hover:text-[var(--color-ink)]"
        }`}
      >
        {label}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-[280px] origin-top-left rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-2 shadow-xl">
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-start gap-3 rounded-xl px-3 py-2.5 transition ${
                  isActive ? "bg-[var(--color-blue-wash)]" : "hover:bg-[var(--color-paper)]"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                    isActive
                      ? "bg-[var(--color-blue-ink)] text-white"
                      : "bg-[var(--color-blue-wash)] text-[var(--color-blue-ink)]"
                  }`}
                >
                  <item.Icon className="h-[15px] w-[15px]" strokeWidth={1.8} />
                </span>
                <span className="min-w-0">
                  <span
                    className={`block text-[13px] font-bold ${
                      isActive ? "text-[var(--color-blue-ink)]" : "text-[var(--color-ink)]"
                    }`}
                  >
                    {item.label}
                  </span>
                  <span className="block text-[11.5px] text-[var(--color-ink-faint)]">{item.desc}</span>
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

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
      { href: "/formula-sheet", label: "Formula Sheets", icon: <FlaskConical className="w-4 h-4" /> },
      { href: "/scan-notes", label: "Scan Notes", icon: <Camera className="w-4 h-4" /> },
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
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Dismiss the account menu on outside click / Escape — it used to be
  // hover-only, so it had no dismiss path at all on touch devices.
  useEffect(() => {
    if (!accountOpen) return;
    const onDown = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setAccountOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [accountOpen]);

  useEffect(() => { setAccountOpen(false); }, [pathname]);

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
            {/* Drawer is the mobile affordance only — on desktop every
                destination is reachable from the menus below. */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex md:hidden items-center justify-center w-11 h-11 rounded-full border border-[var(--color-line)] bg-[var(--color-paper-card)] hover:bg-[var(--color-paper)] text-[var(--color-ink-soft)] transition-colors shadow-xs cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="w-4 h-4" />
            </button>
            <MagneticWrapper strength={30}>
              <Link
                href="/"
                className="flex cursor-pointer items-center gap-[11px] transition-opacity hover:opacity-90"
                aria-label="BlueBottleCap home"
              >
                <span className="inline-flex"><Seal size={28} /></span>
                <span className="text-[17px] font-semibold tracking-[-.01em] text-[var(--color-ink)]">
                  BlueBottleCap
                </span>
              </Link>
            </MagneticWrapper>
          </div>

          {/* Center: Primary nav (desktop) */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main">
            <Link
              href="/"
              aria-current={pathname === "/" ? "page" : undefined}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-200 ${
                pathname === "/"
                  ? "bg-[var(--color-blue-wash)] text-[var(--color-blue-ink)]"
                  : "text-[var(--color-ink-soft)] hover:bg-[var(--color-paper-card)] hover:text-[var(--color-ink)]"
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>

            {navMenus.map((m) => (
              <NavMenu key={m.label} label={m.label} items={m.items} pathname={pathname} />
            ))}

            <Link
              href="/dashboard"
              aria-current={pathname === "/dashboard" ? "page" : undefined}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-200 ${
                pathname === "/dashboard"
                  ? "bg-[var(--color-blue-wash)] text-[var(--color-blue-ink)]"
                  : "text-[var(--color-ink-soft)] hover:bg-[var(--color-paper-card)] hover:text-[var(--color-ink)]"
              }`}
            >
              <Map className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
          </nav>

          {/* Right: Auth + streak */}
          <div className="flex items-center gap-3">
            {/* Streak badge */}
            {/* A bare "0" next to a flame read as a broken counter to signed-out
                visitors. Show the badge only once there's a streak to show. */}
            {userStats.streakDays > 0 && (
              <div
                className="flex items-center gap-1 rounded-full bg-[var(--color-blue-wash)] px-2.5 py-1 text-[11px] font-bold text-[var(--color-blue-ink)]"
                title={`${userStats.streakDays}-day study streak`}
                aria-label={`${userStats.streakDays} day study streak`}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2c.8 3.2-.6 5-2 6.5C8.6 10 7 11.6 7 14a5 5 0 0 0 10 0c0-1.1-.3-2.1-.8-3-.5 1-1.3 1.6-2.2 1.8.6-2.6.2-5.5-2-8.3A11 11 0 0 0 12 2z"/></svg>
                {userStats.streakDays}
              </div>
            )}

            {currentUser ? (
              <div ref={accountRef} className="hidden md:block relative">
                <button
                  onClick={() => setAccountOpen((v) => !v)}
                  aria-expanded={accountOpen}
                  aria-haspopup="true"
                  className="flex items-center gap-2 rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)]/50 hover:bg-[var(--color-paper)] px-3 h-9 text-xs font-bold text-brand-navy transition cursor-pointer">
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
                <div className={`absolute right-0 top-full mt-2 w-52 origin-top-right rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-2 shadow-xl transition-all duration-150 z-50 ${
                  accountOpen ? "opacity-100 visible" : "pointer-events-none invisible opacity-0"
                }`}>
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
              /* Was the lowest-contrast element in the bar despite being the
                 primary action for signed-out visitors. */
              <button
                onClick={onLoginClick}
                className="hidden md:flex items-center gap-1.5 rounded-xl bg-[var(--color-blue-ink)] px-4 h-9 text-[13px] font-semibold text-white transition hover:bg-[var(--color-blue-deep)] cursor-pointer"
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
            className="flex h-11 w-11 items-center justify-center rounded-lg text-[var(--color-ink-faint)] hover:bg-[var(--color-paper)] hover:text-[var(--color-ink)] transition cursor-pointer"
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

          {/* Credit balance — the wallet number students spend on AI tools.
              Free resources (question bank, papers, planner, timer) don't touch
              it. Tappable to top up. */}
          <Link
            href="/pricing"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center justify-between rounded-lg px-1 py-1 -mx-1 hover:bg-[var(--color-paper)] transition"
            title="Credits power the AI tools. Tap to top up."
          >
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--color-ink-faint)]">
              <Zap className="h-3.5 w-3.5 text-[var(--color-blue-ink)]" /> Credits
            </span>
            <span className="text-[12px] font-bold text-[var(--color-ink)]">
              {userStats.activePlan === "Pro" ? "Unlimited" : userStats.creditsLeft}
            </span>
          </Link>

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
            <Link
              href="/pricing"
              onClick={() => setSidebarOpen(false)}
              className="bbc-btn bbc-btn-primary flex w-full items-center justify-center gap-1.5 py-2.5 text-[13px] cursor-pointer"
            >
              <Zap className="h-4 w-4 fill-amber-300 text-amber-300" />
              Upgrade Plan
            </Link>
          )}
        </div>
      </aside>
    </>
  );
};
