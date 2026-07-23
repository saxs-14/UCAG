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
  bursaries: {
    pageTitle: "Bursaries & Internships",
    bursariesHeading: "Bursaries",
    internshipsHeading: "Internships",
    fieldOfStudyFilterLabel: "Field of study",
    allFields: "All fields",
    levelFilterLabel: "Level",
    allLevels: "All levels",
    levelMatricOnly: "Matric only",
    levelCurrentlyEnrolled: "Currently enrolled",
    levelCompletedQualification: "Completed a qualification",
    matricOnlyFilterLabel: "Matric-only internships",
    matricOnlyAll: "All internships",
    matricOnlyTrue: "Matric-only only",
    matricOnlyFalse: "Requires enrolment/qualification",
    noResults: "No listings match your filters right now.",
    scamExplainerTitle: "How to spot a bursary scam",
    scamExplainerIntro:
      "Bursary scams targeting school-leavers are real and common in South Africa. Before you apply anywhere, check for these warning signs:",
    scamWarningSigns: [
      "Asks you to pay a \"registration\", \"processing\", or \"admin\" fee before you can apply -- legitimate bursaries never charge you to apply.",
      "Only exists as a WhatsApp forward or social media post, with no official provider website you can independently verify.",
      "Pressures you to \"apply now before it's too late\" with no clear closing date.",
      "Asks for banking details, your ID document, or a payment before confirming you've actually been awarded anything.",
    ],
    scamExplainerOutro:
      "Every listing on this page shows its real provider and a source link -- click through and verify independently before you apply.",
  },
  statistics: {
    pageTitle: "Statistics",
    higherEducationHeading: "Higher Education",
    schoolsHeading: "Schools",
    pendingVerification: "Data pending verification",
    downloadCsv: "Download as CSV",
    sourceLine: "Source: {publisher} · {year} · Verified {date}",
  },
} as const;
