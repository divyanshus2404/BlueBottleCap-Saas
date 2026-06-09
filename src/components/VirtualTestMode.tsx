"use client";

import React, { useState, useEffect } from "react";
import { UserStats } from "../types";
import { jeePyqData, JEEQuestion } from "../data/jeePyqs";
import { repeatedTestsData, RepeatedTest } from "../data/repeatedJeePyqs";
import { studyMaterial, getChaptersBySubject, getChapterByName } from "../data/studyMaterial";
import {
  Timer,
  Layers,
  BookOpen,
  Lock,
  Check,
  X,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Star,
  Award,
  ChevronLeft,
  Settings,
  LogOut,
  Sliders,
  DollarSign,
  ArrowLeft,
  Zap,
  FileText,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";


interface VirtualTestModeProps {
  userStats: UserStats;
  onUpgradeClick: () => void;
  onToast: (msg: string, type?: "success" | "error" | "info") => void;
  purchasedTests: string[];
  onPurchaseSuccess: (testId: string) => void;
  studyMaterialUnlocked: boolean;
  onUnlockStudyMaterial: () => void;
  onGoHome: () => void;
}

export const VirtualTestMode: React.FC<VirtualTestModeProps> = ({
  userStats,
  onUpgradeClick,
  onToast,
  purchasedTests,
  onPurchaseSuccess,
  studyMaterialUnlocked,
  onUnlockStudyMaterial,
  onGoHome,
}) => {
  const { currentUser } = useAuth();

  // Navigation Sidebar tab
  const [activeSidebarTab, setActiveSidebarTab] = useState<"dashboard" | "mock-tests" | "study-material" | "performance" | "support">("dashboard");

  // Study material browser state
  const [studySubject, setStudySubject] = useState<"Physics" | "Chemistry" | "Mathematics">("Physics");
  const [studyChapter, setStudyChapter] = useState<string>("");
  const [expandedConcept, setExpandedConcept] = useState<number | null>(null);
  const [revealedAnswers, setRevealedAnswers] = useState<{ [key: string]: boolean }>({});

  // Mock test filter states
  const [mockTypeTab, setMockTypeTab] = useState<"chapter" | "repeated">("repeated");
  const [selectedSubject, setSelectedSubject] = useState<"Physics" | "Chemistry" | "Mathematics">("Physics");
  const [selectedChapterName, setSelectedChapterName] = useState<string>("");

  // Timed test session state
  const [activeTest, setActiveTest] = useState<{
    id: string;
    name: string;
    questions: JEEQuestion[];
  } | null>(null);
  const [testStarted, setTestStarted] = useState<boolean>(false);
  const [shuffledQuestions, setShuffledQuestions] = useState<JEEQuestion[]>([]);
  const [testSelectedAnswers, setTestSelectedAnswers] = useState<{ [qId: string]: string }>({});
  const [testSubmitted, setTestSubmitted] = useState<boolean>(false);
  const [testTimerSeconds, setTestTimerSeconds] = useState<number>(600); // 10 minutes
  const [testTimerActive, setTestTimerActive] = useState<boolean>(false);

  // Performance history log
  const [performanceHistory, setPerformanceHistory] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bluebottlecap_test_history");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("bluebottlecap_test_history", JSON.stringify(performanceHistory));
  }, [performanceHistory]);

  // Sync default chapter on subject change
  useEffect(() => {
    const subjectData = jeePyqData.find(s => s.name === selectedSubject);
    if (subjectData && subjectData.chapters.length > 0) {
      setSelectedChapterName(subjectData.chapters[0].name);
    }
  }, [selectedSubject]);

  // Countdown timer hook
  useEffect(() => {
    let interval: any = null;
    if (testTimerActive && testTimerSeconds > 0 && !testSubmitted) {
      interval = setInterval(() => {
        setTestTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (testTimerSeconds === 0 && !testSubmitted) {
      handleAutoSubmit();
    }
    return () => clearInterval(interval);
  }, [testTimerActive, testTimerSeconds, testSubmitted]);

  // Load Razorpay Script
  const loadRazorpayScript = () => {
    return new Promise<boolean>((resolve) => {
      if (document.querySelector("script[src='https://checkout.razorpay.com/v1/checkout.js']")) {
        return resolve(true);
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Payment checkout trigger for ₹120
  const handleUnlockTest = async (testId: string, testName: string) => {
    try {
      onToast("Connecting to payment server...", "info");
      
      const amountPaise = 120 * 100; // ₹120.00 in paise
      const resp = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountPaise }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Failed to create checkout order");

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error("Failed to load Razorpay check script");

      const options: any = {
        key: data.key_id,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "BlueBottleCap",
        description: `Unlock ${testName}`,
        order_id: data.order.id,
        handler: async function (response: any) {
          try {
            onToast("Verifying payment...", "info");
            const verifyResp = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const verifyData = await verifyResp.json();
            if (verifyResp.ok && verifyData.ok) {
              onPurchaseSuccess(testId);
              onToast(`🎉 Successfully unlocked ${testName}!`, "success");
            } else {
              throw new Error("Payment signature verification failed");
            }
          } catch (err: any) {
            onToast(err.message || "Verification failed", "error");
          }
        },
        prefill: {
          name: currentUser?.displayName || "JEE Aspirant",
          email: currentUser?.email || "student@bluebottlecap.com",
        },
        theme: { color: "#1E293B" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error(err);
      onToast(err.message || "Payment initiation failed", "error");
    }
  };

  // Launch the Timed Assessment
  const handleStartTest = (testId: string, testName: string, originalQuestions: JEEQuestion[]) => {
    if (originalQuestions.length === 0) {
      onToast("No questions available for this topic.", "error");
      return;
    }
    
    // Shuffling order (Fisher-Yates)
    const arr = [...originalQuestions];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    setActiveTest({ id: testId, name: testName, questions: originalQuestions });
    setShuffledQuestions(arr);
    setTestSelectedAnswers({});
    setTestSubmitted(false);
    setTestTimerSeconds(600); // 10 minutes
    setTestTimerActive(true);
    setTestStarted(true);
  };

  const handleAutoSubmit = () => {
    setTestSubmitted(true);
    setTestTimerActive(false);
    onToast("⏰ Time's up! Your assessment was submitted automatically.", "info");
    recordPerformanceScore();
  };

  const handleSubmitTest = () => {
    if (confirm("Are you sure you want to submit your answers?")) {
      setTestSubmitted(true);
      setTestTimerActive(false);
      onToast("📈 Assessment submitted successfully!", "success");
      recordPerformanceScore();
    }
  };

  const recordPerformanceScore = () => {
    if (!activeTest) return;

    // Calculate score
    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;

    shuffledQuestions.forEach(q => {
      const ans = testSelectedAnswers[q.id];
      if (!ans) {
        unattemptedCount++;
      } else if (ans === q.answer) {
        correctCount++;
      } else {
        incorrectCount++;
      }
    });

    const score = (correctCount * 4) - (incorrectCount * 1);
    const maxScore = shuffledQuestions.length * 4;

    const newRecord = {
      testId: activeTest.id,
      testName: activeTest.name,
      score,
      maxScore,
      correctCount,
      incorrectCount,
      unattemptedCount,
      date: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
      }),
      accuracy: correctCount + incorrectCount > 0 
        ? Math.round((correctCount / (correctCount + incorrectCount)) * 100) 
        : 0
    };

    setPerformanceHistory(prev => [newRecord, ...prev]);

    if (currentUser) {
      addDoc(collection(db, "test_results"), {
        ...newRecord,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
      }).catch(err => console.error("Error saving test result to DB:", err));
    }
  };

  const handleExitTest = () => {
    setActiveTest(null);
    setTestStarted(false);
    setShuffledQuestions([]);
    setTestSelectedAnswers({});
    setTestSubmitted(false);
    setTestTimerActive(false);
  };

  // Helper selectors
  const activeSubjectData = jeePyqData.find(s => s.name === selectedSubject);
  const chaptersList = activeSubjectData ? activeSubjectData.chapters : [];
  const activeChapter = chaptersList.find(c => c.name === selectedChapterName) || chaptersList[0];
  const activeChapterQuestions = activeChapter ? activeChapter.questions : [];

  // Active timed test scoring calculations
  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;
  if (testSubmitted) {
    shuffledQuestions.forEach(q => {
      const studentAns = testSelectedAnswers[q.id];
      if (!studentAns) {
        unattemptedCount++;
      } else if (studentAns === q.answer) {
        correctCount++;
      } else {
        incorrectCount++;
      }
    });
  }
  const totalPossibleScore = shuffledQuestions.length * 4;
  const testScore = (correctCount * 4) - (incorrectCount * 1);
  const testAccuracy = correctCount + incorrectCount > 0 
    ? Math.round((correctCount / (correctCount + incorrectCount)) * 100) 
    : 0;

  // Auto-select first chapter when subject changes in study material
  useEffect(() => {
    const chapters = getChaptersBySubject(studySubject);
    if (chapters.length > 0) setStudyChapter(chapters[0].chapter);
  }, [studySubject]);

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-73px)] w-full bg-[#f8fafc] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.15),rgba(255,255,255,0))] dark:bg-slate-950/50 fade-in text-brand-navy dark:text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-brand-cobalt/5 blur-3xl" />
        <div className="absolute top-1/2 -left-20 w-72 h-72 rounded-full bg-teal-400/5 blur-3xl" />
      </div>
        
        {/* LEFT SIDEBAR NAVIGATION PANEL */}
        <aside className="w-full lg:w-64 bg-white dark:bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between shrink-0 print:hidden">
          <div className="space-y-6">

            {/* ← Back to Home button */}
            <button
              onClick={() => onGoHome()}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-brand-navy dark:text-white hover:bg-slate-100 dark:bg-slate-800 transition cursor-pointer select-none text-left"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>

            {/* Header branding */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white font-black text-sm">
                E
              </div>
              <div className="text-left">
                <span className="font-display text-sm font-bold tracking-tight text-brand-navy dark:text-white block leading-none">
                  BlueBottleCap
                </span>
                <span className="text-[9px] uppercase tracking-wider font-mono text-gray-400 font-bold leading-none mt-1 block">
                  Virtual Test Suite
                </span>
              </div>
            </div>

            {/* Profile widget */}
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-3.5 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center font-bold text-xs text-brand-cobalt">
                JA
              </div>
              <div className="text-left min-w-0">
                <strong className="block text-xs font-black truncate text-brand-navy dark:text-white">JEE Aspirant</strong>
                <div className="group relative inline-flex items-center gap-1 mt-0.5">
                  <span className="block text-[10px] font-bold text-brand-cobalt">Rank: #1240</span>
                  <div className="cursor-help w-3 h-3 rounded-full border border-brand-cobalt/50 text-brand-cobalt flex items-center justify-center text-[8px] font-bold bg-brand-cobalt/5 hover:bg-brand-cobalt hover:text-white transition-colors">i</div>
                  <div className="absolute left-0 top-full mt-2 w-48 p-2.5 bg-slate-800 text-slate-200 text-[10px] font-medium leading-relaxed rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                    <strong className="text-white block mb-1">Disclaimer</strong>
                    These ranks are not related to any real exam. They are simply a fun way to encourage consistency and put students to work!
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Links */}
            <nav className="space-y-1">
              {[
                { id: "dashboard", label: "Dashboard", icon: <Layers className="w-4 h-4" /> },
                { id: "mock-tests", label: "Mock Tests", icon: <Timer className="w-4 h-4" /> },
                { id: "study-material", label: "Study Material", icon: <BookOpen className="w-4 h-4" /> },
                { id: "performance", label: "Performance", icon: <Award className="w-4 h-4" /> },
              ].map((item) => {
                const isActive = activeSidebarTab === item.id && !activeTest;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      handleExitTest();
                      setActiveSidebarTab(item.id as any);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                      isActive 
                        ? "bg-slate-900 text-white shadow-3xs" 
                        : "text-slate-650 hover:bg-slate-100 dark:bg-slate-800 hover:text-brand-navy dark:text-white"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="pt-8 border-t border-slate-100 space-y-4">
            <button
              onClick={() => onUpgradeClick()}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-cobalt hover:bg-brand-navy text-white py-2.5 text-xs font-bold transition cursor-pointer select-none"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Configure Pricing</span>
            </button>
            <div className="flex justify-between text-[10px] text-slate-400 font-bold px-1 select-none">
              <span>Settings</span>
              <span>Logout</span>
            </div>
          </div>
        </aside>

        {/* Main Content Pane */}
        <main className="flex-1 p-6 md:p-8 bg-white/40 backdrop-blur-2xl border-l border-white/60 dark:bg-slate-900/80 min-h-[500px] relative z-10 shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.05)]">
          
          {/* TIMED TEST WORKSPACE (IF ACTIVE) */}
          {activeTest ? (
            <div className="space-y-6 fade-in">
              
              {/* Back navigation & timer bar */}
              <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-150 pb-4">
                <button
                  onClick={() => handleExitTest()}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-navy dark:text-white cursor-pointer select-none print:hidden"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Exit Assessment</span>
                </button>

                <h3 className="text-sm font-black font-display text-brand-navy dark:text-white max-w-xs truncate print:text-2xl print:max-w-full print:whitespace-normal">
                  {activeTest.name}
                </h3>

                <div className="flex items-center gap-2.5 print:hidden">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition"
                  >
                    <FileText className="w-4 h-4" />
                    <span className="hidden sm:inline">Export PDF</span>
                  </button>
                  <div className="flex items-center gap-1.5 rounded-xl bg-orange-50 border border-orange-200 px-3 py-2 text-xs font-bold text-orange-700 shadow-3xs font-mono">
                    <Timer className="w-4 h-4 text-orange-500 animate-pulse" />
                    <span>
                      {Math.floor(testTimerSeconds / 60)}:{(testTimerSeconds % 60).toString().padStart(2, "0")}
                    </span>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setTestTimerActive(prev => !prev)}
                    disabled={testSubmitted}
                    className={`rounded-xl border px-3 py-2 text-xs font-bold transition cursor-pointer select-none disabled:opacity-35 ${
                      testTimerActive 
                        ? "bg-slate-100 dark:bg-slate-800 border-slate-350 text-slate-700" 
                        : "bg-slate-900 hover:bg-slate-800 text-white border-transparent"
                    }`}
                  >
                    {testSubmitted ? "Completed" : (testTimerActive ? "Pause" : "Resume")}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSubmitTest()}
                    disabled={testSubmitted}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2 text-xs font-bold cursor-pointer transition select-none shadow-xs"
                  >
                    Submit OMR
                  </button>
                </div>
              </div>

              {/* Marks Calculator Score Card */}
              {testSubmitted && (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-white p-6 grid gap-6 md:grid-cols-12 items-center shadow-xs fade-in text-left">
                  {/* Score details */}
                  <div className="md:col-span-5 text-center border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 pb-6 md:pb-0 pr-0 md:pr-6 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">Mock Result Scoreboard</span>
                    <div className="text-5xl font-black text-brand-navy dark:text-white font-display flex items-baseline justify-center">
                      {testScore}
                      <span className="text-sm font-semibold text-slate-400 ml-1">/ {totalPossibleScore}</span>
                    </div>
                    <span className="rounded-full bg-slate-900 text-white px-3 py-1 text-[10px] font-bold inline-block leading-none uppercase tracking-wider font-mono">
                      {testScore >= 0 ? "Positive Marks" : "Negative Marks"}
                    </span>
                  </div>

                  {/* Statistics breakdown */}
                  <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block font-mono font-bold">Correct (+4)</span>
                      <div className="text-xl font-extrabold text-emerald-600 font-display">{correctCount}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block font-mono font-bold">Incorrect (-1)</span>
                      <div className="text-xl font-extrabold text-rose-600 font-display">{incorrectCount}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block font-mono font-bold">Unattempted</span>
                      <div className="text-xl font-extrabold text-slate-500 font-display">{unattemptedCount}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block font-mono font-bold">Accuracy</span>
                      <div className="text-xl font-extrabold text-brand-cobalt font-display">{testAccuracy}%</div>
                    </div>

                    {/* Rank Predictor note */}
                    <div className="col-span-2 sm:col-span-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 text-left text-xs leading-relaxed text-slate-650 font-sans shadow-3xs flex gap-2">
                      <span className="text-base leading-none select-none">🎯</span>
                      <div className="text-sm">
                        <strong className="font-extrabold text-slate-800 dark:text-slate-200">BlueBottleCap Percentile Predictor:</strong>
                        <p className="text-[10.5px] text-slate-500 mt-0.5">
                          {testScore >= totalPossibleScore * 0.6 
                            ? "Splendid attempt! This score equates to the 98.5th percentile in JEE Mains mocks. Target Advanced levels next."
                            : testScore > 0 
                              ? "Average performance. Review chemical equations and calculus derivatives to reduce negative mark errors."
                              : "Needs immediate concept clearance. Go back to Practice Mode, analyze solutions conceptually with the AI Teacher, and retry."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Shuffled Question bubble sheet */}
              <div className="space-y-5">
                {shuffledQuestions.map((q, idx) => {
                  const userAns = testSelectedAnswers[q.id];
                  const isCorrect = userAns === q.answer;
                  return (
                    <div key={q.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900 space-y-4 hover:border-slate-300 transition shadow-3xs text-left">
                      
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-slate-900 text-white px-2 py-0.5 text-[9px] font-bold font-mono">Q{idx + 1}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">{q.year}</span>
                        </div>
                        
                        {testSubmitted && (
                          <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase leading-none font-mono ${
                            !userAns 
                              ? "bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-800" 
                              : isCorrect 
                                ? "bg-emerald-50 border border-emerald-250 text-emerald-700" 
                                : "bg-rose-50 border border-rose-250 text-rose-700"
                          }`}>
                            {!userAns ? "Unattempted" : (isCorrect ? "Correct (+4)" : "Incorrect (-1)")}
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-normal">{q.question}</p>

                      {/* MCQs Option labels */}
                      <div className="grid gap-2 sm:grid-cols-2 pt-1">
                        {q.options.map((opt) => (
                          <div 
                            key={opt}
                            className={`p-3 rounded-xl border text-xs font-semibold text-left select-none ${
                              userAns === opt.charAt(0)
                                ? "bg-slate-50 dark:bg-slate-950 border-slate-900 text-brand-navy dark:text-white"
                                : "bg-white dark:bg-slate-900 border-slate-150 text-slate-650"
                            }`}
                          >
                            {opt}
                          </div>
                        ))}
                      </div>

                        {/* OMR Selector Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-150 print:hidden">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Select Answer:</span>
                        <div className="flex gap-4">
                          {["A", "B", "C", "D"].map((optLetter) => {
                            const isChosen = userAns === optLetter;
                            const isCorrectOpt = q.answer === optLetter;
                            
                            let btnStyle = "border-slate-350 text-slate-600 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:bg-slate-800";
                            if (testSubmitted) {
                              if (isCorrectOpt) {
                                btnStyle = "bg-emerald-600 text-white border-transparent shadow-3xs scale-105 font-black";
                              } else if (isChosen) {
                                btnStyle = "bg-rose-600 text-white border-transparent shadow-3xs scale-105 font-black";
                              } else {
                                btnStyle = "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-400 opacity-50";
                              }
                            } else if (isChosen) {
                              btnStyle = "bg-slate-900 text-white border-transparent shadow-3xs scale-105 font-bold";
                            }

                            return (
                              <button
                                key={optLetter}
                                type="button"
                                disabled={testSubmitted}
                                onClick={() => {
                                  setTestSelectedAnswers(prev => ({ ...prev, [q.id]: optLetter }));
                                }}
                                className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs transition cursor-pointer select-none ${btnStyle}`}
                              >
                                {optLetter}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Solution accordion on submit review */}
                      {testSubmitted && (
                        <div className="pt-2 print:block">
                          <details className="group print:open">
                            <summary className="text-[10px] font-bold text-brand-cobalt hover:underline cursor-pointer list-none flex items-center gap-1 select-none print:hidden">
                              <span>View derivation & tricks</span>
                              <ChevronRight className="w-3.5 h-3.5 group-open:rotate-90 transition-transform" />
                            </summary>
                            <div className="mt-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-150 p-4 space-y-3 font-mono text-[10.5px] leading-relaxed text-slate-700 fade-in print:bg-white print:border-none print:p-0">
                              <div className="flex items-center gap-1.5 font-bold text-emerald-800 text-[10px] leading-none mb-1 font-sans">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                Correct Option: {q.answer}
                              </div>
                              <p className="whitespace-pre-line border-t border-slate-200 dark:border-slate-800/50 pt-2 print:border-t-0">{q.solution}</p>
                              <div className="rounded-xl bg-rose-50 border border-rose-100 p-4 flex gap-3 text-rose-800 leading-normal font-sans">
                                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                                <div>
                                  <strong className="font-bold block">Typical Trap:</strong>
                                  {q.commonMistakes}
                                </div>
                              </div>
                            </div>
                          </details>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          ) : (
            
            // SIDEBAR TABS LAYOUT CONTROLLER
            <div className="space-y-8 text-left">
              
              {/* TABS: DASHBOARD SCREEN */}
              {activeSidebarTab === "dashboard" && (
                <div className="space-y-8 fade-in">
                  
                  {/* Dashboard Welcome Header block */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
                    <div>
                      <h2 className="font-display text-3xl font-black tracking-tight text-brand-navy dark:text-white">
                        Welcome back, JEE Aspirant.
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-slate-400 font-semibold mt-1">
                        Your current readiness index is above the 85th percentile.
                      </p>
                    </div>

                    <a
                      href="/downloads/jee-syllabus.pdf"
                      download="jee-syllabus.pdf"
                      className="rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:bg-slate-950 px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-3xs"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                      <span>Syllabus PDF</span>
                    </a>
                  </div>

                  {/* Core Metrics grid */}
                  <div className="grid gap-6 md:grid-cols-3">
                    
                    {/* Circle Circular readiness score card */}
                    <div className="bg-white/70 backdrop-blur-xl dark:bg-slate-900 border border-white dark:border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between items-center text-center space-y-4 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                      <div className="flex justify-between items-center w-full">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Readiness Score</span>
                        <div className="h-4 w-4 text-slate-400 font-black cursor-pointer text-xs" title="Calculated based on mock correctness and syllabus scope">ⓘ</div>
                      </div>

                      {/* SVG circular indicator */}
                      <div className="relative flex items-center justify-center">
                        <svg className="w-32 h-32" viewBox="0 0 100 100">
                          <circle className="text-slate-100" strokeWidth="9" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                          <circle 
                            className="text-teal-400 animate-[dash_1.5s_ease-out_forwards]" 
                            strokeWidth="9" 
                            strokeDasharray={251.2} 
                            strokeDashoffset={251.2 * (1 - 0.78)}
                            strokeLinecap="round" 
                            stroke="currentColor" 
                            fill="transparent" 
                            r="40" cx="50" cy="50" 
                            style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
                          />
                        </svg>
                        <div className="absolute text-3xl font-black text-slate-800 dark:text-slate-200 font-display">
                          <span className="animate-fade-in" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
                            78
                          </span><span className="text-sm font-bold text-slate-400">%</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center w-full pt-1.5 border-t border-slate-100 text-xs">
                        <span className="text-slate-500 font-semibold">Target: 90%</span>
                        <span className="rounded-full bg-teal-50 text-teal-700 border border-teal-150 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider font-mono">
                          On Track
                        </span>
                      </div>
                    </div>

                    {/* Subject Performance bar chart card */}
                    <div className="bg-white/70 backdrop-blur-xl dark:bg-slate-900 border border-white dark:border-slate-800/80 rounded-3xl p-6 md:col-span-2 flex flex-col justify-between shadow-xl shadow-slate-200/40 hover:-translate-y-1 transition-transform duration-300">
                      <div className="flex justify-between items-center w-full mb-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Subject Performance (Last 5 Mocks)</span>
                        <span className="text-xs font-bold text-slate-500 hover:underline cursor-pointer">Details</span>
                      </div>

                      {/* Bar Indicators */}
                      <div className="grid grid-cols-3 gap-6 items-end h-32 pt-2 pb-1 border-b border-slate-100">
                        {/* Physics */}
                        <div className="flex flex-col items-center gap-1.5 h-full justify-end">
                          <div 
                            className="w-8 sm:w-12 bg-indigo-100 rounded-t-lg relative group overflow-hidden transition-all duration-1000 ease-out h-[82%]" 
                          >
                            <div className="absolute inset-x-0 bottom-0 bg-indigo-500 h-1"></div>
                          </div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase font-mono">PHY</span>
                        </div>

                        {/* Chemistry */}
                        <div className="flex flex-col items-center gap-1.5 h-full justify-end">
                          <div 
                            className="w-8 sm:w-12 bg-teal-100 rounded-t-lg relative group overflow-hidden transition-all duration-1000 ease-out delay-100 h-[64%]" 
                          >
                            <div className="absolute inset-x-0 bottom-0 bg-teal-500 h-1"></div>
                          </div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase font-mono">CHEM</span>
                        </div>

                        {/* Mathematics */}
                        <div className="flex flex-col items-center gap-1.5 h-full justify-end">
                          <div 
                            className="w-8 sm:w-12 bg-amber-100 rounded-t-lg relative group overflow-hidden transition-all duration-1000 ease-out delay-200 h-[65%]" 
                          >
                            <div className="absolute inset-x-0 bottom-0 bg-amber-500 h-1"></div>
                          </div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase font-mono">MATH</span>
                        </div>
                      </div>

                      <div className="flex justify-between text-[11px] font-bold text-slate-800 dark:text-slate-200 pt-3">
                        <div>PHY: <span className="text-indigo-650">82%</span></div>
                        <div>CHEM: <span className="text-teal-650">88%</span></div>
                        <div>MATH: <span className="text-amber-650">65%</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom secondary details section */}
                  <div className="grid gap-6 md:grid-cols-2">
                    
                    {/* Upcoming schedule list card */}
                    <div className="bg-white/70 backdrop-blur-xl dark:bg-slate-900 border border-white dark:border-slate-800/80 rounded-3xl p-6 space-y-4 shadow-xl shadow-slate-200/40 hover:-translate-y-1 transition-transform duration-300">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Upcoming Schedule</h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-4 p-3 rounded-2xl border border-white/60 bg-white/50 backdrop-blur-md dark:bg-slate-950/50 hover:bg-white/80 transition-colors cursor-pointer">
                          <div className="bg-red-550/90 text-white rounded-xl p-2.5 text-center shrink-0 w-12 shadow-3xs leading-tight">
                            <span className="block text-[10px] font-mono font-bold uppercase">Oct</span>
                            <strong className="block text-base font-black leading-none">12</strong>
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <strong className="block text-xs text-brand-navy dark:text-white truncate">Full Syllabus Mock #4</strong>
                            <span className="text-[10px] text-slate-400 font-bold block">Duration: 180 min</span>
                          </div>
                          <button
                            onClick={() => onToast("Successfully enrolled for Oct 12 Mock assessment!", "success")}
                            className="rounded-lg bg-slate-900 text-white hover:bg-slate-800 px-3 py-1.5 text-[10px] font-bold cursor-pointer transition select-none"
                          >
                            Enroll
                          </button>
                        </div>

                        <div className="flex items-center gap-4 p-3 rounded-2xl border border-white/60 bg-white/50 backdrop-blur-md dark:bg-slate-950/50 hover:bg-white/80 transition-colors cursor-pointer">
                          <div className="bg-slate-900 text-white rounded-xl p-2.5 text-center shrink-0 w-12 shadow-3xs leading-tight">
                            <span className="block text-[10px] font-mono font-bold uppercase">Oct</span>
                            <strong className="block text-base font-black leading-none">15</strong>
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <strong className="block text-xs text-brand-navy dark:text-white truncate">Topic Test: Electromagnetism</strong>
                            <span className="text-[10px] text-slate-400 font-bold block">Duration: 60 min</span>
                          </div>
                          <span className="rounded-lg bg-teal-50 text-teal-700 border border-teal-150 px-2.5 py-1.5 text-[9px] font-bold uppercase font-mono">
                            Enrolled
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Formula cheatsheet promotional cards */}
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                      <div
                        onClick={() => setActiveSidebarTab("study-material")}
                        className="bg-white/70 backdrop-blur-xl dark:bg-slate-900 border border-white dark:border-slate-800/80 rounded-3xl p-5 hover:border-slate-350 transition cursor-pointer select-none text-left space-y-4 shadow-xl shadow-slate-200/40 flex flex-col justify-between hover:-translate-y-1 duration-300"
                      >
                        <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center font-display font-black text-sm">
                          Σ
                        </div>
                        <div>
                          <strong className="block text-xs font-bold text-brand-navy dark:text-white">Formula Sheets</strong>
                          <p className="text-[10px] text-slate-400 mt-1 leading-relaxed font-semibold">Quick reference for all Physics and Chemistry derivations.</p>
                        </div>
                      </div>

                      <div
                        onClick={() => setActiveSidebarTab("support")}
                        className="bg-white/70 backdrop-blur-xl dark:bg-slate-900 border border-white dark:border-slate-800/80 rounded-3xl p-5 hover:border-slate-350 transition cursor-pointer select-none text-left space-y-4 shadow-xl shadow-slate-200/40 flex flex-col justify-between hover:-translate-y-1 duration-300"
                      >
                        <div className="h-8 w-8 rounded-lg bg-teal-50 text-teal-650 border border-teal-100 flex items-center justify-center font-black text-sm">
                          ✉
                        </div>
                        <div>
                          <strong className="block text-xs font-bold text-brand-navy dark:text-white">Doubt Solving</strong>
                          <p className="text-[10px] text-slate-400 mt-1 leading-relaxed font-semibold">Connect with experts and clear complex math traps.</p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* TABS: MOCK TESTS PANEL */}
              {activeSidebarTab === "mock-tests" && (
                <div className="space-y-8 fade-in">
                  
                  {/* Subject mode toggle */}
                  <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-100 pb-5">
                    <div>
                      <h2 className="font-display text-2.5xl font-black tracking-tight text-brand-navy dark:text-white">
                        Select Mock Assessment
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-slate-400 font-semibold mt-1">
                        Attempt realistic mock tests to analyze percentile rankings.
                      </p>
                    </div>

                    {/* Mode tabs */}
                    <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex gap-1 border border-slate-200 dark:border-slate-800">
                      <button
                        onClick={() => setMockTypeTab("repeated")}
                        className={`rounded-lg px-3.5 py-1.5 text-[10.5px] font-bold transition select-none cursor-pointer ${
                          mockTypeTab === "repeated" 
                            ? "bg-white dark:bg-slate-900 text-slate-900 shadow-3xs" 
                            : "text-slate-500 hover:text-slate-800 dark:text-slate-200"
                        }`}
                      >
                        Repeated Questions Mode
                      </button>
                      <button
                        onClick={() => setMockTypeTab("chapter")}
                        className={`rounded-lg px-3.5 py-1.5 text-[10.5px] font-bold transition select-none cursor-pointer ${
                          mockTypeTab === "chapter" 
                            ? "bg-white dark:bg-slate-900 text-slate-900 shadow-3xs" 
                            : "text-slate-500 hover:text-slate-800 dark:text-slate-200"
                        }`}
                      >
                        10-Yr Chapter Mocks
                      </button>
                    </div>
                  </div>

                  {/* RENDER MODE: MOST REPEATED MOCKS */}
                  {mockTypeTab === "repeated" && (
                    <div className="grid gap-5 md:grid-cols-2">
                      {repeatedTestsData.map((test) => {
                        const testId = test.id;
                        const isUnlocked = purchasedTests.includes(testId);
                        
                        return (
                          <div 
                            key={testId} 
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 hover:border-slate-350 transition rounded-3xl p-5.5 space-y-5 shadow-3xs text-left flex flex-col justify-between"
                          >
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider font-mono ${
                                  test.type === "Advanced" 
                                    ? "bg-purple-50 text-purple-700 border border-purple-250" 
                                    : "bg-blue-50 text-blue-700 border border-blue-250"
                                }`}>
                                  JEE {test.type} Focus
                                </span>
                                
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                                  ₹120 Single Unlock
                                </span>
                              </div>

                              <strong className="block text-base font-black tracking-tight text-brand-navy dark:text-white">
                                {test.name}
                              </strong>
                              <p className="text-[10.5px] text-slate-550 leading-relaxed font-semibold">
                                Curated set of high-frequency repeated questions compiled directly from the past decade of JEE examinations.
                              </p>
                            </div>

                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-4">
                              <div className="flex gap-4 text-[10px] font-bold text-slate-400 font-mono">
                                <span>Q: {test.questions.length} MCQs</span>
                                <span>10 Mins</span>
                              </div>

                              {isUnlocked ? (
                                <button
                                  onClick={() => handleStartTest(testId, test.name, test.questions)}
                                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 text-xs transition cursor-pointer select-none flex items-center gap-1 leading-none shadow-3xs"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Attempt Test</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUnlockTest(testId, test.name)}
                                  className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold px-4.5 py-2 text-xs transition cursor-pointer select-none flex items-center gap-1.5 leading-none shadow-3xs animate-pulse"
                                >
                                  <Lock className="w-3.5 h-3.5" />
                                  <span>Unlock (₹120)</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* RENDER MODE: 10-YR CHAPTER MOCKS */}
                  {mockTypeTab === "chapter" && (
                    <div className="max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6.5 space-y-6 shadow-3xs text-left">
                      {/* Topic filters */}
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Select Subject</label>
                          <select
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value as any)}
                            className="w-full rounded-xl border border-slate-250 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold focus:border-slate-900 focus:outline-hidden text-brand-navy dark:text-white cursor-pointer"
                          >
                            <option value="Physics">Physics</option>
                            <option value="Chemistry">Chemistry</option>
                            <option value="Mathematics">Mathematics</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Select Chapter</label>
                          <select
                            value={selectedChapterName}
                            onChange={(e) => setSelectedChapterName(e.target.value)}
                            className="w-full rounded-xl border border-slate-250 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold focus:border-slate-900 focus:outline-hidden text-brand-navy dark:text-white cursor-pointer"
                          >
                            {chaptersList.map((chap) => (
                              <option key={chap.name} value={chap.name}>{chap.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Targeted chapter assessment card */}
                      {activeChapter ? (() => {
                        const testId = `chapter_${selectedSubject.toLowerCase()}_${selectedChapterName.replace(/\s+/g, "_").toLowerCase()}`;
                        const isUnlocked = purchasedTests.includes(testId);
                        
                        return (
                          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50 dark:bg-slate-950/50 space-y-4">
                            <div className="flex justify-between items-start">
                              <div className="space-y-0.5">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono">{selectedSubject} Assessment</span>
                                <strong className="block text-sm font-black text-brand-navy dark:text-white leading-normal">{selectedChapterName}</strong>
                              </div>
                              <span className="rounded-full bg-slate-200 text-slate-700 px-2.5 py-0.5 text-[9px] font-bold font-mono">₹120</span>
                            </div>

                            <p className="text-[10px] text-slate-500 leading-normal">
                              Solve timed questions compiled from past 10 years papers. The OMR scores dynamically using +4/-1 scheme with Socratic error diagnostics.
                            </p>

                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-4">
                              <div className="flex gap-4 text-[10px] font-bold text-slate-400 font-mono">
                                <span>Q: {activeChapterQuestions.length} MCQs</span>
                                <span>10 Mins</span>
                              </div>

                              {isUnlocked ? (
                                <button
                                  onClick={() => handleStartTest(testId, `${selectedChapterName} Timed Mock`, activeChapterQuestions)}
                                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 text-xs transition cursor-pointer select-none flex items-center gap-1 leading-none shadow-3xs"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Attempt Mock</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUnlockTest(testId, `${selectedChapterName} Mock`)}
                                  className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold px-4.5 py-2 text-xs transition cursor-pointer select-none flex items-center gap-1.5 leading-none shadow-3xs"
                                >
                                  <Lock className="w-3.5 h-3.5" />
                                  <span>Unlock for ₹120</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })() : (
                        <div className="text-center p-8 text-xs text-slate-400 font-bold border border-dashed rounded-2xl bg-slate-50 dark:bg-slate-950">
                          Select a chapter from the options above.
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}

              {/* TABS: STUDY MATERIAL — Chapter Browser */}
              {activeSidebarTab === "study-material" && (() => {
                const chaptersForSubject = getChaptersBySubject(studySubject);
                const currentChapterData = getChapterByName(studySubject, studyChapter) ?? chaptersForSubject[0];

                // ₹281 Razorpay unlock handler
                const handlePayForStudyMaterial = () => {
                  if (!(window as any).Razorpay) {
                    onToast("Payment gateway not loaded. Please refresh.", "error");
                    return;
                  }
                  const options = {
                    key: "rzp_test_qFQoLyR9fSqFGt",
                    amount: 28100, // ₹281 in paise
                    currency: "INR",
                    name: "BlueBottleCap",
                    description: "Full Chapter-wise Study Material — JEE Mains & Advanced",
                    image: "/logo.png",
                    handler: () => {
                      onUnlockStudyMaterial();
                      onToast("🎉 Study material unlocked! Enjoy all chapters.", "success");
                    },
                    prefill: { name: "JEE Aspirant" },
                    theme: { color: "#1e3a5f" },
                  };
                  const rzp = new (window as any).Razorpay(options);
                  rzp.open();
                };

                return (
                  <div className="space-y-0 fade-in">
                    {/* Header row */}
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h2 className="font-display text-xl font-black tracking-tight text-brand-navy dark:text-white">
                          Chapter-wise Study Material
                        </h2>
                        <p className="text-xs text-gray-400 font-semibold mt-1">
                          Concepts · Formulas · Examples · Questions (NCERT + Mains + Advanced)
                        </p>
                      </div>
                      {studyMaterialUnlocked ? (
                        <span className="text-[10px] bg-green-100 text-green-700 font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3" /> Unlocked
                        </span>
                      ) : (
                        <button
                          onClick={handlePayForStudyMaterial}
                          className="flex items-center gap-1.5 bg-brand-navy text-white text-[10px] font-black px-3 py-1.5 rounded-xl hover:opacity-90 transition cursor-pointer"
                        >
                          <Zap className="w-3 h-3" /> Unlock ₹281
                        </button>
                      )}
                    </div>

                    {/* Subject tabs */}
                    <div className="flex gap-1 mb-5">
                      {(["Physics", "Chemistry", "Mathematics"] as const).map(subj => (
                        <button
                          key={subj}
                          onClick={() => setStudySubject(subj)}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition cursor-pointer ${
                            studySubject === subj
                              ? "bg-brand-navy text-white"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200"
                          }`}
                        >
                          {subj}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-5">
                      {/* Chapter list sidebar */}
                      <div className="w-44 shrink-0 space-y-1 max-h-[520px] overflow-y-auto pr-1">
                        {chaptersForSubject.map((ch) => (
                          <button
                            key={ch.chapter}
                            onClick={() => {
                              if (!studyMaterialUnlocked && ch.chapter !== chaptersForSubject[0]?.chapter) {
                                onToast("Unlock the full material to access this chapter.", "info");
                                return;
                              }
                              setStudyChapter(ch.chapter);
                              setExpandedConcept(null);
                              setRevealedAnswers({});
                            }}
                            className={`w-full text-left px-2.5 py-2 rounded-xl text-[11px] font-bold transition flex items-center justify-between gap-1 ${
                              studyChapter === ch.chapter
                                ? "bg-brand-navy text-white"
                                : "text-slate-600 hover:bg-slate-100 dark:bg-slate-800"
                            } ${!studyMaterialUnlocked && ch.chapter !== chaptersForSubject[0]?.chapter ? "opacity-50" : ""}`}
                          >
                            <span className="truncate leading-snug">{ch.chapter}</span>
                            {!studyMaterialUnlocked && ch.chapter !== chaptersForSubject[0]?.chapter && (
                              <Lock className="w-3 h-3 shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>

                      {/* Chapter detail view */}
                      <div className="flex-1 min-w-0 max-h-[520px] overflow-y-auto space-y-5 pr-1">
                        {currentChapterData ? (
                          <>
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-bold text-sm text-brand-navy dark:text-white">{currentChapterData.chapter}</h3>
                                <span className="text-[10px] text-slate-400 font-bold">Class {currentChapterData.class} · {currentChapterData.subject}</span>
                              </div>
                            </div>

                            {/* Key Concepts Accordion */}
                            <div>
                              <p className="text-[11px] font-black text-brand-navy dark:text-white uppercase tracking-wider mb-2">Key Concepts</p>
                              <div className="space-y-2">
                                {currentChapterData.keyConcepts.map((concept, idx) => {
                                  const isBlurred = !studyMaterialUnlocked && idx >= 2;
                                  const isOpen = expandedConcept === idx;
                                  return (
                                    <div
                                      key={idx}
                                      className={`rounded-2xl border border-slate-100 bg-white dark:bg-slate-900 overflow-hidden ${isBlurred ? "blur-[3px] pointer-events-none select-none" : ""}`}
                                    >
                                      <button
                                        onClick={() => setExpandedConcept(isOpen ? null : idx)}
                                        className="w-full flex items-center justify-between px-3.5 py-2.5 text-left cursor-pointer hover:bg-slate-50 dark:bg-slate-950 transition"
                                      >
                                        <span className="text-xs font-bold text-brand-navy dark:text-white">{concept.title}</span>
                                        {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                                      </button>
                                      {isOpen && (
                                        <div className="px-3.5 pb-3.5 space-y-2 border-t border-slate-50">
                                          <p className="text-[11px] text-slate-600 leading-relaxed mt-2">{concept.explanation}</p>
                                          {concept.formula && (
                                            <div className="bg-slate-900 text-green-400 rounded-xl px-3 py-2 text-[11px] font-mono">
                                              {concept.formula}
                                            </div>
                                          )}
                                          {concept.example && (
                                            <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                                              <p className="text-[10px] font-black text-amber-700 uppercase tracking-wide mb-0.5">Example</p>
                                              <p className="text-[11px] text-slate-600">{concept.example}</p>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Blur overlay for locked content */}
                            {!studyMaterialUnlocked && (
                              <div className="relative">
                                <div className="blur-[3px] pointer-events-none select-none space-y-5">
                                  {/* Important Points preview */}
                                  <div>
                                    <p className="text-[11px] font-black text-brand-navy dark:text-white uppercase tracking-wider mb-2">Important Points</p>
                                    <div className="space-y-1.5">
                                      {currentChapterData.importantPoints.map((pt, i) => (
                                        <div key={i} className="flex items-start gap-2 bg-white dark:bg-slate-900 rounded-xl px-3 py-2 border border-slate-100">
                                          <span className="text-brand-cobalt font-black text-xs shrink-0 mt-0.5">{i+1}.</span>
                                          <p className="text-[11px] text-slate-600">{pt}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  {/* Questions preview */}
                                  <div>
                                    <p className="text-[11px] font-black text-brand-navy dark:text-white uppercase tracking-wider mb-2">Practice Questions</p>
                                    {currentChapterData.questions.slice(0,2).map((q, i) => (
                                      <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 p-3 mb-2">
                                        <p className="text-[11px] font-bold text-brand-navy dark:text-white">{q.text}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                {/* Lock overlay */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-slate-900/60 rounded-2xl">
                                  <Lock className="w-8 h-8 text-slate-300 mb-3" />
                                  <p className="text-xs font-black text-brand-navy dark:text-white mb-1">Premium Content</p>
                                  <p className="text-[10px] text-slate-400 font-semibold mb-4 text-center px-4">
                                    Unlock all chapters, important points &amp; practice questions for ₹281 (one-time)
                                  </p>
                                  <button
                                    onClick={handlePayForStudyMaterial}
                                    className="flex items-center gap-2 bg-brand-navy text-white text-xs font-black px-5 py-2.5 rounded-2xl hover:opacity-90 transition cursor-pointer shadow-md"
                                  >
                                    <Zap className="w-3.5 h-3.5" />
                                    Unlock Full Material — ₹281
                                  </button>
                                  <p className="text-[9px] text-slate-400 mt-2 font-semibold">All subjects · All chapters · NCERT + Mains + Advanced</p>
                                </div>
                              </div>
                            )}

                            {/* UNLOCKED: Important Points */}
                            {studyMaterialUnlocked && (
                              <>
                                <div>
                                  <p className="text-[11px] font-black text-brand-navy dark:text-white uppercase tracking-wider mb-2">Important Points</p>
                                  <div className="space-y-1.5">
                                    {currentChapterData.importantPoints.map((pt, i) => (
                                      <div key={i} className="flex items-start gap-2 bg-white dark:bg-slate-900 rounded-xl px-3 py-2 border border-slate-100">
                                        <span className="text-brand-cobalt font-black text-xs shrink-0 mt-0.5">{i+1}.</span>
                                        <p className="text-[11px] text-slate-600">{pt}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Practice Questions */}
                                <div>
                                  <p className="text-[11px] font-black text-brand-navy dark:text-white uppercase tracking-wider mb-2">Practice Questions</p>
                                  <div className="space-y-3">
                                    {currentChapterData.questions.map((q, qi) => {
                                      const qKey = `${studySubject}-${studyChapter}-${qi}`;
                                      const isRevealed = revealedAnswers[qKey];
                                      const tagColor = q.type === "NCERT"
                                        ? "bg-blue-100 text-blue-700"
                                        : q.type === "JEE Mains"
                                        ? "bg-amber-100 text-amber-700"
                                        : "bg-purple-100 text-purple-700";
                                      return (
                                        <div key={qi} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 p-4 space-y-3">
                                          <div className="flex items-start justify-between gap-2">
                                            <p className="text-[12px] font-bold text-brand-navy dark:text-white leading-snug">{q.text}</p>
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full shrink-0 ${tagColor}`}>{q.type}</span>
                                          </div>
                                          <div className="grid grid-cols-2 gap-1.5">
                                            {q.options.map((opt, oi) => (
                                              <div
                                                key={oi}
                                                className={`text-[11px] px-2.5 py-1.5 rounded-xl border font-semibold ${
                                                  isRevealed && opt.startsWith(q.answer + ".")
                                                    ? "bg-green-100 border-green-300 text-green-800 font-bold"
                                                    : "bg-slate-50 dark:bg-slate-950 border-slate-100 text-slate-600"
                                                }`}
                                              >
                                                {opt}
                                              </div>
                                            ))}
                                          </div>
                                          {isRevealed && (
                                            <div className="bg-slate-900 text-green-400 rounded-xl px-3 py-2.5 text-[11px]">
                                              <span className="text-slate-400 font-bold">Solution: </span>{q.solution}
                                            </div>
                                          )}
                                          <button
                                            onClick={() => setRevealedAnswers(prev => ({ ...prev, [qKey]: !prev[qKey] }))}
                                            className="text-[10px] font-black text-brand-cobalt hover:text-brand-navy dark:text-white transition cursor-pointer"
                                          >
                                            {isRevealed ? "Hide Answer" : "Reveal Answer & Solution"}
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </>
                            )}
                          </>
                        ) : (
                          <div className="text-center py-10 text-xs text-slate-400 font-bold">
                            Select a chapter from the list.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Always-visible PDF downloads */}
                    <div className="mt-6 pt-5 border-t border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Quick Download Cheatsheets</p>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { name: "Physics Derivations", url: "/downloads/physics-derivations.pdf" },
                          { name: "Chemistry Reactions", url: "/downloads/chemistry-reactions.pdf" },
                          { name: "Math Integration", url: "/downloads/math-integration.pdf" },
                        ].map((sheet, i) => (
                          <a
                            key={i}
                            href={sheet.url}
                            download={sheet.url.split("/").pop()}
                            className="flex items-center gap-2 text-[10px] font-bold text-slate-500 hover:text-brand-navy dark:text-white hover:bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2 transition border border-slate-100 bg-white dark:bg-slate-900"
                          >
                            <FileText className="w-3 h-3 shrink-0" />
                            {sheet.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* TABS: PERFORMANCE SUMMARY */}
              {activeSidebarTab === "performance" && (
                <div className="space-y-8 fade-in">
                  <div>
                    <h2 className="font-display text-2.5xl font-black tracking-tight text-brand-navy dark:text-white">
                      Assessment Log
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-slate-400 font-semibold mt-1">
                      Check your scores, correctness percentages, and timeline performance metrics.
                    </p>
                  </div>

                  {performanceHistory.length > 0 ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl shadow-3xs overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 text-slate-400 uppercase tracking-widest font-mono text-[9px] font-bold">
                              <th className="p-4 font-bold">Assessment</th>
                              <th className="p-4 font-bold">Attempted Date</th>
                              <th className="p-4 font-bold text-center">Score</th>
                              <th className="p-4 font-bold text-center">Accuracy</th>
                              <th className="p-4 font-bold text-center">Correct/Incorrect</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium">
                            {performanceHistory.map((item, index) => (
                              <tr key={index} className="hover:bg-slate-50 dark:bg-slate-950/50">
                                <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{item.testName}</td>
                                <td className="p-4 text-slate-400 font-mono text-[10px] font-bold">{item.date}</td>
                                <td className="p-4 text-center font-display font-bold text-slate-700">
                                  {item.score} <span className="text-[10px] text-slate-400 font-semibold">/ {item.maxScore}</span>
                                </td>
                                <td className="p-4 text-center">
                                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold font-mono ${
                                    item.accuracy >= 75 
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                      : item.accuracy >= 50 
                                      ? "bg-amber-50 text-amber-700 border border-amber-100"
                                      : "bg-rose-50 text-rose-700 border border-rose-100"
                                  }`}>
                                    {item.accuracy}%
                                  </span>
                                </td>
                                <td className="p-4 text-center text-slate-500 font-mono text-[10px] font-bold">
                                  <span className="text-emerald-600">{item.correctCount}C</span> / <span className="text-rose-600">{item.incorrectCount}I</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-12 border border-dashed rounded-3xl bg-slate-50 dark:bg-slate-950 text-slate-400 font-bold text-xs space-y-2 select-none">
                      <Award className="w-8 h-8 text-slate-300 mx-auto" />
                      <p>No assessment attempts logged yet. Head to the Mock Tests tab to take your first test.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TABS: SUPPORT CHANNEL */}
              {activeSidebarTab === "support" && (
                <div className="space-y-8 fade-in">
                  <div>
                    <h2 className="font-display text-2.5xl font-black tracking-tight text-brand-navy dark:text-white">
                      Student Help Desk
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-slate-400 font-semibold mt-1">
                      Have questions regarding payments, content mistakes, or system issues? Drop us a query.
                    </p>
                  </div>

                  <div className="max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6.5 shadow-3xs text-left space-y-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Query Category</label>
                      <select className="w-full rounded-xl border border-slate-250 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold focus:border-slate-900 focus:outline-hidden text-brand-navy dark:text-white cursor-pointer">
                        <option>Payment Dispute / Razorpay Refund</option>
                        <option>MCQ Answer Correction / Question Error</option>
                        <option>AI Teacher Feedback Suggestions</option>
                        <option>Feature Requests</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Detail Explanation</label>
                      <textarea
                        rows={4}
                        placeholder="Explain your problem or feedback..."
                        className="w-full rounded-xl border border-slate-250 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold focus:border-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900 text-brand-navy dark:text-white shadow-3xs"
                      />
                    </div>

                    <button
                      onClick={() => {
                        alert("Your ticket was successfully submitted. Support team will reply within 24 hours.");
                        setActiveSidebarTab("dashboard");
                      }}
                      className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 text-xs transition cursor-pointer select-none"
                    >
                      Submit Ticket
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

        </main>
    </div>
  );
};
