import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { aiRateLimiter, getClientIp } from '@/src/lib/rateLimit';
import { requireAuth } from '@/src/lib/authGuard';
import { enforceUserQuota } from '@/src/lib/userQuota';

function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured.');
  return new GoogleGenAI({ apiKey });
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!aiRateLimiter.check(ip)) {
    return NextResponse.json({ error: 'Too many requests. Please wait before trying again.' }, { status: 429 });
  }

  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  const quota = await enforceUserQuota(auth.userId, "generate_roadmap");
  if (!quota.ok) return quota.error!;

  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 3) {
      return NextResponse.json({ error: 'A valid prompt is required.' }, { status: 400 });
    }

    const ai = getAIClient();

    const systemPrompt = `You are an expert academic counselor and course architect. Create a realistic, 5-to-8 step chronological learning roadmap for the following topic/goal: "${prompt.trim()}".
Return the result STRICTLY as a JSON object containing two keys: "nodes" and "coincidingGroups".
"nodes" must be an array of objects where each object has:
- "id": a unique string like "n-1"
- "title": a short, punchy title for the step
- "description": a 1-sentence description of what to study
- "status": string "completed" for the first node, "current" for the second node, and "locked" for the rest
- "duration": a string like "Week 1", "Week 2-3", or "Month 1"
"coincidingGroups" must be an array of 2 to 4 objects representing mock peer study groups related to the topic, where each object has:
- "id": a unique string like "g-1"
- "name": a fun, creative name for the study group (e.g. "React Masters", "Chemistry Connoisseurs")
- "avatar": a single relevant emoji
- "members": a random integer between 3 and 40
- "currentNodeId": the id of one of the nodes (e.g., "n-2")
Do NOT wrap the response in markdown blocks like \`\`\`json. Return pure JSON only.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: systemPrompt,
      config: {
        temperature: 0.7,
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text ?? '{}';

    // Validate it's parseable JSON before returning
    let parsedData: unknown;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      console.error('[generate-roadmap] Invalid JSON from Gemini:', responseText.slice(0, 200));
      return NextResponse.json({ error: 'AI returned invalid data. Please try again.' }, { status: 500 });
    }

    return NextResponse.json(parsedData);
  } catch (err: unknown) {
    console.error('[/api/gemini/generate-roadmap]', err);
    const message = err instanceof Error ? err.message : '';

    if (message.includes('GEMINI_API_KEY')) {
      return NextResponse.json({ error: 'AI service is not configured. Contact support.' }, { status: 503 });
    }
    if (message.toLowerCase().includes('quota') || message.includes('429')) {
      return NextResponse.json({ error: 'AI service is temporarily busy. Please try again.' }, { status: 429 });
    }
    return NextResponse.json({ error: 'Failed to generate roadmap. Please try again.' }, { status: 500 });
  }
}
