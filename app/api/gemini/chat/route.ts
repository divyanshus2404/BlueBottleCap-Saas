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
  // Rate limiting — 20 AI requests per minute per IP
  const ip = getClientIp(req);
  if (!aiRateLimiter.check(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment before sending another message.' },
      { status: 429 }
    );
  }

  // Require authentication — protects Gemini API quota from anonymous abuse
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  try {
    const { messages, paperContext, highlightedText } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required.' }, { status: 400 });
    }

    // Cap conversation history to prevent expensive API calls
    const cappedMessages = messages.slice(-30);

    let systemInstruction =
      'You are BlueBottleCap Co-Pilot, an advanced academic AI assistant. You help students understand research papers, complex mathematics, visual homework equations, and coding problems. Provide direct, informative, encouraging, and detailed study assistance. Format all math notation with clear standard text or Markdown LaTeX formats.';
    if (paperContext) {
      systemInstruction += `\n\nActive Scientific Paper Content:\n${paperContext}`;
    }
    if (highlightedText) {
      systemInstruction += `\n\nHighlighted text selection by user:\n"${highlightedText}"`;
    }

    const contents = cappedMessages.map((msg: { role: string; content: string }) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // ── Streaming response ──
    // Instead of waiting for the full response, we stream tokens back to the
    // client as they arrive, giving a much faster perceived response time.
    const client2 = getAIClient();
    const stream = await client2.models.generateContentStream({
      model: 'gemini-2.0-flash',
      contents,
      config: { systemInstruction },
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.text ?? '';
            if (text) {
              // Send each chunk as a Server-Sent Event so the client can render
              // progressively. Format: "data: <json>\n\n"
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ delta: text })}\n\n`)
              );
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        } catch (streamErr) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: 'Stream interrupted.' })}\n\n`)
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err: unknown) {
    console.error('[/api/gemini/chat]', err);
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
    return NextResponse.json({ error: 'An error occurred. Please try again.' }, { status: 500 });
  }
}
