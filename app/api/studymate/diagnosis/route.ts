import { NextResponse } from "next/server";
import { generateLocalDiagnosis } from "@/lib/ai/studymate/studyDiagnosis";
import type { StudentStudyProfile } from "@/lib/studymate/types";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { profile: StudentStudyProfile };
    if (!body.profile || !Array.isArray(body.profile.subjects)) {
      return NextResponse.json({ error: "Invalid profile payload" }, { status: 400 });
    }

    const diagnosis = generateLocalDiagnosis(body.profile);
    return NextResponse.json(diagnosis);
  } catch {
    return NextResponse.json({ error: "Failed to generate diagnosis" }, { status: 500 });
  }
}
