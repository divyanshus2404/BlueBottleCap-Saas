import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { aiRateLimiter, getClientIp } from '@/src/lib/rateLimit';
import { requireAuth } from '@/src/lib/authGuard';
import { enforceUserQuota } from '@/src/lib/userQuota';

function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured.');
  return new GoogleGenAI({ apiKey });
}

interface FlashcardRequest {
  topic: string;
  subject?: string;
  count?: number;
}

interface GeneratedFlashcard {
  question: string;
  answer: string;
  category: string;
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!aiRateLimiter.check(ip)) {
    return NextResponse.json({ error: 'Too many requests. Please wait before trying again.' }, { status: 429 });
  }

  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  const quota = await enforceUserQuota(auth.userId, "generate_flashcards");
  if (!quota.ok) return quota.error!;

  try {
    const body: FlashcardRequest = await req.json();
    const { topic, subject = 'General', count = 5 } = body;

    if (!topic || typeof topic !== 'string' || topic.trim().length < 2) {
      return NextResponse.json({ error: 'A valid topic is required.' }, { status: 400 });
    }

    const cardCount = Math.min(Math.max(Number(count) || 5, 1), 20); // clamp 1–20

    const ai = getAIClient();

    const prompt = `Generate exactly ${cardCount} high-quality spaced-repetition flashcards for the topic: "${topic.trim()}" (Subject: ${subject}).

Return ONLY a JSON array with no markdown wrapper. Each object in the array must have:
- "question": a clear, concise question (not too long)
- "answer": a direct, accurate answer (2-4 sentences max)
- "category": the subject/category (use "${subject}")

Focus on key concepts, definitions, formulas, and commonly tested exam points.
Do NOT include numbering in the question text.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json', temperature: 0.4 },
    });

    const raw = response.text ?? '[]';
    let cards: GeneratedFlashcard[];
    try {
      const parsed = JSON.parse(raw);
      cards = Array.isArray(parsed) ? parsed : [];
    } catch {
      return NextResponse.json({ error: 'AI returned invalid data. Please try again.' }, { status: 500 });
    }

    // Add IDs so the client can use them immediately
    const cardsWithIds = cards.map((card, i) => ({
      id: `ai-${Date.now()}-${i}`,
      question: card.question ?? '',
      answer: card.answer ?? '',
      category: card.category ?? subject,
    }));

    return NextResponse.json({ flashcards: cardsWithIds });
  } catch (err: unknown) {
    console.error('[/api/gemini/generate-flashcards]', err);
    const message = err instanceof Error ? err.message : '';
    if (message.includes('GEMINI_API_KEY')) {
      return NextResponse.json({ error: 'AI service is not configured.' }, { status: 503 });
    }
    if (message.toLowerCase().includes('quota') || message.includes('429')) {
      return NextResponse.json({ error: 'AI service is temporarily busy. Please try again.' }, { status: 429 });
    }
    return NextResponse.json(
      { error: 'Couldn\'t generate flashcards for that topic. Try a more specific chapter name.' },
      { status: 500 }
    );
  }
}
