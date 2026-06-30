"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { UserStats, UsageStats, Flashcard, DailyActivity, RecentActivityItem } from "../types";
import { useAuth } from "./AuthContext";
import { db } from "../firebase";
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, addDoc, onSnapshot, query, where } from "firebase/firestore";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

interface GlobalState {
  pdfCount: number;
  activeJob: any | null;
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

const generateDefaultActivity = (): DailyActivity[] => {
  const activities: DailyActivity[] = [];
  const today = new Date();
  for (let i = 60; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    if (Math.random() < 0.4) {
      const queriesUsed = Math.floor(Math.random() * 6) + 1;
      const cardsCreated = Math.floor(Math.random() * 4);
      const hoursSaved = parseFloat(((queriesUsed * 0.2) + (cardsCreated * 0.1)).toFixed(1));
      activities.push({
        date: dateStr,
        queriesUsed,
        cardsCreated,
        hoursSaved
      });
    }
  }
  return activities;
};

export const GlobalStateProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser } = useAuth();
  
  // --- All state from App.tsx ---
  const [pdfCount, setPdfCount] = useState<number>(0);
  const [activeJob, setActiveJob] = useState<any | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState<boolean>(false);
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

  const [dailyActivity, setDailyActivity] = useState<DailyActivity[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bluebottlecap_daily_activity");
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return generateDefaultActivity();
  });

  const [todayReviewsCount, setTodayReviewsCount] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bluebottlecap_today_reviews");
      if (saved) {
        const count = parseInt(saved, 10);
        if (!isNaN(count)) return count;
      }
    }
    return 0;
  });

  const [openedPapers, setOpenedPapers] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bluebottlecap_opened_papers");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {}
      }
    }
    return [];
  });

  const [toolCreditsLeft, setToolCreditsLeft] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bluebottlecap_tool_credits");
      if (saved) {
        const count = parseInt(saved, 10);
        if (!isNaN(count)) return count;
      }
    }
    return 5;
  });

  // Single source of truth for plan limits. Every read of aiQueries.max /
  // pdfEdits.max / storage.max must go through this so the dashboard bars
  // and the upgrade-time setters can never drift apart again.
  type PlanName = "Free" | "Basic" | "Pro" | "Elite";
  const planLimits = (plan: string) => {
    const p = (plan || "Free") as PlanName;
    switch (p) {
      case "Free":
        return { aiQueries: 5, pdfEdits: 1, storage: 50 };
      case "Basic":
        return { aiQueries: 100, pdfEdits: 20, storage: 2000 };
      case "Pro":
        return { aiQueries: 99999, pdfEdits: 99999, storage: 10000 };
      case "Elite":
        return { aiQueries: 99999, pdfEdits: 99999, storage: 50000 };
      default:
        return { aiQueries: 5, pdfEdits: 1, storage: 50 };
    }
  };

  const [userStats, setUserStats] = useState<UserStats>(() => {
    if (typeof window !== "undefined") {
      const savedPlan = (localStorage.getItem("bluebottlecap_active_plan") || "Free") as 'Free' | 'Basic' | 'Pro' | 'Elite';
      const savedStreak = localStorage.getItem("bluebottlecap_streak_days");
      const streakDays = savedStreak ? parseInt(savedStreak, 10) : 0;
      const savedHours = localStorage.getItem("bluebottlecap_hours_saved");
      const hoursSaved = savedHours ? parseFloat(savedHours) : 0.0;
      const savedCredits = localStorage.getItem("bluebottlecap_credits_left");
      const creditsLeft = savedCredits ? parseInt(savedCredits, 10) : (savedPlan === "Free" ? 5 : 99999);
      const savedPurchases = localStorage.getItem("bluebottlecap_purchased_tests");
      const purchasedTests = savedPurchases ? JSON.parse(savedPurchases) : [];
      const studyMaterialUnlocked = localStorage.getItem("bluebottlecap_study_material_unlocked") === "true";

      return { hoursSaved, streakDays, creditsLeft, activePlan: savedPlan, purchasedTests, studyMaterialUnlocked };
    }
    return { hoursSaved: 0, streakDays: 0, creditsLeft: 5, activePlan: "Free", purchasedTests: [], studyMaterialUnlocked: false };
  });

  const [usageStats, setUsageStats] = useState<UsageStats>(() => {
    if (typeof window !== "undefined") {
      const savedPlan = localStorage.getItem("bluebottlecap_active_plan") || "Free";
      const savedCredits = localStorage.getItem("bluebottlecap_credits_left");
      const creditsLeft = savedCredits ? parseInt(savedCredits, 10) : (savedPlan === "Free" ? 5 : 99999);
      const savedPapers = localStorage.getItem("bluebottlecap_opened_papers");
      let papersCount = 1;
      if (savedPapers) {
        try {
          const parsed = JSON.parse(savedPapers);
          if (Array.isArray(parsed)) papersCount = parsed.length;
        } catch (e) {}
      }
      const limits = planLimits(savedPlan);
      return {
        aiQueries: { current: creditsLeft, max: limits.aiQueries, unit: "messages" },
        pdfEdits: { current: Math.min(papersCount, limits.pdfEdits), max: limits.pdfEdits, unit: "PDFs" },
        storage: { current: 120, max: limits.storage, unit: "MB" },
      };
    }
    return { aiQueries: { current: 5, max: 5, unit: "messages" }, pdfEdits: { current: 0, max: 1, unit: "PDFs" }, storage: { current: 0, max: 50, unit: "MB" } };
  });

  useEffect(() => {
    setUsageStats((prev) => {
      const limits = planLimits(userStats.activePlan);
      // Clamp current to max so the dashboard usage bar can never
      // render >100% (e.g. a Free user with two cached papers).
      const pdfCurrent = Math.min(openedPapers.length, limits.pdfEdits);
      return {
        ...prev,
        aiQueries: { ...prev.aiQueries, max: limits.aiQueries },
        pdfEdits: { current: pdfCurrent, max: limits.pdfEdits, unit: "PDFs" },
        storage: { current: 120, max: limits.storage, unit: "MB" },
      };
    });
  }, [openedPapers, userStats.activePlan]);

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

      if (typeof window !== "undefined") {
        localStorage.setItem("bluebottlecap_daily_activity", JSON.stringify(updated));
      }

      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        updateDoc(userDocRef, { dailyActivity: updated }).catch((err) => console.error(err));
      }

      return updated;
    });

    setUserStats((prev) => {
      const nextStats = { ...prev, hoursSaved: parseFloat((prev.hoursSaved + (actionType === "query" ? 0.2 : 0.1)).toFixed(1)) };
      if (typeof window !== "undefined") localStorage.setItem("bluebottlecap_hours_saved", String(nextStats.hoursSaved));
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
      if (typeof window !== "undefined") localStorage.setItem("bluebottlecap_today_reviews", String(nextCount));
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
      if (typeof window !== "undefined") localStorage.setItem("bluebottlecap_tool_credits", String(nextCount));
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

    if (usageStats.aiQueries.current > 0) {
      const newQueriesLeft = usageStats.aiQueries.current - 1;
      setUsageStats((prev) => ({ ...prev, aiQueries: { ...prev.aiQueries, current: newQueriesLeft } }));
      setUserStats((prev) => {
        if (typeof window !== "undefined") localStorage.setItem("bluebottlecap_credits_left", String(newQueriesLeft));
        return { ...prev, creditsLeft: newQueriesLeft };
      });
      recordActivity("query");
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        updateDoc(userDocRef, { creditsLeft: newQueriesLeft }).catch((err) => console.error(err));
      }
      if (newQueriesLeft <= 5 && newQueriesLeft > 0) {
        showToast(`⚠️ Only ${newQueriesLeft} messages left — consider upgrading!`, "warning");
      } else if (newQueriesLeft === 0) {
        showToast("🚫 No messages left. Upgrade to continue.", "error");
      } else {
        showToast(`✅ Message sent — ${newQueriesLeft} remaining`, "success");
      }
      return true;
    }
    showToast("🚫 No messages left. Upgrade to continue.", "error");
    return false;
  };

  const handleUpgradeAccount = async (plan: 'Free' | 'Basic' | 'Pro' | 'Elite') => {
    showToast(`🎉 Upgraded to ${plan} plan! All features unlocked.`, "success");
    if (typeof window !== "undefined") {
      localStorage.setItem("bluebottlecap_active_plan", plan);
      localStorage.setItem("bluebottlecap_credits_left", plan === "Free" ? "5" : "99999");
    }
    setUserStats((prev) => ({ ...prev, activePlan: plan, creditsLeft: plan === "Free" ? 5 : 99999 }));
    setUsageStats((prev) => {
      const limits = planLimits(plan);
      return {
        aiQueries: { current: limits.aiQueries, max: limits.aiQueries, unit: "messages" },
        pdfEdits: { current: Math.min(prev.pdfEdits.current, limits.pdfEdits), max: limits.pdfEdits, unit: "PDFs" },
        storage: { current: prev.storage.current, max: limits.storage, unit: "MB" },
      };
    });

    if (currentUser) {
      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        await updateDoc(userDocRef, { activePlan: plan, creditsLeft: plan === "Free" ? 5 : 99999, updatedAt: new Date().toISOString() });
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
      if (typeof window !== "undefined") localStorage.setItem("bluebottlecap_purchased_tests", JSON.stringify(next));
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        updateDoc(userDocRef, { purchasedTests: next, updatedAt: new Date().toISOString() }).catch(err => console.error(err));
      }
      return { ...prev, purchasedTests: next };
    });
  };

  const handleUnlockStudyMaterial = () => {
    if (typeof window !== "undefined") localStorage.setItem("bluebottlecap_study_material_unlocked", "true");
    setUserStats(prev => ({ ...prev, studyMaterialUnlocked: true }));
    if (currentUser) {
      const userDocRef = doc(db, "users", currentUser.uid);
      updateDoc(userDocRef, { studyMaterialUnlocked: true, updatedAt: new Date().toISOString() }).catch(err => console.error(err));
    }
  };

  const value = {
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
    usageStats,
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
    setOpenedPapers
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
