/**
 * Ingestion pipeline configuration -- cadences, budgets, kill switch.
 * See docs/MASTER_PROMPT_v2.md Phase 4 for the full rationale (tiered
 * cadence over hourly extraction: stable facts don't get fresher from
 * more frequent extraction, they just get more chances to be wrong).
 *
 * This file is config only. The pipeline itself (fetch/extract/
 * corroborate/diff/route/publish/log) is Phase 4 implementation, not
 * built yet -- this establishes the knobs it will read.
 */

export type IngestionTask =
  | "linkHealthCheck"
  | "applicationWindows"
  | "bursaries"
  | "internships"
  | "programmeRequirements"
  | "facultySchoolStructure"
  | "nationalStatistics";

export interface CadenceRule {
  task: IngestionTask;
  label: string;
  /** Cron expression, SAST. */
  cron: string;
  /** Whether Mar-Sep uses a different (denser) cadence -- bursaries only. */
  seasonalOverrideCron?: string;
  seasonalMonths?: number[]; // 1-12, months the override applies
  autoPublish: boolean;
  autoPublishNote: string;
}

/** Cron expressions are UTC; SAST is UTC+2 with no DST, so "03:00 SAST" = "0 1 * * *". */
export const CADENCE_RULES: CadenceRule[] = [
  {
    task: "linkHealthCheck",
    label: "Link health check (are apply URLs alive?)",
    cron: "0 */6 * * *",
    autoPublish: true,
    autoPublishNote: "Only flags dead links -- never changes a fact, safe to auto-publish.",
  },
  {
    task: "applicationWindows",
    label: "Application open/close dates",
    cron: "0 1 * * *", // 03:00 SAST daily
    autoPublish: false,
    autoPublishNote: "Always human-verified -- a wrong closing date costs a learner a year.",
  },
  {
    task: "bursaries",
    label: "Bursaries",
    cron: "0 3 * * 0", // weekly default (Sunday 05:00 SAST)
    seasonalOverrideCron: "0 3 * * *", // daily during Mar-Sep
    seasonalMonths: [3, 4, 5, 6, 7, 8, 9],
    autoPublish: false,
    autoPublishNote: "Never -- scam risk (see CLAUDE.md bursary/internship safety rules).",
  },
  {
    task: "internships",
    label: "Internships",
    cron: "0 3 * * *", // daily
    autoPublish: false,
    autoPublishNote: "Low-risk fields only (e.g. deadline countdown refresh); new listings queue for review.",
  },
  {
    task: "programmeRequirements",
    label: "Programme requirements & APS rules",
    cron: "0 2 1 * *", // monthly, 1st of month
    autoPublish: false,
    autoPublishNote: "Always human-verified -- feeds the APS engine directly.",
  },
  {
    task: "facultySchoolStructure",
    label: "Faculty/school structure",
    cron: "0 2 1 1,4,7,10 *", // quarterly
    autoPublish: false,
    autoPublishNote: "Always human-verified.",
  },
  {
    task: "nationalStatistics",
    label: "National statistics",
    cron: "0 2 1 1,4,7,10 *", // quarterly
    autoPublish: true,
    autoPublishNote: "Only if pulled from an official published dataset.",
  },
];

export interface IngestionBudget {
  perRunTokenLimit: number;
  perMonthTokenLimit: number;
  /** USD -- when exceeded, alert; pipeline continues until perMonthTokenLimit hits. */
  perMonthCostAlertUsd: number;
}

/** Conservative defaults for Tier 1 scale. Revisit once Tier 2/3 data is
 * being ingested -- see the Phase 0 cost estimate in the checkpoint response. */
export const INGESTION_BUDGET: IngestionBudget = {
  perRunTokenLimit: 200_000,
  perMonthTokenLimit: 5_000_000,
  perMonthCostAlertUsd: 50,
};

/** Global kill switch. When true, every scheduled ingestion route handler
 * must no-op immediately (log and return) regardless of cadence. The
 * "refresh now" admin button must also respect this. */
export const INGESTION_KILL_SWITCH = false;

/** robots.txt findings from Phase 0 research, recorded here so the fetch
 * stage doesn't have to re-derive them. UCT explicitly blocks AI-crawler
 * user agents by name in robots.txt -- this pipeline must not spoof its
 * user-agent to route around that; see CLAUDE.md stack notes. */
export const RESPECT_ROBOTS_TXT = true;
export const USER_AGENT = "UCAG-Ingestion-Bot/1.0 (+https://www.ucag.co.za/about-our-bot)"; // TODO(Phase 4): confirm final contact URL before first live run
