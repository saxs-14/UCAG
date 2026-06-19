import { GoogleGenAI } from '@google/genai';
import type { Subject, Language } from '@/types';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

function getClient(): GoogleGenAI {
  if (!GEMINI_API_KEY) {
    throw new Error(
      'GEMINI_API_KEY is not set. Please add it to .env.local — get a free key at https://aistudio.google.com/app/apikey'
    );
  }
  return new GoogleGenAI({ apiKey: GEMINI_API_KEY });
}

const MODEL = 'gemini-2.5-flash';

export async function generateCareerGuidance(opts: {
  apsScore: number;
  subjects: Subject[];
  qualifiedCourses: string[];
  closeCourses: string[];
  language?: Language;
}): Promise<string> {
  const ai = getClient();
  const { apsScore, subjects, qualifiedCourses, closeCourses, language = 'en' } = opts;

  const subjectsSummary = subjects
    .map(s => `${s.name}: ${s.mark}%`)
    .join(', ');

  const languageInstructions: Record<Language, string> = {
    en: 'Respond in clear, encouraging English.',
    zu: 'Respond in isiZulu. Be warm and encouraging.',
    nso: 'Respond in Sepedi (Northern Sotho). Be warm and encouraging.',
    ts:  'Respond in Xitsonga. Be warm and encouraging.',
    ss:  'Respond in Siswati. Be warm and encouraging.',
  };

  const prompt = `You are an expert South African educational career counsellor for the University of Mpumalanga (UMP).
A Grade 12 learner has provided their results. Based ONLY on the information below, write personalised, honest, and encouraging career guidance.

LEARNER PROFILE:
- APS Score: ${apsScore} points
- Subjects: ${subjectsSummary}
- Courses they qualify for: ${qualifiedCourses.length > 0 ? qualifiedCourses.join(', ') : 'No courses at current APS'}
- Courses they are close to qualifying for: ${closeCourses.length > 0 ? closeCourses.join(', ') : 'None identified'}

YOUR TASK:
1. Acknowledge their strengths genuinely (do not fabricate strengths; be specific to their actual marks).
2. Explain in 2-3 sentences why the top 2 matching courses suit them, referencing their actual subject marks.
3. If they do not qualify for any course, explain clearly what improvement is needed and mention UMP's Extended Curriculum Programme (ECP) as a pathway.
4. Suggest one primary career direction and one alternative.
5. Mention one relevant bursary or funding option (NSFAS, Funza Lushaka, Mpumalanga Provincial, Sasol, or the Social Work Scholarship — choose the most relevant).
6. End with one short, sincere motivational sentence.

Keep the response under 250 words. Be honest — do not overstate qualifications. ${languageInstructions[language]}`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  });

  return response.text ?? '';
}

export async function generateChatReply(opts: {
  userMessage: string;
  apsScore: number;
  language: Language;
  history: { role: 'user' | 'assistant'; content: string }[];
}): Promise<string> {
  const ai = getClient();
  const { userMessage, apsScore, language, history } = opts;

  const langName: Record<Language, string> = {
    en: 'English', zu: 'isiZulu', nso: 'Sepedi', ts: 'Xitsonga', ss: 'Siswati',
  };

  const systemPrompt = `You are Mpumi, an AI educational assistant for UCAG — the University Course Advisory Guide for the University of Mpumalanga (UMP). You help Grade 12 learners across Mpumalanga with:
- APS calculation and what their score means
- UMP admission requirements for specific courses
- Career guidance and job prospects
- Bursary and NSFAS funding information
- The Adopt-a-Learner mentorship programme
- General university application process
- UMP campus life and resources

The learner's current APS score is ${apsScore}.

RULES:
1. Always respond in ${langName[language]}.
2. Be warm, supportive, and encouraging — many users are first-generation university applicants.
3. Be accurate: do not invent APS requirements or bursary amounts. If unsure, say so.
4. Keep responses concise (under 150 words) unless a detailed explanation is clearly needed.
5. Never claim to be human. You are Mpumi, an AI assistant.
6. If asked about topics outside education, gently redirect to your area of expertise.`;

  const contents = [
    ...history.map(h => ({
      role: h.role === 'assistant' ? 'model' : 'user' as 'user' | 'model',
      parts: [{ text: h.content }],
    })),
    { role: 'user' as const, parts: [{ text: userMessage }] },
  ];

  const response = await ai.models.generateContent({
    model: MODEL,
    config: { systemInstruction: systemPrompt },
    contents,
  });

  return response.text ?? '';
}
