import type { MatchResult } from "@/lib/matching/types";
import type { Programme, ApplicationWindow } from "@/lib/firestore/types";
import type { WeeklyStudyTimetable } from "@/lib/studymate/types";

/**
 * WhatsApp Integration Service Boundaries.
 * Formats UCAG & StudyMate data into clean, structured WhatsApp text payloads
 * for multi-channel learner communication.
 */

export function formatWhatsAppApsMessage(totalAps: number, qualifyingCount: number): string {
  return `🎓 *UCAG APS Result* 🎓\n\nYour calculated Admission Point Score (APS) is: *${totalAps}*\n\nYou currently qualify for *${qualifyingCount} verified programme(s)* at UMP!\n\nView details: https://ucag.ac.za/ump/programmes`;
}

export function formatWhatsAppRecommendationsMessage(
  scoredProgrammes: { programme: Programme; matchResult: MatchResult }[]
): string {
  const qualifying = scoredProgrammes.filter((p) => p.matchResult.bucket === "qualify");
  if (qualifying.length === 0) {
    return `📚 *UCAG Programme Match* 📚\n\nNo exact matches found for your current marks. Check backup options and upgrade paths on UCAG:\nhttps://ucag.ac.za/ump/programmes`;
  }

  const top3 = qualifying.slice(0, 3).map((p, idx) => `${idx + 1}. *${p.programme.name}* (Min APS: ${p.programme.minAps ?? "N/A"})`).join("\n");

  return `📚 *UCAG Recommended Programmes* 📚\n\nBased on your marks, here are your top matches:\n\n${top3}\n\nApply now: https://ucag.ac.za/ump/programmes`;
}

export function formatWhatsAppTimetableReminder(timetable: WeeklyStudyTimetable, day: string): string {
  const daySlots = timetable.slots.filter((s) => s.day === day && s.activityType !== "break");
  if (daySlots.length === 0) {
    return `📅 *VarsityPath AI Daily Reminder* 📅\n\nNo scheduled study sessions for ${day}. Enjoy your rest day! 🌟`;
  }

  const scheduleText = daySlots.map((s) => `• *${s.startTime}-${s.endTime}*: ${s.subjectCode} (${s.topic})`).join("\n");

  return `📅 *VarsityPath AI Schedule for ${day}* 📅\n\n${scheduleText}\n\nGood luck with your revision today! 🚀`;
}

export function formatWhatsAppApplicationAlert(window: ApplicationWindow): string {
  return `⏰ *UMP Application Window Alert* ⏰\n\nStatus: *${window.status.toUpperCase()}*\nCloses on: *${window.closesOn}*\nLate closing: *${window.lateClosesOn ?? "N/A"}*\n\nDon't miss out! Complete your application:\nhttps://www.ump.ac.za/Study-with-us/Application-Process/Online-Applications`;
}
