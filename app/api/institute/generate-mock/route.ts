import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { enforceRateLimit } from "@/src/lib/rateLimit";
import { requireAuth } from "@/src/lib/authGuard";
import { enforceUserQuota } from "@/src/lib/userQuota";
import { parseBody, GenerateMockSchema } from "@/src/lib/validate";
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
  const limited = await enforceRateLimit(req, { limit: 8, windowMs: 60_000, prefix: "gen-mock" });
  if (limited) return limited;

  // This route was previously public. An IP cap alone does not protect the
  // Gemini bill — a generated paper is the single most expensive call in the
  // app, and rotating IPs defeats the limiter entirely.
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  const quota = await enforceUserQuota(auth.userId, "institute_generate_mock");
  if (!quota.ok && quota.error) return quota.error;

  // Schema-validated: bounds and types are enforced in one place instead of
  // via per-field helpers, and a bad logo is now reported rather than dropped.
  const parsed = await parseBody(req, GenerateMockSchema);
  if (!parsed.ok) return parsed.error;
  const {
    instituteName, exam, subject, chapters, difficulty, count, brandHex, logoDataUrl,
    durationMins, marksPerQuestion, negativeMarking,
  } = parsed.data;

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

  const logo = decodeLogo(logoDataUrl);
  const meta: MockPaperMeta = {
    instituteName,
    exam,
    subject,
    durationMins: durationMins || undefined,
    marksPerQuestion: marksPerQuestion ?? 4,
    negativeMarking: negativeMarking ?? 1,
    brandHex: brandHex || undefined,
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
