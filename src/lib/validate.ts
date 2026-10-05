/**
 * One place to parse and validate request bodies.
 *
 * Before this, every route hand-rolled its own checks and most only tested
 * presence, not type or length — so a number where a string was expected, or a
 * 5MB string in a field meant to hold 200 characters, reached the handler (and
 * for AI routes, reached the model, where length is billable).
 *
 * `parseBody` returns a discriminated union rather than throwing, so routes
 * keep the same early-return shape they already use for auth and rate limits:
 *
 *   const parsed = await parseBody(req, MySchema);
 *   if (!parsed.ok) return parsed.error;
 *   const { field } = parsed.data;   // fully typed
 */
import { NextResponse } from "next/server";
import { z } from "zod";

export type ParseResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: NextResponse };

export async function parseBody<S extends z.ZodTypeAny>(
  req: Request,
  schema: S,
): Promise<ParseResult<z.infer<S>>> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return {
      ok: false,
      error: NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }),
    };
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    // Surface the first problem in a form a user can act on ("prompt: too
    // long") without dumping the whole schema shape back to the caller.
    const first = result.error.issues[0];
    const path = first?.path?.join(".");
    const message = path ? `${path}: ${first.message}` : (first?.message ?? "Invalid request.");
    return {
      ok: false,
      error: NextResponse.json({ error: message }, { status: 400 }),
    };
  }

  return { ok: true, data: result.data };
}

/* ── Shared field builders ───────────────────────────────────────── */

/**
 * Text headed for an AI model. The max length is the point: prompt length is
 * what you are billed on, so an unbounded string field is an unbounded bill.
 */
export const aiText = (max: number, min = 1) =>
  z.string().trim().min(min, "is required").max(max, `must be ${max} characters or fewer`);

/** A bounded integer, coerced from the strings that arrive over JSON forms. */
export const boundedInt = (min: number, max: number) =>
  z.coerce.number().int().min(min).max(max);

export const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .email("must be a valid email address")
  .max(254);

/** Hex colour for white-label branding, e.g. "#1B3FCB". */
export const hexColour = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/, "must be a hex colour like #1B3FCB");

/** A base64 data URL for an uploaded image, size-capped to keep PDFs sane. */
export const imageDataUrl = (maxBytes = 2_000_000) =>
  z
    .string()
    .regex(/^data:image\/(png|jpe?g);base64,[A-Za-z0-9+/=]+$/, "must be a PNG or JPEG data URL")
    .refine(
      (v) => {
        const b64 = v.split(",")[1] ?? "";
        // 4 base64 chars encode 3 bytes; close enough for a size guard.
        return (b64.length * 3) / 4 <= maxBytes;
      },
      `must be under ${Math.round(maxBytes / 1_000_000)}MB`,
    );

/* ── Route schemas ──────────────────────────────────────────────── */

export const RecommendToolSchema = z.object({
  query: aiText(500, 2),
});

export const GenerateMockSchema = z.object({
  instituteName: aiText(120),
  exam: aiText(80).optional().default("JEE Main 2026"),
  subject: aiText(60).optional().default("Physics"),
  chapters: aiText(400),
  difficulty: z.enum(["easy", "medium", "hard", "mixed"]).optional().default("mixed"),
  count: boundedInt(3, 30).optional().default(10),
  brandHex: hexColour.optional(),
  // Paper layout. 0 means "omit from the header", which is why the floor is 0
  // rather than 1 on duration.
  durationMins: boundedInt(0, 360).optional(),
  marksPerQuestion: boundedInt(0, 10).optional(),
  negativeMarking: boundedInt(0, 5).optional(),
  // Rejected rather than silently dropped, so a user who uploads a 10MB logo
  // is told why instead of getting an unbranded paper back.
  logoDataUrl: imageDataUrl().nullish(),
});

export const WebhookEventSchema = z.object({
  event: z.string(),
  payload: z
    .object({
      payment: z
        .object({
          entity: z
            .object({
              id: z.string(),
              order_id: z.string().optional(),
              notes: z.record(z.string()).optional(),
            })
            .optional(),
        })
        .optional(),
    })
    .optional(),
});
