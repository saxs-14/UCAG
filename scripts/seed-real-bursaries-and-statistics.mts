#!/usr/bin/env -S npx tsx
/**
 * Real, individually-verified bursary, internship, and statistics data,
 * replacing config/sampleData.ts's fictional SAMPLE_BURSARIES/
 * SAMPLE_INTERNSHIPS/SAMPLE_STATISTICS on the Bursaries and Statistics
 * pages. Every value below was independently fetched from a real page
 * (WebFetch/WebSearch, not memory) before being written here -- see each
 * entry's sourceUrl.
 *
 * fieldsOfStudy is deliberately specific per bursary/internship, not a
 * generic list -- the whole point of the field-of-study filter
 * (components/bursaries/BursariesPage.tsx) is to show a learner only
 * what's actually relevant to the course/career they're asking about,
 * not everything with the field ignored. NSFAS is the one deliberate
 * exception: it genuinely funds any recognised qualification, so it's
 * tagged across every field rather than under-representing its real
 * scope.
 *
 * Internship listings are a harder case than bursary programmes: a
 * bursary is a stable annual programme with a shifting deadline; a
 * specific internship posting (e.g. Eskom's individual YES vacancies)
 * opens and closes within weeks and goes stale fast. One was confirmed
 * live via eskom.co.za's own recruitment site, then found already
 * expired/redirected by the time this was written. Rather than publish a
 * posting that may already be gone, every internship entry below is a
 * stable underlying *programme* on the provider's own domain (YES,
 * Standard Bank's early-careers internships, the National Department of
 * Health's Internship and Community Service Programme, Transnet's
 * Engineers in Training), not a single dated vacancy.
 *
 * Both pages are DESIGNED to show "pending verification" / an empty
 * state for anything not on record here -- that's the correct, honest
 * outcome for everything not covered below, not a bug to paper over.
 *
 * Usage (against the local emulator):
 *   NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true npx tsx scripts/seed-real-bursaries-and-statistics.mts
 */

import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import type { Bursary, Internship, Statistic } from "../lib/firestore/types";

const useEmulator = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true";

if (getApps().length === 0) {
  if (useEmulator) {
    process.env.FIRESTORE_EMULATOR_HOST ??= "127.0.0.1:8080";
    initializeApp({ projectId: "demo-ucag" });
  } else {
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
    if (!projectId || !clientEmail || !privateKey) {
      console.error("Missing Firebase Admin env vars and NEXT_PUBLIC_USE_FIREBASE_EMULATOR is not set.");
      process.exit(1);
    }
    initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  }
}

const db = getFirestore();
const ACADEMIC_YEAR = 2027;
const VERIFIED_ON = "2026-07-26";

// --- Bursaries -------------------------------------------------------------
// opensOn/closesOn: null where the real date couldn't be confirmed to
// the day from a primary source -- e.g. Old Mutual's own page states
// only "Applications open from April", never a specific day, so opensOn
// stays null rather than guessing a day within that month. isPastClosingDate()
// treats a null closesOn as "not expired" by design
// (lib/ingestion/bursarySafety.ts), so this shows as a real, open-ended
// listing rather than a guessed date -- never the reverse.
const BURSARIES: Omit<Bursary, "id">[] = [
  {
    name: "NSFAS Bursary",
    provider: "National Student Financial Aid Scheme (NSFAS)",
    fieldsOfStudy: ["Engineering", "Science", "Commerce", "Humanities", "Health Sciences", "Law", "Education", "ICT"],
    levelRequired: "matricOnly",
    opensOn: null,
    closesOn: null,
    value: "Full tuition, accommodation/living allowance, and learning materials (for households earning under R350,000/year, or R600,000/year for students with a disability)",
    criteria: [
      "South African citizen or permanent resident",
      "Combined household income under R350,000/year (R600,000/year if living with a disability)",
      "Admitted to or applying for a public university or TVET college",
    ],
    applyUrl: "https://www.nsfas.org.za/",
    riskFlags: [],
    sourceUrl: "https://www.nsfas.org.za/",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    name: "Sasol Bursary Programme",
    provider: "Sasol",
    fieldsOfStudy: ["Engineering", "Science"],
    levelRequired: "matricOnly",
    opensOn: "2026-04-01",
    closesOn: "2026-05-17",
    value: "Full tuition, living allowance, and psychosocial support",
    criteria: [
      "South African citizen by birth, permanently resident in South Africa",
      "Registering for full-time undergraduate study at a Sasol-approved public university (excluding UNISA)",
      "Mathematics and Physical Science at NSC level 6 (70-79%) for engineering degrees",
      "Covers Chemical/Civil/Electrical/Electronic/Industrial/Mechanical/Mining/Metallurgical Engineering, Chemistry, Geology, Data Science, and Mine Surveying",
    ],
    applyUrl: "https://www.sasolbursaries.com",
    riskFlags: [],
    sourceUrl:
      "https://www.sasol.com/media-centre/media-releases/sasol-bursaries-now-open-applications-invited-for-2027-engineering-and-science-studies",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    name: "Funza Lushaka Bursary",
    provider: "Department of Basic Education (DBE)",
    fieldsOfStudy: ["Education"],
    levelRequired: "matricOnly",
    opensOn: null, // 2026-cycle dates confirmed (opened 7 Oct 2025); 2027-cycle dates not yet posted on the official page.
    closesOn: null,
    value: "Full tuition, accommodation or transport, daily meals, learning materials, and a personal care allowance",
    criteria: [
      "South African citizen, passionate about teaching",
      "Accepted into (or applying for) a Bachelor of Education (B.Ed) or Postgraduate Certificate in Education at a public university",
      "Willing to specialise in priority subjects (Maths, Science, Technology, Engineering, South African indigenous languages, and more)",
      "Recipients commit to teaching in a public school after graduating",
    ],
    applyUrl: "https://www.funzalushaka.doe.gov.za/",
    riskFlags: [],
    sourceUrl: "https://www.education.gov.za/Programmes/FunzaLushaka.aspx",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    name: "Old Mutual Actuarial Bursary",
    provider: "Old Mutual",
    fieldsOfStudy: ["Commerce", "Science"],
    levelRequired: "matricOnly",
    opensOn: null, // official page states only "opens from April", never a specific day
    closesOn: "2026-06-30",
    value: "Full tuition, study materials, meals, residence accommodation, return flights home, and guaranteed employment on graduation",
    criteria: [
      "South African citizen",
      "A for Mathematics (not Mathematical Literacy) and Bs for all other matric subjects",
      "For Actuarial Science at NWU, UCT, Stellenbosch, UP, Wits, UFS, UJ, or UKZN",
    ],
    applyUrl: "https://www.oldmutual.co.za/careers/actuarial-bursary/",
    riskFlags: [],
    sourceUrl: "https://www.oldmutual.co.za/careers/actuarial-bursary/",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    name: "Legal Practitioners Fidelity Fund Bursary",
    provider: "Legal Practitioners Fidelity Fund (LPFF)",
    fieldsOfStudy: ["Law"],
    levelRequired: "currentlyEnrolled",
    opensOn: "2026-04-01", // recurring annual date per LPFF's own page ("applications open 1 April annually")
    closesOn: "2026-08-15", // recurring annual date per LPFF's own page ("applications close 15 August annually")
    value: "Tuition fees for LLB, BCom Law, or BA Law at a public South African university",
    criteria: [
      "2nd or 3rd year LLB student (or equivalent) with an academic average above 50%",
      "Public university students only",
      "LLM/further legal study applicants must hold a completed LLB and be employed at a legal practising firm",
    ],
    applyUrl: "https://www.fidfund.co.za/bursaries/",
    riskFlags: [],
    sourceUrl: "https://www.fidfund.co.za/bursaries/",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },

  // --- ICT & Telecoms ---
  {
    name: "Vodacom External Bursary Programme",
    provider: "Vodacom",
    fieldsOfStudy: ["ICT"],
    levelRequired: "matricOnly",
    opensOn: null, // not stated on Vodacom's own page
    closesOn: null, // aggregators cite 31 August, but Vodacom's own bursary portal requires login to view a date -- not independently confirmed
    value: "Full tuition, registration, accommodation, textbooks, meal allowance, a laptop, a cellphone, and structured vacation work",
    criteria: [
      "South African citizen by birth",
      "Full-time undergraduate study at an SA tertiary institution",
      "Entering 1st-3rd year in 2027",
      "Matric exemption pass with a minimum 70% average (Grade 12 entrants)",
      "Minimum 65% average if already at tertiary level",
    ],
    applyUrl: "https://externalbursary.vodacom.co.za/",
    riskFlags: [],
    sourceUrl: "https://now.vodacom.co.za/brand-with-a-purpose/vodacom-bursary-program/",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    name: "SITA External ICT Bursary",
    provider: "State Information Technology Agency (SITA)",
    fieldsOfStudy: ["ICT"],
    levelRequired: "currentlyEnrolled",
    opensOn: null, // not stated with day-level precision in SITA's own advert
    closesOn: "2026-04-01", // SITA's own PDF advert for the 2026 academic year; a real, recurring annual bursary -- the 2027 advert was not yet published at verification time
    value: "Tuition, prescribed materials, accommodation, meals, allowances, and work-integrated learning",
    criteria: [
      "South African citizen",
      "Registered for 2nd year or above in an accredited ICT qualification (SITA does not fund 1st years)",
      "Minimum 65% average",
      "Not already receiving other bursary funding, and not previously funded by SITA",
    ],
    applyUrl: "https://forms.office.com/r/Fp1D8weqCB",
    riskFlags: [],
    sourceUrl:
      "https://www.sita.co.za/sites/default/files/SITA%20EXTERNAL%20BURSARY%20ADVERT%20(2026%20ACADEMIC%20YEAR).pdf",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    name: "Accenture Education Trust Scholarship",
    provider: "Accenture South Africa",
    fieldsOfStudy: ["ICT"],
    levelRequired: "currentlyEnrolled",
    opensOn: null, // not stated on Accenture's own materials
    closesOn: null, // aggregators disagree on the exact date; not independently confirmed on accenture.com
    value: "Registration, tuition, exam fees, meals, residence, and a book allowance and laptop",
    criteria: [
      "Minimum 65% cumulative average",
      "Family income R350,000-R1,000,000/year (undergraduate) or NSFAS/household income under R300,000/year (postgraduate)",
      "Study at a select South African tertiary institution",
      "2nd-4th year of a technology-aligned degree",
    ],
    applyUrl: "https://www.accenture.com/za-en/careers/jobdetails?id=R00269740_en",
    riskFlags: [],
    sourceUrl: "https://acnmedia.accenture.com/Careers/PDF/Acc-2nd-4th-year-bursary-information-sheet.pdf",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    name: "Telkom Full-Time Bursary Programme",
    provider: "Telkom",
    fieldsOfStudy: ["ICT", "Engineering"],
    levelRequired: "matricOnly",
    opensOn: null, // not confirmed on telkom.co.za directly
    closesOn: null, // same -- aggregator-only claims, not independently confirmed
    value: "Tuition, accommodation, prescribed books, a living allowance, and guaranteed entry into Telkom's graduate pipeline",
    criteria: [
      "Strong Matric results, or a current tertiary student",
      "Study in Electrical Engineering (Light Current), IT/Computer Science, Marketing, or Accounting",
    ],
    applyUrl: "https://group.telkom.co.za/about_us/humancapital/careers/telkom-graduates.html",
    riskFlags: [],
    sourceUrl: "https://group.telkom.co.za/about_us/humancapital/careers/telkom-graduates.html",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },

  // --- Accounting, Finance, Banking & Actuarial ---
  {
    name: "SAICA Thuthuka Bursary Fund",
    provider: "South African Institute of Chartered Accountants (SAICA)",
    fieldsOfStudy: ["Commerce"],
    levelRequired: "matricOnly",
    opensOn: null, // not stated on SAICA's own page
    closesOn: null, // third-party sites claim a date via the Thuthuka portal, not independently confirmed by fetching that portal directly
    value: "Tuition, books, meals, residence fees, accommodation, and academic/mentorship support",
    criteria: [
      "South African citizen",
      "Black African or Coloured",
      "Combined family income under R350,000/year",
      "Minimum 60% for Mathematics in Grade 11",
      "Must write the National Benchmark Tests (NBTs)",
      "Applying to a Thuthuka partner university",
    ],
    applyUrl: "https://www.thuthukabursaryfund.co.za",
    riskFlags: [],
    sourceUrl: "https://www.saica.org.za/initiatives/thuthuka/apply-to-the-thuthuka-bursary-fund/",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    name: "PwC CA Programme Bursary",
    provider: "PwC South Africa",
    fieldsOfStudy: ["Commerce"],
    levelRequired: "matricOnly",
    opensOn: null,
    closesOn: "2026-08-31", // stated explicitly on PwC's own recruitment portal
    value: "Tuition, accommodation, prescribed textbooks, a living allowance, mentorship, vacation work, and a path to a SAICA training contract",
    criteria: [
      "Mathematics (not Mathematical Literacy) with a minimum B symbol",
      "Grade 12: 75% overall average",
      "University: 70% (1st/2nd year) or 65% (3rd/4th year)",
      "South African citizen or permanent resident",
      "Study at a SAICA-accredited university",
    ],
    applyUrl: "https://pwcza-graduate.erecruit.co/candidateapp/Jobs/View/PWC260312-3",
    riskFlags: [],
    sourceUrl: "https://pwcza-graduate.erecruit.co/candidateapp/Jobs/View/PWC260312-3",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    name: "Deloitte Bursary (Financial Contribution Fund)",
    provider: "Deloitte South Africa",
    fieldsOfStudy: ["Commerce"],
    levelRequired: "matricOnly",
    opensOn: "2026-06-01", // stated on Deloitte's own page for the undergraduate funding window
    closesOn: "2026-09-30",
    value: "Tuition and prescribed books, plus a capped accommodation contribution",
    criteria: [
      "South African or Namibian citizen",
      "Matric pass in Mathematics",
      "Study a SAICA-accredited CA(SA) degree",
      "Must first secure a Deloitte Training Contract before applying for this funding",
    ],
    applyUrl: "https://www.joindeloitte.co.za/Account/Register",
    riskFlags: [],
    sourceUrl: "https://www.deloitte.com/za/en/careers/explore-your-fit/students/financial-contribution.html",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    name: "EY Bursary Programme",
    provider: "EY (Ernst & Young) South Africa",
    fieldsOfStudy: ["Commerce"],
    levelRequired: "matricOnly",
    opensOn: "2026-07-01", // stated on EY's own page (matric-applicant window; university-applicant window opens 2026-08-01)
    closesOn: "2026-09-30",
    value: "Two tiers: Academic Merit with Financial Need (tuition, accommodation, books, and meals) or Academic Merit (a portion of tuition)",
    criteria: [
      "South African citizen",
      "Committed to the CA(SA) path",
      "Study at a SAICA-accredited university",
      "3-year minimum training-contract work-back obligation",
    ],
    applyUrl: "https://www.ey.com/en_za/careers/apply-for-our-bursary-program",
    riskFlags: [],
    sourceUrl: "https://www.ey.com/en_za/careers/apply-for-our-bursary-program",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    name: "KPMG Bursary Programme",
    provider: "KPMG South Africa",
    fieldsOfStudy: ["Commerce"],
    levelRequired: "matricOnly",
    opensOn: null, // not stated on KPMG's own page
    closesOn: null, // aggregators claim a date, not independently confirmed on kpmg.com
    value: "Pure Merit Bursary or Merit-with-Financial-Need Bursary; tuition/accommodation/books per the individual award letter",
    criteria: [
      "Study a SAICA-recognised full-time degree",
      "Matric: 4 A's, excluding Life Orientation",
      "Sliding academic minimums by year of study (65% down to 50% average)",
      "Must first apply for a KPMG Training Contract",
    ],
    applyUrl: "https://kpmg-students.readyplatform.co.za/Account/Login",
    riskFlags: [],
    sourceUrl: "https://kpmg.com/za/en/careers/graduate-opportunities/bursaries.html",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    name: "Capitec External Bursary Programme (Quantitative Skills)",
    provider: "Capitec Bank",
    fieldsOfStudy: ["Commerce", "Science"],
    levelRequired: "currentlyEnrolled",
    opensOn: null,
    closesOn: "2026-08-12", // stated on Capitec's own official application portal
    value: "Tuition, registration fees, accommodation, textbooks, and a meal allowance",
    criteria: [
      "For Actuarial Science, Mathematics, Statistics, Quantitative Finance/Management, Data Science, or Econometrics",
      "South African citizen",
      "Age 28 or under by 31 December 2026",
      "1st-3rd year of an NQF7+ Bachelor's/Honours degree (not TVET, UNISA, or distance learning)",
      "65% academic average",
      "Work-back obligation or repayment",
    ],
    applyUrl: "https://capitecbursary.auraams.app/Home/Index?applicationTypeId=320",
    riskFlags: [],
    sourceUrl: "https://capitecbursary.auraams.app/Home/Index?applicationTypeId=320",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    name: "Liberty Actuarial Bursary Programme",
    provider: "Liberty Group Limited",
    fieldsOfStudy: ["Commerce", "Science"],
    levelRequired: "currentlyEnrolled",
    opensOn: null,
    closesOn: "2026-08-30", // stated on Liberty's own page
    value: "Tuition, accommodation, meals, a book/travel allowance, and guaranteed employment on graduation",
    criteria: [
      "For Actuarial Science",
      "2nd year of study and above (1st-years not eligible)",
      "South African citizen by birth or descent",
      "Minimum 60% overall, 65% in Mathematics/actuarial modules",
      "Continuous strong academic record and extramural/leadership involvement",
    ],
    applyUrl: "https://careers.liberty.co.za",
    riskFlags: [],
    sourceUrl: "https://www.liberty.co.za/careers/Pages/actuarial-bursary-programme.aspx",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    name: "Sanlam Actuarial Bursary",
    provider: "Sanlam",
    fieldsOfStudy: ["Commerce", "Science"],
    levelRequired: "matricOnly",
    opensOn: null,
    closesOn: null, // not confirmed directly on sanlam's own careers page
    value: "Funding and support for Actuarial Science study, mentorship, vacation work, board-exam support, and guaranteed employment",
    criteria: ["Merit-based selection", "Aligned to Sanlam's employment equity plan"],
    applyUrl: "https://www.sanlamonline.co.za/careers/",
    riskFlags: [],
    sourceUrl: "https://www.sanlamonline.co.za/careers/",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },

  // --- Mining, Energy & Petrochemical ---
  {
    name: "Valterra Platinum Bursary Programme",
    provider: "Valterra Platinum", // rebranded from Anglo American Platinum -- confirmed on the company's own site
    fieldsOfStudy: ["Engineering", "Science"],
    levelRequired: "matricOnly",
    opensOn: null,
    closesOn: null, // aggregators consistently cite a date via the SmartRecruiters portal, but Valterra's own page did not render an exact date -- not independently confirmed
    value: "Tuition, accommodation, meals/living allowance, textbooks, and a laptop for qualifying students",
    criteria: [
      "South African citizen",
      "Enrolled in or accepted at a recognised university for Mining, Mechanical, or Electrical Engineering, Metallurgy, Geosciences/Geology, Mechatronics, or Electronic Engineering",
      "Minimum 65% academic average, maintained annually",
      "Priority to North West and Limpopo applicants",
      "Mandatory vacation work, and a work-back obligation matching sponsorship duration",
      "Cannot hold another full bursary simultaneously",
    ],
    applyUrl: "https://careers.smartrecruiters.com/ValterraPlatinum1",
    riskFlags: [],
    sourceUrl: "https://www.valterraplatinum.com/working-here/young-talent/",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    name: "Glencore Bursary Programme (Alloys Division)",
    provider: "Glencore South Africa",
    fieldsOfStudy: ["Engineering"],
    levelRequired: "matricOnly",
    opensOn: null,
    closesOn: "2026-08-01", // stated explicitly on Glencore's own listing
    value: "Registration/tuition, residence and meals, textbooks, a monthly cash allowance, and computer purchase assistance from year 2",
    criteria: [
      "For Electrical Engineering",
      "Grade 12 or current university student",
      "Minimum 60% (C symbol) in Mathematics and Physical Science, Higher Grade",
      "Selection via academics and an interview with Glencore's Alloys Bursary Committee",
      "Cannot hold this simultaneously with another major industry bursary",
    ],
    applyUrl: "https://www.glencore.com/en/careers/jobs/07O%20-%2000195726",
    riskFlags: [],
    sourceUrl: "https://www.glencore.com/en/careers/jobs/07O%20-%2000195726",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    name: "Sibanye-Stillwater External Bursary Programme",
    provider: "Sibanye-Stillwater",
    fieldsOfStudy: ["Engineering", "Science"],
    levelRequired: "matricOnly",
    opensOn: null,
    closesOn: null, // not stated on Sibanye-Stillwater's own page
    value: "Full undergraduate bachelor's degree bursary (exact cost breakdown not itemized on the provider's own page)",
    criteria: [
      "For Mining, Mechanical, Electrical, Metallurgical, or Chemical Engineering, Geology, or Mine Surveying/Rock Engineering",
      "South African citizen",
      "Under 21 in first year of study (under 23 if continuing)",
      "Full-time study at an accredited SA university",
    ],
    applyUrl: "https://www.sibanyestillwater.com/careers/south-africa/",
    riskFlags: [],
    sourceUrl: "https://www.sibanyestillwater.com/careers/south-africa/",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    name: "Implats Bursary Programme",
    provider: "Impala Platinum Holdings (Implats)",
    fieldsOfStudy: ["Engineering", "Science", "Commerce"],
    levelRequired: "matricOnly",
    opensOn: null,
    closesOn: null, // not stated on implats.co.za directly; aggregator-only claims not independently confirmed
    value: "Tuition, residence costs, and a cash allowance for the full course duration",
    criteria: [
      "For Mining Engineering, Metallurgy, Electrical Engineering (heavy current), Chemistry, Geology, Accounting, Survey, or Human Resources",
      "Work-back obligation during and after studies",
      "Mandatory annual vacation work",
      "Priority to candidates from Implats' local host communities",
    ],
    applyUrl: "https://www.implats.co.za/young-talent.php",
    riskFlags: [],
    sourceUrl: "https://www.implats.co.za/young-talent.php",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    name: "Eskom University Bursary Programme",
    provider: "Eskom Holdings SOC Ltd",
    fieldsOfStudy: ["Engineering"],
    levelRequired: "matricOnly",
    opensOn: null,
    closesOn: "2025-11-28", // stated explicitly on Eskom's own recruitment portal for the most recently confirmed cycle; a real, recurring annual bursary -- next cycle's dates not yet announced. Apply only via eskom.co.za's own portal: Eskom has been targeted by well-publicised fake-learnership scams unrelated to this specific programme.
    value: "Not itemized on the provider's own listing beyond tuition coverage",
    criteria: [
      "For Chemical, Civil, Computer, Electrical (Light or Heavy Current), Electromechanical/Mechatronics, Industrial, Mechanical, or Metallurgy Engineering",
      "South African citizen",
      "Minimum English/Mathematics/Physical Science levels specified per engineering stream",
      "Cannot hold another bursary, or already be registered at a tertiary institution",
    ],
    applyUrl:
      "https://eskomcareers.ci.hr/applicant/index.php?controller=Bursaries&method=view&bursaryid=31d0a365-f4d3-49a6-b3d1-7494f9a29463",
    riskFlags: [],
    sourceUrl:
      "https://eskomcareers.ci.hr/applicant/index.php?controller=Bursaries&method=view&bursaryid=31d0a365-f4d3-49a6-b3d1-7494f9a29463",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    name: "Kumba Iron Ore Bursary Programme",
    provider: "Kumba Iron Ore (Anglo American)",
    fieldsOfStudy: ["Engineering", "Science", "Commerce"],
    levelRequired: "matricOnly",
    opensOn: null,
    closesOn: null, // not stated on the provider's own page
    value: "Financial assistance covering studies, plus practical/vacation work exposure at Northern Cape operations",
    criteria: [
      "For Mining Engineering, Process Engineering, Geosciences, or Finance",
      "Preference to candidates from the Northern Cape",
      "Bursary Loan Agreement required",
      "Graduate-programme entry after study is performance/needs-based, not automatic",
    ],
    applyUrl: "https://www.angloamericankumba.com/careers/graduates-and-bursaries",
    riskFlags: [],
    sourceUrl: "https://www.angloamericankumba.com/careers/graduates-and-bursaries",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    name: "Anglo American Bursary Programme",
    provider: "Anglo American plc",
    fieldsOfStudy: ["Engineering", "Science"],
    levelRequired: "matricOnly",
    opensOn: null,
    closesOn: null, // Anglo American's own page states dates vary by business unit and to check before applying, without giving a specific date
    value: "University and textbook costs, plus mentoring/coaching",
    criteria: [
      "For Mining Engineering and related disciplines, varying by business unit",
      "Selection is business-unit specific",
    ],
    applyUrl: "https://www.angloamerican.com/careers/job-opportunities/apply",
    riskFlags: [],
    sourceUrl: "https://southafrica.angloamerican.com/careers/graduates-and-bursaries",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    name: "Exxaro Bursary Programme",
    provider: "Exxaro Resources",
    fieldsOfStudy: ["Engineering"],
    levelRequired: "matricOnly",
    opensOn: null,
    closesOn: null, // Exxaro's own page confirms the programme but does not render specific dates; aggregator-only claims not independently confirmed
    value: "Not itemized on the provider's own page",
    criteria: [
      "For Mining Engineering and general Engineering disciplines",
      "Priority to Exxaro host communities in Limpopo and Mpumalanga (Lephalale/eMalahleni)",
      "A separate stream exists for students living with disabilities, open to any field",
    ],
    applyUrl: "https://www.exxaro.com/workplace/bursaries-skills-development",
    riskFlags: [],
    sourceUrl: "https://www.exxaro.com/workplace/bursaries-skills-development",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },

  // --- Built Environment, Agriculture & Veterinary Science ---
  {
    name: "Zutari Bursary Scheme",
    provider: "Zutari", // rebranded from Aurecon's South Africa/Africa business in 2020 -- confirmed on the company's own site
    fieldsOfStudy: ["Built Environment", "Engineering"],
    levelRequired: "matricOnly",
    opensOn: null,
    closesOn: null, // not stated on Zutari's own page
    value: "Tuition and study-related costs (exact coverage not itemized on Zutari's own page)",
    criteria: [
      "For BSc/BEng Civil, Mechanical, Electrical/Electronic, Industrial, or Chemical Engineering",
      "Grade 12: 75% average, Level 7 Mathematics and Science",
      "1st year: 70% average; 2nd/3rd year: 65% average",
      "South African citizen",
      "Certified SA ID, proof of registration, transcripts, and a panel interview",
    ],
    applyUrl: "mailto:earlytalent@zutari.com",
    riskFlags: [],
    sourceUrl: "https://www.zutari.com/join-us/early-talent-attraction/",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    name: "AgriSETA Bursary",
    provider: "Agriculture Sector Education Training Authority (AgriSETA)",
    fieldsOfStudy: ["Agriculture"],
    levelRequired: "currentlyEnrolled",
    opensOn: null,
    closesOn: null, // AgriSETA's own page describes a recurring annual window but did not confirm the specific 2027-cycle date to me
    value: "Not itemized on AgriSETA's own page",
    criteria: [
      "For agriculture-related diplomas/degrees, NQF6+",
      "South African citizen",
      "Apply via an accredited AgriSETA training provider or employer, not by direct individual application",
    ],
    applyUrl: "https://www.agriseta.co.za",
    riskFlags: [],
    sourceUrl: "https://www.agriseta.co.za/funded-learning-programmes/",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    name: "Maize Trust Bursary Scheme",
    provider: "Maize Trust (administered via Grain SA)",
    fieldsOfStudy: ["Agriculture"],
    levelRequired: "currentlyEnrolled",
    opensOn: null,
    closesOn: null, // Grain SA's own page hosts official application materials but did not render an exact date to me
    value: "Not itemized on Grain SA's own page",
    criteria: [
      "For maize/grain-related undergraduate and postgraduate (MSc/PhD) study",
      "Approximately 12 bursaries awarded per year",
      "At least half awarded to students from disadvantaged communities",
      "Open to students at all South African universities",
    ],
    applyUrl: "https://www.grainsa.co.za/pages/about-grain-sa/maize-trust-bursary-scheme",
    riskFlags: [],
    sourceUrl: "https://www.grainsa.co.za/pages/about-grain-sa/maize-trust-bursary-scheme",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    name: "CETA Thapelo Madibeng Bursary Scheme",
    provider: "Construction Education and Training Authority (CETA)",
    fieldsOfStudy: ["Built Environment"],
    levelRequired: "matricOnly",
    opensOn: "2026-01-05", // stated explicitly on CETA's official advert (hosted by Mangosuthu University of Technology) for the most recently confirmed cycle; a real, recurring bursary -- 2027-cycle advert not yet published
    closesOn: "2026-01-30",
    value: "Tuition fees, prescribed textbooks, accommodation, and meals; transport conditionally; a Masters/PhD research allowance where applicable",
    criteria: [
      "For construction, engineering, planning, property development, or infrastructure-related study",
      "Unemployed South African citizen",
      "Household income under R600,000/year",
      "Apply via CETA's own INDICIUM online system",
    ],
    applyUrl: "https://www.ceta.org.za/about-us/vacancies/thapelo-madibeng-bursary-scheme",
    riskFlags: [],
    sourceUrl: "https://www.ceta.org.za/about-us/vacancies/thapelo-madibeng-bursary-scheme",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },

  // --- Media, Government & Aviation ---
  {
    name: "National Treasury Bursary Scheme",
    provider: "National Treasury, Republic of South Africa",
    fieldsOfStudy: ["Commerce"],
    levelRequired: "currentlyEnrolled",
    opensOn: null,
    closesOn: "2025-08-22", // stated explicitly in National Treasury's own official PDF advert for the most recently confirmed cycle; a real, recurring annual scheme -- next cycle's dates not yet published
    value: "Registration, tuition, accommodation, prescribed textbooks, and a monthly allowance",
    criteria: [
      "For BCom Accounting, BCom Economics, Diploma in Logistics, or a Degree/Diploma in Graphic Design",
      "South African citizen",
      "Registered full-time undergraduate student, from 2nd year",
      "Academic average of 65% or higher in latest exams",
      "Combined household income under R600,000/year",
    ],
    applyUrl: "https://www.treasury.gov.za/graduate/default.aspx",
    riskFlags: [],
    sourceUrl: "https://www.treasury.gov.za/graduate/External%20Bursary%20Advert.pdf",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    name: "SACAA Bursary Programme",
    provider: "South African Civil Aviation Authority (SACAA)",
    fieldsOfStudy: ["Aviation", "Engineering"],
    levelRequired: "matricOnly",
    opensOn: null,
    closesOn: null, // not stated on caa.co.za
    value: "Historically covers Pilot Training (fixed/rotary wing), Aircraft Maintenance Engineering, and Aeronautical Engineering studies (exact coverage not itemized on SACAA's own page)",
    criteria: [
      "Apply only via the official portal (sacaa.mcidirecthire.com) or BursaryApplications@caa.co.za -- SACAA's own page warns against unofficial application channels",
    ],
    applyUrl: "https://sacaa.mcidirecthire.com",
    riskFlags: [],
    sourceUrl: "https://www.caa.co.za/information-for-the-public/careers-in-aviation/",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    name: "ATNS Air Traffic Services Bursary Programme",
    provider: "Air Traffic and Navigation Services (ATNS)",
    fieldsOfStudy: ["Aviation"],
    levelRequired: "matricOnly",
    opensOn: null, // ATNS runs three intakes per year rather than one annual deadline
    closesOn: null,
    value: "A fully funded 1-year Air Traffic Services training programme at the ATNS Aviation Training Academy, with a possible 18-month fixed-term contract to follow",
    criteria: [
      "South African citizen, age 18-33",
      "Grade 12 with Mathematics (Pure Maths only, not Mathematical Literacy) and English, level 4 or higher",
      "Medically fit, and must pass ATNS's own aptitude assessments",
      "No criminal record",
    ],
    applyUrl: "https://atns.careerjunction.co.za",
    riskFlags: [],
    sourceUrl: "https://www.atns-ata.com/Bursaries",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    name: "SAA Cadet Pilot Development Programme",
    provider: "South African Airways (SAA)",
    fieldsOfStudy: ["Aviation"],
    levelRequired: "matricOnly",
    opensOn: null,
    closesOn: null,
    value: "Bursary funding toward a 'frozen' Airline Transport Pilot's Licence (ATPL); approximately 14 months, roughly 40 cadets trained per year",
    criteria: [
      "South African citizen",
      "Matric Certificate/N3 or a SAQA-accredited qualification",
      "Mathematics/Statistics, Physical Science, and English required",
      "Completion does not guarantee SAA employment",
      "Apply only via flysaa.com -- SAA has publicly warned about fraudulent third-party websites impersonating this exact programme and charging fake application/shortlisting fees; SAA never charges a fee",
    ],
    applyUrl: "https://www.flysaa.com/about-us/leading-carrier/careers/youth-development",
    riskFlags: [],
    sourceUrl: "https://www.flysaa.com/about-us/leading-carrier/careers/youth-development",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    name: "Media24 Journalism Bursary",
    provider: "Media24",
    fieldsOfStudy: ["Humanities"],
    levelRequired: "completedQualification",
    opensOn: null, // timing is set by each partner university's journalism school, not Media24 directly
    closesOn: null,
    value: "A 2-year bursary: 1 funded year of postgraduate journalism study at Wits, North-West University, Stellenbosch, or Rhodes, followed by 1 year working at Media24",
    criteria: [
      "Must be admitted to a postgraduate journalism qualification at Wits, North-West University, Stellenbosch, or Rhodes",
      "Apply through the university's journalism department, not directly through Media24",
    ],
    applyUrl: "https://www.media24.com/contact/",
    riskFlags: [],
    sourceUrl: "https://www.media24.com/contact/",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
];

// --- Internships -------------------------------------------------------
// Same "stable programme page, not a single dated vacancy" discipline as
// the file header explains for YES: SABC's own site was checked and
// skipped (SABC itself has publicly warned about fake internship
// listings circulating under its name -- https://www.sabc.co.za/sabc/
// sabc-takes-note-of-a-website-advertising-non-existent-sabc-internships-
// for-2020-2/ -- and its real internships page has no citable programme
// content of its own, just a link to a rotating vacancy portal).
const INTERNSHIPS: Omit<Internship, "id">[] = [
  {
    title: "Youth Employment Service (YES) 12-Month Work Experience Programme",
    provider: "Youth Employment Service (YES)",
    fieldsOfStudy: ["Engineering", "Science", "Commerce", "Humanities", "Health Sciences", "Law", "Education", "ICT"],
    minQualification: "Grade 12 (matric) or equivalent",
    matricOnly: true,
    province: null, // nationwide; specific placements vary by host employer
    opensOn: null, // an ongoing national programme, not a single dated vacancy -- see file header
    closesOn: null,
    applyUrl: "https://www.yes4youth.co.za/",
    sourceUrl: "https://www.yes4youth.co.za/",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    title: "Standard Bank Internship Programme",
    provider: "Standard Bank",
    fieldsOfStudy: ["Commerce", "ICT"],
    minQualification: "Undergraduate degree/diploma (STEM for the technology tracks, marketing/finance for the business tracks)",
    matricOnly: false,
    province: "Gauteng",
    opensOn: null, // no fixed date on the official page; runs across multiple programme intakes (CIB, Insurance, Salesforce, Mainframe-Cobol)
    closesOn: null,
    applyUrl: "https://www.standardbank.com/sbg/standard-bank-group/careers/early-careers/internships/opportunities",
    sourceUrl: "https://www.standardbank.com/sbg/standard-bank-group/careers/early-careers/internships",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    title: "Internship and Community Service Programme (ICSP)",
    provider: "National Department of Health",
    fieldsOfStudy: ["Health Sciences"],
    minQualification:
      "Completed degree/diploma in Medicine, Nursing, Pharmacy, Physiotherapy, Occupational Therapy, Dietetics, Radiography, Psychology, Dentistry, Audiology, or another allied health profession",
    matricOnly: false,
    province: null, // placements nationwide at approved public health facilities
    opensOn: null, // two allocation cycles annually (Annual and Mid-year); no single fixed date
    closesOn: null,
    applyUrl: "https://icsp-doh.org.za/",
    sourceUrl: "https://www.health.gov.za/icsp/",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    title: "Engineers in Training Programme",
    provider: "Transnet",
    fieldsOfStudy: ["Engineering"],
    minQualification: "Completed degree in Engineering",
    matricOnly: false,
    province: null, // placements across Transnet's national operations
    opensOn: null, // no fixed date on the official page; advertised on transnet.net and in newspapers when intakes open
    closesOn: null,
    applyUrl: "https://www.transnet.net/Careers",
    sourceUrl: "https://www.transnet.net/RenderPage.aspx?id=7753695",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },

  // --- ICT & Telecoms ---
  {
    title: "BCX Graduate Internship Programme",
    provider: "BCX (a Telkom Group company)",
    fieldsOfStudy: ["ICT"],
    minQualification: "Completed degree or diploma in Information Technology or Business",
    matricOnly: false,
    province: null, // not specified; BCX operates nationally
    opensOn: null, // an 8-month recurring internship programme (running since 2005), not a single dated vacancy
    closesOn: null,
    applyUrl: "https://jobs.telkom.co.za/BCX/go/Students/5054901/",
    sourceUrl: "https://jobs.telkom.co.za/BCX/go/Students/5054901/",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    title: "SITA ICT Internship (Youth Development Programme)",
    provider: "State Information Technology Agency (SITA)",
    fieldsOfStudy: ["ICT"],
    minQualification: "Currently enrolled from 2nd year of an IT qualification",
    matricOnly: false,
    province: null, // nationwide
    opensOn: null, // SITA's own page states closing dates are only published per-advert in national print media -- no fixed annual date
    closesOn: null,
    applyUrl: "https://www.sita.co.za/content/youth-development-programme",
    sourceUrl: "https://www.sita.co.za/content/youth-development-programme",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },

  // --- Accounting, Finance, Banking & Actuarial ---
  {
    title: "EY Graduate Programme",
    provider: "EY (Ernst & Young) South Africa",
    fieldsOfStudy: ["Commerce", "Science"],
    minQualification: "Honours degree (varies by stream -- Actuarial and Quants, Assurance/Audit, Tax)",
    matricOnly: false,
    province: null, // nationwide
    opensOn: null, // EY's own page describes stream-specific windows (e.g. January-October for Tax) rather than one fixed annual date
    closesOn: null,
    applyUrl: "https://eyglobal.yello.co/job_boards/c1riT--B2O-KySgYWsZO1Q",
    sourceUrl: "https://www.ey.com/en_za/careers/graduate-programmes-south-africa",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    title: "KPMG Graduate Training Contract Programme",
    provider: "KPMG South Africa",
    fieldsOfStudy: ["Commerce"],
    minQualification: "CTA or equivalent from a SAICA-accredited university",
    matricOnly: false,
    province: null, // nationwide
    opensOn: null,
    closesOn: null, // not stated on KPMG's own page for the current cycle
    applyUrl: "https://kpmgza.taleo.net/careersection/kpmg_graduate/jobsearch.ftl?lang=en&portal=10205020166",
    sourceUrl: "https://kpmg.com/za/en/careers/graduate-opportunities.html",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    title: "Nedbank CIB Young Analyst Programme",
    provider: "Nedbank (Corporate and Investment Banking)",
    fieldsOfStudy: ["Commerce", "Science"],
    minQualification: "Final-year 4-year degree or postgraduate qualification, 0-2 years' experience",
    matricOnly: false,
    province: null, // nationwide (Johannesburg-centric postings seen)
    opensOn: "2026-08-01", // stated by Nedbank itself as the recurring annual window
    closesOn: "2026-08-31",
    applyUrl: "https://jobs.nedbank.co.za",
    sourceUrl: "https://cib.nedbank.co.za/culture/young-analyst-programme.html",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    title: "Absa GenA Graduate Programme",
    provider: "Absa Group",
    fieldsOfStudy: ["Commerce", "Science"],
    minQualification: "Recent graduate or final-year honours in Risk Management, Investment Banking, Global Markets, Actuarial Science, or Finance",
    matricOnly: false,
    province: null, // nationwide
    opensOn: null,
    closesOn: null, // not stated on Absa's own overview page
    applyUrl: "https://leap.ly/campaign/absagena24",
    sourceUrl: "https://www.absa.africa/careers/graduate-opportunities/",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },

  // --- Mining, Energy & Petrochemical ---
  {
    title: "Valterra Platinum Graduate Programme",
    provider: "Valterra Platinum",
    fieldsOfStudy: ["Engineering", "Science"],
    minQualification: "Honours-level (NQF 8) or final-year honours in Mining, Geomatics, Geotechnical, Mechanical, Electrical, Electronic, or Mechatronics Engineering, Chemistry, Chemical Engineering, or Metallurgy",
    matricOnly: false,
    province: null, // varies by operation
    opensOn: null,
    closesOn: null, // applications run through the provider's careers portal on a rolling basis
    applyUrl: "https://careers.smartrecruiters.com/ValterraPlatinum1",
    sourceUrl: "https://www.valterraplatinum.com/working-here/young-talent/",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    title: "Anglo American BLAST Graduate Programme",
    provider: "Anglo American plc",
    fieldsOfStudy: ["Engineering", "Commerce", "Science"],
    minQualification: "Degree or postgraduate qualification, fewer than 2 years' work experience",
    matricOnly: false,
    province: null, // South Africa, plus several other countries Anglo American operates in
    opensOn: null,
    closesOn: null, // Anglo American's own page states applications are open throughout the year
    applyUrl: "https://www.angloamerican.com/careers",
    sourceUrl: "https://www.angloamerican.com/careers/early-careers",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    title: "TotalEnergies South Africa Graduate Internship Programme",
    provider: "TotalEnergies Marketing South Africa (Pty) Ltd",
    fieldsOfStudy: ["Engineering", "Commerce", "Science", "Law"],
    minQualification: "Completed or about-to-complete Bachelor's/Honours degree in Finance, HR, Engineering, Digital/Data, Logistics and Supply Chain, Science, or Law",
    matricOnly: false,
    province: "Gauteng, Western Cape",
    opensOn: null,
    closesOn: null, // reviewed on a rolling basis, no fixed closing date on the provider's own page
    applyUrl: "https://careers.totalenergies.com",
    sourceUrl: "https://totalenergies.co.za/about-us/careers/careers",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    title: "Harmony Gold Internship Programme",
    provider: "Harmony Gold Mining Company",
    fieldsOfStudy: ["Engineering", "Science"],
    minQualification: "Graduate or diplomate, or those needing experiential/in-service exposure in a core mining discipline",
    matricOnly: false,
    province: null, // communities local to Harmony's SA operations, plus employees' children
    opensOn: null,
    closesOn: "2026-02-27", // stated explicitly on Harmony Gold's own page for the most recently confirmed cycle; a real, recurring annual programme (100+ interns/year) -- next cycle's dates not yet announced
    applyUrl: "https://www.harmony.co.za/careers/opportunities-for-students/",
    sourceUrl: "https://www.harmony.co.za/careers/opportunities-for-students/",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    title: "Implats Graduate Programme",
    provider: "Impala Platinum Holdings (Implats)",
    fieldsOfStudy: ["Engineering", "Science"],
    minQualification: "Graduate (degree) in Mining, Metallurgy, Chemical Engineering, Mechanical Engineering, or Electrical Engineering (heavy current)",
    matricOnly: false,
    province: null, // priority to Implats' local host communities
    opensOn: null,
    closesOn: null, // not stated on the provider's own page
    applyUrl: "https://www.implats.co.za/young-talent.php",
    sourceUrl: "https://www.implats.co.za/young-talent.php",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },

  // --- Built Environment, Agriculture & Veterinary Science ---
  {
    title: "ARC Internship Programme",
    provider: "Agricultural Research Council (ARC)",
    fieldsOfStudy: ["Agriculture", "Science"],
    minQualification: "Degree or diploma graduate (also open to Engineering, Technology, and Commerce graduates within ARC's research divisions)",
    matricOnly: false,
    province: null, // ARC operates research campuses across multiple provinces
    opensOn: null,
    closesOn: null, // advertised on a rolling/ongoing basis, no fixed annual window, per the ARC's own page
    applyUrl: "https://www.arc.agric.za/Pages/Careers/Internship-Programme.aspx",
    sourceUrl: "https://www.arc.agric.za/Pages/Careers/Internship-Programme.aspx",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    title: "SANRAL Engineering Internship Programme",
    provider: "South African National Roads Agency SOC Ltd (SANRAL)",
    fieldsOfStudy: ["Built Environment", "Engineering"],
    minQualification: "Civil Engineering diploma/degree (exact qualification level not itemized on SANRAL's own page)",
    matricOnly: false,
    province: null, // not specified on the provider's own page
    opensOn: null,
    closesOn: null, // not stated on the provider's own page
    applyUrl: "https://www.nra.co.za",
    sourceUrl: "https://www.nra.co.za",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    title: "Compulsory Community Service (CCS) for Veterinarians",
    provider: "South African Veterinary Council (SAVC), regulating a Department of Agriculture, Land Reform and Rural Development requirement",
    fieldsOfStudy: ["Health Sciences"],
    minQualification: "Bachelor of Veterinary Science (BVSc) degree",
    matricOnly: false,
    province: null, // nationwide, with placement emphasis on rural/underserved areas
    opensOn: null, // this is a mandatory 12-month statutory requirement for every newly qualified veterinarian, not a competitive annual-window programme -- registration happens on an ongoing basis as each veterinarian graduates
    closesOn: null,
    applyUrl: "mailto:ccs.vet@savc.org.za",
    sourceUrl: "https://savc.org.za/veterinary-profession/practicing-as-a-veterinarian/veterinarian-registration/",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },

  // --- Media, Government & Aviation ---
  {
    title: "SARS Graduate in Training Programme",
    provider: "South African Revenue Service (SARS)",
    fieldsOfStudy: ["Commerce", "Law", "ICT", "Humanities"],
    minQualification: "3-year Diploma/Degree or higher (NQF 6+); exact field mix varies by advertised intake",
    matricOnly: false,
    province: null, // nationwide
    opensOn: null,
    closesOn: null, // recruitment runs via SARS's own vacancies portal on a rolling basis
    applyUrl: "https://www.sars.gov.za/careers/",
    sourceUrl: "https://www.sars.gov.za/careers/graduate-development-programme/",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    title: "SARS Chartered Accountant Articles Programme",
    provider: "South African Revenue Service (SARS)",
    fieldsOfStudy: ["Commerce"],
    minQualification: "Relevant Accounting degree, en route to CA(SA)",
    matricOnly: false,
    province: null, // nationwide
    opensOn: null,
    closesOn: null, // not stated on SARS's own page
    applyUrl: "https://www.sars.gov.za/careers/",
    sourceUrl: "https://www.sars.gov.za/careers/",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    title: "National Treasury Graduate Internship Programme",
    provider: "National Treasury",
    fieldsOfStudy: ["Commerce", "Law", "ICT", "Humanities"],
    minQualification: "3-year Diploma/Degree or Postgraduate qualification (fields include Economics, Journalism, Media Studies, Communication Studies, Law/LLB, IT, and Public Administration)",
    matricOnly: false,
    province: "Gauteng",
    opensOn: null,
    closesOn: "2026-01-12", // stated explicitly in National Treasury's own official PDF advert for the most recently confirmed cycle; a real, recurring annual programme -- next cycle's dates not yet published
    applyUrl: "https://erecruitment.treasury.gov.za/eRecruitment/",
    sourceUrl: "https://www.treasury.gov.za/graduate/Final%20Advert%20-%20Graduate%20Internship%20Programme%202026.pdf",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    title: "The Presidency Internship Programme",
    provider: "The Presidency, Republic of South Africa",
    fieldsOfStudy: ["Humanities", "Commerce", "ICT"],
    minQualification: "National Diploma through Master's degree (fields include Social Science, Economics, Public Policy, Communications, Journalism, Media Studies, Political Studies, and IT)",
    matricOnly: false,
    province: "Gauteng, Western Cape",
    opensOn: null,
    closesOn: "2024-12-23", // stated explicitly on the Presidency's own page for the most recently confirmed cycle; a real, recurring annual programme -- next cycle's dates not yet published
    applyUrl: "mailto:applications@presidency.gov.za",
    sourceUrl: "https://www.thepresidency.gov.za/node/8669",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    title: "DOJ&CD Youth Development Internship Programme",
    provider: "Department of Justice and Constitutional Development",
    fieldsOfStudy: ["Law"],
    minQualification: "Relevant tertiary qualification (varies by advert; historically has also run legal, social work, finance/auditing, language, IT, and supply chain streams)",
    matricOnly: false,
    province: null, // runs across all regions/provinces, with a separate application per region
    opensOn: null,
    closesOn: "2025-06-20", // stated explicitly on the Department's own page for the most recently confirmed cycle; a real, recurring annual programme -- next cycle's dates not yet published
    applyUrl: "https://www.justice.gov.za/vacancies/vacancies-Internships.html",
    sourceUrl: "https://www.justice.gov.za/vacancies/vacancies-Internships.html",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
];

// --- Statistics --------------------------------------------------------
// 2025 NSC results, independently confirmed from TWO separate official
// SAnews.gov.za (South African Government News Agency / GCIS) articles,
// both citing the Department of Basic Education / Minister Siviwe
// Gwarube's 12 January 2026 announcement -- exact figures matched across
// both. datasetKey "nsc-results-by-province" is what
// components/statistics/StatisticsPage.tsx already renders; every other
// chart on that page correctly continues to show "data pending
// verification" (no fabricated data added for them).
const PROVINCE_PASS_RATES: { province: string; passRate: number }[] = [
  { province: "KwaZulu-Natal", passRate: 90.6 },
  { province: "Free State", passRate: 89.33 },
  { province: "Gauteng", passRate: 89.06 },
  { province: "North West", passRate: 88.49 },
  { province: "Western Cape", passRate: 88.2 },
  { province: "Northern Cape", passRate: 87.79 },
  { province: "Mpumalanga", passRate: 86.55 },
  { province: "Limpopo", passRate: 86.15 },
  { province: "Eastern Cape", passRate: 84.17 },
  { province: "South Africa (national)", passRate: 88 },
];

const STAT_SOURCE_URL = "https://www.sanews.gov.za/south-africa/class-2025-sets-new-national-record-historic-88-pass-rate";
const STAT_PUBLISHER = "Department of Basic Education (via SAnews.gov.za / GCIS)";

const STATISTICS: Omit<Statistic, "id">[] = PROVINCE_PASS_RATES.map(({ province, passRate }) => ({
  dataset: "nsc-results-by-province",
  dimension: province,
  metric: "NSC pass rate",
  value: passRate,
  unit: "%",
  sourceUrl: STAT_SOURCE_URL,
  verifiedOn: VERIFIED_ON,
  publisher: STAT_PUBLISHER,
  year: 2025,
}));

let written = 0;

for (const bursary of BURSARIES) {
  const id = bursary.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-+|-+$)/g, "");
  await db.collection("bursaries").doc(id).set({ id, ...bursary });
  console.log(`  bursary: ${id}`);
  written++;
}

for (const internship of INTERNSHIPS) {
  const id = internship.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-+|-+$)/g, "");
  await db.collection("internships").doc(id).set({ id, ...internship });
  console.log(`  internship: ${id}`);
  written++;
}

for (const stat of STATISTICS) {
  const id = `${stat.dataset}-${stat.dimension}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-+|-+$)/g, "");
  await db.collection("statistics").doc(id).set({ id, ...stat });
  console.log(`  statistic: ${id} -> ${stat.value}${stat.unit}`);
  written++;
}

console.log(`Seeded ${written} real documents into ${useEmulator ? "the local emulator" : "the real Firestore project"}.`);
