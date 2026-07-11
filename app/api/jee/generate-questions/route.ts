import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { aiRateLimiter, getClientIp } from '@/src/lib/rateLimit';
import { requireAuth } from '@/src/lib/authGuard';

function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured.');
  return new GoogleGenAI({ apiKey });
}

interface JEEGenerateRequest {
  subject: 'Physics' | 'Chemistry' | 'Mathematics';
  chapter?: string;
  difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
  count?: number;
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!aiRateLimiter.check(ip)) {
    return NextResponse.json({ error: 'Too many requests. Please wait before trying again.' }, { status: 429 });
  }

  // Require authentication — protects Gemini API quota from anonymous abuse
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  try {
    const body: JEEGenerateRequest = await req.json();
    const {
      subject,
      chapter = '',
      difficulty = 'mixed',
      count = 5,
    } = body;

    const validSubjects = ['Physics', 'Chemistry', 'Mathematics'];
    if (!subject || !validSubjects.includes(subject)) {
      return NextResponse.json({ error: 'Subject must be Physics, Chemistry, or Mathematics.' }, { status: 400 });
    }

    const cardCount = Math.min(Math.max(Number(count) || 5, 1), 10);
    const ai = getAIClient();

    const prompt = `Generate ${cardCount} original JEE-style multiple choice questions for ${subject}${chapter ? ` — Chapter: ${chapter}` : ''}.
Difficulty: ${difficulty}

Return ONLY a JSON array (no markdown). Each object must have:
- "question": the full question text (LaTeX for math using \\( \\) for inline, \\[ \\] for display)
- "options": array of exactly 4 strings, e.g. ["A. ...", "B. ...", "C. ...", "D. ..."]
- "correctAnswer": "A", "B", "C", or "D"
- "explanation": a detailed step-by-step solution (2-5 sentences)
- "topic": the specific topic within ${subject}
- "difficulty": "easy", "medium", or "hard"

Make questions exam-realistic — no trivial definitions. Use numerical problems where appropriate.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json', temperature: 0.6 },
    });

    const raw = response.text ?? '[]';
    let questions: unknown[];
    try {
      const parsed = JSON.parse(raw);
      questions = Array.isArray(parsed) ? parsed : [];
    } catch {
      return NextResponse.json({ error: 'AI returned invalid data. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ questions, subject, chapter, difficulty });
  } catch (err: unknown) {
    console.error('[/api/jee/generate-questions]', err);
    const message = err instanceof Error ? err.message : '';
    if (message.includes('GEMINI_API_KEY')) {
      return NextResponse.json({ error: 'AI service is not configured.' }, { status: 503 });
    }
    if (message.toLowerCase().includes('quota') || message.includes('429')) {
      return NextResponse.json({ error: 'AI service is temporarily busy. Please try again.' }, { status: 429 });
    }
    return NextResponse.json({ error: 'Failed to generate questions.' }, { status: 500 });
  }
}
