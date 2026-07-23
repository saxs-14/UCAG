import type { z } from "zod";

export interface LlmExtractionRequest<T> {
  /** The page content (or excerpt) to extract structured facts from. */
  sourceText: string;
  /** What to extract and how, in plain language -- the provider-specific
   * implementation is responsible for turning this into whatever
   * structured-output mechanism it supports (tool use, JSON mode, etc). */
  instructions: string;
  schema: z.ZodType<T>;
}

export interface LlmExtractionResponse<T> {
  data: T;
  /** Tokens actually billed for this call -- feeds lib/ingestion/budget.ts. */
  tokensUsed: number;
}

/**
 * Provider-agnostic interface. Nothing in the pipeline (lib/ingestion/
 * extract.ts) depends on which LLM provider is configured -- swap
 * implementations via config/ingestion.ts / LLM_PROVIDER without
 * touching pipeline logic. Implementations MUST throw (never coerce) on
 * output that doesn't validate against `schema` -- see
 * docs/MASTER_PROMPT_v2.md Phase 4: "Reject and log anything that fails
 * validation rather than coercing it."
 */
export interface LlmClient {
  extract<T>(request: LlmExtractionRequest<T>): Promise<LlmExtractionResponse<T>>;
}
