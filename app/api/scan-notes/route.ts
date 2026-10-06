import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { enforceRateLimit } from "@/src/lib/rateLimit";
import { requireAuth } from "@/src/lib/authGuard";
import { enforceUserQuota } from "@/src/lib/userQuota";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_INLINE_BYTES = 1 * 1024 * 1024; // OCR.space free tier: 1 MB
const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/heic",
]);

function getOcrSpaceKey(): string | undefined {
  return process.env.OCR_SPACE_API_KEY;
}

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY environment variable is not defined.");
  return new GoogleGenAI({ apiKey });
}

async function ocrWithEngine(apiKey: string, dataUri: string, engine: "1" | "2"): Promise<string> {
  const form = new URLSearchParams();
  form.append("apikey", apiKey);
  form.append("base64Image", dataUri);
  form.append("language", "eng");
  form.append("OCREngine", engine);
  form.append("isTable", "true");
  form.append("scale", "true");
  form.append("detectOrientation", "true");

  const res = await fetch("https://api.ocr.space/parse/image", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });

  if (!res.ok) throw new Error(`OCR.space engine ${engine} returned ${res.status}`);

  const data = await res.json();
  if (data.IsErroredOnProcessing) {
    throw new Error(data.ErrorMessage?.[0] || "OCR.space processing error");
  }

  return (data.ParsedResults || [])
    .map((r: { ParsedText?: string }) => r.ParsedText || "")
    .join("\n")
    .trim();
}

async function ocrSpaceExtract(base64: string, mimeType: string): Promise<string> {
  const apiKey = getOcrSpaceKey();
  if (!apiKey) throw new Error("OCR_SPACE_API_KEY not set");

  const dataUri = `data:${mimeType};base64,${base64}`;

  // Run both engines in parallel — Engine 1 is better for printed text,
  // Engine 2 for handwriting. Pick whichever returns more content.
  const [e1, e2] = await Promise.allSettled([
    ocrWithEngine(apiKey, dataUri, "1"),
    ocrWithEngine(apiKey, dataUri, "2"),
  ]);

  const t1 = e1.status === "fulfilled" ? e1.value : "";
  const t2 = e2.status === "fulfilled" ? e2.value : "";

  const text = t2.length >= t1.length ? t2 : t1;
  if (!text) throw new Error("OCR returned empty text");
  return text;
}

const STRUCTURE_PROMPT = `You are a study-notes formatter for an Indian college student.

You will receive OCR-extracted text from handwritten notes. Structure it into clean Markdown:

# <Short title reflecting the subject (e.g., "Thermodynamics — 2nd Law")>

> 1-line summary of what the page is about.

## Notes
- Clean up the OCR text into readable study notes.
- Preserve original meaning. Fix OCR errors and spelling.
- Use bullet points and short paragraphs.
- Render equations in LaTeX: $ ... $ (inline) or $$ ... $$ (block).
- Promote implied section headers (e.g., "Eg.", "Note:") to headings.
- Do NOT add facts that aren't in the source text.

## Key terms
- 3–8 important terms with 1-line definitions.

If the text is gibberish or unreadable, return ONLY:
\`\`\`
NOT_READABLE
\`\`\`
`;

const VISION_PROMPT = `You are a precise handwritten-notes transcriber for an Indian college student.

Read the photo of handwritten notes and return a clean, typed version in **Markdown**, with this structure:

# <Short title that reflects the subject (e.g., "Thermodynamics — 2nd Law")>

> 1-line summary of what the page is about, in your own words.

## Notes
- Faithful transcription of every line of the handwritten content.
- Preserve original meaning. Fix only obvious spelling and capitalisation errors.
- Use bullet points and short paragraphs the way a study-ready notebook would.
- Render equations in LaTeX between $ ... $ (inline) or $$ ... $$ (block).
- If a section header is implied (e.g., "Eg.", "Note:"), promote it to a heading.
- Do NOT add facts that aren't in the photo. Do NOT pad with filler.

## Key terms
- 3–8 important terms from the page, each with a 1-line definition in your own words.

If the photo is unreadable, not handwritten notes, or empty, return ONLY:
\`\`\`
NOT_READABLE
\`\`\`
`;

export async function POST(req: Request) {
  const limited = await enforceRateLimit(req, { limit: 8, windowMs: 60_000, prefix: "scan-notes" });
  if (limited) return limited;

  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  const quota = await enforceUserQuota(auth.userId, "scan_notes");
  if (!quota.ok) return quota.error!;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data with an 'image' field." }, { status: 400 });
  }

  const file = form.get("image");
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "Missing 'image' file." }, { status: 400 });
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json(
      { error: `Unsupported image type: ${file.type}. Use PNG, JPEG, WebP, or HEIC.` },
      { status: 415 },
    );
  }
  if (file.size > 6 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Image is larger than 6 MB. Compress or crop and try again." },
      { status: 413 },
    );
  }

  let base64: string;
  try {
    const buf = Buffer.from(await file.arrayBuffer());
    base64 = buf.toString("base64");
  } catch {
    return NextResponse.json({ error: "Could not read the uploaded image." }, { status: 400 });
  }

  try {
    const hasOcrSpace = Boolean(getOcrSpaceKey());
    const client = getGeminiClient();
    let markdown: string;

    if (hasOcrSpace && file.size <= MAX_INLINE_BYTES) {
      // Path A: OCR.space extracts text → Gemini structures it
      const rawText = await ocrSpaceExtract(base64, file.type);

      const response = await client.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
          {
            role: "user",
            parts: [{ text: `${STRUCTURE_PROMPT}\n\n---\nOCR Text:\n${rawText}` }],
          },
        ],
      });
      markdown = (response.text || "").trim();
    } else {
      // Path B: Gemini Vision directly (fallback for large images or no OCR key)
      const response = await client.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
          {
            role: "user",
            parts: [
              { text: VISION_PROMPT },
              { inlineData: { mimeType: file.type, data: base64 } },
            ],
          },
        ],
      });
      markdown = (response.text || "").trim();
    }

    if (!markdown || markdown === "NOT_READABLE") {
      return NextResponse.json(
        { error: "We couldn't read this image as handwritten notes. Try a sharper, well-lit photo." },
        { status: 422 },
      );
    }

    return NextResponse.json({ markdown });
  } catch (err: unknown) {
    console.error("[scan-notes] error:", err);
    return NextResponse.json(
      { error: "AI transcription failed. Try again in a moment." },
      { status: 502 },
    );
  }
}
