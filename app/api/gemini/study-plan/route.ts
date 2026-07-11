import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { aiRateLimiter, getClientIp } from '@/src/lib/rateLimit';
import { requireAuth } from '@/src/lib/authGuard';

function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured.');
  return new GoogleGenAI({ apiKey });
}

interface StudyPlanRequest {
  subjects: string[];       // e.g. ["Mathematics", "Physics", "Chemistry"]
  examDate: string;         // ISO date string, e.g. "2025-05-01"
  hoursPerDay: number;      // e.g. 6
  weakTopics?: string[];    // optional: topics needing extra attention
  currentSemester?: string; // e.g. "4th semester"
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!aiRateLimiter.check(ip)) {
    return NextResponse.json({ error: 'Too many requests. Please wait before trying again.' }, { status: 429 });
  }

  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  try {
    const body: StudyPlanRequest = await req.json();
    const { subjects, examDate, hoursPerDay, weakTopics = [], currentSemester = '' } = body;

    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return NextResponse.json({ error: 'At least one subject is required.' }, { status: 400 });
    }
    if (!examDate || isNaN(Date.parse(examDate))) {
      return NextResponse.json({ error: 'A valid exam date is required.' }, { status: 400 });
    }
    if (!hoursPerDay || typeof hoursPerDay !== 'number' || hoursPerDay < 1 || hoursPerDay > 18) {
      return NextResponse.json({ error: 'hoursPerDay must be between 1 and 18.' }, { status: 400 });
    }

    const daysUntilExam = Math.max(
      1,
      Math.ceil((new Date(examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    );

    const ai = getAIClient();

    const prompt = `You are a top IIT-JEE and B.Tech exam preparation expert. Create a personalized study plan.

Student Profile:
- Subjects: ${subjects.join(', ')}
- Days until exam: ${daysUntilExam} days
- Study hours per day: ${hoursPerDay} hours
- Weak topics needing extra attention: ${weakTopics.length > 0 ? weakTopics.join(', ') : 'None specified'}
${currentSemester ? `- Current semester: ${currentSemester}` : ''}

Return ONLY a JSON object (no markdown wrapper) with this structure:
{
  "overview": "2-3 sentence summary of the overall strategy",
  "weeklyPlan": [
    {
      "week": 1,
      "theme": "Foundation Building",
      "focus": ["Subject: Topic", "Subject: Topic"],
      "dailyHours": { "SubjectName": hoursFloat },
      "milestone": "What should be completed by end of this week"
    }
  ],
  "dailySchedule": {
    "morning": "What to study in morning slot",
    "afternoon": "What to study in afternoon slot",
    "evening": "Review and practice problems"
  },
  "priorityTopics": [
    { "subject": "Physics", "topic": "Mechanics", "urgency": "high" }
  ],
  "tips": ["Tip 1", "Tip 2", "Tip 3"]
}

Generate ${Math.min(Math.ceil(daysUntilExam / 7), 12)} weeks of planning. Keep it practical and achievable.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json', temperature: 0.5 },
    });

    const raw = response.text ?? '{}';
    let plan: unknown;
    try {
      plan = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: 'AI returned invalid data. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ plan, daysUntilExam });
  } catch (err: unknown) {
    console.error('[/api/gemini/study-plan]', err);
    const message = err instanceof Error ? err.message : '';
    if (message.includes('GEMINI_API_KEY')) {
      return NextResponse.json({ error: 'AI service is not configured.' }, { status: 503 });
    }
    if (message.toLowerCase().includes('quota') || message.includes('429')) {
      return NextResponse.json({ error: 'AI service is temporarily busy. Please try again.' }, { status: 429 });
    }
    return NextResponse.json({ error: 'Failed to generate study plan.' }, { status: 500 });
  }
}
