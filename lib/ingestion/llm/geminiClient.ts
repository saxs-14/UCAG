import "server-only";
import { getLlmEnv } from "@/lib/env/server";
import type { LlmClient, LlmExtractionRequest, LlmExtractionResponse } from "./client";

/**
 * Concrete LlmClient backed by the Google Gemini API -- the free-tier
 * option (no ongoing Anthropic API free tier exists; Gemini's Flash
 * models do, as of the research behind this choice: generous daily
 * request limits, no card required, no expiration). Same shape as
 * AnthropicClient.ts on purpose -- lib/ingestion/extract.ts and
 * everything above it doesn't know or care which provider is configured.
 *
 * Model name is deliberately not hardcoded to a specific dated version:
 * Google's free-tier model lineup has changed more than once in 2026
 * (Flash-only from April, version bumps since). Verify the current
 * free-tier-eligible model name in Google AI Studio when setting
 * LLM_API_KEY, and override via the `model` option or LLM_MODEL env var
 * if "gemini-flash-lite-latest" (a rolling alias, not a fact this codebase
 * can verify on your behalf) isn't current by the time you read this.
 *
 * Defaults to the *lite* alias, not "gemini-flash-latest", based on a
 * live-tested comparison against a real key: the full Flash model
 * (currently resolving to gemini-3.6-flash) is a mandatory-reasoning model
 * that spent 81-89 hidden "thinking" tokens replying to a one-word prompt
 * -- thinkingConfig.thinkingBudget:0 was rejected outright as an invalid
 * argument, so that cost cannot be turned off for that model. The lite
 * alias (currently gemini-3.5-flash-lite) produced zero thinking tokens by
 * default on the same prompts, including a realistic date-extraction JSON
 * task, while remaining free-tier eligible and answering correctly. Two
 * older non-reasoning models (gemini-2.0-flash, gemini-2.0-flash-lite)
 * were also tried and are NOT free-tier eligible on a fresh key (quota
 * limit 0) -- Google appears to have removed them from the free tier
 * rather than the lite alias being the exception.
 *
 * Rate limiting + 429 retry: live-verified against a real key and a real
 * batch run (25 sources) that the free tier's 15 requests/minute cap for
 * gemini-3.5-flash-lite is real and easy to hit -- an unpaced run burns
 * through it in well under a minute, and every source after that (plus
 * the next admin-triggered run, if started inside the same rolling
 * window) failed outright with a 429 and no recovery. Two independent
 * fixes, both needed:
 *  - `minIntervalMs` paces consecutive requests so a full run mostly
 *    never hits the cap in the first place. It's module-level (shared by
 *    every GeminiLlmClient instance in this process, not per-instance)
 *    because getLlmClient() constructs a fresh instance per API route
 *    call, and two runs seconds apart still share Google's actual quota
 *    window.
 *  - When the cap is hit anyway (concurrent runs, a low-headroom
 *    minIntervalMs, or genuine external usage), retry with the
 *    server-specified `retryDelay` from the 429 body rather than exponential
 *    backoff guesswork -- Gemini tells you exactly how long to wait.
 * Both default to off/near-real values here but are overridable via the
 * constructor specifically so the existing unit tests (which construct a
 * client per `it()` and expect immediate resolution) don't need touching;
 * getLlmClient() is what opts real ingestion runs into real pacing.
 */

export interface GeminiLlmClientOptions {
  model?: string;
  /** Minimum spacing enforced between consecutive requests, shared across
   * every GeminiLlmClient instance in this process. 0 (the default) means
   * no pacing -- fine for tests and for a single one-off call, wrong for
   * a real batch run. */
  minIntervalMs?: number;
  /** How many times to retry a 429 (quota exhausted) response, waiting
   * the delay Gemini itself reports, before giving up and letting the
   * caller record it as a failed extraction. */
  maxRetries?: number;
  /** Injectable so tests can assert on retry/pacing behavior without
   * real wall-clock waits. */
  sleep?: (ms: number) => Promise<void>;
}

const DEFAULT_MAX_RETRIES = 2;
const MAX_BACKOFF_MS = 65_000;
const FALLBACK_BACKOFF_MS = 10_000; // used only if a 429 body has no parseable retryDelay

let lastRequestAt = 0;

/** Test-only: the rate limiter's "last request" clock is module-level by
 * design (see the class doc comment), which would otherwise make tests
 * order-dependent on each other's timing. */
export function __resetGeminiRateLimiterForTests(): void {
  lastRequestAt = 0;
}

function parseRetryDelayMs(errorBodyText: string): number | null {
  try {
    const parsed = JSON.parse(errorBodyText) as {
      error?: { details?: { "@type"?: string; retryDelay?: string }[] };
    };
    const retryInfo = parsed.error?.details?.find((d) =>
      d["@type"]?.endsWith("google.rpc.RetryInfo")
    );
    const raw = retryInfo?.retryDelay; // e.g. "28.737225999s"
    if (!raw) return null;
    const seconds = Number.parseFloat(raw.replace(/s$/, ""));
    return Number.isFinite(seconds) ? Math.ceil(seconds * 1000) : null;
  } catch {
    return null;
  }
}

export class GeminiLlmClient implements LlmClient {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly minIntervalMs: number;
  private readonly maxRetries: number;
  private readonly sleep: (ms: number) => Promise<void>;

  constructor(options?: GeminiLlmClientOptions) {
    const env = getLlmEnv();
    if (!env.LLM_API_KEY) {
      throw new Error(
        "LLM_API_KEY is not configured -- copy .env.example to .env.local and set it before running live ingestion."
      );
    }
    this.apiKey = env.LLM_API_KEY;
    this.model = options?.model ?? process.env.LLM_MODEL ?? "gemini-flash-lite-latest";
    this.minIntervalMs = options?.minIntervalMs ?? 0;
    this.maxRetries = options?.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.sleep = options?.sleep ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
  }

  private async waitForPacing(): Promise<void> {
    if (this.minIntervalMs <= 0) return;
    const remaining = this.minIntervalMs - (Date.now() - lastRequestAt);
    if (remaining > 0) await this.sleep(remaining);
  }

  async extract<T>(request: LlmExtractionRequest<T>): Promise<LlmExtractionResponse<T>> {
    let attempt = 0;
    for (;;) {
      await this.waitForPacing();
      lastRequestAt = Date.now();

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-goog-api-key": this.apiKey,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `${request.instructions}\n\nRespond with ONLY a single JSON object, no prose, no markdown fences.\n\n---\n${request.sourceText}`,
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
            },
          }),
        }
      );

      if (response.ok) {
        return GeminiLlmClient.parseResponse(await response.json(), request.schema);
      }

      const bodyText = await response.text();
      if (response.status === 429 && attempt < this.maxRetries) {
        const backoffMs = Math.min(
          parseRetryDelayMs(bodyText) ?? FALLBACK_BACKOFF_MS,
          MAX_BACKOFF_MS
        );
        attempt++;
        await this.sleep(backoffMs);
        continue;
      }

      throw new Error(`Gemini API error: ${response.status} ${bodyText}`);
    }
  }

  private static parseResponse<T>(
    body: {
      candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
      usageMetadata?: {
        promptTokenCount?: number;
        candidatesTokenCount?: number;
        /** Hidden reasoning tokens on thinking-capable models (e.g. the
         * default gemini-flash-latest alias) -- live-verified to be the
         * majority of total token cost on a trivial prompt (81-89 of ~90
         * tokens). Not billed separately from output tokens by Gemini, but
         * must still count toward this app's own budget tracking or
         * checkBudgetLive() silently undercounts real usage. */
        thoughtsTokenCount?: number;
      };
    },
    schema: LlmExtractionRequest<T>["schema"]
  ): LlmExtractionResponse<T> {
    const text = body.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error("Gemini response contained no text to parse as JSON.");
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(text);
    } catch {
      throw new Error(`Model response was not valid JSON: ${text.slice(0, 200)}`);
    }

    // The one line that matters: reject, don't coerce, on schema mismatch.
    const validated = schema.parse(parsedJson);

    const usage = body.usageMetadata;
    return {
      data: validated,
      tokensUsed:
        (usage?.promptTokenCount ?? 0) +
        (usage?.candidatesTokenCount ?? 0) +
        (usage?.thoughtsTokenCount ?? 0),
    };
  }
}
