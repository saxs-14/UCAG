import { NextRequest, NextResponse } from 'next/server';
import { generateCareerGuidance } from '@/lib/gemini';
import type { Subject, Language } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { apsScore, subjects, qualifiedCourses, closeCourses, language = 'en' } = body as {
      apsScore: number;
      subjects: Subject[];
      qualifiedCourses: string[];
      closeCourses: string[];
      language?: Language;
    };

    if (typeof apsScore !== 'number' || !Array.isArray(subjects)) {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const guidance = await generateCareerGuidance({ apsScore, subjects, qualifiedCourses, closeCourses, language });
    return NextResponse.json({ guidance });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
    const isConfig = msg.includes('GEMINI_API_KEY');
    return NextResponse.json({ error: msg }, { status: isConfig ? 503 : 500 });
  }
}
