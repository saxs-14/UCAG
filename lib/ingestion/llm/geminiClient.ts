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
 */
export class GeminiLlmClient implements LlmClient {
  private readonly apiKey: string;
  private readonly model: string;

  constructor(options?: { model?: string }) {
    const env = getLlmEnv();
    if (!env.LLM_API_KEY) {
      throw new Error(
        "LLM_API_KEY is not configured -- copy .env.example to .env.local and set it before running live ingestion."
      );
    }
    this.apiKey = env.LLM_API_KEY;
    this.model = options?.model ?? process.env.LLM_MODEL ?? "gemini-flash-lite-latest";
  }

  async extract<T>(request: LlmExtractionRequest<T>): Promise<LlmExtractionResponse<T>> {
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

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${await response.text()}`);
    }

    const body = (await response.json()) as {
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
    };

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
    const validated = request.schema.parse(parsedJson);

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
