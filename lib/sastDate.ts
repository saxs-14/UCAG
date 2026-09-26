/**
 * South Africa has one timezone, no daylight saving (SAST, UTC+2, fixed
 * year-round) -- see config/ingestion.ts's own comment for the same fact.
 * That makes this a plain fixed-offset calculation, no IANA timezone
 * database or ICU dependency needed.
 *
 * The bug this exists to prevent: `new Date("2026-11-30")` parses a
 * date-only string as UTC midnight, which is 02:00 SAST -- so comparing
 * it directly against a real `now` instant (as lib/applicationStatus.ts
 * and lib/ingestion/bursarySafety.ts both do, to decide whether an
 * application window or bursary listing is still open) treats a
 * closing date as already over for essentially the entire actual
 * closing day in South African local time. A learner reading "closes 30
 * November 2026" and applying at 3pm SAST that day would see the
 * application marked closed. Per CLAUDE.md's core rule, a wrong
 * closing date is exactly the failure mode this whole product exists to
 * prevent -- this is a correctness fix, not a style preference.
 */

const SAST_OFFSET_MS = 2 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * The instant a date string should be treated as "starting" -- SAST
 * midnight for a bare date-only string ("2026-06-01" means "opens from
 * the start of 1 June, South African time"). A string that already
 * carries its own time/offset is trusted as-is and returned unchanged.
 */
export function parseSastDayStart(dateStr: string): number {
  if (DATE_ONLY_PATTERN.test(dateStr)) {
    return new Date(dateStr).getTime() - SAST_OFFSET_MS;
  }
  return new Date(dateStr).getTime();
}

/**
 * The instant a date string should be treated as "ending" -- the last
 * millisecond of that SAST calendar day for a bare date-only string
 * ("2026-11-30" means "open through the end of 30 November, South
 * African time"). A string that already carries its own time/offset is
 * trusted as-is and returned unchanged.
 */
export function parseSastDayEnd(dateStr: string): number {
  if (DATE_ONLY_PATTERN.test(dateStr)) {
    return parseSastDayStart(dateStr) + DAY_MS - 1;
  }
  return new Date(dateStr).getTime();
}
