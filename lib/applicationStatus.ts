/**
 * Pure TypeScript, same discipline as lib/aps and lib/matching. Decides
 * what a result card's application-status button should say and do --
 * per docs/MASTER_PROMPT_v2.md sect. 3, this is a trust-critical piece of
 * UI logic: a closed application must NEVER show an apply link, and an
 * unknown status must NEVER be presented as "open" or "closed" by guessing.
 */

import type { ApplicationWindow, ApplicationWindowStatus } from "@/lib/firestore/types";
import { parseSastDayEnd, parseSastDayStart } from "@/lib/sastDate";

/**
 * Cross-checks/derives status from raw dates. In production the
 * `status` field on ApplicationWindow is set by the Phase 4 ingestion
 * pipeline (which may have out-of-band knowledge, e.g. an announced
 * early closure) -- this function is what the UI falls back to when
 * dates are the only signal available, and is also useful for tests.
 */
export function deriveApplicationWindowStatus(
  window: Pick<ApplicationWindow, "opensOn" | "closesOn" | "lateClosesOn">,
  now: Date
): ApplicationWindowStatus {
  if (!window.opensOn && !window.closesOn) return "unknown";

  const nowTime = now.getTime();
  const opensTime = window.opensOn ? parseSastDayStart(window.opensOn) : null;
  const closesTime = window.closesOn ? parseSastDayEnd(window.closesOn) : null;
  const lateClosesTime = window.lateClosesOn ? parseSastDayEnd(window.lateClosesOn) : null;
  const effectiveCloseTime = lateClosesTime ?? closesTime;

  if (opensTime !== null && nowTime < opensTime) return "openingSoon";
  if (effectiveCloseTime !== null && nowTime > effectiveCloseTime) return "closed";
  if (opensTime !== null && nowTime >= opensTime) return "open";

  return "unknown";
}

/**
 * The real entry point every caller should use instead of reaching for
 * `window.status` directly. Found 2026-11-01: every seed file sets
 * `status: "open"` unconditionally (including on windows whose own
 * closesOn date has long since passed), and three call sites each did
 * `window?.status ?? deriveApplicationWindowStatus(...)` -- since
 * status was always a defined string, the date-derived fallback never
 * ran, so a programme could show "Apply now" months after its own
 * recorded deadline. "Closed" is the one status that must never lose
 * to the other signal: a stored "closed" can legitimately override
 * dates (an announced early closure, per this file's original
 * doc comment), and a date-derived "closed" must always override a
 * stale/stored "open" -- showing an apply link past a real deadline is
 * the harmful direction; failing to show one a day early is not.
 */
export function resolveEffectiveApplicationWindowStatus(
  window: Pick<ApplicationWindow, "status" | "opensOn" | "closesOn" | "lateClosesOn"> | null | undefined,
  now: Date
): ApplicationWindowStatus {
  if (!window) return "unknown";
  const derived = deriveApplicationWindowStatus(window, now);
  if (window.status === "closed" || derived === "closed") return "closed";
  if (window.opensOn || window.closesOn) return derived;
  return window.status ?? "unknown";
}

export type ApplicationCta =
  | { kind: "apply"; label: string; url: string }
  | { kind: "openingSoon"; label: string; opensOn: string }
  | { kind: "statusCheck"; label: string; url: string | null }
  | { kind: "datesBeingVerified"; label: string; url: string | null };

/**
 * The one function that decides whether an apply link is shown. Closed
 * NEVER returns an "apply" CTA, even if applyUrl is set on the programme
 * -- that's the whole point of this function existing instead of the UI
 * just checking `if (applyUrl) show apply button`.
 */
export function resolveApplicationCta(
  status: ApplicationWindowStatus,
  urls: { applyUrl: string | null; statusCheckUrl: string | null; websiteUrl: string },
  opensOn: string | null
): ApplicationCta {
  switch (status) {
    case "open":
      if (urls.applyUrl) {
        return { kind: "apply", label: "Apply now", url: urls.applyUrl };
      }
      // Open but no apply URL on record is a data gap, not a reason to
      // fabricate a link -- fall through to "verify on the institution's site."
      return {
        kind: "datesBeingVerified",
        label: "Applications open -- visit the institution's site",
        url: urls.websiteUrl,
      };
    case "openingSoon":
      return {
        kind: "openingSoon",
        label: opensOn ? `Opening ${opensOn}` : "Opening soon",
        opensOn: opensOn ?? "",
      };
    case "closed":
      return {
        kind: "statusCheck",
        label: "Check your application status",
        url: urls.statusCheckUrl,
      };
    case "unknown":
      return {
        kind: "datesBeingVerified",
        label: "Dates being verified",
        url: urls.websiteUrl,
      };
  }
}
