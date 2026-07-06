export interface SRCard {
  id: string;
  question: string;
  answer: string;
  category: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: string; // ISO date
  lastReview?: string;
}

// SM-2 quality grades
export type Grade = 0 | 1 | 2 | 3 | 4 | 5;

export function initSRCard(card: { id: string; question: string; answer: string; category: string }): SRCard {
  return {
    ...card,
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReview: new Date().toISOString().split("T")[0],
  };
}

export function reviewCard(card: SRCard, grade: Grade): SRCard {
  const ef = Math.max(1.3, card.easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)));
  const today = new Date().toISOString().split("T")[0];

  if (grade < 3) {
    return { ...card, easeFactor: ef, interval: 1, repetitions: 0, nextReview: addDays(today, 1), lastReview: today };
  }

  let interval: number;
  if (card.repetitions === 0) {
    interval = 1;
  } else if (card.repetitions === 1) {
    interval = 6;
  } else {
    interval = Math.round(card.interval * ef);
  }

  return {
    ...card,
    easeFactor: ef,
    interval,
    repetitions: card.repetitions + 1,
    nextReview: addDays(today, interval),
    lastReview: today,
  };
}

export function getDueCards(cards: SRCard[]): SRCard[] {
  const today = new Date().toISOString().split("T")[0];
  return cards.filter((c) => c.nextReview <= today);
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}
