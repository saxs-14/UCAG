import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const MODEL = 'gemini-2.5-flash';

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY is not set. Add it to .env.local to enable AI roadmap guidance.' },
      { status: 503 }
    );
  }

  try {
    const { apsScore, qualificationTier, qualifiedCourses, weakSubjects, completedSteps } = await req.json();

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are a South African university application expert helping a Grade 12 learner at the University of Mpumalanga (UMP).

LEARNER PROFILE:
- APS Score: ${apsScore}/42
- Qualification tier: ${qualificationTier}
- Courses they currently qualify for: ${qualifiedCourses?.length > 0 ? qualifiedCourses.join(', ') : 'None yet'}
- Subjects where improvement would help: ${weakSubjects?.length > 0 ? weakSubjects.join(', ') : 'None identified'}
- Steps already completed: ${completedSteps?.length > 0 ? completedSteps.join(', ') : 'None yet'}

YOUR TASK:
Write 3–4 short, specific, actionable paragraphs of personalised guidance for this learner. Cover:
1. Their current standing and what it means for UMP admission (be honest and specific)
2. The single most important next step they should take RIGHT NOW
3. One study improvement tip specific to their weak subjects (if any)
4. A specific encouragement tied to their actual situation — not generic motivation

Keep each paragraph to 2–3 sentences. Be warm, direct, and honest. Do not overstate their chances. Do not repeat generic advice — be specific to their numbers.`;

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    return NextResponse.json({ guidance: response.text ?? '' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
