import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { enforceRateLimit } from '@/src/lib/rateLimit';

function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not defined.");
  }
  return new GoogleGenAI({ apiKey });
}

export async function POST(req: Request) {
  const limited = enforceRateLimit(req, { limit: 20, windowMs: 60_000, prefix: "ai-chat" });
  if (limited) return limited;

  try {
    const { messages, paperContext, highlightedText } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required." }, { status: 400 });
    }

    const client = getAIClient();

    let systemInstruction = "You are BlueBottleCap Co-Pilot, an advanced academic AI assistant. You help students understand research papers, complex mathematics, visual homework equations, and coding problems. Provide direct, informative, encouraging, and detailed study assistance. Format all math notation with clear standard text or Markdown LaTeX formats.";
    if (paperContext) {
      systemInstruction += `\n\nActive Scientific Paper Content:\n${paperContext}`;
    }
    if (highlightedText) {
      systemInstruction += `\n\nHighlighted text selection by user:\n"${highlightedText}"`;
    }

    const contents = messages.map((msg: any) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const response = await client.models.generateContent({
      model: "gemini-2.0-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    return NextResponse.json({ reply: response.text });
  } catch (err: any) {
    console.error(err);
    if (err.message?.includes("GEMINI_API_KEY")) {
      return NextResponse.json({ error: "Missing GEMINI_API_KEY. Please configure your environment variables." }, { status: 503 });
    }
    return NextResponse.json({ error: err.message || "An error occurred during chat conversation." }, { status: 500 });
  }
}
