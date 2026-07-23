/**
 * Every user-facing string, in one place. Per docs/MASTER_PROMPT_v2.md
 * sect. 0.3 ("config over hardcode") -- no component should have a
 * hardcoded English string. This file is seeded with the strings needed
 * so far; Phases 2/3/6 will extend it (subject form, result cards, POPIA
 * consent copy) rather than hardcoding inline.
 */

export const LABELS = {
  app: {
    name: "UCAG",
    fullName: "University Course Application Guide",
    tagline: "Find out what you qualify for -- verified, not guessed.",
  },
  nav: {
    calculator: "APS Calculator",
    bursaries: "Bursaries & Internships",
    statistics: "Statistics",
    profile: "My Profile",
  },
  verification: {
    verifiedOn: "Verified {date} · Source: {source}",
    datesBeingVerified: "Dates being verified",
    apsRulesBeingVerified: "APS rules being verified for this institution",
    comingSoon: "Coming soon -- not yet verified for this institution",
  },
  applicationStatus: {
    open: "Applications open",
    openingSoon: "Opening {date}",
    closed: "Applications closed",
    closedStatusCheckCta: "Check your application status",
    unknown: "Dates being verified",
  },
  resultBuckets: {
    qualify: "You qualify",
    almostQualify: "Almost -- here's the gap",
    notYet: "Not yet -- here's your next step",
  },
} as const;
