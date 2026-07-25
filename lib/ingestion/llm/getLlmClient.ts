import "server-only";
import { getLlmEnv } from "@/lib/env/server";
import { AnthropicLlmClient } from "./anthropicClient";
import { GeminiLlmClient } from "./geminiClient";
import type { LlmClient } from "./client";

/**
 * The one place that turns LLM_PROVIDER into a concrete client -- nothing
 * else in the pipeline imports AnthropicLlmClient or GeminiLlmClient
 * directly. Switching providers (e.g. free-tier Gemini now, Anthropic
 * later if volume outgrows Gemini's free-tier limits) is a one-line env
 * var change, not a code change.
 */
export function getLlmClient(): LlmClient {
  const env = getLlmEnv();
  const provider = env.LLM_PROVIDER?.toLowerCase();

  switch (provider) {
    case "gemini":
      return new GeminiLlmClient();
    case "anthropic":
      return new AnthropicLlmClient();
    default:
      throw new Error(
        `LLM_PROVIDER is "${env.LLM_PROVIDER ?? "(unset)"}" -- set it to "gemini" or "anthropic" in .env.local (alongside a real LLM_API_KEY) before running live ingestion.`
      );
  }
}
