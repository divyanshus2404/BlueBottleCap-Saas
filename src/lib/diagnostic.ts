// Lightweight JEE-flavored diagnostic. The bank is intentionally small —
// the goal isn't to be a question engine, it's to (a) get a "wow you have
// my number" moment in 2 minutes and (b) seed a topic-strength map so the
// dashboard can show personalized next-actions and a readiness number.
//
// All persistence is localStorage-only for now. When auth + Firestore
// readiness is bigger, this gets promoted server-side.

export type Subject = "Physics" | "Chemistry" | "Maths";
export type Topic =
  | "Mechanics"
  | "Modern Physics"
  | "Organic Chemistry"
  | "Physical Chemistry"
  | "Calculus"
  | "Algebra";

export interface DiagnosticQuestion {
  id: string;
  subject: Subject;
  topic: Topic;
  prompt: string;
  options: string[];
  /** index into options */
  correct: number;
  /** Plain-English explanation shown after answer */
  explanation: string;
}

export const QUESTION_BANK: DiagnosticQuestion[] = [
  {
    id: "phy-mech-1",
    subject: "Physics",
    topic: "Mechanics",
    prompt:
      "A block of mass 2 kg slides down a frictionless incline of 30°. What is its acceleration?",
    options: ["2.5 m/s²", "4.9 m/s²", "9.8 m/s²", "5.0 m/s²"],
    correct: 1,
    explanation: "a = g·sin(30°) = 9.8 × 0.5 = 4.9 m/s². Frictionless plane, single component along the incline.",
  },
  {
    id: "phy-modern-1",
    subject: "Physics",
    topic: "Modern Physics",
    prompt:
      "The energy of a photon with wavelength 600 nm is closest to:",
    options: ["1.0 eV", "2.07 eV", "3.1 eV", "4.5 eV"],
    correct: 1,
    explanation: "E (eV) ≈ 1240 / λ(nm). 1240 / 600 ≈ 2.07 eV.",
  },
  {
    id: "chem-org-1",
    subject: "Chemistry",
    topic: "Organic Chemistry",
    prompt:
      "Which of the following is the strongest nucleophile in a polar protic solvent?",
    options: ["F⁻", "Cl⁻", "Br⁻", "I⁻"],
    correct: 3,
    explanation: "In polar protic solvents, nucleophilicity increases down a group: I⁻ is the largest, least solvated, and most nucleophilic.",
  },
  {
    id: "chem-phys-1",
    subject: "Chemistry",
    topic: "Physical Chemistry",
    prompt:
      "ΔG° for a reaction is +5.7 kJ/mol at 298 K. Roughly what is Keq?",
    options: ["~10", "~1", "~0.1", "~0.01"],
    correct: 2,
    explanation: "Keq = exp(−ΔG°/RT) = exp(−5700 / (8.314 × 298)) ≈ exp(−2.3) ≈ 0.10.",
  },
  {
    id: "maths-calc-1",
    subject: "Maths",
    topic: "Calculus",
    prompt: "Evaluate: ∫₀^π sin(x) dx",
    options: ["0", "1", "2", "π"],
    correct: 2,
    explanation: "∫₀^π sin(x) dx = [−cos(x)]₀^π = −cos(π) + cos(0) = 1 + 1 = 2.",
  },
];

export interface TopicScore {
  topic: Topic;
  subject: Subject;
  correct: number;
  total: number;
}

export interface DiagnosticResult {
  /** 0–100 */
  readiness: number;
  topicScores: TopicScore[];
  /** Weakest 1–2 topics, sorted by accuracy ascending */
  weakTopics: Topic[];
  /** Strongest 1–2 topics */
  strongTopics: Topic[];
  takenAt: string;
}

export function scoreDiagnostic(
  answers: Record<string, number>,
): DiagnosticResult {
  const byTopic = new Map<Topic, TopicScore>();
  let totalCorrect = 0;

  for (const q of QUESTION_BANK) {
    const ans = answers[q.id];
    const correct = ans === q.correct;
    if (correct) totalCorrect++;

    const entry = byTopic.get(q.topic) ?? {
      topic: q.topic,
      subject: q.subject,
      correct: 0,
      total: 0,
    };
    entry.total += 1;
    if (correct) entry.correct += 1;
    byTopic.set(q.topic, entry);
  }

  const topicScores = [...byTopic.values()];
  // Weakest first by accuracy, then by topic name for stability.
  const sorted = [...topicScores].sort((a, b) => {
    const accA = a.correct / a.total;
    const accB = b.correct / b.total;
    if (accA !== accB) return accA - accB;
    return a.topic.localeCompare(b.topic);
  });

  const weakTopics = sorted.filter((t) => t.correct / t.total < 0.6).map((t) => t.topic);
  const strongTopics = sorted
    .filter((t) => t.correct / t.total >= 0.6)
    .reverse()
    .map((t) => t.topic);

  // Readiness is the diagnostic score itself, on a 0–100 scale.
  // Capped at 85 so even a perfect diagnostic doesn't say "100% ready" on day 1.
  const rawPct = (totalCorrect / QUESTION_BANK.length) * 100;
  const readiness = Math.min(85, Math.round(rawPct));

  return {
    readiness,
    topicScores,
    // Empty when every topic is ≥ 0.6 accuracy — the UI handles the
    // "all-strong" case rather than inventing a weak topic to drill.
    weakTopics,
    strongTopics,
    takenAt: new Date().toISOString(),
  };
}

export const RESULT_KEY = "bluebottlecap_diagnostic_result";

export function loadDiagnosticResult(): DiagnosticResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(RESULT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DiagnosticResult;
  } catch {
    return null;
  }
}

export function saveDiagnosticResult(r: DiagnosticResult): void {
  if (typeof window === "undefined") return;
  // Mirror loadDiagnosticResult's defensiveness — Safari private mode and
  // quota-exceeded both throw on setItem and would crash the result transition.
  try {
    localStorage.setItem(RESULT_KEY, JSON.stringify(r));
  } catch {
    /* best-effort: storage unavailable or full */
  }
}
