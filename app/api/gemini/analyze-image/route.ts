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

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!aiRateLimiter.check(ip)) {
    return NextResponse.json({ error: 'Too many requests. Please wait before trying again.' }, { status: 429 });
  }

  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  const quota = await enforceUserQuota(auth.userId, "analyze_image");
  if (!quota.ok) return quota.error!;

  try {
    const { image, prompt } = await req.json();

    if (!image || !image.startsWith('data:')) {
      return NextResponse.json({ error: 'Valid base64 image data is required.' }, { status: 400 });
    }

    // Limit image data to 10MB to prevent excessively large Gemini calls
    if (image.length > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image is too large. Please use a smaller image.' }, { status: 400 });
    }

    const ai = getAIClient();

    const commaIdx = image.indexOf(',');
    const mimePart = image.substring(0, commaIdx);
    const base64Data = image.substring(commaIdx + 1);
    const mimeMatch = mimePart.match(/data:(.*?);/);
    const mimeType = mimeMatch?.[1] ?? 'image/jpeg';

    const defaultPrompt = "Analyze this page from a textbook/PDF. Extract all the visible text, identify key concepts, summarize the main points, and explain any diagrams or equations present. Format clearly using markdown.";

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt?.trim() || defaultPrompt },
            { inlineData: { mimeType, data: base64Data } }
          ]
        }
      ],
      config: { temperature: 0.3 }
    });

    return NextResponse.json({ result: response.text ?? '' });
  } catch (err: unknown) {
    console.error('[/api/gemini/analyze-image]', err);
    const message = err instanceof Error ? err.message : '';
    if (message.includes('GEMINI_API_KEY')) {
      return NextResponse.json({ error: 'AI service is not configured.' }, { status: 503 });
    }
    if (message.toLowerCase().includes('quota') || message.includes('429')) {
      return NextResponse.json({ error: 'AI service is temporarily busy. Please try again.' }, { status: 429 });
    }
    return NextResponse.json({ error: 'Failed to analyze image.' }, { status: 500 });
  }
}
