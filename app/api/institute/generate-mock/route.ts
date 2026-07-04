import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { enforceRateLimit } from "@/src/lib/rateLimit";
import { renderMockPaper, type MockQuestion, type MockPaperMeta } from "@/src/lib/mockPaper";

// White-label mock generator — the B2B keystone. Institutes pick exam +
// subject + chapters; Gemini writes JEE-pattern MCQs; we render a PDF
// branded with the institute's name/logo/colour plus an answer key.
//
// Returns the PDF bytes directly (application/pdf) so the client can
// download or preview. Degrades to a clear 503 without GEMINI_API_KEY.

function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

function clampInt(v: unknown, min: number, max: number, dflt: number): number {
  const n = typeof v === "number" ? v : parseInt(String(v), 10);
  if (!Number.isFinite(n)) return dflt;
  return Math.max(min, Math.min(max, Math.round(n)));
}

function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

/** Decode a "data:image/png;base64,..." URL into typed bytes for pdf-lib. */
function decodeLogo(dataUrl: unknown): { png?: Uint8Array; jpg?: Uint8Array } {
  if (typeof dataUrl !== "string") return {};
  const m = /^data:image\/(png|jpe?g);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl.trim());
  if (!m) return {};
  try {
    const bytes = new Uint8Array(Buffer.from(m[2], "base64"));
    if (bytes.length > 2_000_000) return {}; // 2MB cap
    return m[1] === "png" ? { png: bytes } : { jpg: bytes };
  } catch {
    return {};
  }
}

export async function POST(req: Request) {
  const limited = enforceRateLimit(req, { limit: 8, windowMs: 60_000, prefix: "gen-mock" });
  if (limited) return limited;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const instituteName = str(body.instituteName, 120);
  const exam = str(body.exam, 80) || "JEE Main 2026";
  const subject = str(body.subject, 60) || "Physics";
  const chapters = str(body.chapters, 400);
  const difficulty = ["easy", "medium", "hard", "mixed"].includes(body.difficulty) ? body.difficulty : "mixed";
  const count = clampInt(body.count, 3, 30, 10);

  if (!instituteName) {
    return NextResponse.json({ error: "Institute name is required." }, { status: 400 });
  }
  if (!chapters) {
    return NextResponse.json({ error: "At least one chapter/topic is required." }, { status: 400 });
  }

  const ai = getAIClient();
  if (!ai) {
    return NextResponse.json({ error: "Question generation is not configured (GEMINI_API_KEY missing)." }, { status: 503 });
  }

  const prompt = `You are a senior ${exam} question setter. Write ${count} multiple-choice questions for ${subject}, covering these chapters/topics: ${chapters}. Difficulty: ${difficulty}.
Rules:
- Exactly 4 options per question, exactly one correct.
- ${exam}-level rigour and phrasing; no trivia.
- Return STRICT JSON: an array of objects with keys "question" (string), "options" (array of exactly 4 strings), "correctIndex" (integer 0-3), "topic" (short string). No markdown, no prose, no code fences.`;

  let questions: MockQuestion[];
  try {
    const resp = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { temperature: 0.6, responseMimeType: "application/json" },
    });
    const parsed = JSON.parse(resp.text || "[]");
    const arr = Array.isArray(parsed) ? parsed : parsed.questions;
    questions = (arr as any[])
      .filter((q) => q && typeof q.question === "string" && Array.isArray(q.options) && q.options.length === 4)
      .map((q) => ({
        question: String(q.question),
        options: q.options.map((o: unknown) => String(o)),
        correctIndex: clampInt(q.correctIndex, 0, 3, 0),
        topic: typeof q.topic === "string" ? q.topic : undefined,
      }));
  } catch (err) {
    console.error("generate-mock: Gemini/parse failed:", err);
    return NextResponse.json({ error: "Could not generate questions — try again." }, { status: 502 });
  }

  if (questions.length === 0) {
    return NextResponse.json({ error: "No valid questions were generated — try different topics." }, { status: 502 });
  }

  const logo = decodeLogo(body.logoDataUrl);
  const meta: MockPaperMeta = {
    instituteName,
    exam,
    subject,
    durationMins: clampInt(body.durationMins, 0, 360, 0) || undefined,
    marksPerQuestion: clampInt(body.marksPerQuestion, 0, 10, 4) || undefined,
    negativeMarking: clampInt(body.negativeMarking, 0, 5, 1) || undefined,
    brandHex: str(body.brandHex, 7) || undefined,
    logoPng: logo.png,
    logoJpg: logo.jpg,
  };

  try {
    const pdf = await renderMockPaper(questions, meta);
    const safeName = `${instituteName}-${subject}`.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    return new NextResponse(Buffer.from(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeName}-mock.pdf"`,
        "X-Question-Count": String(questions.length),
      },
    });
  } catch (err) {
    console.error("generate-mock: PDF render failed:", err);
    return NextResponse.json({ error: "Could not render the paper." }, { status: 500 });
  }
}
