import { NextResponse } from "next/server";
import { generateLocalTimetable } from "@/lib/ai/studymate/studyTimetable";
import type { StudentStudyProfile } from "@/lib/studymate/types";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { profile: StudentStudyProfile };
    if (!body.profile || !Array.isArray(body.profile.subjects)) {
      return NextResponse.json({ error: "Invalid profile payload" }, { status: 400 });
    }

    const timetable = generateLocalTimetable(body.profile);
    return NextResponse.json(timetable);
  } catch {
    return NextResponse.json({ error: "Failed to generate timetable" }, { status: 500 });
  }
}
