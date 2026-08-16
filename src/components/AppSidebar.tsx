"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Zap, BookOpen, Layers, X, Map, FileText, BarChart3, Brain, Clock, Newspaper, ScrollText, Download } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useGlobalState } from "../context/GlobalStateContext";

const Seal = ({ size = 24 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
    <circle cx="16" cy="16" r="15" fill="var(--color-blue-ink)" />
    <path d="M13.4 7.5h5.2v1.7h-1v2.2l1.5 2.8v8.8c0 .7-.5 1.2-1.2 1.2h-4.8c-.7 0-1.2-.5-1.2-1.2v-8.8l1.5-2.8V9.2h-1V7.5z" fill="none" stroke="#fff" strokeWidth="1.3" strokeLinejoin="round" />
    <path d="M13.5 7.5h5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export const sidebarGroups = [
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

interface AppSidebarProps {
  open: boolean;
  onClose: () => void;
  onSignIn: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ open, onClose, onSignIn }) => {
  const { currentUser, userProfile, signOutUser } = useAuth();
  const { userStats } = useGlobalState();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* ── SIDEBAR OVERLAY ── */}
      {open && (
        <div className="fixed inset-0 z-[9999]" onClick={onClose}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
        </div>
      )}

      {/* ── SIDEBAR PANEL ── */}
      <aside
        className={`fixed left-0 top-0 z-[10000] flex h-full w-[280px] flex-col bg-[var(--color-paper-card)] border-r border-[var(--color-line)] shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar header */}
        <div className="flex h-16 items-center justify-between border-b border-[var(--color-line)] px-5">
          <Link href="/" onClick={onClose} className="flex items-center gap-2.5">
            <Seal size={24} />
            <span className="text-[15px] font-semibold tracking-[-.01em] text-[var(--color-ink)]">BlueBottleCap</span>
          </Link>
          <button
            onClick={onClose}
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
                      onClick={onClose}
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
                  onClick={onClose}
                  className="flex flex-1 items-center justify-center rounded-lg border border-[var(--color-line)] text-[11px] font-bold text-[var(--color-ink)] py-2 hover:bg-[var(--color-paper-card)] transition"
                >
                  Profile
                </Link>
                <button
                  onClick={() => { signOutUser(); onClose(); }}
                  className="flex flex-1 items-center justify-center rounded-lg bg-red-50 text-[11px] font-bold text-red-600 py-2 hover:bg-red-100/50 transition"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => { onSignIn(); onClose(); }}
              className="flex w-full items-center justify-center rounded-xl border border-[var(--color-line)] py-2.5 text-[13px] font-semibold text-[var(--color-ink)] hover:bg-[var(--color-paper)] transition cursor-pointer"
            >
              Sign In
            </button>
          )}

          {userStats.activePlan === "Free" && (
            <button
              onClick={() => { router.push("/pricing"); onClose(); }}
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
