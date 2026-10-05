import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { enforceRateLimit } from "@/src/lib/rateLimit";
import { requireAuth } from "@/src/lib/authGuard";
import { enforceUserQuota } from "@/src/lib/userQuota";

export const runtime = "nodejs";
export const maxDuration = 60;

function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY environment variable is not defined.");
  return new GoogleGenAI({ apiKey });
}

const PROMPT = `You are a formula-sheet generator for Indian engineering students (JEE, GATE, B.Tech).

Given a topic or subject, produce a **concise, exam-ready formula/concept cheat sheet** in Markdown.

Rules:
- Title: # Formula Sheet — <Topic>
- Organize into logical sections with ## headings (e.g., ## Definitions, ## Key Formulas, ## Shortcuts & Tricks, ## Common Mistakes)
- Every formula in LaTeX: $ ... $ inline, $$ ... $$ block
- Include units and conditions where they matter
- Add 2–3 "exam shortcuts" or tricks that save time in MCQs
- Keep it to ONE page worth of content — dense but readable
- Use bullet points, not paragraphs
- Bold key variable names on first use
- If the topic is too broad (e.g., "Physics"), narrow to the most exam-critical subtopics and note what was covered
- Do NOT pad with filler or definitions that any student would already know
- Target: a student who understood the chapter and needs a last-minute revision sheet

If the topic is nonsensical or not an academic subject, return:
\`\`\`
INVALID_TOPIC
\`\`\`
`;

export async function POST(req: Request) {
  // Distributed 20 req/min cap. Goes through enforceRateLimit so the
  // Upstash-backed limiter applies; the in-memory one is only a fallback.
  const limited = await enforceRateLimit(req, { limit: 20, windowMs: 60_000, prefix: "gemini-formula-sheet" });
  if (limited) return limited;

  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  const quota = await enforceUserQuota(auth.userId, "formula_sheet");
  if (!quota.ok) return quota.error!;

  let body: { topic?: string; exam?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const topic = (body.topic || "").trim();
  if (!topic || topic.length < 2) {
    return NextResponse.json({ error: "Please provide a topic." }, { status: 400 });
  }
  if (topic.length > 200) {
    return NextResponse.json({ error: "Topic is too long (max 200 characters)." }, { status: 400 });
  }

  const exam = body.exam || "JEE/GATE";

  try {
    const client = getAIClient();
    const response = await client.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `${PROMPT}\n\nTopic: ${topic}\nTarget exam: ${exam}`,
    });

    const text = (response.text || "").trim();
    if (!text || text === "INVALID_TOPIC") {
      return NextResponse.json(
        { error: "That doesn't look like a valid academic topic. Try something like 'Thermodynamics' or 'Integration'." },
        { status: 422 },
      );
    }

    return NextResponse.json({ markdown: text, topic, exam });
  } catch (err: unknown) {
    console.error("[/api/gemini/formula-sheet]", err);
    const message = err instanceof Error ? err.message : "Unknown error";

    if (message.includes("GEMINI_API_KEY")) {
      return NextResponse.json({ error: "AI service is not configured." }, { status: 503 });
    }
    if (message.toLowerCase().includes("quota") || message.includes("429")) {
      return NextResponse.json({ error: "AI service is busy. Try again shortly." }, { status: 429 });
    }
    return NextResponse.json({ error: "Could not generate the formula sheet. Try again." }, { status: 500 });
  }
}
