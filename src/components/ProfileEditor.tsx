"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth, UserProfile } from "@/src/context/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/src/firebase";
import { Camera, Check, ChevronLeft, Loader2, User, Mail, ShieldCheck, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useGlobalState } from "@/src/context/GlobalStateContext";

const AVATARS = [
  { id: "av-blue", bg: "#1B3FCB", emoji: "📘" },
  { id: "av-rocket", bg: "#6C3FC7", emoji: "🚀" },
  { id: "av-fire", bg: "#E05A2B", emoji: "🔥" },
  { id: "av-star", bg: "#D4A017", emoji: "⭐" },
  { id: "av-brain", bg: "#2CA58D", emoji: "🧠" },
  { id: "av-atom", bg: "#3B82F6", emoji: "⚛️" },
  { id: "av-bulb", bg: "#F59E0B", emoji: "💡" },
  { id: "av-target", bg: "#EF4444", emoji: "🎯" },
  { id: "av-book", bg: "#10B981", emoji: "📖" },
  { id: "av-medal", bg: "#8B5CF6", emoji: "🏅" },
  { id: "av-bolt", bg: "#F97316", emoji: "⚡" },
  { id: "av-gem", bg: "#06B6D4", emoji: "💎" },
];

export function ProfileEditor() {
  const { currentUser, userProfile } = useAuth();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelResult, setCancelResult] = useState<"ok" | "err" | null>(null);
  const { userStats, showToast } = useGlobalState();
  const isPro = userStats.activePlan === "Pro";
  const cancelled = (userProfile as { subscriptionCancelled?: boolean } | null)?.subscriptionCancelled === true;

  const handleCancelSubscription = async () => {
    if (!currentUser) return;
    if (!window.confirm("Cancel your Pro plan? You'll keep access for the period you've already paid for; you won't be charged again.")) return;
    setCancelling(true);
    setCancelResult(null);
    try {
      const idToken = await currentUser.getIdToken().catch(() => null);
      const resp = await fetch("/api/user/cancel-subscription", {
        method: "POST",
        headers: idToken ? { Authorization: `Bearer ${idToken}` } : {},
      });
      if (resp.ok) {
        setCancelResult("ok");
        showToast?.("Subscription cancelled — you won't be charged again.", "success");
      } else {
        setCancelResult("err");
        showToast?.("Couldn't cancel. Email support@bluebottlecap.com and we'll do it manually.", "error");
      }
    } catch {
      setCancelResult("err");
      showToast?.("Network error. Email support@bluebottlecap.com to cancel.", "error");
    } finally {
      setCancelling(false);
    }
  };

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || userProfile.displayName || "");
      setSelectedAvatar(userProfile.avatarId as string || null);
      setPhotoPreview(userProfile.photoURL || null);
    }
  }, [userProfile]);

  if (!currentUser) {
    return (
      <div className="bbc flex min-h-[60vh] items-center justify-center">
        <p className="text-[var(--color-ink-soft)]">Sign in to edit your profile.</p>
      </div>
    );
  }

  const currentAvatar = AVATARS.find(a => a.id === selectedAvatar);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be under 2 MB.");
      return;
    }
    setPhotoFile(file);
    setSelectedAvatar(null);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!currentUser || !db) return;
    setSaving(true);
    try {
      const ref = doc(db, "users", currentUser.uid);
      const updates: Partial<UserProfile> & Record<string, unknown> = {
        name: name.trim(),
        displayName: name.trim(),
      };

      if (selectedAvatar) {
        updates.avatarId = selectedAvatar;
        updates.photoURL = "";
      } else if (photoFile) {
        // Convert to base64 data URL for Firestore (small images only)
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(photoFile);
        });
        // Compress by drawing to a small canvas
        const img = new Image();
        img.src = dataUrl;
        await new Promise((r) => { img.onload = r; });
        const canvas = document.createElement("canvas");
        const size = 200;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d")!;
        const min = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - min) / 2, (img.height - min) / 2, min, min, 0, 0, size, size);
        updates.photoURL = canvas.toDataURL("image/jpeg", 0.8);
        updates.avatarId = "";
      }

      await updateDoc(ref, updates);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Profile save failed:", err);
      alert("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const renderAvatar = () => {
    if (photoPreview && !selectedAvatar) {
      return (
        <div className="relative h-[120px] w-[120px] overflow-hidden rounded-full border-4 border-white shadow-lg">
          <img src={photoPreview} alt="Profile" className="h-full w-full object-cover" />
        </div>
      );
    }
    if (currentAvatar) {
      return (
        <div className="flex h-[120px] w-[120px] items-center justify-center rounded-full border-4 border-white shadow-lg" style={{ background: currentAvatar.bg }}>
          <span className="text-[48px]">{currentAvatar.emoji}</span>
        </div>
      );
    }
    return (
      <div className="flex h-[120px] w-[120px] items-center justify-center rounded-full border-4 border-white bg-[var(--color-blue-wash)] shadow-lg">
        <User className="h-12 w-12 text-[var(--color-blue-ink)]" strokeWidth={1.5} />
      </div>
    );
  };

  return (
    <div className="bbc min-h-screen">
      <div className="mx-auto max-w-[560px] px-6 py-10">
        {/* Back button */}
        <button onClick={() => router.back()} className="mb-8 inline-flex items-center gap-1 text-[13px] text-[var(--color-ink-soft)] transition hover:text-[var(--color-ink)]">
          <ChevronLeft className="h-4 w-4" /> Back
        </button>

        <h1 className="bbc-serif text-[28px] tracking-[-.02em]">Edit profile</h1>
        <p className="mt-1 text-[14.5px] text-[var(--color-ink-soft)]">Customize how you appear across BlueBottleCap.</p>

        {/* Avatar preview + upload */}
        <div className="mt-10 flex flex-col items-center">
          <div className="relative">
            {renderAvatar()}
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[var(--color-blue-ink)] text-white shadow-md transition hover:scale-105"
            >
              <Camera className="h-4 w-4" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>
          <p className="mt-3 text-[12px] text-[var(--color-ink-faint)]">Upload a photo or pick an avatar below</p>
        </div>

        {/* Avatar grid */}
        <div className="mt-8">
          <label className="bbc-mono text-[10.5px] uppercase tracking-[.18em] text-[var(--color-ink-faint)]">Choose an avatar</label>
          <div className="mt-3 grid grid-cols-6 gap-3">
            {AVATARS.map((av) => (
              <button
                key={av.id}
                onClick={() => { setSelectedAvatar(av.id); setPhotoPreview(null); setPhotoFile(null); }}
                className={`relative flex h-[52px] w-full items-center justify-center rounded-[12px] border-2 transition hover:scale-105 ${selectedAvatar === av.id ? "border-[var(--color-blue-ink)] shadow-md" : "border-[var(--color-line)]"}`}
                style={{ background: av.bg }}
              >
                <span className="text-[22px]">{av.emoji}</span>
                {selectedAvatar === av.id && (
                  <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-blue-ink)]">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Name field */}
        <div className="mt-10">
          <label htmlFor="profile-name" className="bbc-mono text-[10.5px] uppercase tracking-[.18em] text-[var(--color-ink-faint)]">Display name</label>
          <input
            id="profile-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            maxLength={50}
            className="mt-2 w-full rounded-[12px] border border-[var(--color-line)] bg-white px-4 py-3 text-[16px] text-[var(--color-ink)] outline-none transition focus:border-[var(--color-blue-ink)] focus:ring-2 focus:ring-[var(--color-blue-ink)]/20"
          />
        </div>

        {/* Email (read-only) */}
        <div className="mt-6">
          <label className="bbc-mono text-[10.5px] uppercase tracking-[.18em] text-[var(--color-ink-faint)]">Email</label>
          <p className="mt-2 rounded-[12px] border border-[var(--color-line)] bg-[var(--color-paper-card)] px-4 py-3 text-[15px] text-[var(--color-ink-soft)]">
            {currentUser.email || "—"}
          </p>
        </div>

        {/* Subscription */}
        <div className="mt-8 rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-5">
          <div className="flex items-center justify-between">
            <div>
              <label className="bbc-mono text-[10.5px] uppercase tracking-[.18em] text-[var(--color-ink-faint)]">Plan</label>
              <p className="mt-1 text-[16px] font-bold text-[var(--color-ink)]">
                {userStats.activePlan || "Free"}
                {cancelled && <span className="ml-2 text-[12px] font-semibold text-amber-600">Cancelled</span>}
              </p>
            </div>
            {isPro && !cancelled && (
              <button
                onClick={handleCancelSubscription}
                disabled={cancelling}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--color-line)] px-3.5 py-2 text-[12.5px] font-semibold text-[var(--color-ink-soft)] transition hover:border-red-300 hover:text-red-600 disabled:opacity-50"
              >
                {cancelling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                {cancelling ? "Cancelling…" : "Cancel plan"}
              </button>
            )}
            {!isPro && (
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--color-blue-ink)] px-3.5 py-2 text-[12.5px] font-semibold text-white transition hover:brightness-110"
              >
                <ShieldCheck className="h-3.5 w-3.5" /> Upgrade
              </Link>
            )}
          </div>
          {cancelled && (
            <p className="mt-3 text-[13px] leading-relaxed text-[var(--color-ink-soft)]">
              Auto-renewal is off. You&apos;ll keep access for the period you&apos;ve
              already paid for. Change your mind?{" "}
              <Link href="/pricing" className="font-semibold text-[var(--color-blue-ink)] underline">Reactivate</Link>.
            </p>
          )}
          <p className="mt-3 flex items-center gap-1.5 text-[12.5px] text-[var(--color-ink-faint)]">
            <Mail className="h-3.5 w-3.5" />
            Billing questions:{" "}
            <a href="mailto:support@bluebottlecap.com" className="font-semibold text-[var(--color-blue-ink)] underline">support@bluebottlecap.com</a>
            <span className="mx-1.5">·</span>
            <Link href="/refunds" className="font-semibold text-[var(--color-blue-ink)] underline">Refund policy</Link>
          </p>
        </div>

        {/* Save button */}
        <div className="mt-10">
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="bbc-btn bbc-btn-primary w-full justify-center gap-2 py-3.5 text-[15px] disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : null}
            {saving ? "Saving…" : saved ? "Saved!" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
