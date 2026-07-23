/**
 * Pipeline-internal types for the Phase 4 ingestion system. Unlike
 * lib/aps and lib/matching, this directory is allowed to do I/O (fetch,
 * eventually Firestore writes) -- it has no "no framework imports"
 * requirement from the brief. Still kept framework-agnostic (no
 * React/Next.js-specific types) so the pure decision logic
 * (budget/diff/route/bursarySafety) stays trivially unit-testable.
 */

export interface FetchOutcome {
  url: string;
  /** True if the response differed from what we had on record (new ETag/
   * Last-Modified/body) -- false means "stop here, no LLM call needed." */
  changed: boolean;
  statusCode: number | null;
  etag: string | null;
  lastModified: string | null;
  body: string | null;
  /** Set when the fetch was skipped or failed -- robots disallow, network
   * error, timeout, etc. Never throws; the pipeline logs and moves on. */
  error: string | null;
  fetchedAt: string;
}

export interface DiffOutcome<T = unknown> {
  changed: boolean;
  currentValue: T | undefined;
  proposedValue: T;
}

export type RouteDecision = "autoPublish" | "queueForReview" | "noChange";

export interface RouteInput {
  taskAutoPublish: boolean;
  confidence: number; // 0-1
  corroboratingSourceCount: number;
  isHighRiskField: boolean;
  diffChanged: boolean;
}

export interface BudgetState {
  tokensUsedThisRun: number;
  tokensUsedThisMonth: number;
}

export interface BudgetCheckResult {
  allowed: boolean;
  reason: string | null;
}
