export type ActiveView = 'landing' | 'onboarding' | 'dashboard' | 'pdf-editor' | 'tools' | 'pricing' | 'signup' | 'create-profile' | 'virtual-test' | 'study-material-page' | 'seniors-opinion' | 'flashcards' | 'about';

export interface UsageMetric {
  current: number;
  max: number;
  unit: string;
}

export interface UserStats {
  hoursSaved: number;
  streakDays: number;
  creditsLeft: number;
  activePlan: 'Free' | 'Basic' | 'Pro' | 'Elite';
  purchasedTests?: string[];
  studyMaterialUnlocked?: boolean;
}

export interface UsageStats {
  aiQueries: UsageMetric;
  pdfEdits: UsageMetric;
  storage: UsageMetric;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  category: string;
  topic?: string;
  nextReview?: string; // ISO date string
  interval?: number; // days until next review
  easeFactor?: number; // difficulty multiplier
}

export interface ToolItem {
  id: string;
  name: string;
  description: string;
  category: 'ai' | 'pdf' | 'image';
  badge?: string;
  metricLabel?: string;
  creditCost?: number;
}

export interface PaperHighlight {
  id: string;
  text: string;
  note?: string;
  color: string;
  pageIndex: number;
}

export interface PaperPage {
  pageIndex: number;
  title: string;
  paragraphs: string[];
}

export interface MockPaper {
  id?: string;
  title: string;
  authors: string;
  doi: string;
  abstract: string;
  pages: PaperPage[];
  isImage?: boolean;
  imageSrc?: string;
  content?: string;
}

export interface DailyActivity {
  date: string; // YYYY-MM-DD
  queriesUsed: number;
  cardsCreated: number;
  hoursSaved: number;
}

export interface StudyAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}
