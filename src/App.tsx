"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ActiveView, UserStats, UsageStats, Flashcard, DailyActivity, RecentActivityItem } from "./types";
import { Navigation } from "./components/Navigation";
import { Onboarding } from "./components/Onboarding";
import { Dashboard } from "./components/Dashboard";
import { PdfCopilot } from "./components/PdfCopilot";
import { ToolsSuite } from "./components/ToolsSuite";
import { VirtualTestMode } from "./components/VirtualTestMode";
import { StudyMaterialPage } from "./components/StudyMaterialPage";
import SeniorsOpinionPage from "./components/SeniorsOpinionPage";
import { FlashcardsPage } from "./components/FlashcardsPage";
import { Pricing } from "./components/Pricing";
import { Paywall } from "./components/Paywall";
import { ArrowRight, Sparkles, Zap, CheckCircle2, ChevronDown, ChevronUp, BookOpen, Layers, Play, Settings, X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useAuth } from "./context/AuthContext";
import { AuthModal } from "./components/AuthModal";
import { SignUpPage } from "./components/SignUpPage";
import { CreateProfilePage } from "./components/CreateProfilePage";
import { db } from "./firebase";
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, addDoc, onSnapshot, query, where } from "firebase/firestore";
import { supabase } from "./supabaseClient";
import { ToastContainer, Toast, ToastType } from "./components/ToastContainer";
import { LandingPage } from "./components/LandingPage";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { SmoothScroll } from "./components/SmoothScroll";
import { LiquidTransition } from "./components/LiquidTransition";
import { CustomCursor } from "./components/CustomCursor";
import { AboutPage } from "./components/AboutPage";
import { GlobalBackground } from "./components/GlobalBackground";

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

const loadPdfTextFromBlob = async (file: File, onProgress?: (percent: number) => void): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  
  if (!(window as any)['pdfjsLib']) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load PDF library."));
      document.head.appendChild(script);
    });
  }
  
  const pdfjsLib = (window as any)['pdfjsLib'];
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
  
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  let fullText = "";
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(" ");
    fullText += pageText + "\n\n";
    if (onProgress) {
      onProgress(Math.round((i / pdf.numPages) * 100));
    }
  }
  return fullText;
};

export default function App({ initialView }: { initialView?: ActiveView }) {
  const { currentUser } = useAuth();
  const [currentView, setCurrentView] = useState<ActiveView>(initialView || "landing");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [pendingView, setPendingView] = useState<ActiveView | null>(null);
  const [faqOpenIdx, setFaqOpenIdx] = useState<number | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Firestore sync state variables
  const [pdfCount, setPdfCount] = useState<number>(0);
  const [activeJob, setActiveJob] = useState<any | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState<boolean>(false);
  const [lastLoggedDate, setLastLoggedDate] = useState<string>("");
  const [loginCount, setLoginCount] = useState<number>(0);
  const [recentActivities, setRecentActivities] = useState<RecentActivityItem[]>([]);

  // ─── Toast state ───────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState<Toast[]>([]);
  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);
  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const [dailyActivity, setDailyActivity] = useState<DailyActivity[]>(() => {
    const saved = localStorage.getItem("bluebottlecap_daily_activity");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return generateDefaultActivity();
  });

  const [todayReviewsCount, setTodayReviewsCount] = useState<number>(() => {
    const saved = localStorage.getItem("bluebottlecap_today_reviews");
    if (saved) {
      const count = parseInt(saved, 10);
      if (!isNaN(count)) return count;
    }
    return 0;
  });

  const [openedPapers, setOpenedPapers] = useState<string[]>(() => {
    const saved = localStorage.getItem("bluebottlecap_opened_papers");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });

  const [toolCreditsLeft, setToolCreditsLeft] = useState<number>(() => {
    const saved = localStorage.getItem("bluebottlecap_tool_credits");
    if (saved) {
      const count = parseInt(saved, 10);
      if (!isNaN(count)) return count;
    }
    return 5;
  });

  // Unified global student states
  const [userStats, setUserStats] = useState<UserStats>(() => {
    const savedPlan = (localStorage.getItem("bluebottlecap_active_plan") || "Free") as 'Free' | 'Basic' | 'Pro' | 'Elite';
    const savedStreak = localStorage.getItem("bluebottlecap_streak_days");
    const streakDays = savedStreak ? parseInt(savedStreak, 10) : 0;
    const savedHours = localStorage.getItem("bluebottlecap_hours_saved");
    const hoursSaved = savedHours ? parseFloat(savedHours) : 0.0;
    const savedCredits = localStorage.getItem("bluebottlecap_credits_left");
    const creditsLeft = savedCredits ? parseInt(savedCredits, 10) : (savedPlan === "Free" ? 25 : 99999);
    const savedPurchases = localStorage.getItem("bluebottlecap_purchased_tests");
    const purchasedTests = savedPurchases ? JSON.parse(savedPurchases) : [];
    const studyMaterialUnlocked = localStorage.getItem("bluebottlecap_study_material_unlocked") === "true";
    
    return {
      hoursSaved,
      streakDays,
      creditsLeft,
      activePlan: savedPlan,
      purchasedTests,
      studyMaterialUnlocked,
    };
  });

  const [usageStats, setUsageStats] = useState<UsageStats>(() => {
    const savedPlan = localStorage.getItem("bluebottlecap_active_plan") || "Free";
    const savedCredits = localStorage.getItem("bluebottlecap_credits_left");
    const creditsLeft = savedCredits ? parseInt(savedCredits, 10) : (savedPlan === "Free" ? 25 : 99999);
    const savedPapers = localStorage.getItem("bluebottlecap_opened_papers");
    let papersCount = 1;
    if (savedPapers) {
      try {
        const parsed = JSON.parse(savedPapers);
        if (Array.isArray(parsed)) papersCount = parsed.length;
      } catch (e) {}
    }
    return {
      aiQueries: { 
        current: creditsLeft, 
        max: savedPlan === "Free" ? 25 : savedPlan === "Basic" ? 100 : 99999, 
        unit: "credits" 
      },
      pdfEdits: { 
        current: papersCount, 
        max: savedPlan === "Free" ? 3 : 99999, 
        unit: "spots" 
      },
      storage: { 
        current: 120, 
        max: savedPlan === "Free" ? 500 : savedPlan === "Basic" ? 2000 : savedPlan === "Pro" ? 10000 : 50000, 
        unit: "MB" 
      },
    };
  });

  // Dynamically update usageStats based on userStats.activePlan and openedPapers state changes
  useEffect(() => {
    setUsageStats((prev) => {
      const activePlan = userStats.activePlan;
      return {
        ...prev,
        aiQueries: {
          ...prev.aiQueries,
          max: activePlan === "Free" ? 25 : activePlan === "Basic" ? 100 : 99999,
        },
        pdfEdits: {
          current: activePlan === "Free" ? openedPapers.length : 4,
          max: activePlan === "Free" ? 3 : 99999,
          unit: "spots"
        },
        storage: {
          current: 120,
          max: activePlan === "Free" ? 500 : activePlan === "Basic" ? 2000 : activePlan === "Pro" ? 10000 : 50000,
          unit: "MB"
        }
      };
    });
  }, [openedPapers, userStats.activePlan]);

  // Safe pre-populated recall flashcards
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

  // Sync state with Firestore on auth state changes
  useEffect(() => {
    if (!currentUser) {
      setPdfCount(0);
      setActiveJob(null);
      setDashboardLoading(false);
      setLastLoggedDate("");
      setLoginCount(0);
      setRecentActivities([]);

      const savedPlan = (localStorage.getItem("bluebottlecap_active_plan") || "Free") as 'Free' | 'Basic' | 'Pro' | 'Elite';
      const savedStreak = localStorage.getItem("bluebottlecap_streak_days");
      const streakDays = savedStreak ? parseInt(savedStreak, 10) : 0;
      const savedHours = localStorage.getItem("bluebottlecap_hours_saved");
      const hoursSaved = savedHours ? parseFloat(savedHours) : 0.0;
      const savedCredits = localStorage.getItem("bluebottlecap_credits_left");
      const creditsLeft = savedCredits ? parseInt(savedCredits, 10) : (savedPlan === "Free" ? 25 : 99999);

      setUserStats({
        hoursSaved,
        streakDays,
        creditsLeft,
        activePlan: savedPlan,
      });

      const savedPapers = localStorage.getItem("bluebottlecap_opened_papers");
      let papersCount = 1;
      if (savedPapers) {
        try {
          const parsed = JSON.parse(savedPapers);
          if (Array.isArray(parsed)) papersCount = parsed.length;
        } catch (e) {}
      }

      setUsageStats({
        aiQueries: { 
          current: creditsLeft, 
          max: savedPlan === "Free" ? 25 : savedPlan === "Basic" ? 100 : 99999, 
          unit: "credits" 
        },
        pdfEdits: { 
          current: papersCount, 
          max: savedPlan === "Free" ? 3 : 99999, 
          unit: "spots" 
        },
        storage: { 
          current: 120, 
          max: savedPlan === "Free" ? 500 : savedPlan === "Basic" ? 2000 : savedPlan === "Pro" ? 10000 : 50000, 
          unit: "MB" 
        },
      });
      setFlashcards([
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

      const savedActivity = localStorage.getItem("bluebottlecap_daily_activity");
      if (savedActivity) {
        try {
          setDailyActivity(JSON.parse(savedActivity));
        } catch (e) {
          setDailyActivity(generateDefaultActivity());
        }
      } else {
        setDailyActivity(generateDefaultActivity());
      }

      const savedReviews = localStorage.getItem("bluebottlecap_today_reviews");
      if (savedReviews) {
        const count = parseInt(savedReviews, 10);
        setTodayReviewsCount(isNaN(count) ? 0 : count);
      } else {
        setTodayReviewsCount(0);
      }

      const openedPapersRaw = localStorage.getItem("bluebottlecap_opened_papers");
      if (openedPapersRaw) {
        try {
          setOpenedPapers(JSON.parse(openedPapersRaw));
        } catch (e) {
          setOpenedPapers(["paper-1"]);
        }
      } else {
        setOpenedPapers(["paper-1"]);
      }

      const toolCreditsRaw = localStorage.getItem("bluebottlecap_tool_credits");
      if (toolCreditsRaw) {
        const count = parseInt(toolCreditsRaw, 10);
        setToolCreditsLeft(isNaN(count) ? 5 : count);
      } else {
        setToolCreditsLeft(5);
      }
      setCurrentView("landing");
      return;
    }

    setDashboardLoading(true);
    const userDocRef = doc(db, "users", currentUser.uid);

    // 1. Listen to user profile document
    const unsubscribeUser = onSnapshot(userDocRef, async (docSnap) => {
      try {
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          const planVal = data.plan || data.activePlan || "Free";
          const creditsVal = typeof data.creditsRemaining === "number" ? data.creditsRemaining : (typeof data.creditsLeft === "number" ? data.creditsLeft : (planVal.toLowerCase().includes("free") ? 25 : 99999));
          const streakVal = typeof data.streak === "number" ? data.streak : (typeof data.streakDays === "number" ? data.streakDays : 0);
          const hoursVal = typeof data.hoursSaved === "number" ? data.hoursSaved : 0.0;
          
          const cleanPlan = planVal.replace(/\s*plan$/i, '');

          // Check streak reset logic
          const todayDateStr = new Date().toISOString().split("T")[0];
          const yesterdayDate = new Date();
          yesterdayDate.setDate(yesterdayDate.getDate() - 1);
          const yesterdayDateStr = yesterdayDate.toISOString().split("T")[0];

          const lastActive: string | undefined = data.lastLoggedDate || data.lastActiveDate;
          
          if (lastActive && lastActive < yesterdayDateStr && streakVal > 0) {
            await updateDoc(userDocRef, { 
              streak: 0, 
              streakDays: 0 
            });
            return;
          }

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

          // Sync user to Supabase to support exam tool usage tracking
          try {
            await supabase.from("users").upsert({
              id: currentUser.uid,
              email: currentUser.email || "",
              name: currentUser.displayName || "",
              plan: cleanPlan,
            }, { onConflict: "id" });
          } catch (err) {
            console.error("Failed to sync user to Supabase:", err);
          }

          // Login Count Tracking
          const currentLoginCount = typeof data.loginCount === "number" ? data.loginCount : 1;
          
          if (lastActive && lastActive < todayDateStr) {
            // New session today, increment login count if we want, or just leave it.
            // For welcome back vs welcome, we really just care if it's > 1.
            // If they haven't logged in today, let's increment it so they get 'Welcome back'.
            await updateDoc(userDocRef, { 
              loginCount: currentLoginCount + 1,
              lastLoggedDate: todayDateStr
            });
            setLoginCount(currentLoginCount + 1);
          } else {
            setLoginCount(currentLoginCount);
          }

          setLastLoggedDate(data.lastLoggedDate || data.lastActiveDate || "");

          localStorage.setItem("bluebottlecap_active_plan", cleanPlan);
          localStorage.setItem("bluebottlecap_streak_days", String(streakVal));
          localStorage.setItem("bluebottlecap_hours_saved", String(hoursVal));
          localStorage.setItem("bluebottlecap_credits_left", String(creditsVal));
          
          const cloudActivity = Array.isArray(data.dailyActivity) ? data.dailyActivity : [];
          const cloudReviews = typeof data.todayReviewsCount === "number" ? data.todayReviewsCount : 0;
          const cloudPapers = Array.isArray(data.openedPapers) ? data.openedPapers : [];
          const cloudToolCredits = typeof data.toolCreditsLeft === "number" ? data.toolCreditsLeft : 5;

          if (cloudActivity.length > 0) {
            setDailyActivity(cloudActivity);
            localStorage.setItem("bluebottlecap_daily_activity", JSON.stringify(cloudActivity));
          } else {
            // Empty data for real users, no more fake 60 days!
            setDailyActivity([]);
            localStorage.setItem("bluebottlecap_daily_activity", JSON.stringify([]));
          }

          const cloudRecent = Array.isArray(data.recentActivities) ? data.recentActivities : [];
          setRecentActivities(cloudRecent);

          setTodayReviewsCount(cloudReviews);
          localStorage.setItem("bluebottlecap_today_reviews", String(cloudReviews));

          setOpenedPapers(cloudPapers);
          localStorage.setItem("bluebottlecap_opened_papers", JSON.stringify(cloudPapers));

          setToolCreditsLeft(cloudToolCredits);
          localStorage.setItem("bluebottlecap_tool_credits", String(cloudToolCredits));
        } else {
          // New User Document Initialization
          const initialActivity: DailyActivity[] = [];
          const initialRecent: RecentActivityItem[] = [];
          const initialReviews = 0;
          const initialPapers: string[] = [];
          const initialToolCredits = 5;
          const initialStreak = 0;
          const initialHours = 0.0;

          await setDoc(userDocRef, {
            email: currentUser.email,
            plan: "Free Plan",
            activePlan: "Free",
            creditsRemaining: 25,
            creditsLeft: 25,
            dailyActivity: initialActivity,
            recentActivities: initialRecent,
            todayReviewsCount: initialReviews,
            openedPapers: initialPapers,
            toolCreditsLeft: initialToolCredits,
            streak: initialStreak,
            streakDays: initialStreak,
            hoursSaved: initialHours,
            lastLoggedDate: new Date().toISOString().split("T")[0],
            loginCount: 1,
            studyMaterialUnlocked: false,
          });

          setDailyActivity(initialActivity);
          setRecentActivities(initialRecent);
          setLoginCount(1);
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

    // 2. Listen to user's PDF collection count
    const pdfsCollectionRef = collection(db, "users", currentUser.uid, "pdfs");
    const unsubscribePdfs = onSnapshot(pdfsCollectionRef, (snap) => {
      setPdfCount(snap.size);
    }, (err) => {
      console.error("Firestore pdfs collection listener error:", err);
    });

    // 3. Listen to user's active processing jobs
    const jobsCollectionRef = collection(db, "users", currentUser.uid, "jobs");
    const qJobs = query(jobsCollectionRef, where("status", "==", "processing"));
    const unsubscribeJobs = onSnapshot(qJobs, (snap) => {
      if (!snap.empty) {
        const firstJobDoc = snap.docs[0];
        setActiveJob({ id: firstJobDoc.id, ...firstJobDoc.data() });
      } else {
        setActiveJob(null);
      }
    }, (err) => {
      console.error("Firestore jobs query listener error:", err);
    });

    const fcCollectionRef = collection(db, "users", currentUser.uid, "flashcards");
    getDocs(fcCollectionRef).then(async (fcSnap) => {
      const loadedFlashcards: Flashcard[] = [];
      fcSnap.forEach((doc) => {
        const fcData = doc.data();
        loadedFlashcards.push({
          id: doc.id,
          question: fcData.question || "",
          answer: fcData.answer || "",
          category: fcData.category || "General",
        });
      });

      if (loadedFlashcards.length > 0) {
        setFlashcards(loadedFlashcards);
      } else {
        const prePopulated = [
          {
            question: "What is Multi-Head Attention in scholarly models?",
            answer: "A computational framework allowing self-attention arrays to weigh target tokens at distinct subspace coordinates simultaneously, enhancing document synthesis speeds.",
            category: "Academic AI Suite",
          },
          {
            question: "How does the 'cold start' study fatigues lower by 43%?",
            answer: "By deploying pre-reading synthesis, indexing key equations, and making flashcards prior to parsing deep text paragraphs linear-wise.",
            category: "Cognitive Science Review",
          },
        ];
        for (const fc of prePopulated) {
          await addDoc(fcCollectionRef, fc).catch(e => console.error(e));
        }
        const fcSnapNew = await getDocs(fcCollectionRef);
        const loadedFcNew: Flashcard[] = [];
        fcSnapNew.forEach((doc) => {
          const fcData = doc.data();
          loadedFcNew.push({
            id: doc.id,
            question: fcData.question || "",
            answer: fcData.answer || "",
            category: fcData.category || "General",
          });
        });
        setFlashcards(loadedFcNew);
      }
    }).catch(err => console.error("Error loading flashcards:", err));

    if (currentView === "landing") {
      setCurrentView("dashboard");
    }

    return () => {
      unsubscribeUser();
      unsubscribePdfs();
      unsubscribeJobs();
    };
  }, [currentUser]);


  // Activity recorder
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
          return {
            ...act,
            queriesUsed: qUsed,
            cardsCreated: cCreated,
            hoursSaved: hSaved,
          };
        }
        return act;
      });

      if (!found) {
        const qUsed = actionType === "query" ? 1 : 0;
        const cCreated = actionType === "card" ? 1 : 0;
        const hSaved = parseFloat(((qUsed * 0.2) + (cCreated * 0.1)).toFixed(1));
        updated.push({
          date: todayStr,
          queriesUsed: qUsed,
          cardsCreated: cCreated,
          hoursSaved: hSaved,
        });
      }

      localStorage.setItem("bluebottlecap_daily_activity", JSON.stringify(updated));

      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        updateDoc(userDocRef, {
          dailyActivity: updated,
        }).catch((err) => console.error("Error updating daily activity in Firestore:", err));
      }

      return updated;
    });

    setUserStats((prev) => {
      const nextStats = {
        ...prev,
        hoursSaved: parseFloat((prev.hoursSaved + (actionType === "query" ? 0.2 : 0.1)).toFixed(1))
      };
      localStorage.setItem("bluebottlecap_hours_saved", String(nextStats.hoursSaved));
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        updateDoc(userDocRef, {
          hoursSaved: nextStats.hoursSaved
        }).catch(err => console.error("Error updating hoursSaved in Firestore:", err));
      }
      return nextStats;
    });
  };

  const handleIncrementReview = () => {
    setTodayReviewsCount((prev) => {
      const nextCount = prev + 1;
      localStorage.setItem("bluebottlecap_today_reviews", String(nextCount));
      
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        updateDoc(userDocRef, {
          todayReviewsCount: nextCount,
        }).catch((err) => console.error("Error updating todayReviewsCount in Firestore:", err));
      }
      return nextCount;
    });
  };

  const handleUseToolCredit = (): boolean => {
    if (userStats.activePlan === "Pro" || userStats.activePlan === "Elite") return true;
    if (toolCreditsLeft > 0) {
      const nextCount = toolCreditsLeft - 1;
      setToolCreditsLeft(nextCount);
      localStorage.setItem("bluebottlecap_tool_credits", String(nextCount));
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        updateDoc(userDocRef, {
          toolCreditsLeft: nextCount
        }).catch(err => console.error(err));
      }
      return true;
    }
    return false;
  };

  // Handlers
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
      setUsageStats((prev) => ({
        ...prev,
        aiQueries: {
          ...prev.aiQueries,
          current: newQueriesLeft,
        },
      }));
      setUserStats((prev) => {
        localStorage.setItem("bluebottlecap_credits_left", String(newQueriesLeft));
        return {
          ...prev,
          creditsLeft: newQueriesLeft,
        };
      });

      recordActivity("query");

      // Sync query count back to Firestore immediately
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        updateDoc(userDocRef, {
          creditsLeft: newQueriesLeft,
        }).catch((err) => console.error("Error updating credits in Firestore:", err));
      }

      if (newQueriesLeft <= 5 && newQueriesLeft > 0) {
        showToast(`⚠️ Only ${newQueriesLeft} AI credits left — consider upgrading!`, "warning");
      } else if (newQueriesLeft === 0) {
        showToast("🚫 No AI credits left. Upgrade to continue.", "error");
      } else {
        showToast(`✅ AI query used — ${newQueriesLeft} credits remaining`, "success");
      }
      return true;
    }
    showToast("🚫 No AI credits left. Upgrade to continue.", "error");
    return false;
  };

  const handleUpgradeAccount = async (plan: 'Free' | 'Basic' | 'Pro' | 'Elite') => {
    showToast(`🎉 Upgraded to ${plan} plan! All features unlocked.`, "success");
    localStorage.setItem("bluebottlecap_active_plan", plan);
    localStorage.setItem("bluebottlecap_credits_left", plan === "Free" ? "25" : "99999");
    setUserStats((prev) => ({
      ...prev,
      activePlan: plan,
      creditsLeft: plan === "Free" ? 25 : 99999,
    }));
    setUsageStats((prev) => ({
      aiQueries: { 
        current: plan === "Free" ? 25 : plan === "Basic" ? 100 : 99999, 
        max: plan === "Free" ? 25 : plan === "Basic" ? 100 : 99999, 
        unit: "credits" 
      },
      pdfEdits: { 
        current: prev.pdfEdits.current, 
        max: plan === "Free" ? 5 : plan === "Basic" ? 20 : 99999, 
        unit: "spots" 
      },
      storage: { 
        current: prev.storage.current, 
        max: plan === "Free" ? 500 : plan === "Basic" ? 2000 : plan === "Pro" ? 10000 : 50000, 
        unit: "MB" 
      },
    }));

    if (currentUser) {
      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        await updateDoc(userDocRef, {
          activePlan: plan,
          creditsLeft: plan === "Free" ? 25 : 99999,
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
      localStorage.setItem("bluebottlecap_purchased_tests", JSON.stringify(next));
      
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        updateDoc(userDocRef, {
          purchasedTests: next,
          updatedAt: new Date().toISOString(),
        }).catch(err => console.error("Failed to update purchased tests in Firestore:", err));
      }
      return {
        ...prev,
        purchasedTests: next
      };
    });
  };

  const handleUnlockStudyMaterial = () => {
    localStorage.setItem("bluebottlecap_study_material_unlocked", "true");
    setUserStats(prev => ({ ...prev, studyMaterialUnlocked: true }));
    if (currentUser) {
      const userDocRef = doc(db, "users", currentUser.uid);
      updateDoc(userDocRef, {
        studyMaterialUnlocked: true,
        updatedAt: new Date().toISOString(),
      }).catch(err => console.error("Failed to update study material unlock in Firestore:", err));
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const viewMap: Record<string, ActiveView> = {
        '/': 'landing',
        '/dashboard': 'dashboard',
        '/about': 'about',
        '/study-material': 'study-material-page',
        '/virtual-test': 'virtual-test',
        '/tools': 'tools',
        '/pricing': 'pricing',
        '/flashcards': 'flashcards',
        '/seniors': 'seniors-opinion',
        '/create-profile': 'create-profile',
        '/pdf-editor': 'pdf-editor'
      };
      const view = viewMap[path] || 'landing';
      if (view !== currentView) {
        setPendingView(view);
        setIsTransitioning(true);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentView]);

  const navigateToView = (view: ActiveView) => {
    if (view === currentView) return;
    
    const paths: Record<string, string> = {
      landing: '/',
      dashboard: '/dashboard',
      about: '/about',
      'study-material-page': '/study-material',
      'virtual-test': '/virtual-test',
      tools: '/tools',
      pricing: '/pricing',
      flashcards: '/flashcards',
      'seniors-opinion': '/seniors',
      'create-profile': '/create-profile',
      'pdf-editor': '/pdf-editor'
    };
    
    // Update the browser URL natively without triggering a full page reload from Next.js
    window.history.pushState({}, '', paths[view] || '/');
    
    setPendingView(view);
    setIsTransitioning(true);
  };

  // Static FAQ items
  const faqItems = [
    {
      q: "How does the AI PDF Co-Pilot analyze my files securely?",
      a: "When you upload dense publications or paste paragraphs, the client computes local visual segments. If you trigger an AI query, our secure, server-side Express proxy handles the Google Gemini request securely. Your API keys are kept safely in the cloud and never exposed to public bundles.",
    },
    {
      q: "Can I use BlueBottleCap completely offline?",
      a: "Yes! While active Gemini LLM features require the server connection, our HTML5 voice lecturer, CSS spaced-recall flashcard, and scanner contrast estimate slider utilize native, client-side web sandbox APIs to remain functional without network keys.",
    },
    {
      q: "What constitutes the '25 AI queries quota'?",
      a: "To democratize high-power research, student accounts receive 25 persistent monthly credits, which are deducted when requesting summaries, Socratic math breakdowns, or jargon explanations. Upgrading to Pro removes all limits.",
    },
  ];

  // Reactively calculate achievements
  const achievements = [
    {
      id: "ach-1",
      name: "First Light",
      description: "Log in to the application to sync your scholar profile.",
      icon: "🏆",
      unlocked: currentUser !== null,
    },
    {
      id: "ach-2",
      name: "Consistent Scholar",
      description: "Maintain a study streak of 5 days or more.",
      icon: "🔥",
      unlocked: userStats.streakDays >= 5,
    },
    {
      id: "ach-3",
      name: "Retention Master",
      description: "Build your knowledge base with 5 or more active flashcards.",
      icon: "🧠",
      unlocked: flashcards.length >= 5,
    },
    {
      id: "ach-4",
      name: "Power Researcher",
      description: "Run 10 or more AI queries within a single week.",
      icon: "⚡",
      unlocked: (() => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0];
        const queriesInLastWeek = dailyActivity
          .filter(act => act.date >= sevenDaysAgoStr)
          .reduce((sum, act) => sum + (act.queriesUsed || 0), 0);
        return queriesInLastWeek >= 10;
      })(),
    },
  ];

  return (
    <SmoothScroll>
      <CustomCursor />
      <LiquidTransition
        isAnimating={isTransitioning}
        onMidpoint={() => {
          if (pendingView) {
            setCurrentView(pendingView);
            window.scrollTo({ top: 0, behavior: "instant" });
          }
        }}
        onComplete={() => {
          setIsTransitioning(false);
          setPendingView(null);
        }}
      />
      <div className="min-h-screen bg-transparent font-sans antialiased flex flex-col">
        <GlobalBackground />
      {/* Unified top header navigation */}
      <Navigation
        currentView={currentView}
        onViewChange={navigateToView}
        userStats={userStats}
        onLoginClick={() => navigateToView("signup")}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* VIEW CONDITIONAL RENDERS */}
      <ErrorBoundary>
        {currentView === "landing" && <LandingPage onNavigate={navigateToView} />}
        {currentView === "onboarding" && (
          <Onboarding
            onComplete={() => navigateToView("dashboard")}
            userStats={userStats}
          />
        )}

      {currentView === "dashboard" && (
        <Dashboard />
      )}

      {currentView === "pdf-editor" && (
        <PdfCopilot
          userStats={userStats}
          onIncrementQuery={incrementAiQueriesUsed}
          onAddFlashcard={handleAddFlashcard}
          openedPapers={openedPapers}
          onOpenPaper={(paperId) => {
            if (userStats.activePlan === "Free" && openedPapers.length >= 3 && !openedPapers.includes(paperId)) {
              return false;
            }
            setOpenedPapers((prev) => {
              if (prev.includes(paperId)) return prev;
              const next = [...prev, paperId];
              localStorage.setItem("bluebottlecap_opened_papers", JSON.stringify(next));
              if (currentUser) {
                const userDocRef = doc(db, "users", currentUser.uid);
                updateDoc(userDocRef, { openedPapers: next }).catch(err => console.error(err));
              }
              return next;
            });
            return true;
          }}
          onUpgradeClick={() => navigateToView("pricing")}
        />
      )}

      {currentView === "tools" && (
        <ToolsSuite
          userStats={userStats}
          flashcards={flashcards}
          onAddFlashcard={handleAddFlashcard}
          onIncrementQuery={incrementAiQueriesUsed}
          toolCreditsLeft={toolCreditsLeft}
          onUseToolCredit={handleUseToolCredit}
          onUpgradeClick={() => navigateToView("pricing")}
        />
      )}

      {currentView === "virtual-test" && (
        <VirtualTestMode
          userStats={userStats}
          onUpgradeClick={() => navigateToView("pricing")}
          onToast={(msg, type) => showToast(msg, type)}
          purchasedTests={userStats.purchasedTests || []}
          onPurchaseSuccess={handlePurchaseTest}
          studyMaterialUnlocked={userStats.studyMaterialUnlocked || false}
          onUnlockStudyMaterial={handleUnlockStudyMaterial}
          onGoHome={() => navigateToView("dashboard")}
        />
      )}
      {currentView === "study-material-page" && (
        <StudyMaterialPage
          onNavigate={navigateToView}
        />
      )}
      {currentView === "about" && (
        <AboutPage onNavigate={navigateToView} />
      )}
      {currentView === "seniors-opinion" && (
        <div className="fade-in">
          <SeniorsOpinionPage onNavigate={navigateToView} />
        </div>
      )}

      {currentView === "flashcards" && (
        <div className="fade-in min-h-[calc(100vh-64px)] bg-slate-50 bg-bg-primary">
          <FlashcardsPage flashcards={flashcards} onUpdateFlashcard={handleUpdateFlashcard} />
        </div>
      )}

      {currentView === "pricing" && (
        <Pricing
          userStats={userStats}
          onUpgradeApproved={handleUpgradeAccount}
          onNavigateTo={navigateToView}
        />
      )}

      {currentView === "signup" && (
        <SignUpPage setCurrentView={navigateToView} />
      )}

      {currentView === "create-profile" && (
        <CreateProfilePage setCurrentView={navigateToView} />
      )}

      </ErrorBoundary>
      </div>
    </SmoothScroll>
  );
}
