import type { LlmClient, LlmExtractionRequest } from "./llm/client";

export type ExtractionOutcome<T> =
  | { success: true; data: T; tokensUsed: number }
  | { success: false; error: string };

/**
 * Stage 2 of the pipeline. Wraps LlmClient.extract so a single bad
 * extraction (network error, malformed JSON, Zod validation failure --
 * all of which the client throws on) becomes a loggable outcome instead
 * of crashing the whole ingestion run. "Reject and log anything that
 * fails validation rather than coercing it" (docs/MASTER_PROMPT_v2.md
 * Phase 4) -- the reject already happened inside the client (schema.parse
 * throws on mismatch); this function is where the log-instead-of-crash
 * part happens.
 */
export async function extractStructuredData<T>(
  client: LlmClient,
  request: LlmExtractionRequest<T>
): Promise<ExtractionOutcome<T>> {
  try {
    const response = await client.extract(request);
    return { success: true, data: response.data, tokensUsed: response.tokensUsed };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
