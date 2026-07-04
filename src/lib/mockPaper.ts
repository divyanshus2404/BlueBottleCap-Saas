// Server-side renderer for institute-branded mock test papers. Uses pdf-lib
// with standard fonts (no external font files) so it runs reliably in Vercel
// serverless — unlike pdfkit, which needs .afm font assets bundled.
//
// Pure and side-effect free: takes questions + branding, returns PDF bytes.
// The Gemini call that produces the questions lives in the route, not here.

import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage, type RGB } from "pdf-lib";

export interface MockQuestion {
  question: string;
  options: string[];      // exactly 4
  correctIndex: number;   // 0-3
  topic?: string;
}

export interface MockPaperMeta {
  instituteName: string;
  exam: string;           // e.g. "JEE Main 2026"
  subject: string;        // e.g. "Physics"
  durationMins?: number;
  marksPerQuestion?: number;
  negativeMarking?: number;
  brandHex?: string;      // "#1B3FCB" — defaults to BBC blue
  logoPng?: Uint8Array;   // optional PNG bytes
  logoJpg?: Uint8Array;   // optional JPG bytes (use one or the other)
}

const A4: [number, number] = [595.28, 841.89];
const MARGIN = 48;
const CONTENT_W = A4[0] - MARGIN * 2;

// pdf-lib's standard fonts are WinAnsi (CP1252) — they throw on the Unicode
// that fills real physics/chem/math questions (true minus, arrows, √, Greek,
// subscripts). We map the common scientific symbols to safe equivalents and
// strip anything else left above Latin-1, so rendering can never crash. Named
// Greek/operators keep the questions readable without bundling a font file.
const SYMBOL_MAP: Record<string, string> = {
  "−": "-", "–": "-", "—": "-", "‐": "-", "‑": "-",
  "’": "'", "‘": "'", "“": '"', "”": '"', "•": "*", "…": "...",
  "≤": "<=", "≥": ">=", "≠": "!=", "≈": "~", "→": "->", "←": "<-", "↔": "<->", "⇒": "=>",
  "√": "sqrt", "∞": "inf", "∑": "sum", "∫": "integral", "∂": "d", "∆": "delta", "∇": "grad",
  "∝": "prop to", "⊥": "perp", "∠": "angle", "∴": "therefore", "∵": "because",
  "α": "alpha", "β": "beta", "γ": "gamma", "δ": "delta", "ε": "epsilon", "θ": "theta",
  "λ": "lambda", "μ": "mu", "π": "pi", "ρ": "rho", "σ": "sigma", "τ": "tau", "φ": "phi",
  "ω": "omega", "Ω": "ohm", "Δ": "Delta", "Σ": "Sigma", "Φ": "Phi", "Ψ": "Psi",
  "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4", "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9",
  "⁰": "0", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9",
};

function sanitize(text: string): string {
  let out = "";
  for (const ch of text) {
    if (SYMBOL_MAP[ch] !== undefined) out += SYMBOL_MAP[ch];
    else if (ch.charCodeAt(0) <= 0xff) out += ch; // Latin-1 renders fine (incl. ² ³ ° ± × ÷ µ)
    else out += ""; // drop anything exotic we didn't map, rather than crash
  }
  return out;
}

function hexToRgb(hex?: string): RGB {
  const fallback = rgb(0.106, 0.247, 0.796); // #1B3FCB
  if (!hex) return fallback;
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return fallback;
  const n = parseInt(m[1], 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

/** Greedy word-wrap: split `text` into lines that fit `maxWidth` at `size`. */
function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const trial = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(trial, size) > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = trial;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export async function renderMockPaper(rawQuestions: MockQuestion[], rawMeta: MockPaperMeta): Promise<Uint8Array> {
  // Normalise all drawn text to WinAnsi-safe glyphs up front — every string
  // below derives from these, so nothing reaches drawText unsanitised.
  const questions: MockQuestion[] = rawQuestions.map((q) => ({
    ...q,
    question: sanitize(q.question),
    options: q.options.map(sanitize),
  }));
  const meta: MockPaperMeta = {
    ...rawMeta,
    instituteName: sanitize(rawMeta.instituteName),
    exam: sanitize(rawMeta.exam),
    subject: sanitize(rawMeta.subject),
  };

  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const brand = hexToRgb(meta.brandHex);
  const ink = rgb(0.09, 0.1, 0.12);
  const soft = rgb(0.42, 0.45, 0.5);

  let logoImg: Awaited<ReturnType<typeof doc.embedPng>> | null = null;
  try {
    if (meta.logoPng) logoImg = await doc.embedPng(meta.logoPng);
    else if (meta.logoJpg) logoImg = await doc.embedJpg(meta.logoJpg);
  } catch {
    logoImg = null; // bad logo bytes shouldn't fail the whole paper
  }

  let page = doc.addPage(A4);
  let y = A4[1] - MARGIN;

  const drawHeader = (label: string) => {
    // Brand bar
    page.drawRectangle({ x: 0, y: A4[1] - 6, width: A4[0], height: 6, color: brand });
    let hx = MARGIN;
    if (logoImg) {
      const h = 30;
      const w = (logoImg.width / logoImg.height) * h;
      page.drawImage(logoImg, { x: MARGIN, y: A4[1] - MARGIN - h + 6, width: w, height: h });
      hx = MARGIN + w + 12;
    }
    page.drawText(meta.instituteName, { x: hx, y: A4[1] - MARGIN - 6, size: 15, font: bold, color: ink });
    page.drawText(`${meta.exam}  ·  ${meta.subject}${label ? "  ·  " + label : ""}`, {
      x: hx, y: A4[1] - MARGIN - 22, size: 9.5, font, color: soft,
    });
    y = A4[1] - MARGIN - 48;
    page.drawLine({ start: { x: MARGIN, y }, end: { x: A4[0] - MARGIN, y }, thickness: 0.75, color: rgb(0.88, 0.88, 0.9) });
    y -= 22;
  };

  const footer = (p: PDFPage, n: number) => {
    p.drawText("Generated with BlueBottleCap", { x: MARGIN, y: 26, size: 8, font, color: rgb(0.6, 0.62, 0.66) });
    const pageLabel = `Page ${n}`;
    p.drawText(pageLabel, { x: A4[0] - MARGIN - font.widthOfTextAtSize(pageLabel, 8), y: 26, size: 8, font, color: rgb(0.6, 0.62, 0.66) });
  };

  let pageNo = 1;
  const ensureSpace = (needed: number) => {
    if (y - needed < 60) {
      footer(page, pageNo);
      page = doc.addPage(A4);
      pageNo += 1;
      drawHeader("");
    }
  };

  drawHeader("Question Paper");

  // Instructions strip
  const parts: string[] = [];
  if (meta.durationMins) parts.push(`Duration: ${meta.durationMins} min`);
  parts.push(`Questions: ${questions.length}`);
  if (meta.marksPerQuestion) parts.push(`+${meta.marksPerQuestion} each`);
  if (meta.negativeMarking) parts.push(`-${meta.negativeMarking} negative`);
  page.drawText(parts.join("     "), { x: MARGIN, y, size: 9.5, font: bold, color: brand });
  y -= 24;

  const optLabels = ["A", "B", "C", "D"];
  questions.forEach((q, i) => {
    const qLines = wrap(`${i + 1}.  ${q.question}`, bold, 11, CONTENT_W);
    const optLineCounts = q.options.map((o, oi) => wrap(`(${optLabels[oi]})  ${o}`, font, 10.5, CONTENT_W - 16).length);
    const blockH = qLines.length * 15 + optLineCounts.reduce((a, b) => a + b, 0) * 14 + 18;
    ensureSpace(blockH);

    for (const ln of qLines) {
      page.drawText(ln, { x: MARGIN, y, size: 11, font: bold, color: ink });
      y -= 15;
    }
    y -= 3;
    q.options.forEach((o, oi) => {
      const lines = wrap(`(${optLabels[oi]})  ${o}`, font, 10.5, CONTENT_W - 16);
      lines.forEach((ln) => {
        page.drawText(ln, { x: MARGIN + 16, y, size: 10.5, font, color: rgb(0.2, 0.22, 0.26) });
        y -= 14;
      });
    });
    y -= 8;
  });

  footer(page, pageNo);

  // Answer key page
  page = doc.addPage(A4);
  pageNo += 1;
  drawHeader("Answer Key");
  const cols = 4;
  const colW = CONTENT_W / cols;
  let idx = 0;
  const startY = y;
  for (let c = 0; c < cols; c++) {
    y = startY;
    const perCol = Math.ceil(questions.length / cols);
    for (let r = 0; r < perCol && idx < questions.length; r++, idx++) {
      const q = questions[idx];
      const label = `${idx + 1}.`;
      const ans = optLabels[q.correctIndex] ?? "?";
      page.drawText(label, { x: MARGIN + c * colW, y, size: 10.5, font, color: soft });
      page.drawText(ans, { x: MARGIN + c * colW + 26, y, size: 10.5, font: bold, color: brand });
      y -= 18;
    }
  }
  footer(page, pageNo);

  return doc.save();
}
