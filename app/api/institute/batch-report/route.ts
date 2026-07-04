import { NextResponse } from "next/server";
import { enforceRateLimit } from "@/src/lib/rateLimit";
import { getAdmin } from "@/src/lib/firebaseAdmin";
import { aggregateBatch, normalizeInstCode, type DiagnosticSubmission } from "@/src/lib/batchReport";

// Aggregated weak-topic report for one institute code. Read-only; returns
// the batch size, average readiness, and per-topic weakness ranking.
// Returns a clear "not configured" signal when firebase-admin is absent so
// the UI can explain rather than show an empty report.

export async function GET(req: Request) {
  const limited = enforceRateLimit(req, { limit: 30, windowMs: 60_000, prefix: "batch-report" });
  if (limited) return limited;

  const inst = normalizeInstCode(new URL(req.url).searchParams.get("inst"));
  if (!inst) return NextResponse.json({ error: "A valid institute code is required." }, { status: 400 });

  const admin = getAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Reporting is not configured (FIREBASE_SERVICE_ACCOUNT_JSON missing)." }, { status: 503 });
  }

  try {
    const snap = await admin.db.collection("institute_diagnostics").where("inst", "==", inst).limit(5000).get();
    const subs: DiagnosticSubmission[] = snap.docs.map((d) => {
      const data = d.data();
      return { readiness: Number(data.readiness) || 0, topics: Array.isArray(data.topics) ? data.topics : [] };
    });
    return NextResponse.json({ inst, report: aggregateBatch(subs) });
  } catch (err) {
    console.error("batch-report: query failed:", err);
    return NextResponse.json({ error: "Could not load the report." }, { status: 500 });
  }
}
