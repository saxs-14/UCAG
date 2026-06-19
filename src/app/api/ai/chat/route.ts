import { NextRequest, NextResponse } from 'next/server';
import { generateChatReply } from '@/lib/gemini';
import type { Language } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userMessage, apsScore = 0, language = 'en', history = [] } = body as {
      userMessage: string;
      apsScore?: number;
      language?: Language;
      history?: { role: 'user' | 'assistant'; content: string }[];
    };

    if (!userMessage?.trim()) {
      return NextResponse.json({ error: 'userMessage is required.' }, { status: 400 });
    }

    const reply = await generateChatReply({ userMessage, apsScore, language, history });
    return NextResponse.json({ reply });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
    const isConfig = msg.includes('GEMINI_API_KEY');
    return NextResponse.json({ error: msg }, { status: isConfig ? 503 : 500 });
  }
}
