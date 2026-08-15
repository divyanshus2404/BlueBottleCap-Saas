"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
import { UserStats, UsageStats, Flashcard, DailyActivity, RecentActivityItem, ActivePlan } from "../types";
import { useAuth } from "./AuthContext";
import { db } from "../firebase";
import { doc, updateDoc, collection, getDocs, addDoc, onSnapshot, query, where } from "firebase/firestore";
import { evaluateStreak } from "../lib/streak";

const todayStr = (d: Date) => d.toISOString().split("T")[0];
const monthStr = (d: Date) => d.toISOString().slice(0, 7);

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

interface GlobalState {
  pdfCount: number;
  activeJob: Record<string, unknown> | null;
  dashboardLoading: boolean;
  lastLoggedDate: string;
  loginCount: number;
  recentActivities: RecentActivityItem[];
  toasts: Toast[];
  showToast: (message: string, type?: Toast["type"]) => void;
  dismissToast: (id: number) => void;
  dailyActivity: DailyActivity[];
  todayReviewsCount: number;
  openedPapers: string[];
  toolCreditsLeft: number;
  userStats: UserStats;
  usageStats: UsageStats;
  flashcards: Flashcard[];

  // Actions
  recordActivity: (actionType: "query" | "card") => void;
  handleIncrementReview: () => void;
  handleUseToolCredit: () => boolean;
  handleUpdateFlashcard: (id: string, updates: Partial<Flashcard>) => Promise<void>;
  handleAddFlashcard: (newFc: Flashcard) => Promise<void>;
  incrementAiQueriesUsed: () => boolean;
  handleUpgradeAccount: (plan: ActivePlan) => Promise<void>;
  handlePurchaseTest: (testId: string) => Promise<void>;
  handleUnlockStudyMaterial: () => void;
  setOpenedPapers: React.Dispatch<React.SetStateAction<string[]>>;

  // Referral state — refresh-count is what the ReferralCard just observed
  // from Firestore, claim-reward atomically credits any unclaimed tiers to
  // the user's AI-query balance and syncs it back to Firestore.
  referralCount: number;
  referralRewardsClaimed: number;
  refreshReferralCount: (n: number) => void;
  claimReferralReward: (tiersEarned: number) => Promise<void>;

  // Streak-save mechanic — mark today as logged so the streak survives
  // even if the user did nothing else all day. Called from the banner
  // after Razorpay verify returns ok, or with { free: true } when the
  // user spends their one free save of the month.
  saveStreakToday: (opts?: { free?: boolean }) => Promise<void>;
  // YYYY-MM the free save was last used ("" = never).
  freeStreakSaveMonth: string;
  // Mark today as a real study day — extends/starts the streak. Called
  // automatically by the activity handlers; no-op if already logged today.
  logStudyActivity: () => void;
}

const GlobalStateContext = createContext<GlobalState | undefined>(undefined);

let toastIdCounter = 0;

/** Compute usage limits based on plan */
function getMaxCredits(plan: string): number {
  if (plan === "Free") return 25;
  if (plan === "Basic") return 100;
  return 99999;
}

export const GlobalStateProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser } = useAuth();

  const [pdfCount, setPdfCount] = useState<number>(0);
  const [activeJob, setActiveJob] = useState<Record<string, unknown> | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState<boolean>(true);
  const [lastLoggedDate, setLastLoggedDate] = useState<string>("");
  const [loginCount, setLoginCount] = useState<number>(0);
  const [freeStreakSaveMonth, setFreeStreakSaveMonth] = useState<string>("");
  const [recentActivities, setRecentActivities] = useState<RecentActivityItem[]>([]);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const showToast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);
  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Start with empty arrays — real data comes from Firestore via onSnapshot
  const [dailyActivity, setDailyActivity] = useState<DailyActivity[]>([]);
  const [todayReviewsCount, setTodayReviewsCount] = useState<number>(0);
  const [openedPapers, setOpenedPapers] = useState<string[]>([]);
  const [toolCreditsLeft, setToolCreditsLeft] = useState<number>(5);

  // Default userStats — overwritten by Firestore onSnapshot
  const [userStats, setUserStats] = useState<UserStats>({
    hoursSaved: 0,
    streakDays: 0,
    creditsLeft: 25,
    activePlan: "Free",
    purchasedTests: [],
    studyMaterialUnlocked: false,
  });

  // usageStats is derived from userStats — computed, not independently stored
  const usageStats: UsageStats = {
    aiQueries: {
      current: userStats.creditsLeft,
      max: getMaxCredits(userStats.activePlan),
      unit: "credits",
    },
    pdfEdits: {
      current: openedPapers.length,
      max: userStats.activePlan === "Free" ? 3 : 99999,
      unit: "spots",
    },
    storage: {
      current: 120,
      max:
        userStats.activePlan === "Free" ? 500
        : userStats.activePlan === "Basic" ? 2000
        : userStats.activePlan === "Pro" ? 10000
        : 50000,
      unit: "MB",
    },
  };

  // Referral counters — synced from the user's Firestore doc. The count is
  // the number of successful sign-ups with our code; claimed is the number
  // of reward tiers we've already credited so we don't double-pay.
  const [referralCount, setReferralCount] = useState<number>(0);
  const [referralRewardsClaimed, setReferralRewardsClaimed] = useState<number>(0);

  const [flashcards, setFlashcards] = useState<Flashcard[]>([
    {
      id: "pre-1",
      question: "What is Multi-Head Attention in scholarly models?",
      answer: "A computational framework allowing self-attention arrays to weigh target tokens at distinct subspace coordinates simultaneously, enhancing document synthesis speeds.",
      category: "Academic AI Suite",
    },
    {
      id: "pre-2",
      question: "How does the 'cold start' study fatigues lower by 43%?",
      answer: "By deploying pre-reading synthesis, indexing key equations, and making flashcards prior to parsing deep text paragraphs linear-wise.",
      category: "Cognitive Science Review",
    },
  ]);

  useEffect(() => {
    if (!currentUser || !db) return;

    setDashboardLoading(true);
    const userDocRef = doc(db, "users", currentUser.uid);

    const unsubscribeUser = onSnapshot(userDocRef, async (docSnap) => {
      try {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const planVal = data.plan || data.activePlan || "Free";
          const creditsVal = typeof data.creditsRemaining === "number" ? data.creditsRemaining : (typeof data.creditsLeft === "number" ? data.creditsLeft : (planVal.toLowerCase().includes("free") ? 5 : 99999));
          const streakVal = typeof data.streak === "number" ? data.streak : (typeof data.streakDays === "number" ? data.streakDays : 0);
          const hoursVal = typeof data.hoursSaved === "number" ? data.hoursSaved : 0.0;
          const cleanPlan = planVal.replace(/\s*plan$/i, '');
          
          const purchases = Array.isArray(data.purchasedTests) ? data.purchasedTests : [];
          const studyUnlocked = data.studyMaterialUnlocked === true;
          setUserStats({
            hoursSaved: hoursVal,
            streakDays: streakVal,
            creditsLeft: creditsVal,
            activePlan: cleanPlan,
            purchasedTests: purchases,
            studyMaterialUnlocked: studyUnlocked,
          });

          setLoginCount(typeof data.loginCount === "number" ? data.loginCount : 1);
          setLastLoggedDate(data.lastLoggedDate || data.lastActiveDate || "");
          if (typeof data.freeStreakSaveMonth === "string") {
            setFreeStreakSaveMonth(data.freeStreakSaveMonth);
            if (typeof window !== "undefined") {
              localStorage.setItem("bluebottlecap_free_streak_save_month", data.freeStreakSaveMonth);
            }
          }

          if (typeof window !== "undefined") {
            localStorage.setItem("bluebottlecap_active_plan", cleanPlan);
            localStorage.setItem("bluebottlecap_streak_days", String(streakVal));
            localStorage.setItem("bluebottlecap_hours_saved", String(hoursVal));
            localStorage.setItem("bluebottlecap_credits_left", String(creditsVal));
          }
          
          const cloudActivity = Array.isArray(data.dailyActivity) ? data.dailyActivity : [];
          const cloudReviews = typeof data.todayReviewsCount === "number" ? data.todayReviewsCount : 0;
          const cloudPapers = Array.isArray(data.openedPapers) ? data.openedPapers : [];
          const cloudToolCredits = typeof data.toolCreditsLeft === "number" ? data.toolCreditsLeft : 5;

          // Referral snapshot — the ReferralCard re-queries the live count
          // itself, but seeding from the doc keeps the progress bar from
          // flashing empty on first paint.
          setReferralCount(typeof data.referralCount === "number" ? data.referralCount : 0);
          setReferralRewardsClaimed(typeof data.referralRewardsClaimed === "number" ? data.referralRewardsClaimed : 0);

          if (cloudActivity.length > 0) {
            setDailyActivity(cloudActivity);
          }
          setRecentActivities(Array.isArray(data.recentActivities) ? data.recentActivities : []);
          setTodayReviewsCount(cloudReviews);
          setOpenedPapers(cloudPapers);
          setToolCreditsLeft(cloudToolCredits);
        }
      } catch (err) {
        console.error("Firestore user doc sync error:", err);
      } finally {
        setDashboardLoading(false);
      }
    }, (err) => {
      console.error("Firestore user doc listener error:", err);
      setDashboardLoading(false);
    });

    const pdfsCollectionRef = collection(db, "users", currentUser.uid, "pdfs");
    const unsubscribePdfs = onSnapshot(pdfsCollectionRef, (snap) => setPdfCount(snap.size));

    const jobsCollectionRef = collection(db, "users", currentUser.uid, "jobs");
    const qJobs = query(jobsCollectionRef, where("status", "==", "processing"));
    const unsubscribeJobs = onSnapshot(qJobs, (snap) => {
      if (!snap.empty) {
        const firstJobDoc = snap.docs[0];
        setActiveJob({ id: firstJobDoc.id, ...firstJobDoc.data() });
      } else {
        setActiveJob(null);
      }
    });

    const fcCollectionRef = collection(db, "users", currentUser.uid, "flashcards");
    getDocs(fcCollectionRef).then(async (fcSnap) => {
      const loadedFlashcards: Flashcard[] = [];
      fcSnap.forEach((doc) => loadedFlashcards.push({ id: doc.id, question: doc.data().question || "", answer: doc.data().answer || "", category: doc.data().category || "General" }));
      if (loadedFlashcards.length > 0) setFlashcards(loadedFlashcards);
    });

    return () => {
      unsubscribeUser();
      unsubscribePdfs();
      unsubscribeJobs();
    };
  }, [currentUser]);

  // Keep a ref of the last logged date so rapid successive activity calls
  // in the same render can't double-increment the streak.
  const lastLoggedRef = useRef(lastLoggedDate);
  useEffect(() => {
    lastLoggedRef.current = lastLoggedDate;
  }, [lastLoggedDate]);

  const logStudyActivity = () => {
    const now = new Date();
    const today = todayStr(now);
    const prevDate = lastLoggedRef.current;
    if (prevDate === today) return;
    lastLoggedRef.current = today;
    setLastLoggedDate(today);
    if (typeof window !== "undefined") {
      localStorage.setItem("bluebottlecap_last_logged_date", today);
    }
    setUserStats((prev) => {
      const snap = evaluateStreak(prev.streakDays, prevDate, now);
      // at-risk = yesterday was the last log, so today extends the run.
      // broken/no-streak = start fresh at 1. active-today only happens when
      // there was no stored date at all — count today as day 1 of a real run
      // unless a positive streak already exists.
      const nextStreak =
        snap.status === "at-risk" ? prev.streakDays + 1 :
        snap.status === "active-today" ? Math.max(prev.streakDays, 1) :
        1;
      if (typeof window !== "undefined") {
        localStorage.setItem("bluebottlecap_streak_days", String(nextStreak));
      }
      if (currentUser && db) {
        const userDocRef = doc(db, "users", currentUser.uid);
        updateDoc(userDocRef, {
          streak: nextStreak,
          streakDays: nextStreak,
          lastLoggedDate: today,
          lastActiveDate: today,
          updatedAt: new Date().toISOString(),
        }).catch((err) => console.error("Failed to persist streak:", err));
      }
      return { ...prev, streakDays: nextStreak };
    });
  };

  // Actions
  const recordActivity = (actionType: "query" | "card") => {
    logStudyActivity();
    const todayStr = new Date().toISOString().split("T")[0];
    setDailyActivity((prev) => {
      let found = false;
      const updated = prev.map((act) => {
        if (act.date === todayStr) {
          found = true;
          const qUsed = act.queriesUsed + (actionType === "query" ? 1 : 0);
          const cCreated = act.cardsCreated + (actionType === "card" ? 1 : 0);
          const hSaved = parseFloat(((qUsed * 0.2) + (cCreated * 0.1)).toFixed(1));
          return { ...act, queriesUsed: qUsed, cardsCreated: cCreated, hoursSaved: hSaved };
        }
        return act;
      });

      if (!found) {
        const qUsed = actionType === "query" ? 1 : 0;
        const cCreated = actionType === "card" ? 1 : 0;
        const hSaved = parseFloat(((qUsed * 0.2) + (cCreated * 0.1)).toFixed(1));
        updated.push({ date: todayStr, queriesUsed: qUsed, cardsCreated: cCreated, hoursSaved: hSaved });
      }

      // Firestore is the single source of truth — no localStorage write
      if (currentUser && db) {
        const userDocRef = doc(db, "users", currentUser.uid);
        updateDoc(userDocRef, { dailyActivity: updated }).catch((err) => console.error(err));
      }

      return updated;
    });

    setUserStats((prev) => {
      const nextStats = { ...prev, hoursSaved: parseFloat((prev.hoursSaved + (actionType === "query" ? 0.2 : 0.1)).toFixed(1)) };
      if (currentUser && db) {
        const userDocRef = doc(db, "users", currentUser.uid);
        updateDoc(userDocRef, { hoursSaved: nextStats.hoursSaved }).catch(err => console.error(err));
      }
      return nextStats;
    });
  };

  const handleIncrementReview = () => {
    logStudyActivity();
    setTodayReviewsCount((prev) => {
      const nextCount = prev + 1;
      if (currentUser && db) {
        const userDocRef = doc(db, "users", currentUser.uid);
        updateDoc(userDocRef, { todayReviewsCount: nextCount }).catch((err) => console.error(err));
      }
      return nextCount;
    });
  };

  const handleUseToolCredit = (): boolean => {
    if (userStats.activePlan === "Pro") {
      logStudyActivity();
      return true;
    }
    if (toolCreditsLeft > 0) {
      logStudyActivity();
      const nextCount = toolCreditsLeft - 1;
      setToolCreditsLeft(nextCount);
      if (currentUser && db) {
        const userDocRef = doc(db, "users", currentUser.uid);
        updateDoc(userDocRef, { toolCreditsLeft: nextCount }).catch(err => console.error(err));
      }
      return true;
    }
    return false;
  };

  const handleUpdateFlashcard = async (id: string, updates: Partial<Flashcard>) => {
    setFlashcards(prev => prev.map(fc => fc.id === id ? { ...fc, ...updates } : fc));
    if (currentUser && db) {
      try {
        const docRef = doc(db, "users", currentUser.uid, "flashcards", id);
        await updateDoc(docRef, updates);
      } catch (err) {
        console.error("Failed to update flashcard in Firestore:", err);
      }
    }
  };

  const handleAddFlashcard = async (newFc: Flashcard) => {
    recordActivity("card");
    showToast("🧠 Flashcard saved to your study bank!", "success");

    if (currentUser && db) {
      try {
        const fcCollectionRef = collection(db, "users", currentUser.uid, "flashcards");
        const docRef = await addDoc(fcCollectionRef, {
          question: newFc.question,
          answer: newFc.answer,
          category: newFc.category,
          createdAt: new Date().toISOString(),
        });
        const fcWithId = { ...newFc, id: docRef.id };
        setFlashcards((prev) => [fcWithId, ...prev]);
      } catch (err) {
        console.error("Failed to add flashcard to Firestore:", err);
        setFlashcards((prev) => [newFc, ...prev]);
      }
    } else {
      setFlashcards((prev) => [newFc, ...prev]);
    }
  };

  const incrementAiQueriesUsed = (): boolean => {
    if (userStats.activePlan === "Pro") {
      recordActivity("query");
      showToast("⚡ AI query used — unlimited plan active", "info");
      return true;
    }

    // Single source of truth: userStats.creditsLeft
    if (userStats.creditsLeft > 0) {
      const newCreditsLeft = userStats.creditsLeft - 1;
      setUserStats((prev) => ({ ...prev, creditsLeft: newCreditsLeft }));
      recordActivity("query");
      if (currentUser && db) {
        const userDocRef = doc(db, "users", currentUser.uid);
        updateDoc(userDocRef, { creditsLeft: newCreditsLeft, creditsRemaining: newCreditsLeft }).catch((err) => console.error(err));
      }
      if (newCreditsLeft <= 5 && newCreditsLeft > 0) {
        showToast(`⚠️ Only ${newCreditsLeft} AI credits left — consider upgrading!`, "warning");
      } else if (newCreditsLeft === 0) {
        showToast("🚫 No AI credits left. Upgrade to continue.", "error");
      } else {
        showToast(`✅ AI query used — ${newCreditsLeft} credits remaining`, "success");
      }
      return true;
    }
    showToast("🚫 No messages left. Upgrade to continue.", "error");
    return false;
  };

  const handleUpgradeAccount = async (plan: ActivePlan) => {
    // Optimistic UI: unlock features immediately. The authoritative source
    // for the plan is the server-side Razorpay verify route, which writes
    // activePlan/creditsRemaining to Firestore via Admin SDK. The onSnapshot
    // listener above will reconcile this state on the next tick.
    //
    // Firestore rules deny client writes to entitlement fields (see
    // firestore.rules), so we deliberately don't try to persist here — that
    // would just log a permission-denied error.
    const newCredits = getMaxCredits(plan);
    setUserStats((prev) => ({ ...prev, activePlan: plan, creditsLeft: newCredits }));
    showToast(`🎉 Upgraded to ${plan} plan! All features unlocked.`, "success");
  };

  const handlePurchaseTest = async (testId: string) => {
    setUserStats(prev => {
      const currentPurchased = prev.purchasedTests || [];
      if (currentPurchased.includes(testId)) return prev;
      const next = [...currentPurchased, testId];
      if (currentUser && db) {
        const userDocRef = doc(db, "users", currentUser.uid);
        updateDoc(userDocRef, { purchasedTests: next, updatedAt: new Date().toISOString() }).catch(err => console.error(err));
      }
      return { ...prev, purchasedTests: next };
    });
  };

  const refreshReferralCount = useCallback((n: number) => {
    setReferralCount(n);
    // Persist the freshest number to Firestore so other surfaces (future
    // emails, admin dashboard) can read a stable count without re-querying.
    if (currentUser && db) {
      const userDocRef = doc(db, "users", currentUser.uid);
      updateDoc(userDocRef, { referralCount: n }).catch(err => console.error(err));
    }
  }, [currentUser]);

  const claimReferralReward = async (tiersEarned: number) => {
    const unclaimed = Math.max(0, tiersEarned - referralRewardsClaimed);
    if (unclaimed <= 0) return;

    // Bonus credits equal +30 per tier, matching the copy on the ReferralCard.
    // If we ever change the number, keep it in sync with REFERRAL_BONUS_PER_TIER.
    const bonus = unclaimed * 30;
    const nextClaimed = tiersEarned;
    const nextCredits = userStats.creditsLeft + bonus;

    setReferralRewardsClaimed(nextClaimed);
    setUserStats((prev) => ({ ...prev, creditsLeft: nextCredits }));
    // usageStats is derived from userStats.creditsLeft — no separate update needed
    if (typeof window !== "undefined") {
      localStorage.setItem("bluebottlecap_credits_left", String(nextCredits));
    }
    showToast(`+${bonus} AI queries added — thanks for the referrals.`, "success");

    if (currentUser && db) {
      const userDocRef = doc(db, "users", currentUser.uid);
      try {
        await updateDoc(userDocRef, {
          referralRewardsClaimed: nextClaimed,
          creditsLeft: nextCredits,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error("Failed to persist referral reward:", err);
      }
    }
  };

  const saveStreakToday = async (opts?: { free?: boolean }) => {
    const now = new Date();
    const today = todayStr(now);
    const month = monthStr(now);
    lastLoggedRef.current = today;
    setLastLoggedDate(today);
    if (opts?.free) setFreeStreakSaveMonth(month);
    if (typeof window !== "undefined") {
      localStorage.setItem("bluebottlecap_last_logged_date", today);
      if (opts?.free) localStorage.setItem("bluebottlecap_free_streak_save_month", month);
    }
    if (currentUser && db) {
      const userDocRef = doc(db, "users", currentUser.uid);
      try {
        await updateDoc(userDocRef, {
          lastLoggedDate: today,
          lastActiveDate: today,
          streakSavedAt: today,
          ...(opts?.free ? { freeStreakSaveMonth: month } : {}),
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error("Failed to persist streak save:", err);
      }
    }
  };

  const handleUnlockStudyMaterial = () => {
    setUserStats(prev => ({ ...prev, studyMaterialUnlocked: true }));
    if (currentUser && db) {
      const userDocRef = doc(db, "users", currentUser.uid);
      updateDoc(userDocRef, { studyMaterialUnlocked: true, updatedAt: new Date().toISOString() }).catch(err => console.error(err));
    }
  };

  const value: GlobalState = {
    pdfCount,
    activeJob,
    dashboardLoading,
    lastLoggedDate,
    loginCount,
    recentActivities,
    toasts,
    showToast,
    dismissToast,
    dailyActivity,
    todayReviewsCount,
    openedPapers,
    toolCreditsLeft,
    userStats,
    usageStats,   // computed — mirrors userStats.creditsLeft
    flashcards,
    recordActivity,
    handleIncrementReview,
    handleUseToolCredit,
    handleUpdateFlashcard,
    handleAddFlashcard,
    incrementAiQueriesUsed,
    handleUpgradeAccount,
    handlePurchaseTest,
    handleUnlockStudyMaterial,
    setOpenedPapers,
    referralCount,
    referralRewardsClaimed,
    refreshReferralCount,
    claimReferralReward,
    saveStreakToday,
    freeStreakSaveMonth,
    logStudyActivity,
  };

  return <GlobalStateContext.Provider value={value}>{children}</GlobalStateContext.Provider>;
};

export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (context === undefined) {
    throw new Error("useGlobalState must be used within a GlobalStateProvider");
  }
  return context;
};
