import { APPLICATION_CHECKLIST_ITEMS } from "@/config/applicationDocuments";
import type { MatchResult } from "@/lib/matching/types";
import type { ApplicationWindow } from "@/lib/firestore/types";

/**
 * Pure, same discipline as lib/aps and lib/matching -- no Firebase/React
 * imports. Combines two independent signals into one "how ready am I to
 * actually apply" number: (a) this specific programme's subject/APS
 * requirements, already computed by lib/matching/engine, and (b) the
 * generic application-readiness checklist (config/applicationDocuments.ts),
 * which is the same for every programme since it's not institution-
 * specific. A programme with zero listed requirements and a fully-ticked
 * checklist reads as 100%, not undefined/NaN.
 */
export interface ReadinessResult {
  /** 0-100, rounded. */
  percent: number;
  metCount: number;
  totalCount: number;
}

export interface DetailedReadinessCategory {
  id: "academic" | "application" | "documentation" | "funding" | "deadline" | "career";
  name: string;
  score: number; // 0-100
  statusText: string;
}

export interface DetailedReadinessScorecard {
  overallScore: number;
  categories: DetailedReadinessCategory[];
}

export function calculateReadiness(
  matchResult: MatchResult,
  checkedItemIds: ReadonlySet<string>
): ReadinessResult {
  const subjectTotal = matchResult.reasons.length;
  const subjectMet = matchResult.reasons.filter((r) => "met" in r && r.met).length;

  const checklistTotal = APPLICATION_CHECKLIST_ITEMS.length;
  const checklistMet = APPLICATION_CHECKLIST_ITEMS.filter((item) =>
    checkedItemIds.has(item.id)
  ).length;

  const totalCount = subjectTotal + checklistTotal;
  const metCount = subjectMet + checklistMet;

  return {
    percent: totalCount === 0 ? 100 : Math.round((metCount / totalCount) * 100),
    metCount,
    totalCount,
  };
}

export function calculateDetailedReadiness(
  matchResult: MatchResult,
  checkedItemIds: ReadonlySet<string>,
  applicationWindow?: ApplicationWindow | null
): DetailedReadinessScorecard {
  // 1. Academic Readiness
  const subjectTotal = matchResult.reasons.length;
  const subjectMet = matchResult.reasons.filter((r) => "met" in r && r.met).length;
  const academicScore = subjectTotal === 0 ? 100 : Math.round((subjectMet / subjectTotal) * 100);

  // 2. Application Readiness
  const checklistTotal = APPLICATION_CHECKLIST_ITEMS.length;
  const checklistMet = APPLICATION_CHECKLIST_ITEMS.filter((item) =>
    checkedItemIds.has(item.id)
  ).length;
  const applicationScore = checklistTotal === 0 ? 100 : Math.round((checklistMet / checklistTotal) * 100);

  // 3. Documentation Readiness (ID/ID Document/Certificates items in checklist)
  const docItemIds = ["certified-id", "nsc-results", "proof-of-residence"];
  const docMet = docItemIds.filter((id) => checkedItemIds.has(id)).length;
  const docScore = Math.round((docMet / docItemIds.length) * 100);

  // 4. Funding Readiness (NSFAS / Bursary checklist items)
  const fundingItemIds = ["nsfas-application", "bursary-application"];
  const fundingMet = fundingItemIds.filter((id) => checkedItemIds.has(id)).length;
  const fundingScore = Math.round((fundingMet / fundingItemIds.length) * 100);

  // 5. Deadline Readiness (derived from applicationWindow status)
  let deadlineScore = 50; // default unknown
  let deadlineText = "Verification required for dates";
  if (applicationWindow) {
    if (applicationWindow.status === "open") {
      deadlineScore = 100;
      deadlineText = `Open until ${applicationWindow.closesOn}`;
    } else if (applicationWindow.status === "openingSoon") {
      deadlineScore = 75;
      deadlineText = `Opening on ${applicationWindow.opensOn}`;
    } else if (applicationWindow.status === "closed") {
      deadlineScore = 0;
      deadlineText = "Applications closed";
    }
  }

  // 6. Career Alignment (100% if qualified degree/diploma, 70% if near-miss)
  const careerScore = matchResult.bucket === "qualify" ? 100 : matchResult.bucket === "almostQualify" ? 70 : 40;

  const categories: DetailedReadinessCategory[] = [
    {
      id: "academic",
      name: "Academic Readiness",
      score: academicScore,
      statusText: `${subjectMet} of ${subjectTotal} subject requirements met`,
    },
    {
      id: "application",
      name: "Application Readiness",
      score: applicationScore,
      statusText: `${checklistMet} of ${checklistTotal} checklist tasks completed`,
    },
    {
      id: "documentation",
      name: "Documentation Readiness",
      score: docScore,
      statusText: `${docMet} of ${docItemIds.length} key documents ready`,
    },
    {
      id: "funding",
      name: "Funding Readiness",
      score: fundingScore,
      statusText: `${fundingMet} of ${fundingItemIds.length} funding applications prepared`,
    },
    {
      id: "deadline",
      name: "Deadline Readiness",
      score: deadlineScore,
      statusText: deadlineText,
    },
    {
      id: "career",
      name: "Career Alignment",
      score: careerScore,
      statusText: matchResult.bucket === "qualify" ? "Strong degree fit" : "Requires mark boost for direct fit",
    },
  ];

  const sumScores = categories.reduce((acc, c) => acc + c.score, 0);
  const overallScore = Math.round(sumScores / categories.length);

  return {
    overallScore,
    categories,
  };
}
