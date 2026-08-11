import { NextResponse } from "next/server";
import { generateLocalQuiz } from "@/lib/ai/studymate/quizGenerator";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { subjectCode: string; topic: string; difficulty?: "easy" | "medium" | "hard" };
    if (!body.subjectCode || !body.topic) {
      return NextResponse.json({ error: "subjectCode and topic are required" }, { status: 400 });
    }

    const quiz = generateLocalQuiz(body.subjectCode, body.topic, body.difficulty ?? "medium");
    return NextResponse.json(quiz);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to generate quiz" }, { status: 500 });
  }
}
