"use client";

import React, { useState, useEffect } from "react";
import { Download, Monitor, Smartphone, Apple, Chrome, Globe, ArrowLeft, CheckCircle, Share, MoreVertical, Plus, ExternalLink } from "lucide-react";
import Link from "next/link";
import { whatsappContactUrl } from "@/src/lib/whatsapp";

type Platform = "iphone" | "android" | "mac" | "windows";

const PLATFORMS: { id: Platform; label: string; icon: React.ReactNode; color: string }[] = [
  { id: "iphone", label: "iPhone / iPad", icon: <Smartphone className="h-5 w-5" />, color: "bg-gray-900 text-white" },
  { id: "android", label: "Android", icon: <Smartphone className="h-5 w-5" />, color: "bg-emerald-600 text-white" },
  { id: "mac", label: "Mac", icon: <Monitor className="h-5 w-5" />, color: "bg-[var(--color-blue-ink)] text-white" },
  { id: "windows", label: "Windows", icon: <Monitor className="h-5 w-5" />, color: "bg-sky-600 text-white" },
];

function StepCard({ step, title, description, visual }: { step: number; title: string; description: string; visual: React.ReactNode }) {
  return (
    <div className="flex gap-5">
      <div className="flex flex-col items-center">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-blue-ink)] text-[14px] font-bold text-white">
          {step}
        </div>
        <div className="mt-2 w-px flex-1 bg-[var(--color-line)]" />
      </div>
      <div className="pb-10">
        <h3 className="text-[17px] font-bold text-[var(--color-ink)]">{title}</h3>
        <p className="mt-1.5 text-[14px] leading-relaxed text-[var(--color-ink-soft)]">{description}</p>
        <div className="mt-4">{visual}</div>
      </div>
    </div>
  );
}

function BrowserMockup({ children, url, browser }: { children: React.ReactNode; url: string; browser: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--color-line)] bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-[var(--color-line)] bg-gray-50 px-3 py-2">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </div>
        <div className="flex-1 rounded-md bg-gray-100 px-3 py-1 text-center text-[11px] text-gray-500">{url}</div>
        <span className="text-[10px] text-gray-400">{browser}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function PhoneMockup({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="mx-auto max-w-[280px]">
      <div className="overflow-hidden rounded-[24px] border-2 border-gray-800 bg-white shadow-lg">
        <div className="bg-gray-800 px-4 py-2 text-center text-[11px] text-white">{title}</div>
        <div className="p-3">{children}</div>
        <div className="flex justify-center bg-gray-50 py-2">
          <div className="h-1 w-24 rounded-full bg-gray-800" />
        </div>
      </div>
    </div>
  );
}

function HighlightBox({ icon, label, accent }: { icon: React.ReactNode; label: string; accent?: boolean }) {
  return (
    <div className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-[13px] font-semibold ${accent ? "border-[var(--color-blue-ink)] bg-[var(--color-blue-wash)] text-[var(--color-blue-ink)]" : "border-[var(--color-line)] bg-gray-50 text-[var(--color-ink)]"}`}>
      {icon}
      {label}
    </div>
  );
}

function IPhoneGuide() {
  return (
    <div className="space-y-0">
      <StepCard
        step={1}
        title="Open in Safari"
        description="Make sure you're using Safari — not Chrome or any other browser. iOS only allows installing web apps from Safari."
        visual={
          <PhoneMockup title="Safari">
            <div className="rounded-lg bg-[var(--color-blue-wash)] p-3 text-center">
              <div className="flex items-center justify-center gap-2 text-[13px] font-semibold text-[var(--color-blue-ink)]">
                <Globe className="h-4 w-4" />
                bluebottlecap.com
              </div>
            </div>
          </PhoneMockup>
        }
      />
      <StepCard
        step={2}
        title='Tap the Share button'
        description="It's the square icon with an arrow pointing up, at the bottom center of Safari (or top-right on iPad)."
        visual={
          <PhoneMockup title="Safari">
            <div className="flex items-center justify-center py-6">
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-dashed border-[var(--color-blue-ink)] bg-[var(--color-blue-wash)]">
                  <Share className="h-7 w-7 text-[var(--color-blue-ink)]" />
                </div>
                <div className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-blue-ink)] text-[10px] font-bold text-white">!</div>
              </div>
            </div>
            <p className="text-center text-[11px] text-gray-500">Tap this icon at the bottom of your screen</p>
          </PhoneMockup>
        }
      />
      <StepCard
        step={3}
        title='"Add to Home Screen"'
        description='Scroll down in the share sheet and tap "Add to Home Screen". You may need to scroll past the first row of app icons.'
        visual={
          <PhoneMockup title="Share Sheet">
            <div className="space-y-2">
              <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 text-[13px] text-gray-500">
                <ExternalLink className="h-4 w-4" /> Copy Link
              </div>
              <div className="flex items-center gap-3 rounded-xl border-2 border-[var(--color-blue-ink)] bg-[var(--color-blue-wash)] p-3 text-[13px] font-semibold text-[var(--color-blue-ink)]">
                <Plus className="h-4 w-4" /> Add to Home Screen
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 text-[13px] text-gray-500">
                <ExternalLink className="h-4 w-4" /> Add to Reading List
              </div>
            </div>
          </PhoneMockup>
        }
      />
      <StepCard
        step={4}
        title='Tap "Add"'
        description="Confirm the name and tap Add in the top-right corner. BlueBottleCap will appear on your home screen like a regular app."
        visual={
          <div className="flex items-center justify-center gap-3">
            <HighlightBox icon={<CheckCircle className="h-4 w-4" />} label="App installed!" accent />
          </div>
        }
      />
    </div>
  );
}

function AndroidGuide() {
  return (
    <div className="space-y-0">
      <StepCard
        step={1}
        title="Open in Chrome"
        description="Visit bluebottlecap.com in Google Chrome. Other browsers like Samsung Internet also support this."
        visual={
          <BrowserMockup url="bluebottlecap.com" browser="Chrome">
            <div className="flex items-center justify-center gap-2 py-3 text-[14px] font-semibold text-[var(--color-blue-ink)]">
              <Download className="h-5 w-5" /> BlueBottleCap
            </div>
          </BrowserMockup>
        }
      />
      <StepCard
        step={2}
        title="Tap the three-dot menu"
        description='Tap the ⋮ menu icon in the top-right corner of Chrome to open the browser menu.'
        visual={
          <PhoneMockup title="Chrome">
            <div className="flex items-end justify-end py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-dashed border-[var(--color-blue-ink)] bg-[var(--color-blue-wash)]">
                <MoreVertical className="h-5 w-5 text-[var(--color-blue-ink)]" />
              </div>
            </div>
            <p className="text-center text-[11px] text-gray-500">Top-right corner of Chrome</p>
          </PhoneMockup>
        }
      />
      <StepCard
        step={3}
        title='"Install app" or "Add to Home screen"'
        description={"You'll see either \"Install app\" (newer Chrome) or \"Add to Home screen\" in the menu. Tap it."}
        visual={
          <PhoneMockup title="Chrome Menu">
            <div className="space-y-2">
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 text-[13px] text-gray-500">New tab</div>
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 text-[13px] text-gray-500">Bookmarks</div>
              <div className="flex items-center gap-3 rounded-lg border-2 border-[var(--color-blue-ink)] bg-[var(--color-blue-wash)] p-3 text-[13px] font-semibold text-[var(--color-blue-ink)]">
                <Download className="h-4 w-4" /> Install app
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 text-[13px] text-gray-500">Settings</div>
            </div>
          </PhoneMockup>
        }
      />
      <StepCard
        step={4}
        title='Tap "Install"'
        description="A confirmation dialog will appear. Tap Install. The app icon will appear on your home screen and in your app drawer."
        visual={
          <div className="flex items-center justify-center gap-3">
            <HighlightBox icon={<CheckCircle className="h-4 w-4" />} label="App installed!" accent />
          </div>
        }
      />
    </div>
  );
}

function MacGuide() {
  return (
    <div className="space-y-0">
      <StepCard
        step={1}
        title="Open in Chrome or Edge"
        description="Visit bluebottlecap.com in Google Chrome or Microsoft Edge. Safari on Mac does not support installing web apps to the dock."
        visual={
          <BrowserMockup url="bluebottlecap.com" browser="Chrome">
            <div className="flex items-center justify-center gap-2 py-3 text-[14px] font-semibold text-[var(--color-blue-ink)]">
              <Download className="h-5 w-5" /> BlueBottleCap
            </div>
          </BrowserMockup>
        }
      />
      <StepCard
        step={2}
        title="Click the install icon in the address bar"
        description='Look for the small install icon (monitor with a down arrow) on the right side of the address bar. In Edge, it may say "App available".'
        visual={
          <BrowserMockup url="bluebottlecap.com" browser="Chrome">
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2.5">
              <span className="text-[13px] text-gray-500">bluebottlecap.com</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-dashed border-[var(--color-blue-ink)] bg-[var(--color-blue-wash)]">
                <Download className="h-4 w-4 text-[var(--color-blue-ink)]" />
              </div>
            </div>
            <p className="mt-2 text-center text-[11px] text-gray-400">Click the install icon in the URL bar</p>
          </BrowserMockup>
        }
      />
      <StepCard
        step={3}
        title='Click "Install"'
        description='A popup will ask you to confirm. Click "Install". BlueBottleCap will open as a standalone window and appear in your Dock and Launchpad.'
        visual={
          <BrowserMockup url="" browser="Install app?">
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-blue-ink)]">
                  <svg width="24" height="24" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="6" fill="#1B3FCB"/><path d="M13.4 7.5h5.2v1.7h-1v2.2l1.5 2.8v8.8c0 .7-.5 1.2-1.2 1.2h-4.8c-.7 0-1.2-.5-1.2-1.2v-8.8l1.5-2.8V9.2h-1V7.5z" fill="none" stroke="#fff" strokeWidth="1.3" strokeLinejoin="round"/></svg>
                </div>
                <div>
                  <p className="text-[14px] font-bold text-[var(--color-ink)]">Install BlueBottleCap?</p>
                  <p className="text-[12px] text-gray-500">bluebottlecap.com</p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button className="rounded-lg bg-gray-100 px-4 py-2 text-[13px] font-semibold text-gray-600">Cancel</button>
                <button className="rounded-lg bg-[var(--color-blue-ink)] px-4 py-2 text-[13px] font-bold text-white">Install</button>
              </div>
            </div>
          </BrowserMockup>
        }
      />
      <StepCard
        step={4}
        title="Pin to Dock (optional)"
        description="Right-click the BlueBottleCap icon in your Dock → Options → Keep in Dock. Now it's always one click away."
        visual={
          <div className="flex items-center justify-center gap-3">
            <HighlightBox icon={<CheckCircle className="h-4 w-4" />} label="App in your Dock!" accent />
          </div>
        }
      />
    </div>
  );
}

function WindowsGuide() {
  return (
    <div className="space-y-0">
      <StepCard
        step={1}
        title="Open in Chrome or Edge"
        description="Visit bluebottlecap.com in Google Chrome or Microsoft Edge."
        visual={
          <BrowserMockup url="bluebottlecap.com" browser="Edge">
            <div className="flex items-center justify-center gap-2 py-3 text-[14px] font-semibold text-[var(--color-blue-ink)]">
              <Download className="h-5 w-5" /> BlueBottleCap
            </div>
          </BrowserMockup>
        }
      />
      <StepCard
        step={2}
        title="Click the install icon"
        description='In Chrome: look for the install icon (monitor with arrow) in the address bar. In Edge: click the ··· menu → "Install this site as an app".'
        visual={
          <BrowserMockup url="bluebottlecap.com" browser="Edge">
            <div className="space-y-2">
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 text-[13px] text-gray-500">New tab</div>
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 text-[13px] text-gray-500">Favorites</div>
              <div className="flex items-center gap-3 rounded-lg border-2 border-[var(--color-blue-ink)] bg-[var(--color-blue-wash)] p-3 text-[13px] font-semibold text-[var(--color-blue-ink)]">
                <Download className="h-4 w-4" /> Install this site as an app
              </div>
            </div>
          </BrowserMockup>
        }
      />
      <StepCard
        step={3}
        title='Click "Install"'
        description="Confirm the installation. BlueBottleCap will open as its own window. You can find it in your Start Menu and pin it to the Taskbar."
        visual={
          <div className="flex items-center justify-center gap-3">
            <HighlightBox icon={<CheckCircle className="h-4 w-4" />} label="App installed!" accent />
          </div>
        }
      />
    </div>
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPage() {
  const [platform, setPlatform] = useState<Platform>("iphone");
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) setPlatform("iphone");
    else if (/android/.test(ua)) setPlatform("android");
    else if (/mac/.test(ua)) setPlatform("mac");
    else setPlatform("windows");

    if (window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone === true) {
      setInstalled(true);
    }

    // The layout <head> script stashes the event before React mounts;
    // read it back here, and also listen in case it fires later.
    const stashed = (window as any).__bbcInstallPrompt as BeforeInstallPromptEvent | undefined;
    if (stashed) setDeferredPrompt(stashed);
    const onReady = () => setDeferredPrompt((window as any).__bbcInstallPrompt ?? null);
    window.addEventListener("bbc-install-ready", onReady);
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    const onInstalled = () => setInstalled(true);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("bbc-install-ready", onReady);
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    const prompt = deferredPrompt ?? ((window as any).__bbcInstallPrompt as BeforeInstallPromptEvent | undefined);
    if (prompt) {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === "accepted") setInstalled(true);
      setDeferredPrompt(null);
      (window as any).__bbcInstallPrompt = undefined;
    } else {
      document.getElementById("install-guide")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const guides: Record<Platform, React.ReactNode> = {
    iphone: <IPhoneGuide />,
    android: <AndroidGuide />,
    mac: <MacGuide />,
    windows: <WindowsGuide />,
  };

  return (
    <div className="bbc relative min-h-screen overflow-hidden">
      <div className="bbc-grid" aria-hidden="true" />
      <div className="relative z-[2] mx-auto max-w-[720px] px-7 py-12 sm:py-16">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-[13px] font-semibold text-[var(--color-ink-faint)] transition hover:text-[var(--color-ink)]">
          <ArrowLeft className="h-4 w-4" /> Back to BlueBottleCap
        </Link>

        <div className="text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-blue-ink)] shadow-lg">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M13.4 7.5h5.2v1.7h-1v2.2l1.5 2.8v8.8c0 .7-.5 1.2-1.2 1.2h-4.8c-.7 0-1.2-.5-1.2-1.2v-8.8l1.5-2.8V9.2h-1V7.5z" fill="none" stroke="#fff" strokeWidth="1.3" strokeLinejoin="round"/>
              <path d="M13.5 7.5h5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="bbc-eyebrow">Install</p>
          <h1 className="bbc-serif mt-3 text-[clamp(28px,4.5vw,42px)] leading-[1.08] tracking-[-.02em] text-[var(--color-ink)]">
            Get BlueBottleCap on your device.
          </h1>
          <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-[var(--color-ink-soft)]">
            No app store needed. Install directly from your browser — it takes 10 seconds and works just like a native app.
          </p>

          <div className="mt-6 flex flex-col items-center gap-3">
            {installed ? (
              <div className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-line)] bg-[var(--color-blue-wash)] px-6 py-3.5 text-[15px] font-bold text-[var(--color-blue-ink)]">
                <CheckCircle className="h-5 w-5" /> BlueBottleCap is installed
              </div>
            ) : (
              <>
                <a
                  href="/bluebottlecap.apk"
                  download="bluebottlecap.apk"
                  className="inline-flex items-center gap-2.5 rounded-xl bg-[var(--color-blue-ink)] px-7 py-3.5 text-[15px] font-bold text-white shadow-lg transition hover:brightness-110 active:scale-[.98]"
                >
                  <Download className="h-5 w-5" /> Download BlueBottleCap for Android
                </a>
                <p className="text-[12px] text-[var(--color-ink-faint)]">
                  Direct .apk download (~1&nbsp;MB). Android may ask you to allow installs from your browser — that's normal for apps outside the Play Store.
                </p>
                <button
                  onClick={handleInstallClick}
                  className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-card)] px-5 py-2.5 text-[13px] font-bold text-[var(--color-ink)] transition hover:border-[var(--color-ink-faint)]"
                >
                  <Smartphone className="h-4 w-4" /> On iPhone / Mac / Windows? Install the web app
                </button>
              </>
            )}
          </div>
        </div>

        {/* Benefits */}
        <div className="mx-auto mt-8 grid max-w-lg grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { icon: "⚡", label: "Instant open" },
            { icon: "📴", label: "Works offline" },
            { icon: "🔔", label: "Notifications" },
            { icon: "💾", label: "Under 1 MB" },
          ].map((b) => (
            <div key={b.label} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-3 text-center">
              <span className="text-[20px]">{b.icon}</span>
              <p className="mt-1 text-[11px] font-semibold text-[var(--color-ink-soft)]">{b.label}</p>
            </div>
          ))}
        </div>

        {/* Platform selector */}
        <div className="mt-10">
          <p className="mb-4 text-center text-[12px] font-semibold uppercase tracking-[.15em] text-[var(--color-ink-faint)]">Select your device</p>
          <div className="flex flex-wrap justify-center gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPlatform(p.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-bold transition ${
                  platform === p.id
                    ? `${p.color} shadow-md`
                    : "bg-[var(--color-paper-card)] text-[var(--color-ink-soft)] border border-[var(--color-line)] hover:border-[var(--color-ink-faint)]"
                }`}
              >
                {p.icon}
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Guide */}
        <div id="install-guide" className="mt-10 scroll-mt-6 rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-6 sm:p-8">
          <h2 className="mb-8 text-center text-[12px] font-bold uppercase tracking-[.15em] text-[var(--color-ink-faint)]">
            {PLATFORMS.find((p) => p.id === platform)?.label} — Step by step
          </h2>
          {guides[platform]}
        </div>

        {/* FAQ */}
        <div className="mt-10 space-y-4">
          <h3 className="text-center text-[12px] font-bold uppercase tracking-[.15em] text-[var(--color-ink-faint)]">Common questions</h3>
          {[
            { q: "Is this a real app?", a: "Yes — it's a Progressive Web App (PWA). It runs like a native app but installs from your browser. No app store, no storage wasted." },
            { q: "Will it use a lot of storage?", a: "Under 1 MB. Smaller than a single photo on your phone." },
            { q: "Can I uninstall it?", a: "Just like any app. Long-press the icon on your phone, or drag it out of the Dock on Mac." },
            { q: "Why not just use the website?", a: "The installed version opens instantly (no browser tabs), supports push notifications for study reminders, and works offline." },
          ].map((f) => (
            <div key={f.q} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-4">
              <h4 className="text-[14px] font-semibold text-[var(--color-ink)]">{f.q}</h4>
              <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--color-ink-soft)]">{f.a}</p>
            </div>
          ))}
        </div>

        {/* CTA — only rendered when a real support number is configured */}
        {whatsappContactUrl() && (
          <div className="mt-10 text-center">
            <p className="text-[13px] text-[var(--color-ink-faint)]">
              Having trouble?{" "}
              <a href={whatsappContactUrl("Hi! I need help installing BlueBottleCap.") ?? "#"} target="_blank" rel="noopener noreferrer" className="font-semibold text-[var(--color-blue-ink)] hover:underline">
                WhatsApp us
              </a>{" "}
              and we'll walk you through it.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
