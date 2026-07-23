import type { RouteDecision, RouteInput } from "./types";

/** Below this confidence, a proposal always queues for review regardless
 * of anything else -- config over hardcode, but this one constant is
 * simple enough to keep local rather than adding a config file for a
 * single number. Revisit if more routing knobs show up. */
const MIN_AUTO_PUBLISH_CONFIDENCE = 0.9;
const MIN_AUTO_PUBLISH_CORROBORATION = 1;

/**
 * Stage 5 of the pipeline (docs/MASTER_PROMPT_v2.md Phase 4): "high-
 * confidence + corroborated + low-risk field -> auto-publish. Everything
 * else -> verificationQueue." High-risk fields (anything a learner acts
 * on directly -- dates, APS rules) never auto-publish even at 100%
 * confidence, because the task-level cadence config already says so
 * (config/ingestion.ts CADENCE_RULES.autoPublish is false for exactly
 * those tasks) -- this function just enforces that rather than trusting
 * each call site to remember.
 */
export function routeProposal(input: RouteInput): RouteDecision {
  if (!input.diffChanged) return "noChange";

  if (
    input.taskAutoPublish &&
    !input.isHighRiskField &&
    input.confidence >= MIN_AUTO_PUBLISH_CONFIDENCE &&
    input.corroboratingSourceCount >= MIN_AUTO_PUBLISH_CORROBORATION
  ) {
    return "autoPublish";
  }

  return "queueForReview";
}
