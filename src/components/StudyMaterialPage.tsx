"use client";

import React, { useState, useMemo } from "react";
import { ActiveView } from "../types";
import { studyMaterial, ChapterMaterial, KeyConcept, StudyQuestion } from "../data/studyMaterial";
import { extraChapters, getAllChapters } from "../data/studyMaterialExtra";
import {
  ArrowLeft,
  Search,
  BookOpen,
  Star,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  ExternalLink,
  Zap,
  Lightbulb,
  FlaskConical,
  BarChart2,
  FileText,
} from "lucide-react";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";

interface StudyMaterialPageProps {
  onNavigate: (view: ActiveView) => void;
  allChapters?: ChapterMaterial[];
}

// Renders text with **term** as yellow highlight markers
const HL: React.FC<{ children: string }> = ({ children }) => {
  const parts = children.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <mark
              key={i}
              className="bg-yellow-200 rounded-sm px-0.5 font-semibold not-italic text-gray-900 text-white"
              style={{
                background:
                  "linear-gradient(to bottom, transparent 20%, #FEF08A 20%, #FEF08A 82%, transparent 82%)",
              }}
            >
              {part.slice(2, -2)}
            </mark>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
};

const subjectIcon: Record<string, React.ReactNode> = {
  Physics: <Zap className="w-3.5 h-3.5" />,
  Chemistry: <FlaskConical className="w-3.5 h-3.5" />,
  Mathematics: <BarChart2 className="w-3.5 h-3.5" />,
};

const subjectColor: Record<string, string> = {
  Physics: "from-blue-600 to-indigo-700",
  Chemistry: "from-emerald-600 to-teal-700",
  Mathematics: "from-orange-500 to-amber-600",
};

const subjectBg: Record<string, string> = {
  Physics: "bg-blue-50 border-blue-100 text-blue-700",
  Chemistry: "bg-emerald-50 border-emerald-100 text-emerald-700",
  Mathematics: "bg-orange-50 border-orange-100 text-orange-700",
};

const questionTypeBadge: Record<string, string> = {
  NCERT: "bg-surface-glass bg-surface-solid text-slate-600",
  "JEE Mains": "bg-amber-100 text-amber-700",
  "JEE Advanced": "bg-purple-100 text-purple-700",
};

const externalResources: Record<string, { title: string; url: string; source: string }[]> = {
  Physics: [
    { title: "NCERT Physics Class 11 & 12", url: "https://ncert.nic.in/textbook.php", source: "ncert.nic.in" },
    { title: "HC Verma Solutions", url: "https://www.vedantu.com/ncert-solutions/hc-verma-solutions", source: "vedantu.com" },
    { title: "Physics Wallah Free Lectures", url: "https://www.pw.live/study-material", source: "pw.live" },
  ],
  Chemistry: [
    { title: "NCERT Chemistry Class 11 & 12", url: "https://ncert.nic.in/textbook.php", source: "ncert.nic.in" },
    { title: "JD Lee Inorganic Chemistry Notes", url: "https://www.vedantu.com/jee/jd-lee-inorganic-chemistry", source: "vedantu.com" },
    { title: "MathonGo Chemistry Notes", url: "https://www.mathongo.com/study-material", source: "mathongo.com" },
  ],
  Mathematics: [
    { title: "NCERT Mathematics Class 11 & 12", url: "https://ncert.nic.in/textbook.php", source: "ncert.nic.in" },
    { title: "MathonGo JEE Maths Notes", url: "https://www.mathongo.com/study-material/jee-main", source: "mathongo.com" },
    { title: "SelfStudys Maths Notes", url: "https://www.selfstudys.com/notes/jee/maths", source: "selfstudys.com" },
  ],
};

const ConceptCard: React.FC<{
  concept: KeyConcept;
  idx: number;
  isOpen: boolean;
  onToggle: () => void;
}> = ({ concept, idx, isOpen, onToggle }) => (
  <div className="rounded-2xl border border-border-subtle dark:border-slate-800 bg-white bg-bg-primary overflow-hidden shadow-sm">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-surface-solid bg-bg-primary transition cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-navy text-white text-[11px] font-black flex items-center justify-center">
          {idx + 1}
        </span>
        <span className="text-sm font-bold text-white text-white">{concept.title}</span>
      </div>
      {isOpen ? (
        <ChevronUp className="w-4 h-4 text-text-secondary shrink-0" />
      ) : (
        <ChevronDown className="w-4 h-4 text-text-secondary shrink-0" />
      )}
    </button>

    {isOpen && (
      <div className="px-4 pb-4 space-y-3 border-t border-border-subtle pt-3">
        {/* Explanation with highlights */}
        <p className="text-sm text-slate-700 leading-relaxed">
          <HL>{concept.explanation}</HL>
        </p>

        {/* Formula box — blackboard style */}
        {concept.formula && (
          <div className="rounded-xl bg-gray-950 px-4 py-3 border border-gray-800">
            <p className="text-[10px] font-black text-gray-500 text-text-secondary uppercase tracking-widest mb-1.5">
              Formula
            </p>
            <p className="font-mono text-green-400 text-sm leading-relaxed whitespace-pre-wrap">
              {concept.formula}
            </p>
          </div>
        )}

        {/* Example box — amber notebook style */}
        {concept.example && (
          <div className="rounded-xl bg-amber-50 border-l-4 border-amber-400 px-4 py-3">
            <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1.5">
              ✏️ Worked Example
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">{concept.example}</p>
          </div>
        )}
      </div>
    )}
  </div>
);

const QuestionCard: React.FC<{
  q: StudyQuestion;
  qKey: string;
  isRevealed: boolean;
  onReveal: () => void;
}> = ({ q, qKey, isRevealed, onReveal }) => {
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);

  return (
    <div className="rounded-2xl border border-border-subtle dark:border-slate-800 bg-white bg-bg-primary shadow-sm overflow-hidden">
      <div className="px-4 pt-4 pb-3 space-y-3">
        <div className="flex items-start gap-2.5">
          <span
            className={`text-[9px] font-black px-2 py-0.5 rounded-full shrink-0 mt-0.5 border ${
              questionTypeBadge[q.type] || "bg-surface-glass bg-surface-solid text-text-muted"
            }`}
          >
            {q.type}
          </span>
          <p className="text-[13px] font-semibold text-white text-white leading-snug">{q.text}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {q.options.map((opt, oi) => {
            const optLetter = opt.split(".")[0]?.trim();
            const isCorrect = isRevealed && optLetter === q.answer;
            const isSelected = selectedOpt === optLetter;
            const isWrongSelected = isRevealed && isSelected && !isCorrect;

            return (
              <button
                key={oi}
                onClick={() => {
                  if (!isRevealed) {
                    setSelectedOpt(optLetter);
                    onReveal();
                  }
                }}
                disabled={isRevealed}
                className={`text-xs px-3 py-2.5 rounded-xl border font-medium transition text-left cursor-pointer ${
                  isCorrect
                    ? "bg-green-100 border-green-300 text-green-800 font-bold"
                    : isWrongSelected
                    ? "bg-red-100 border-red-300 text-red-800 font-bold"
                    : isSelected
                    ? "bg-brand-navy border-brand-navy text-white shadow-md ring-2 ring-brand-cobalt/20 scale-[1.02]"
                    : "bg-surface-solid bg-bg-primary border-border-subtle dark:border-slate-800 text-slate-700 text-text-primary hover:border-slate-300 hover:bg-surface-glass dark:hover:bg-bg-primary"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {isRevealed && (
          <div className="rounded-xl bg-bg-primary px-4 py-3 animate-fade-in mt-3">
            <p className="text-[10px] font-black text-text-muted uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />
              Solution
            </p>
            <p className="text-xs text-green-400 leading-relaxed">{q.solution}</p>
          </div>
        )}
      </div>

      <div className="border-t border-border-subtle dark:border-slate-800 px-4 py-3 bg-surface-solid bg-bg-primary">
        <button
          onClick={() => {
            if (isRevealed && selectedOpt) {
              setSelectedOpt(null);
            }
            onReveal();
          }}
          className="flex items-center gap-1.5 text-[11px] font-bold text-accent hover:text-white text-white transition cursor-pointer"
        >
          {isRevealed ? (
            <>
              <EyeOff className="w-3.5 h-3.5" /> Hide answer & reset
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" /> Reveal answer & solution
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export const StudyMaterialPage: React.FC<StudyMaterialPageProps> = ({
  onNavigate,
  allChapters,
}) => {
  const [chapters, setChapters] = useState<ChapterMaterial[]>(() =>
    getAllChapters(allChapters && allChapters.length > 0 ? allChapters : studyMaterial)
  );

  React.useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "chapters"), (snapshot) => {
      const fetched: ChapterMaterial[] = [];
      snapshot.forEach(doc => {
        fetched.push(doc.data() as ChapterMaterial);
      });
      if (fetched.length > 0) {
        // Since order isn't guaranteed, we could sort if needed, but the original logic didn't assume order
        setChapters(fetched);
      }
    });
    return () => unsubscribe();
  }, []);

  const [selectedSubject, setSelectedSubject] = useState<"Physics" | "Chemistry" | "Mathematics">("Physics");
  const [selectedChapter, setSelectedChapter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedConcepts, setExpandedConcepts] = useState<Record<number, boolean>>({ 0: true });
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});
  const [questionFilter, setQuestionFilter] = useState<"All" | "NCERT" | "JEE Mains" | "JEE Advanced">("All");
  const [activeTab, setActiveTab] = useState<"notes" | "questions" | "resources">("notes");

  const filteredChapters = useMemo(() => {
    const bySubject = chapters.filter((c) => c.subject === selectedSubject);
    if (!searchQuery.trim()) return bySubject;
    const q = searchQuery.toLowerCase();
    return chapters.filter(
      (c) =>
        c.chapter.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q) ||
        c.keyConcepts.some((k) => k.title.toLowerCase().includes(q))
    );
  }, [chapters, selectedSubject, searchQuery]);

  const currentChapter = useMemo(
    () => chapters.find((c) => c.chapter === selectedChapter),
    [chapters, selectedChapter]
  );

  const toggleConcept = (idx: number) => {
    setExpandedConcepts((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleAnswer = (key: string) => {
    setRevealedAnswers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChapterSelect = (chapter: string) => {
    setSelectedChapter(chapter);
    setExpandedConcepts({ 0: true });
    setRevealedAnswers({});
    setActiveTab("notes");
    setQuestionFilter("All");
  };

  const classByChapters = useMemo(() => {
    const c11 = filteredChapters.filter((c) => c.class === 11);
    const c12 = filteredChapters.filter((c) => c.class === 12);
    return { c11, c12 };
  }, [filteredChapters]);

  const filteredQuestions = useMemo(() => {
    if (!currentChapter) return [];
    if (questionFilter === "All") return currentChapter.questions;
    return currentChapter.questions.filter((q) => q.type === questionFilter);
  }, [currentChapter, questionFilter]);

  return (
    <div className="min-h-screen bg-[#FDFCF9]">
      {/* ── TOP HEADER ── */}
      <div className="sticky top-0 z-30 bg-white bg-bg-primary/90 backdrop-blur border-b border-border-subtle shadow-sm">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
          <div className="flex items-center gap-4 h-14">
            {/* Back */}
            <button
              onClick={() => onNavigate("dashboard")}
              className="flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-white text-white transition cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </button>

            {/* Title */}
            <div className="flex items-center gap-2 shrink-0">
              <BookOpen className="w-5 h-5 text-accent" />
              <span className="font-display text-base font-black text-white text-white tracking-tight">
                Study Material
              </span>
              <span className="hidden sm:inline text-[10px] bg-green-100 text-green-700 font-black px-2 py-0.5 rounded-full border border-green-200">
                FREE
              </span>
            </div>

            {/* Subject tabs */}
            <div className="flex gap-1 ml-2">
              {(["Physics", "Chemistry", "Mathematics"] as const).map((subj) => (
                <button
                  key={subj}
                  onClick={() => {
                    setSelectedSubject(subj);
                    setSelectedChapter("");
                    setSearchQuery("");
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black transition cursor-pointer ${
                    selectedSubject === subj && !searchQuery
                      ? `bg-gradient-to-r ${subjectColor[subj]} text-white shadow-sm`
                      : "text-text-muted hover:bg-surface-glass bg-surface-solid"
                  }`}
                >
                  {subjectIcon[subj]}
                  <span className="hidden sm:inline">{subj}</span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="ml-auto relative w-48 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chapters or topics..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-border-subtle dark:border-slate-800 bg-surface-solid bg-bg-primary focus:outline-none focus:border-accent focus:bg-white bg-bg-primary transition"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── DISCLAIMER BANNER ── */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center">
        <p className="text-[10px] text-amber-800 font-semibold">
          📚 All study material on this page is original content created by BlueBottleCap educators. External resource links direct you to their respective official websites. We do not host or claim ownership of any third-party content.
        </p>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-6 flex gap-5">
        {/* ── LEFT: CHAPTER LIST ── */}
        <aside className="w-56 xl:w-64 shrink-0 sticky top-[88px] h-[calc(100vh-100px)] overflow-y-auto">
          <div className="bg-white bg-bg-primary rounded-2xl border border-border-subtle dark:border-slate-800 shadow-sm overflow-hidden">
            {/* Chapter count */}
            <div className="px-4 py-3 border-b border-border-subtle bg-surface-solid bg-bg-primary">
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                {searchQuery ? `${filteredChapters.length} results` : selectedSubject} — {filteredChapters.length} chapters
              </p>
            </div>

            <div className="py-2">
              {/* Class 11 */}
              {classByChapters.c11.length > 0 && !searchQuery && (
                <div className="px-3 pt-2 pb-1">
                  <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest">
                    Class 11
                  </p>
                </div>
              )}
              {(searchQuery ? filteredChapters : classByChapters.c11).map((ch) => (
                <button
                  key={ch.chapter}
                  onClick={() => handleChapterSelect(ch.chapter)}
                  className={`w-full text-left px-3 py-2.5 text-[12px] font-semibold transition flex items-center gap-2 ${
                    selectedChapter === ch.chapter
                      ? "bg-brand-navy text-white"
                      : "text-slate-600 hover:bg-surface-solid bg-bg-primary hover:text-white text-white"
                  }`}
                >
                  {searchQuery && (
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border shrink-0 ${subjectBg[ch.subject]}`}>
                      {ch.subject.slice(0, 3)}
                    </span>
                  )}
                  <span className="truncate leading-snug">{ch.chapter}</span>
                </button>
              ))}

              {/* Class 12 */}
              {classByChapters.c12.length > 0 && !searchQuery && (
                <>
                  <div className="px-3 pt-4 pb-1">
                    <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest">
                      Class 12
                    </p>
                  </div>
                  {classByChapters.c12.map((ch) => (
                    <button
                      key={ch.chapter}
                      onClick={() => handleChapterSelect(ch.chapter)}
                      className={`w-full text-left px-3 py-2.5 text-[12px] font-semibold transition flex items-center gap-2 ${
                        selectedChapter === ch.chapter
                          ? "bg-brand-navy text-white"
                          : "text-slate-600 hover:bg-surface-solid bg-bg-primary hover:text-white text-white"
                      }`}
                    >
                      <span className="truncate leading-snug">{ch.chapter}</span>
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        </aside>

        {/* ── RIGHT: NOTES CONTENT ── */}
        <main className="flex-1 min-w-0 space-y-5">
          {currentChapter ? (
            <>
              {/* Chapter header */}
              <div className={`rounded-3xl bg-gradient-to-br ${subjectColor[currentChapter.subject]} p-6 text-white shadow-lg`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold bg-white bg-bg-primary/20 rounded-lg px-2.5 py-1">
                        Class {currentChapter.class}
                      </span>
                      <span className="text-xs font-bold bg-white bg-bg-primary/20 rounded-lg px-2.5 py-1 flex items-center gap-1">
                        {subjectIcon[currentChapter.subject]}
                        {currentChapter.subject}
                      </span>
                    </div>
                    <h1 className="text-2xl font-black tracking-tight">{currentChapter.chapter}</h1>
                    <div className="flex items-center gap-4 mt-3 text-sm font-semibold text-white/80">
                      <span>📖 {currentChapter.keyConcepts.length} concepts</span>
                      <span>📝 {currentChapter.questions.length} questions</span>
                      {(currentChapter as any).topperTips && (
                        <span>⭐ {(currentChapter as any).topperTips.length} topper tips</span>
                      )}
                    </div>
                  </div>
                  <FileText className="w-12 h-12 opacity-20 shrink-0" />
                </div>
              </div>

              {/* Tab bar */}
              <div className="flex gap-1 bg-white bg-bg-primary rounded-2xl border border-border-subtle dark:border-slate-800 p-1 shadow-sm">
                {(["notes", "questions", "resources"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition cursor-pointer ${
                      activeTab === tab
                        ? "bg-brand-navy text-white shadow-sm"
                        : "text-text-muted hover:bg-surface-solid bg-bg-primary"
                    }`}
                  >
                    {tab === "notes" && "📖 "}
                    {tab === "questions" && "📝 "}
                    {tab === "resources" && "🔗 "}
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* ── NOTES TAB ── */}
              {activeTab === "notes" && (
                <div className="space-y-6">
                  {/* Key Concepts */}
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-5 rounded-full bg-accent" />
                      <h2 className="text-sm font-black text-white text-white uppercase tracking-wide">
                        Key Concepts
                      </h2>
                    </div>
                    <div className="space-y-2">
                      {currentChapter.keyConcepts.map((concept, idx) => (
                        <ConceptCard
                          key={idx}
                          concept={concept}
                          idx={idx}
                          isOpen={!!expandedConcepts[idx]}
                          onToggle={() => toggleConcept(idx)}
                        />
                      ))}
                    </div>
                  </section>

                  {/* Important Points — highlighted marker style */}
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-5 rounded-full bg-yellow-400" />
                      <h2 className="text-sm font-black text-white text-white uppercase tracking-wide">
                        Must-Know Points
                      </h2>
                    </div>
                    <div className="bg-white bg-bg-primary rounded-2xl border border-border-subtle dark:border-slate-800 shadow-sm divide-y divide-slate-100">
                      {currentChapter.importantPoints.map((pt, i) => (
                        <div key={i} className="flex items-start gap-3 px-4 py-3.5">
                          <span
                            className="flex-shrink-0 w-5 h-5 rounded bg-yellow-300 text-yellow-900 text-[10px] font-black flex items-center justify-center mt-0.5"
                          >
                            {i + 1}
                          </span>
                          <p className="text-sm text-slate-700 leading-relaxed">
                            <HL>{pt}</HL>
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Topper Tips */}
                  {(currentChapter as any).topperTips?.length > 0 && (
                    <section>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1 h-5 rounded-full bg-blue-500" />
                        <h2 className="text-sm font-black text-white text-white uppercase tracking-wide">
                          ⭐ Topper Tips
                        </h2>
                      </div>
                      <div className="space-y-2">
                        {(currentChapter as any).topperTips.map((tip: string, i: number) => (
                          <div
                            key={i}
                            className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3.5"
                          >
                            <Star className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-blue-900 leading-relaxed font-medium">
                              <HL>{tip}</HL>
                            </p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Common Mistakes */}
                  {(currentChapter as any).commonMistakes?.length > 0 && (
                    <section>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1 h-5 rounded-full bg-red-400" />
                        <h2 className="text-sm font-black text-white text-white uppercase tracking-wide">
                          ⚠️ Common Mistakes
                        </h2>
                      </div>
                      <div className="space-y-2">
                        {(currentChapter as any).commonMistakes.map((mistake: string, i: number) => (
                          <div
                            key={i}
                            className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl px-4 py-3.5"
                          >
                            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-900 leading-relaxed font-medium">
                              <HL>{mistake}</HL>
                            </p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}

              {/* ── QUESTIONS TAB ── */}
              {activeTab === "questions" && (
                <div className="space-y-4">
                  {/* Filter bar */}
                  <div className="flex gap-1 flex-wrap">
                    {(["All", "NCERT", "JEE Mains", "JEE Advanced"] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setQuestionFilter(f)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition cursor-pointer border ${
                          questionFilter === f
                            ? "bg-brand-navy text-white border-brand-navy"
                            : "bg-white bg-bg-primary text-text-muted border-border-subtle dark:border-slate-800 hover:border-slate-300"
                        }`}
                      >
                        {f} {f !== "All" && `(${currentChapter.questions.filter((q) => q.type === f).length})`}
                      </button>
                    ))}
                  </div>

                  {filteredQuestions.map((q, qi) => {
                    const qKey = `${currentChapter.chapter}-${qi}`;
                    return (
                      <QuestionCard
                        key={qKey}
                        q={q}
                        qKey={qKey}
                        isRevealed={!!revealedAnswers[qKey]}
                        onReveal={() => toggleAnswer(qKey)}
                      />
                    );
                  })}

                  {filteredQuestions.length === 0 && (
                    <div className="text-center py-10 text-sm text-text-secondary font-semibold">
                      No questions of this type for this chapter.
                    </div>
                  )}
                </div>
              )}

              {/* ── RESOURCES TAB ── */}
              {activeTab === "resources" && (
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-xs text-amber-800 font-semibold">
                    🔗 These are links to official external websites. BlueBottleCap does not host or own any of this content. All rights belong to respective owners.
                  </div>

                  {/* Subject-level resources */}
                  <div className="space-y-3">
                    <p className="text-xs font-black text-text-muted uppercase tracking-widest">
                      Recommended Free Resources for {currentChapter.subject}
                    </p>
                    {(externalResources[currentChapter.subject] || []).map((res, i) => (
                      <a
                        key={i}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between bg-white bg-bg-primary border border-border-subtle dark:border-slate-800 rounded-2xl px-4 py-3.5 hover:border-accent hover:shadow-sm transition group"
                      >
                        <div>
                          <p className="text-sm font-bold text-white text-white group-hover:text-accent transition">
                            {res.title}
                          </p>
                          <p className="text-[11px] text-text-secondary font-medium mt-0.5">
                            {res.source}
                          </p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-text-primary group-hover:text-accent transition shrink-0" />
                      </a>
                    ))}
                  </div>

                  {/* NCERT official */}
                  <div className="space-y-3">
                    <p className="text-xs font-black text-text-muted uppercase tracking-widest mt-4">
                      Official Textbooks
                    </p>
                    <a
                      href="https://ncert.nic.in/textbook.php"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between bg-green-50 border border-green-200 rounded-2xl px-4 py-3.5 hover:border-green-400 hover:shadow-sm transition group"
                    >
                      <div>
                        <p className="text-sm font-bold text-green-800">
                          📗 NCERT Official Textbook — {currentChapter.subject} Class {currentChapter.class}
                        </p>
                        <p className="text-[11px] text-green-600 font-medium mt-0.5">
                          ncert.nic.in — Free, Official Government Portal
                        </p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-green-400 group-hover:text-green-600 transition shrink-0" />
                    </a>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-8 animate-fade-in pb-10">
              <div className={`rounded-3xl bg-gradient-to-br ${subjectColor[selectedSubject]} p-8 sm:p-10 text-white shadow-lg relative overflow-hidden`}>
                <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
                  {subjectIcon[selectedSubject]}
                </div>
                <div className="relative z-10 flex items-center gap-5">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-md shrink-0 border border-white/30 shadow-inner">
                    {React.cloneElement(subjectIcon[selectedSubject] as React.ReactElement<any>, { className: "w-8 h-8 sm:w-10 sm:h-10 text-white" })}
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{selectedSubject} Overview</h1>
                    <p className="text-white/80 font-medium mt-1.5 sm:text-lg flex items-center gap-2">
                      <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-sm font-bold">{filteredChapters.length} Chapters</span>
                      Master concepts, practice questions, and ace exams.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                {[11, 12].map((cls) => {
                  const classChaps = filteredChapters.filter(c => c.class === cls);
                  if (classChaps.length === 0) return null;
                  
                  return (
                    <div key={cls} className="space-y-4">
                      <h2 className="flex items-center gap-3">
                        <span className="text-xs font-black text-text-secondary text-text-muted uppercase tracking-widest whitespace-nowrap">Class {cls} Chapters</span>
                        <div className="h-px bg-slate-200 bg-surface-solid w-full rounded-full"></div>
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {classChaps.map(ch => (
                          <button
                            key={ch.chapter}
                            onClick={() => handleChapterSelect(ch.chapter)}
                            className="text-left bg-white bg-bg-primary border border-border-subtle dark:border-slate-800 rounded-2xl p-5 hover:border-accent hover:shadow-md transition group cursor-pointer flex flex-col h-full"
                          >
                            <h3 className="font-bold text-white text-white group-hover:text-accent transition line-clamp-2 min-h-[3rem] leading-snug">
                              {ch.chapter}
                            </h3>
                            <div className="mt-auto pt-4 flex items-center gap-3 text-[11px] font-black text-text-secondary text-text-muted uppercase tracking-wide">
                              <span className="flex items-center gap-1.5 bg-surface-solid bg-bg-primary px-2 py-1 rounded-lg">
                                <BookOpen className="w-3.5 h-3.5 text-accent" /> {ch.keyConcepts?.length || 0}
                              </span>
                              <span className="flex items-center gap-1.5 bg-surface-solid bg-bg-primary px-2 py-1 rounded-lg">
                                <FileText className="w-3.5 h-3.5 text-accent" /> {ch.questions?.length || 0}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── FOOTER DISCLAIMER ── */}
      <footer className="border-t border-border-subtle dark:border-slate-800 bg-white bg-bg-primary mt-10">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-center sm:text-left">
              <p className="text-xs text-text-muted font-semibold">
                📚 <strong>Disclaimer:</strong> All original notes and study material on this page are created and owned by BlueBottleCap. External links direct you to their respective official platforms (NCERT, Vedantu, Physics Wallah, MathonGo, etc.). BlueBottleCap does not host, reproduce, or claim ownership of any third-party educational content. All third-party trademarks belong to their respective owners.
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <span className="text-[10px] bg-green-100 text-green-700 font-black px-2.5 py-1 rounded-full border border-green-200">
                FREE ACCESS
              </span>
              <span className="text-[10px] bg-blue-100 text-blue-700 font-black px-2.5 py-1 rounded-full border border-blue-200">
                ORIGINAL CONTENT
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StudyMaterialPage;
