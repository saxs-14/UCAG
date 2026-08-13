import type { Metadata } from "next";
import Link from "next/link";
import { LABELS } from "@/config/labels";
import { UmpHeader } from "@/components/ump/UmpHeader";
import { CareerRoadmapView } from "@/components/career/CareerRoadmapView";
import type { RoadmapStep } from "@/components/career/CareerRoadmapView";

const UMP_NAVY = "#003b5c";


export const metadata: Metadata = {
  title: `UMP Career Roadmaps -- ${LABELS.app.name}`,
  description:
    "Step-by-step career roadmaps for University of Mpumalanga students — from Grade 12 through your UMP degree to a successful career in ICT, Agriculture, Education, or Business.",
};

/**
 * Career Roadmaps page. Each roadmap is a typed RoadmapStep array --
 * no live Firestore data needed here (these are editorial career paths,
 * not verified admission facts). The distinction matters: a roadmap
 * entry saying "build 2-3 portfolio projects" is advice, not a verified
 * institutional fact, and doesn't need sourceUrl/verifiedOn. The
 * provenance gate only applies to the calculator, programme pages, and
 * bursary listings -- see CLAUDE.md.
 */

const ICT_ROADMAP: RoadmapStep[] = [
  {
    id: "ict-school",
    phase: "school",
    title: "Grade 12 — Build Your Foundation",
    subtitle: "Focus on Maths and Physical Science to meet UMP's ICT entry requirements.",
    duration: "Grades 10–12",
    bullets: [
      "Achieve at least level 4 (50%) in Mathematics — required for BSc Computing.",
      "Study IT or CAT as an elective if available at your school.",
      "Start exploring free coding resources: freeCodeCamp, CS50, or Khan Academy.",
      "Apply to UMP in April–September of your Grade 12 year.",
    ],
    ctaLabel: "Check your APS",
    ctaHref: "/",
  },
  {
    id: "ict-admission",
    phase: "admission",
    title: "UMP Application & NSFAS",
    subtitle: "Submit your UMP application and sort out funding before the deadline.",
    duration: "April–September",
    bullets: [
      "Apply via the UMP online portal — no walk-ins accepted.",
      "Apply for NSFAS at the same time if your household income is under R350,000/year.",
      "Collect your NBT results if UMP requires it for your programme.",
      "Track your application status on the UMP portal.",
    ],
    ctaLabel: "UMP Application Portal",
    ctaHref: "https://www.ump.ac.za/Study-with-us/Application-Process/Online-Applications",
  },
  {
    id: "ict-degree",
    phase: "degree",
    title: "Bachelor of ICT at UMP",
    subtitle: "3 years full-time at UMP's Mbombela campus. Focus on software, networks, and systems.",
    duration: "3 years",
    bullets: [
      "Year 1: Programming fundamentals, computer architecture, and mathematics.",
      "Year 2: Databases, web development, operating systems, and networking.",
      "Year 3: Software engineering, AI basics, capstone project, and work-integrated learning.",
      "Join the UMP Computing Society and participate in hackathons.",
    ],
    ctaLabel: "View UMP ICT programmes",
    ctaHref: "/ump/programmes?faculty=ump-faculty-edbs&field=technology",
  },
  {
    id: "ict-skills",
    phase: "skills",
    title: "Build a Portfolio While Studying",
    subtitle: "Real projects and certifications separate you from other graduates.",
    duration: "Ongoing during degree",
    bullets: [
      "Contribute to open-source projects on GitHub.",
      "Complete a free cloud certification: AWS Cloud Practitioner or Google Cloud Foundations.",
      "Build 2–3 real-world projects: a web app, a REST API, and a mobile app.",
      "Participate in ICDL or Microsoft certification programmes.",
    ],
  },
  {
    id: "ict-work",
    phase: "work",
    title: "Internship / Graduate Programme",
    subtitle: "Most tech companies in SA run structured graduate programmes. Apply in your final year.",
    duration: "12–24 months",
    bullets: [
      "Apply to MICT SETA-accredited internships for ICT graduates.",
      "Look for government IT graduate programmes (SITA, DPSA).",
      "Explore Mpumalanga provincial government IT roles to give back to the region.",
      "Attend career fairs — UMP holds an annual Graduate Readiness Expo.",
    ],
    ctaLabel: "Browse ICT internships",
    ctaHref: "/bursaries",
  },
  {
    id: "ict-career",
    phase: "career",
    title: "Software Engineer / Systems Analyst / IT Manager",
    subtitle: "Average South African ICT graduate salary: R300,000–R600,000/year depending on specialisation.",
    bullets: [
      "Software Developer: Build applications for banks, telecoms, or government.",
      "Systems Analyst: Solve business problems with IT systems.",
      "Cybersecurity Analyst: High demand, with South Africa facing a critical skills shortage.",
      "IT Manager: Lead teams and projects at medium-to-large organisations.",
      "Consider an Honours or MSc at UMP or another university after 2–3 years of experience.",
    ],
  },
];

const AGRICULTURE_ROADMAP: RoadmapStep[] = [
  {
    id: "agri-school",
    phase: "school",
    title: "Grade 12 — Science Foundation",
    subtitle: "Agriculture at UMP requires strong sciences. Physical Science and Life Sciences are key.",
    duration: "Grades 10–12",
    bullets: [
      "Achieve level 4+ in Mathematics and Life Sciences.",
      "Agricultural Sciences as an elective is a major advantage.",
      "Visit a working farm or agricultural research station if possible.",
      "Apply to UMP during the April–September window.",
    ],
    ctaLabel: "Check your APS",
    ctaHref: "/",
  },
  {
    id: "agri-admission",
    phase: "admission",
    title: "UMP Application & AgriSETA Bursary",
    subtitle: "Apply for an AgriSETA bursary alongside your UMP application.",
    duration: "April–September",
    bullets: [
      "Apply for NSFAS if your household income is under R350,000/year.",
      "Check the AgriSETA bursary portal — opens annually around August.",
      "Apply for the Mpumalanga Department of Agriculture bursary.",
    ],
    ctaLabel: "UMP Funding options",
    ctaHref: "/ump/funding",
  },
  {
    id: "agri-degree",
    phase: "degree",
    title: "BSc in Agriculture at UMP",
    subtitle: "4 years covering crop science, animal science, soil, and agribusiness.",
    duration: "4 years",
    bullets: [
      "UMP's FANS faculty has a dedicated farm for practical work-integrated learning.",
      "Core modules: Soil Science, Crop Production, Animal Science, Agribusiness Management.",
      "Year 4 includes a full-year structured work placement on a commercial farm or research station.",
    ],
    ctaLabel: "View UMP Agriculture programmes",
    ctaHref: "/ump/programmes?faculty=ump-faculty-fans",
  },
  {
    id: "agri-skills",
    phase: "skills",
    title: "Practical & Research Skills",
    subtitle: "Modern agriculture is data-driven and technology-intensive.",
    duration: "Ongoing during degree",
    bullets: [
      "Learn precision agriculture tools: GIS mapping, drone surveying, soil sensors.",
      "Complete an ASCO or AgriSETA short course in agribusiness or crop management.",
      "Participate in the UMP student farm's commercial operations.",
    ],
  },
  {
    id: "agri-work",
    phase: "work",
    title: "Agricultural Extension Officer / Farm Manager",
    subtitle: "Government extension services and commercial farming both offer strong graduate paths.",
    duration: "12–24 months",
    bullets: [
      "Apply to the Mpumalanga Department of Agriculture graduate programme.",
      "ARC (Agricultural Research Council) offers structured internships.",
      "Commercial fruit, vegetable, and game farms in Mpumalanga hire annually.",
    ],
    ctaLabel: "Browse agriculture internships",
    ctaHref: "/bursaries",
  },
  {
    id: "agri-career",
    phase: "career",
    title: "Agricultural Scientist / Agribusiness Manager / Extension Officer",
    subtitle: "Agriculture is a strategic sector for Mpumalanga — excellent local and provincial government opportunities.",
    bullets: [
      "Agricultural Extension Officer: Advise smallholder farmers and rural communities.",
      "Crop Scientist: Research and improve crop varieties for local conditions.",
      "Agribusiness Manager: Run commercial farming operations or agri-processing businesses.",
      "Consider an MSc in Agriculture for research or academic careers.",
    ],
  },
];

interface RoadmapTab {
  id: string;
  label: string;
  emoji: string;
  steps: RoadmapStep[];
  heading: string;
}

const ROADMAPS: RoadmapTab[] = [
  {
    id: "ict",
    label: "ICT",
    emoji: "💻",
    heading: "Grade 12 → UMP ICT Degree → Software Engineer",
    steps: ICT_ROADMAP,
  },
  {
    id: "agriculture",
    label: "Agriculture",
    emoji: "🌱",
    heading: "Grade 12 → UMP Agriculture Degree → Agricultural Career",
    steps: AGRICULTURE_ROADMAP,
  },
];

export default function UmpCareerRoadmapsPage() {
  return (
    <main id="main-content" className="flex flex-1 flex-col items-center bg-paper">
      <UmpHeader />

      {/* Hero */}
      <div
        className="w-full py-10 px-6 sm:px-10 text-white"
        style={{ background: `linear-gradient(135deg, ${UMP_NAVY} 0%, #004f7c 60%, #003348 100%)` }}
      >
        <div className="mx-auto max-w-5xl flex flex-col gap-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs opacity-70">
            <Link href="/ump" className="hover:opacity-100 hover:underline">UMP Hub</Link>
            <span>›</span>
            <span>Career Roadmaps</span>
          </nav>
          <h1 className="text-3xl font-extrabold tracking-tight">🗺️ Career Roadmaps</h1>
          <p className="text-slate-300 text-sm max-w-2xl">
            Step-by-step paths from Grade 12 through your UMP degree to a career in your chosen field.
          </p>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6 sm:p-8">

        {/* Disclaimer */}
        <div className="rounded-xl border border-line bg-slate-soft p-4 text-xs text-ink-soft leading-relaxed">
          <strong className="text-ink">Note:</strong> Career roadmaps are editorial guidance
          based on general industry knowledge — not verified admission requirements. For
          exact APS scores, subject requirements, and application dates, always use the{" "}
          <Link href="/" className="font-semibold text-brand-teal hover:underline">
            APS Calculator
          </Link>{" "}
          and verify on the{" "}
          <a
            href="https://www.ump.ac.za"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-brand-teal hover:underline"
          >
            UMP official website
          </a>
          .
        </div>

        {/* Roadmaps — stacked with visual separator */}
        <div className="flex flex-col gap-12">
          {ROADMAPS.map((roadmap) => (
            <div key={roadmap.id} className="flex flex-col gap-2">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl" aria-hidden>
                  {roadmap.emoji}
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                    {roadmap.label} Career Path
                  </p>
                </div>
              </div>
              <CareerRoadmapView heading={roadmap.heading} steps={roadmap.steps} />
            </div>
          ))}
        </div>

        {/* Link to programmes */}
        <div className="card-learner rounded-2xl p-5 text-center">
          <p className="text-sm font-semibold text-ink mb-1">
            Ready to check your APS?
          </p>
          <p className="text-xs text-ink-soft mb-3">
            Enter your subject marks and see which UMP programmes you qualify for right now.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="rounded-lg bg-brand-teal px-4 py-2 text-sm font-bold text-white shadow transition hover:opacity-90"
            >
              🎓 Check my APS
            </Link>
            <Link
              href="/ump/programmes"
              className="rounded-lg border border-line bg-paper-raised px-4 py-2 text-sm font-semibold text-ink transition hover:bg-slate-soft"
            >
              Browse UMP Programmes
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
