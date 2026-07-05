"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { UserStats, UsageStats, Flashcard, DailyActivity, RecentActivityItem } from "../types";
import { useAuth } from "./AuthContext";
import { db } from "../firebase";
import { doc, updateDoc, collection, getDocs, addDoc, onSnapshot, query, where } from "firebase/firestore";

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
  handleUpgradeAccount: (plan: 'Free' | 'Basic' | 'Pro' | 'Elite') => Promise<void>;
  handlePurchaseTest: (testId: string) => Promise<void>;
  handleUnlockStudyMaterial: () => void;
  setOpenedPapers: React.Dispatch<React.SetStateAction<string[]>>;
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
    if (!currentUser) return;

    setDashboardLoading(true);
    const userDocRef = doc(db, "users", currentUser.uid);

    const unsubscribeUser = onSnapshot(userDocRef, async (docSnap) => {
      try {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const planVal = data.plan || data.activePlan || "Free";
          const creditsVal = typeof data.creditsRemaining === "number" ? data.creditsRemaining : (typeof data.creditsLeft === "number" ? data.creditsLeft : (planVal.toLowerCase().includes("free") ? 25 : 99999));
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

  // Actions
  const recordActivity = (actionType: "query" | "card") => {
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
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        updateDoc(userDocRef, { dailyActivity: updated }).catch((err) => console.error(err));
      }

      return updated;
    });

    setUserStats((prev) => {
      const nextStats = { ...prev, hoursSaved: parseFloat((prev.hoursSaved + (actionType === "query" ? 0.2 : 0.1)).toFixed(1)) };
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        updateDoc(userDocRef, { hoursSaved: nextStats.hoursSaved }).catch(err => console.error(err));
      }
      return nextStats;
    });
  };

  const handleIncrementReview = () => {
    setTodayReviewsCount((prev) => {
      const nextCount = prev + 1;
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        updateDoc(userDocRef, { todayReviewsCount: nextCount }).catch((err) => console.error(err));
      }
      return nextCount;
    });
  };

  const handleUseToolCredit = (): boolean => {
    if (userStats.activePlan === "Pro" || userStats.activePlan === "Elite") return true;
    if (toolCreditsLeft > 0) {
      const nextCount = toolCreditsLeft - 1;
      setToolCreditsLeft(nextCount);
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        updateDoc(userDocRef, { toolCreditsLeft: nextCount }).catch(err => console.error(err));
      }
      return true;
    }
    return false;
  };

  const handleUpdateFlashcard = async (id: string, updates: Partial<Flashcard>) => {
    setFlashcards(prev => prev.map(fc => fc.id === id ? { ...fc, ...updates } : fc));
    if (currentUser) {
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

    if (currentUser) {
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
    if (userStats.activePlan === "Pro" || userStats.activePlan === "Elite") {
      recordActivity("query");
      showToast("⚡ AI query used — unlimited plan active", "info");
      return true;
    }

    // Single source of truth: userStats.creditsLeft
    if (userStats.creditsLeft > 0) {
      const newCreditsLeft = userStats.creditsLeft - 1;
      setUserStats((prev) => ({ ...prev, creditsLeft: newCreditsLeft }));
      recordActivity("query");
      if (currentUser) {
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
    showToast("🚫 No AI credits left. Upgrade to continue.", "error");
    return false;
  };

  const handleUpgradeAccount = async (plan: 'Free' | 'Basic' | 'Pro' | 'Elite') => {
    showToast(`🎉 Upgraded to ${plan} plan! All features unlocked.`, "success");
    const newCredits = getMaxCredits(plan);
    setUserStats((prev) => ({ ...prev, activePlan: plan, creditsLeft: newCredits }));
    // usageStats auto-computes from userStats — no separate setUsageStats call needed

    if (currentUser) {
      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        await updateDoc(userDocRef, {
          activePlan: plan,
          plan,
          creditsLeft: newCredits,
          creditsRemaining: newCredits,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error("Failed to update user plan in Firestore:", err);
      }
    }
  };

  const handlePurchaseTest = async (testId: string) => {
    setUserStats(prev => {
      const currentPurchased = prev.purchasedTests || [];
      if (currentPurchased.includes(testId)) return prev;
      const next = [...currentPurchased, testId];
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        updateDoc(userDocRef, { purchasedTests: next, updatedAt: new Date().toISOString() }).catch(err => console.error(err));
      }
      return { ...prev, purchasedTests: next };
    });
  };

  const handleUnlockStudyMaterial = () => {
    setUserStats(prev => ({ ...prev, studyMaterialUnlocked: true }));
    if (currentUser) {
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
