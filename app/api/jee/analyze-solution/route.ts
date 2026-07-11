import { NextResponse } from 'next/server';
import { GoogleGenAI, Part } from '@google/genai';
import { aiRateLimiter, getClientIp } from '@/src/lib/rateLimit';
import { requireAuth } from '@/src/lib/authGuard';

function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured.');
  return new GoogleGenAI({ apiKey });
}

interface SolutionRequest {
  questionId?: string;
  questionText: string;
  correctAnswer: string;
  detailedSolution: string;
  studentTypedSteps?: string;
  studentImage?: string; // base64 data URI
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
    const body: SolutionRequest = await req.json();
    const { questionText, correctAnswer, detailedSolution, studentTypedSteps, studentImage } = body;

    if (!questionText || !correctAnswer || !detailedSolution) {
      return NextResponse.json(
        { error: 'questionText, correctAnswer, and detailedSolution are required.' },
        { status: 400 }
      );
    }

    const client = getAIClient();
    const parts: Part[] = [];

    const systemInstruction = `You are a world-class IIT-JEE Socratic Teacher/Mentor.
Your goal is to audit a student's handwritten rough-work photo or typed steps to help them solve a past year JEE exam question.
CRITICAL RULES:
1. Act Socratically: DO NOT output the final answer or option letter (e.g., A, B, C, D) under any circumstances.
2. Identify the Mistake: Analyze the student's steps and locate exactly where they went wrong (e.g., sign error, wrong formula, calculation mistake, incorrect boundary conditions, physics assumption flaw).
3. Guide the Student: Point out the incorrect step gently, explain WHY it is wrong conceptually, and provide a small clue or hint to guide them toward the correct derivation path.
4. Be brief, encouraging, and clear. Use bold text for core concept names.`;

    const prompt = `Here is the JEE Question the student is trying to solve:
"${questionText}"

Correct Answer (for your reference only - do not reveal): Option ${correctAnswer}
Detailed Correct Solution (for your reference only - do not reveal):
${detailedSolution}

Student's Attempted Steps:
${studentTypedSteps?.trim() || '[Student did not type any text steps]'}
`;

    // Attach image if provided (handwritten rough work)
    if (studentImage?.startsWith('data:')) {
      const commaIdx = studentImage.indexOf(',');
      if (commaIdx !== -1) {
        const mimePart = studentImage.substring(0, commaIdx);
        const base64Data = studentImage.substring(commaIdx + 1);
        const mimeMatch = mimePart.match(/data:(.*?);/);
        const mimeType = mimeMatch?.[1] ?? 'image/png';

        parts.push({
          inlineData: { mimeType, data: base64Data },
        });
      }
    }

    parts.push({ text: prompt });

    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: { parts },
      config: { systemInstruction },
    });

    return NextResponse.json({ feedback: response.text ?? '' });
  } catch (err: unknown) {
    console.error('[/api/jee/analyze-solution]', err);
    const message = err instanceof Error ? err.message : '';

    if (message.includes('GEMINI_API_KEY')) {
      return NextResponse.json({ error: 'AI service is not configured. Contact support.' }, { status: 503 });
    }
    if (message.toLowerCase().includes('quota') || message.includes('429')) {
      return NextResponse.json({ error: 'AI service is temporarily busy. Please try again.' }, { status: 429 });
    }
    return NextResponse.json({ error: 'Failed to analyze solution. Please try again.' }, { status: 500 });
  }
}
