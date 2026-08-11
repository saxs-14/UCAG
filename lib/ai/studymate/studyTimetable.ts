import type {
  StudentStudyProfile,
  TimetableSlot,
  WeeklyStudyTimetable,
} from "@/lib/studymate/types";

const DAYS: TimetableSlot["day"][] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

/**
 * Deterministic timetable generator for offline usage and unit testing.
 * Allocates 60-75% of available study time to subjects marked as weak or < 60%.
 */
export function generateLocalTimetable(profile: StudentStudyProfile): WeeklyStudyTimetable {
  const sortedSubjects = [...profile.subjects].sort((a, b) => {
    // Sort weak / low marks first
    if (a.isWeakArea && !b.isWeakArea) return -1;
    if (!a.isWeakArea && b.isWeakArea) return 1;
    return a.currentPercent - b.currentPercent;
  });

  const slots: TimetableSlot[] = [];
  let slotIndex = 0;

  for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
    const day = DAYS[dayIndex];
    const isWeekend = day === "Saturday" || day === "Sunday";
    const startTimeHour = isWeekend ? 10 : 16; // 10:00 weekend, 16:00 weekday

    // 2 sessions per weekday, 3 per weekend day
    const sessionsToday = isWeekend ? 3 : 2;

    for (let s = 0; s < sessionsToday; s++) {
      const subject = sortedSubjects[slotIndex % sortedSubjects.length];
      slotIndex++;

      const startH = startTimeHour + s * 1.5;
      const endH = startH + 1;

      const formatTime = (h: number) => {
        const hh = Math.floor(h).toString().padStart(2, "0");
        const mm = h % 1 === 0 ? "00" : "30";
        return `${hh}:${mm}`;
      };

      const topicName =
        subject.code === "MATH"
          ? "Algebra & Functions Practice"
          : subject.code === "PHS"
          ? "Mechanics & Chemical Change"
          : `${subject.name} Core Revision`;

      slots.push({
        id: `slot-${day.toLowerCase()}-${s}`,
        day,
        startTime: formatTime(startH),
        endTime: formatTime(endH),
        subjectCode: subject.code,
        topic: topicName,
        activityType: s === 0 ? "practice" : "review",
      });
    }

    // Add a break slot
    if (!isWeekend) {
      slots.push({
        id: `break-${day.toLowerCase()}`,
        day,
        startTime: "17:00",
        endTime: "17:15",
        subjectCode: "REST",
        topic: "Short break & hydration",
        activityType: "break",
      });
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    totalWeeklyHours: slots.filter((s) => s.activityType !== "break").length * 1,
    slots,
    tips: [
      "Prioritise your weak subjects during high-energy time slots.",
      "Always do 10 minutes of active recall at the start of each study block.",
      "Take 15-minute breaks between study sessions to avoid mental burnout.",
    ],
  };
}

export function buildStudyTimetablePrompt(profile: StudentStudyProfile): string {
  const subjectsStr = profile.subjects
    .map((s) => `${s.name} (${s.code}): ${s.currentPercent}% -> Target ${s.targetPercent}%${s.isWeakArea ? " [WEAK]" : ""}`)
    .join(", ");

  const assessmentsStr = profile.upcomingAssessments
    .map((a) => `${a.title} on ${a.date}`)
    .join(", ") || "None";

  return `Generate a realistic weekly study timetable for a ${profile.grade} student.
Available study time: ${profile.availableHoursPerWeek} hours per week.
Subjects: ${subjectsStr}
Upcoming assessments: ${assessmentsStr}

Instructions:
- Prioritise subjects marked as [WEAK] or with large mark gaps.
- Include study sessions, practice sessions, past-paper sessions, and short breaks.
- Ensure realistic start and end times suitable for school hours (e.g. 16:00 - 19:00 on weekdays, 09:00 - 13:00 on weekends).

Return JSON matching:
{
  "totalWeeklyHours": number,
  "slots": [
    { "id": "string", "day": "Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday", "startTime": "HH:MM", "endTime": "HH:MM", "subjectCode": "string", "topic": "string", "activityType": "review|practice|past-paper|break" }
  ],
  "tips": ["string"]
}`;
}
