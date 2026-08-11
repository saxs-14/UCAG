import { NextResponse } from "next/server";
import { generateTutorResponse } from "@/lib/ai/studymate/tutor";
import type { TutorMessage } from "@/lib/studymate/types";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { userQuery: string; history?: TutorMessage[]; subjectCode?: string };
    if (!body.userQuery || typeof body.userQuery !== "string") {
      return NextResponse.json({ error: "userQuery string is required" }, { status: 400 });
    }

    const reply = generateTutorResponse(
      body.userQuery,
      body.history ?? [],
      body.subjectCode ?? "MATH"
    );
    return NextResponse.json(reply);
  } catch {
    return NextResponse.json({ error: "Failed to generate tutor reply" }, { status: 500 });
  }
}
