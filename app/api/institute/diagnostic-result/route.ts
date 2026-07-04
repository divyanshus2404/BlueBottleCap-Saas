import { NextResponse } from "next/server";
import { enforceRateLimit } from "@/src/lib/rateLimit";
import { getAdmin } from "@/src/lib/firebaseAdmin";
import { normalizeInstCode, type SubmittedTopic } from "@/src/lib/batchReport";

// A student's diagnostic result, tagged with an institute code, so the
// institute owner can later see their whole batch's weak-topic map.
// Anonymous — no login. Persisted via firebase-admin; degrades to a
// no-op "ok" when the service account isn't configured (like verify).

export async function POST(req: Request) {
  const limited = enforceRateLimit(req, { limit: 20, windowMs: 60_000, prefix: "diag-result" });
  if (limited) return limited;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const inst = normalizeInstCode(body.inst);
  if (!inst) return NextResponse.json({ error: "A valid institute code is required." }, { status: 400 });

  const readiness = Math.max(0, Math.min(100, Number(body.readiness) || 0));
  const topics: SubmittedTopic[] = Array.isArray(body.topics)
    ? body.topics
        .filter((t: any) => t && typeof t.topic === "string" && Number(t.total) > 0)
        .slice(0, 30)
        .map((t: any) => {
          // Cap total first, then clamp correct against the *capped* total —
          // otherwise a total > 50 could persist correct > total and push
          // aggregate accuracy above 100%.
          const total = Math.min(50, Number(t.total) || 0);
          const correct = Math.max(0, Math.min(total, Number(t.correct) || 0));
          return {
            topic: String(t.topic).slice(0, 60),
            subject: typeof t.subject === "string" ? t.subject.slice(0, 40) : undefined,
            correct,
            total,
          };
        })
    : [];

  if (topics.length === 0) return NextResponse.json({ error: "No topic scores provided." }, { status: 400 });

  const admin = getAdmin();
  if (!admin) return NextResponse.json({ ok: true, persisted: false }); // graceful

  try {
    await admin.db.collection("institute_diagnostics").add({
      inst,
      readiness,
      topics,
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true, persisted: true });
  } catch (err) {
    console.error("diagnostic-result: persist failed:", err);
    return NextResponse.json({ ok: true, persisted: false }); // never block the student UX
  }
}
