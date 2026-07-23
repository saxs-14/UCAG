/** Deadline countdown -- "on every card" per docs/MASTER_PROMPT_v2.md
 * Phase 5. Compares calendar days (UTC midnight to UTC midnight), not
 * raw millisecond difference -- a naive `Math.ceil(diffMs / dayMs)`
 * bumps anything later today into "tomorrow" (e.g. now=00:00,
 * closes=12:00 same day -> 0.5 days -> ceil -> 1 -> wrongly "tomorrow"). */
export function daysUntil(closesOn: string | null, now: Date): number | null {
  if (!closesOn) return null;

  const closesDate = new Date(closesOn);
  const startOfToday = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const startOfClosingDay = Date.UTC(
    closesDate.getUTCFullYear(),
    closesDate.getUTCMonth(),
    closesDate.getUTCDate()
  );

  return Math.round((startOfClosingDay - startOfToday) / (1000 * 60 * 60 * 24));
}

export function formatDeadlineCountdown(closesOn: string | null, now: Date): string {
  const days = daysUntil(closesOn, now);
  if (days === null) return "No closing date on record";
  if (days < 0) return "Closed";
  if (days === 0) return "Closes today";
  if (days === 1) return "Closes tomorrow";
  return `${days} days left`;
}
