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
    bursaries: "Bursary",
    programmes: "Programme Explorer",
    profile: "My Profile",
    ump: "UMP",
  },
  ump: {
    navLabel: "UMP",
    hubPageTitle: "University of Mpumalanga",
    hubPageSubtitle:
      "Explore verified programmes, entry requirements, and application dates for the University of Mpumalanga — Mpumalanga's own university, right in the heart of the province.",
    programmesPageTitle: "UMP Programmes",
    programmesPageSubtitle:
      "All verified undergraduate programmes offered at the University of Mpumalanga. Filter by faculty or field of study, then check your APS in the calculator.",
    filterAllFaculties: "All Faculties",
    filterAllQualifications: "All Qualifications",
    filterAllFields: "All Fields",
    noResults: "No programmes match your current filters.",
    facultiesHeading: "Faculties & Schools",
    applyHeading: "How to apply",
    applyBody:
      "Applications to UMP are submitted online through the UMP Student Application Portal. The portal opens annually — check the application window status below for current dates.",
    applyCtaLabel: "Apply via UMP Portal",
    keyFactsHeading: "At a glance",
    programmeCountLabel: "Verified programmes",
    facultyCountLabel: "Faculties",
    provinceLabel: "Province",
    typeLabel: "Institution type",
    unverifiedNote:
      "Some details are still being verified. Always confirm requirements on the official UMP website before applying.",
  },
  footer: {
    about:
      "UCAG helps South African learners work out their real APS and find university programmes, bursaries, and internships they genuinely qualify for -- everything on this site is either independently verified against a primary source, or clearly labelled as not yet confirmed.",
    linksHeading: "Site",
    aboutHeading: "About this site",
    verificationNote: "Every fact on this site links to the primary source it was verified against.",
    copyright: "University Course Application Guide (UCAG). Not affiliated with any university, government department, or the Department of Basic Education.",
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
    pageSubtitle: "Real, independently verified funding and work opportunities for South African learners -- filter by field of study to find what applies to you.",
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
    scamShieldTitle: "Every listing here is already screened",
    scamShieldBody:
      "Beyond checking the signs above yourself: every bursary submitted to UCAG is automatically screened for scam patterns before it's ever added -- a keyword check for common scam phrasing, plus a machine-learning model trained to catch scam wording that doesn't match an exact phrase (e.g. \"a quick refundable fee\" instead of \"registration fee\"). Nothing that fails this check is shown on this page.",
  },
  programmes: {
    pageTitle: "Programme Explorer",
    pageSubtitle: "Search and filter verified degree, diploma, and certificate programmes across every institution on UCAG -- then check your APS against any one of them.",
    filterInstitutionLabel: "Institution",
    filterAllInstitutions: "All institutions",
    filterQualificationLabel: "Qualification",
    filterAllQualifications: "All qualifications",
    filterFieldLabel: "Field of study",
    filterAllFields: "All fields",
    searchLabel: "Search",
    searchPlaceholder: "Search programmes by name...",
    noResults: "No programmes match your filters right now.",
  },
  account: {
    pageTitle: "My Profile",
    pageSubtitle: "Your saved marks and shortlist, kept private to your account -- signing in is optional, the calculator works fully without one.",
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
    profileHeading: "Your learner profile",
    profileIntro: "Choose the institution you want UCAG to keep at the centre of your journey. This is the only extra profile detail UCAG needs.",
    editProfileButton: "Edit profile",
    saveProfileButton: "Save profile",
    savingProfileButton: "Saving...",
    cancelEditButton: "Cancel",
    profileSaved: "Profile updated.",
    institutionLabel: "Institution",
    institutionPlaceholder: "Choose your institution",
    institutionRequired: "Choose an institution before creating your account.",
    institutionMissing: "Choose an institution to complete your profile.",
    checkingAuth: "Checking your account...",
    authUnavailable: "Accounts aren't available on this deployment right now. The calculator and public information pages still work without an account.",
    recentLoginRequired: "For your security, please sign out and sign in again before deleting your account.",
    stashedMarksNotice: "Your subject marks from the APS Calculator are now saved to your profile.",
    savedMarksHeading: "My saved marks",
    savedMarksIntro: "Your latest saved NSC marks follow you across your UCAG sessions.",
    savedMarksEmpty: "No marks saved yet. Use the calculator first.",
    shortlistHeading: "My shortlist",
    shortlistIntro: "Programmes you saved while comparing your options.",
    shortlistEmpty: "Nothing shortlisted yet. Browse programmes and choose Shortlist.",
    openCalculatorButton: "Open calculator",
    adminHeading: "Admin",
    adminPortalButton: "Open admin portal",
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
        body: "Your email address (or Google account), the institution you choose for your UCAG journey, the subject marks you choose to save, and a shortlist of programmes you're interested in. We don't ask for your ID number or home address. If a piece of information isn't needed to support your university-planning journey, we don't ask for it.",
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
      {
        heading: "The chat assistant",
        body: "Messages you send to the UCAG Assistant are sent to Google's Gemini API to generate a reply and are not stored by UCAG. Don't share personal details you wouldn't want processed by a third-party AI service. The assistant can help you understand APS and this site -- it never provides institution-specific requirements or dates; those always come from the calculator's verified, sourced results.",
      },
    ],
  },
  chat: {
    assistantName: "UCAG Assistant",
    openButtonLabel: "Open chat assistant",
    closeButtonLabel: "Close chat assistant",
    aiDisclosureBadge: "AI",
    disclaimer: "AI-generated answers. Uses our verified records where it can -- always check the calculator for a specific programme's requirements.",
    inputPlaceholder: "Ask about APS, bursaries, high school, or how this site works...",
    sendButtonLabel: "Send",
    thinkingIndicator: "Thinking...",
    greeting:
      "Hi! Ask me about APS, universities, bursaries, internships, matric, or anything education-related. I'll use our verified records where I can, and always say so when I can't confirm something -- for a specific programme's exact requirements, the calculator above is the source of truth.",
    genericError: "Something went wrong -- please try again.",
    rateLimitedError: "You've sent a lot of messages -- wait a bit before sending another.",
    notConfiguredError: "The chat assistant isn't available right now.",
  },
} as const;
