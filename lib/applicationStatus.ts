/**
 * Pure TypeScript, same discipline as lib/aps and lib/matching. Decides
 * what a result card's application-status button should say and do --
 * per docs/MASTER_PROMPT_v2.md sect. 3, this is a trust-critical piece of
 * UI logic: a closed application must NEVER show an apply link, and an
 * unknown status must NEVER be presented as "open" or "closed" by guessing.
 */

import type { ApplicationWindow, ApplicationWindowStatus } from "@/lib/firestore/types";

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
  const opensTime = window.opensOn ? new Date(window.opensOn).getTime() : null;
  const closesTime = window.closesOn ? new Date(window.closesOn).getTime() : null;
  const lateClosesTime = window.lateClosesOn ? new Date(window.lateClosesOn).getTime() : null;
  const effectiveCloseTime = lateClosesTime ?? closesTime;

  if (opensTime !== null && nowTime < opensTime) return "openingSoon";
  if (effectiveCloseTime !== null && nowTime > effectiveCloseTime) return "closed";
  if (opensTime !== null && nowTime >= opensTime) return "open";

  return "unknown";
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
