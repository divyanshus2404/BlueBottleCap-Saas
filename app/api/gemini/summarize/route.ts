import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { aiRateLimiter, getClientIp } from '@/src/lib/rateLimit';
import { requireAuth } from '@/src/lib/authGuard';

function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not defined.');
  }
  return new GoogleGenAI({ apiKey });
}

export async function POST(req: Request) {
  // Rate limiting — shared 20 req/min limit with chat endpoint
  const ip = getClientIp(req);
  if (!aiRateLimiter.check(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment before summarizing again.' },
      { status: 429 }
    );
  }

  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  try {
    const { text, focus } = await req.json();
    if (!text || (text as string).trim() === '') {
      return NextResponse.json({ error: 'Text is required for summarization.' }, { status: 400 });
    }

    // Cap input to 50,000 characters to control API costs
    const cappedText = (text as string).slice(0, 50000);

    const client = getAIClient();
    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Please summarize the following text. Key focus area: ${focus || 'general study summary'}.
Format the summary in clean, readable markdown with this structure:
- **Core Summary Header** (Bold title summarizing the theme)
- **Executive Summary** (1-2 clear sentences explaining the core argument)
- **Key Takeaways & Core Concepts** (Detailed bullet points with bold sub-terms)
- **Logical Map / Argument Hierarchy** (Structured indented breakdown of arguments)
- **Critical Spark Questions** (2-3 thought-provoking study questions for discussion)

Text to summarize:
${cappedText}`,
    });

    return NextResponse.json({ summary: response.text });
  } catch (err: unknown) {
    console.error('[/api/gemini/summarize]', err);
    const message = err instanceof Error ? err.message : 'Unknown error';

    if (message.includes('GEMINI_API_KEY')) {
      return NextResponse.json(
        { error: 'AI service is not configured. Contact support.' },
        { status: 503 }
      );
    }
    if (message.toLowerCase().includes('quota') || message.includes('429')) {
      return NextResponse.json(
        { error: 'AI service is temporarily busy. Please try again in a moment.' },
        { status: 429 }
      );
    }
    return NextResponse.json({ error: 'An error occurred during summarization.' }, { status: 500 });
  }
}
