import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { enforceRateLimit } from "@/src/lib/rateLimit";
import { requireAuth } from "@/src/lib/authGuard";

export const runtime = "nodejs";
// Notes can be image-heavy and Gemini Vision needs a moment.
export const maxDuration = 60;

const MAX_INLINE_BYTES = 6 * 1024 * 1024; // 6 MB cap — Vision inline limit guidance
const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/heic",
]);

function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY environment variable is not defined.");
  return new GoogleGenAI({ apiKey });
}

const PROMPT = `You are a precise handwritten-notes transcriber for an Indian college student.

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
  const limited = enforceRateLimit(req, { limit: 8, windowMs: 60_000, prefix: "scan-notes" });
  if (limited) return limited;

  // Require authentication — protects Gemini API quota from anonymous abuse
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

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
  if (file.size > MAX_INLINE_BYTES) {
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
    const client = getAIClient();
    const response = await client.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: PROMPT },
            { inlineData: { mimeType: file.type, data: base64 } },
          ],
        },
      ],
    });

    const text = (response.text || "").trim();
    if (!text || text === "NOT_READABLE") {
      return NextResponse.json(
        { error: "We couldn't read this image as handwritten notes. Try a sharper, well-lit photo." },
        { status: 422 },
      );
    }

    return NextResponse.json({ markdown: text });
  } catch (err: unknown) {
    console.error("[scan-notes] gemini error:", err);
    return NextResponse.json(
      { error: "AI transcription failed. Try again in a moment." },
      { status: 502 },
    );
  }
}
