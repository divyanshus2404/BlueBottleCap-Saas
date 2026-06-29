import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not defined.");
  }
  return new GoogleGenAI({ apiKey });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      questionId,
      questionText,
      correctAnswer,
      detailedSolution,
      studentTypedSteps,
      studentImage,
    } = body;

    const client = getAIClient();
    const parts: any[] = [];

    const systemInstruction = `You are a world-class IIT-JEE Socratic Teacher/Mentor. 
Your goal is to audit a student's handwritten rough-work photo or typed steps to help them solve a past year JEE exam question.
CRITICAL RULES:
1. Act Socratically: DO NOT output the final answer or option letter (e.g., A, B, C, D) under any circumstances.
2. Identify the Mistake: Analyze the student's steps and locate exactly where they went wrong (e.g., sign error, wrong formula, calculation mistake, incorrect boundary conditions, physics assumption flaw).
3. Guide the Student: Point out the incorrect step gently, explain WHY it is wrong conceptually, and provide a small clue or hint to guide them toward the correct derivation path.
4. Be brief, encouraging, and clear. Use bold text for core concept names.`;

    let prompt = `Here is the JEE Question the student is trying to solve:
"${questionText}"

Correct Answer (for your reference only - do not reveal): Option ${correctAnswer}
Detailed Correct Solution (for your reference only - do not reveal):
${detailedSolution}

Student's Attempted Steps:
${studentTypedSteps || "[Student did not type any text steps]"}
`;

    if (studentImage && studentImage.startsWith("data:")) {
      const commaIdx = studentImage.indexOf(",");
      if (commaIdx !== -1) {
        const mimePart = studentImage.substring(0, commaIdx);
        const base64Data = studentImage.substring(commaIdx + 1);
        const mimeMatch = mimePart.match(/data:(.*?);/);
        const mimeType = mimeMatch ? mimeMatch[1] : "image/png";

        parts.push({
          inlineData: {
            mimeType,
            data: base64Data,
          },
        });
      }
    }

    parts.push({ text: prompt });

    const response = await client.models.generateContent({
      model: "gemini-2.0-flash",
      contents: { parts },
      config: {
        systemInstruction,
      },
    });

    return NextResponse.json({ feedback: response.text });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "An error occurred during solution analysis." }, { status: 500 });
  }
}
