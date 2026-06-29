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
    const { text, focus } = await req.json();
    if (!text || text.trim() === "") {
      return NextResponse.json({ error: "Text is required for summarization." }, { status: 400 });
    }

    const client = getAIClient();
    const response = await client.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Please summarize the following text. Key focus area: ${focus || "general study summary"}.
Format the summary in clean, readable markdown with this structure:
- **Core Summary Header** (Bold title summarizing the theme)
- **Executive Summary** (1-2 clear sentences explaining the core argument)
- **Key Takeaways & Core Concepts** (Detailed bullet points with bold sub-terms)
- **Logical Map / Argument Hierarchy** (Structured indented breakdown of arguments)
- **Critical Spark Questions** (2-3 thought-provoking study questions for discussion)

Text to summarize:
${text}`,
    });

    return NextResponse.json({ summary: response.text });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "An error occurred during summarization." }, { status: 500 });
  }
}
