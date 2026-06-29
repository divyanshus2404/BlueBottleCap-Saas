import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { enforceRateLimit } from '@/src/lib/rateLimit';

function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not defined.");
  }
  return new GoogleGenAI({ apiKey });
}

export async function POST(req: Request) {
  const limited = enforceRateLimit(req, { limit: 15, windowMs: 60_000, prefix: "ai-roadmap" });
  if (limited) return limited;

  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Valid prompt is required" }, { status: 400 });
    }

    const ai = getAIClient();
    const systemPrompt = `You are an expert academic counselor and course architect. Create a realistic, 5-to-8 step chronological learning roadmap for the following topic/goal: "${prompt}". 
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
      model: "gemini-2.5-flash",
      contents: systemPrompt,
      config: {
        temperature: 0.7,
        responseMimeType: "application/json"
      }
    });

    let responseText = response.text || "{}";
    const parsedData = JSON.parse(responseText);
    return NextResponse.json(parsedData);
  } catch (err: any) {
    console.error("Gemini roadmap generation error:", err);
    return NextResponse.json({ error: "Failed to generate roadmap" }, { status: 500 });
  }
}
