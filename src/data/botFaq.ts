/**
 * Canned answers for the help bot.
 *
 * Deliberately NOT an LLM. Every answer here is written by hand, so it cannot
 * hallucinate a feature that does not exist or invent a price — the two ways a
 * support bot actually damages trust. It matches on keywords and, when nothing
 * scores high enough, says so and points at a human instead of guessing.
 *
 * Adding an entry: list the words a student would actually type, not the words
 * we use internally ("sheet" and "cheat sheet", not "formula generation").
 */
export interface FaqEntry {
  id: string;
  /** Lowercase tokens that should match this entry. */
  keywords: string[];
  question: string;
  answer: string;
  /** Optional in-app destination shown as a button under the answer. */
  link?: { href: string; label: string };
}

export const FAQ: FaqEntry[] = [
  {
    id: "what-is",
    keywords: ["what", "bluebottlecap", "about", "who", "purpose", "do"],
    question: "What is BlueBottleCap?",
    answer:
      "A study workspace for JEE and NEET. You get mock tests that copy the real NTA exam screen, a question bank, flashcards, past papers, a syllabus planner, and tools for your own notes and PDFs. Most of it works without signing in.",
    link: { href: "/planner", label: "Open the planner" },
  },
  {
    id: "free",
    keywords: ["free", "cost", "price", "pricing", "pay", "money", "charge", "subscription", "plan"],
    question: "Is it free?",
    answer:
      "Yes, there is a free tier that does not expire and needs no card. Mock tests, the question bank, flashcards, past papers and the planner are all usable now. Pro is ₹199/month and lifts the daily limits on the AI tools.",
    link: { href: "/pricing", label: "See pricing" },
  },
  {
    id: "mock",
    keywords: ["mock", "test", "exam", "paper", "nta", "marking", "practice", "attempt"],
    question: "How do the mock tests work?",
    answer:
      "They copy the real NTA exam interface — the colour-coded question palette, section switching, and +4 / −1 marking. When you submit you get your score plus a topic-by-topic accuracy breakdown, so you can see which chapter is actually weak rather than just the subject.",
    link: { href: "/mock-test", label: "Take a mock test" },
  },
  {
    id: "mock-real",
    keywords: ["real", "official", "actual", "rank", "percentile", "predict", "nta", "genuine"],
    question: "Are the mock scores official?",
    answer:
      "No. These are practice papers made for self-study. They are not real JEE or NEET papers, are not connected to NTA in any way, and your score here does not predict or affect your actual result, rank or percentile.",
  },
  {
    id: "planner",
    keywords: ["planner", "plan", "syllabus", "chapter", "schedule", "cover", "checklist", "roadmap"],
    question: "How does the planner work?",
    answer:
      "Pick JEE or NEET and you get the full syllabus, chapter by chapter. Each chapter has three ticks — Learn, Practice, Revise. Ticking a later one fills in the earlier ones automatically. It shows your overall percentage and suggests which high-weightage chapters to do next.",
    link: { href: "/planner", label: "Open the planner" },
  },
  {
    id: "tracking",
    keywords: ["track", "tracked", "tracking", "progress", "data", "privacy", "store", "stored", "save", "saved", "secure", "private", "localstorage"],
    question: "How is my progress tracked?",
    answer:
      "Everything is saved in your own browser's local storage. Nothing is uploaded, there is no account yet, and nobody else can read it — including us. The trade-off: clearing your browser data or switching device loses it, so use 'Save a backup' in the planner to keep a copy.",
    link: { href: "/planner", label: "See what is stored" },
  },
  {
    id: "signin",
    keywords: ["sign", "login", "log", "account", "register", "signup", "email", "google"],
    question: "Do I need an account?",
    answer:
      "Not right now. Mock tests, the question bank, flashcards, past papers, the planner and the file tools all work signed out, saving to this device. Accounts are being rebuilt, which is why sign-in is switched off at the moment.",
  },
  {
    id: "flashcards",
    keywords: ["flashcard", "card", "revise", "revision", "memory", "spaced", "repetition", "recall"],
    question: "How do the flashcards work?",
    answer:
      "There are 80 cards across Physics, Chemistry, Maths and Biology. They use spaced repetition — grade a card by how well you knew it and the harder ones come back sooner. Filter by subject using the chips at the top.",
    link: { href: "/flashcards", label: "Open flashcards" },
  },
  {
    id: "question-bank",
    keywords: ["question", "bank", "practice", "topic", "difficulty", "mcq", "problems", "solve"],
    question: "What is in the question bank?",
    answer:
      "290 questions across Physics, Chemistry, Maths and Biology, each with a worked explanation. You can search, filter by subject and difficulty, and browse by topic.",
    link: { href: "/question-bank", label: "Browse questions" },
  },
  {
    id: "past-papers",
    keywords: ["past", "previous", "year", "pyq", "old", "papers"],
    question: "Do you have previous year papers?",
    answer:
      "Yes — 64 questions across 5 papers covering JEE Mains 2023–2025 and NEET 2024–2025, each with a full solution rather than just the answer letter.",
    link: { href: "/previous-year-papers", label: "See past papers" },
  },
  {
    id: "tools",
    keywords: ["tool", "convert", "pdf", "image", "merge", "split", "compress", "file", "png", "jpg"],
    question: "What do the file tools do?",
    answer:
      "Eight converters — PNG to JPG, JPG to PNG, WebP, image compress and resize, PDF merge, PDF split, and PDF to images. They all run inside your browser, so your files are never uploaded anywhere.",
    link: { href: "/tools", label: "Open file tools" },
  },
  {
    id: "ai-down",
    keywords: ["ai", "scan", "copilot", "formula", "sheet", "chat", "not working", "error", "broken", "fail"],
    question: "Why are the AI features not working?",
    answer:
      "The AI features — PDF Copilot, Formula Sheets, Scan Notes and AI tool search — need an API key that is not configured on this build yet. Everything else works without it. The mock tests, question bank, flashcards, planner and file tools need no key at all.",
  },
  {
    id: "timer",
    keywords: ["timer", "pomodoro", "focus", "streak", "study time", "session"],
    question: "How does the study timer work?",
    answer:
      "Pick 25/5, 50/10 or 90/15 minutes and it runs focus and break cycles. Completed focus sessions count towards your study minutes and daily streak on the progress page.",
    link: { href: "/study-timer", label: "Start a session" },
  },
  {
    id: "diagnostic",
    keywords: ["diagnostic", "where", "stand", "start", "begin", "weak", "assessment", "level"],
    question: "Where should I start?",
    answer:
      "Take the 2-minute diagnostic. It is 5 questions across Physics, Chemistry and Maths, needs no login, and tells you which topics are weakest so the planner and your study plan can point you at the right chapters.",
    link: { href: "/diagnostic", label: "Take the diagnostic" },
  },
  {
    id: "progress",
    keywords: ["score", "scores", "report", "stats", "analytics", "improve", "performance", "history", "results", "accuracy"],
    question: "Where do I see my progress?",
    answer:
      "The progress page shows your average score, subject-wise accuracy, your strongest and weakest topics, and every mock you have taken. It fills in automatically as you use the app.",
    link: { href: "/my-progress", label: "See my progress" },
  },
  {
    id: "offline",
    keywords: ["offline", "install", "app", "mobile", "phone", "pwa", "download"],
    question: "Can I use it on my phone?",
    answer:
      "Yes. The site works on mobile, and you can install it as an app from the install page so it opens like any other app on your home screen.",
    link: { href: "/install", label: "Install the app" },
  },
];

/** Shown as starter chips so people do not face an empty box. */
export const SUGGESTED = ["What is BlueBottleCap?", "Is it free?", "How is my progress tracked?", "Where should I start?"];
