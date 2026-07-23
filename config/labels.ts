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
  account: {
    pageTitle: "My Profile",
    optionalNote: "An account is optional -- the calculator works fully without one.",
    signUpHeading: "Create an account",
    signInHeading: "Sign in",
    switchToSignIn: "Already have an account? Sign in",
    switchToSignUp: "New here? Create an account",
    ageGateQuestion: "Are you 18 or older?",
    ageGateYes: "Yes, I'm 18 or older",
    ageGateNo: "No, I'm under 18",
    guardianConsentHeading: "We need a parent or guardian's consent",
    guardianConsentIntro:
      "Because you're under 18, South African privacy law (POPIA) means a parent or guardian needs to agree before you can create an account. Ask them to fill this in with you.",
    guardianNameLabel: "Parent/guardian name",
    guardianEmailLabel: "Parent/guardian email",
    guardianConsentCheckbox:
      "I am this learner's parent or guardian and I agree to their account being created.",
    guardianConsentSubmit: "Continue",
    emailLabel: "Email",
    passwordLabel: "Password",
    createAccountButton: "Create account",
    signInButton: "Sign in",
    googleButton: "Continue with Google",
    signOutButton: "Sign out",
    downloadDataButton: "Download my data",
    deleteAccountButton: "Delete my account",
    deleteAccountConfirm:
      "This deletes your account and everything saved to it -- your marks, shortlist, and consent record. This can't be undone. Are you sure?",
    deleteAccountConfirmButton: "Yes, delete my account",
    deleteAccountCancelButton: "Cancel",
    shortlistHeading: "My shortlist",
    shortlistEmpty: "Nothing shortlisted yet.",
    savedMarksHeading: "My saved marks",
    savedMarksEmpty: "No marks saved yet.",
    privacyNoticeLink: "Privacy notice",
  },
  privacy: {
    pageTitle: "Privacy Notice",
    intro:
      "This page explains what UCAG does with your information, in plain language -- not legal jargon. If anything here doesn't make sense, ask a parent, guardian, or teacher, or contact us using the details at the bottom.",
    sections: [
      {
        heading: "You don't need an account to use the calculator",
        body: "Entering your subjects and marks to see what you qualify for doesn't require signing up. Nothing you type into the calculator is saved anywhere unless you create an account.",
      },
      {
        heading: "What we collect if you do create an account",
        body: "Just your email address (or Google account), the subject marks you choose to save, and a shortlist of programmes you're interested in. That's it -- we don't ask for your ID number, your home address, or your surname unless it's part of your email address. If a piece of information isn't needed to calculate your APS or show you results, we don't ask for it.",
      },
      {
        heading: "Why we collect it",
        body: "So you can come back later without re-entering your marks, and so you can keep a shortlist of programmes you're considering. Nothing you save is used for anything except showing it back to you.",
      },
      {
        heading: "If you're under 18",
        body: "South African law (POPIA) says a parent or guardian needs to agree before we can create an account for someone under 18. That's why the sign-up process asks a parent or guardian to confirm they're okay with it, and we keep a record of that -- who agreed, and when.",
      },
      {
        heading: "Who can see your information",
        body: "Only you, when you're signed in. If you're under 18, the parent or guardian who gave consent for your account can be told that consent is on record, but they don't automatically get to see your saved marks or shortlist.",
      },
      {
        heading: "How long we keep it",
        body: "For as long as your account exists. If you delete your account, your saved marks, shortlist, and consent record are deleted with it -- not archived, not kept 'just in case.'",
      },
      {
        heading: "Your rights",
        body: "You can download everything we have stored about you at any time (see 'Download my data' on your account page), and you can delete your account at any time (see 'Delete my account'). Both work immediately -- neither is a support ticket you have to wait on.",
      },
      {
        heading: "Questions or concerns",
        body: "If something about how UCAG handles your information doesn't sit right with you, that's worth raising -- contact details go here once the project has a real support channel set up.",
      },
    ],
  },
} as const;
