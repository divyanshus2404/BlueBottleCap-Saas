import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { enforceRateLimit } from "@/src/lib/rateLimit";
import { TOOLS } from "@/src/lib/tools";

function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not defined.");
  }
  return new GoogleGenAI({ apiKey });
}

// Fallback when Gemini is unreachable or unconfigured: cheap keyword match
// against the registry so the UI never freezes empty-handed.
function keywordMatch(query: string): string[] {
  const q = query.toLowerCase();
  const scored = TOOLS.map((t) => {
    let score = 0;
    if (t.name.toLowerCase().includes(q)) score += 10;
    for (const kw of t.keywords) {
      if (q.includes(kw)) score += 3;
      if (kw.includes(q)) score += 1;
    }
    return { id: t.id, score };
  });
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((s) => s.id);
}

export async function POST(req: Request) {
  const limited = enforceRateLimit(req, { limit: 30, windowMs: 60_000, prefix: "tool-recommend" });
  if (limited) return limited;

  try {
    const { query } = (await req.json().catch(() => ({}))) as { query?: string };
    if (!query || query.trim().length < 2) {
      return NextResponse.json({ error: "Query is required." }, { status: 400 });
    }

    const catalog = TOOLS.map((t) => `- ${t.id}: ${t.name} — ${t.desc} [${t.keywords.join(", ")}]`).join("\n");
    const allowed = TOOLS.map((t) => t.id);

    let toolIds: string[] = [];

    try {
      const client = getAIClient();
      const response = await client.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `You are a tool recommender for a file-utility app. Given the user's request, pick up to 3 matching tool ids from the catalog. Return ONLY a JSON array of ids (e.g. ["pdf-merge","pdf-split"]) and nothing else — no prose, no code fences.

Catalog:
${catalog}

User request: "${query}"`,
      });
      const raw = (response.text || "").trim();
      // Strip code fences if Gemini ignored the instruction.
      const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) {
        toolIds = parsed.filter((id) => typeof id === "string" && allowed.includes(id)).slice(0, 3);
      }
    } catch (geminiErr) {
      // Swallow and fall back to keyword search — recommendation should always
      // return *something* useful rather than 500 on a query.
      console.warn("Gemini recommend-tool failed, falling back:", geminiErr);
    }

    if (toolIds.length === 0) toolIds = keywordMatch(query);

    return NextResponse.json({ toolIds });
  } catch (err: any) {
    console.error("recommend-tool error:", err);
    return NextResponse.json({ error: err.message || "Recommendation failed." }, { status: 500 });
  }
}
