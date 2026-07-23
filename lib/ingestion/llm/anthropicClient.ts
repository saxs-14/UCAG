import "server-only";
import { getLlmEnv } from "@/lib/env/server";
import type { LlmClient, LlmExtractionRequest, LlmExtractionResponse } from "./client";

/**
 * Concrete LlmClient backed by the Anthropic Messages API. NOT
 * exercised against a real endpoint anywhere in this codebase yet -- no
 * LLM_API_KEY is configured for v2 (see README.md status). Built so the
 * pipeline has something real to call once a key exists; the interface
 * (lib/ingestion/llm/client.ts) is what everything else depends on, so
 * swapping providers later doesn't touch pipeline code.
 *
 * Deliberately asks for plain JSON in the response text rather than
 * building a JSON-Schema-from-Zod converter for tool-use mode -- fewer
 * moving parts, and the Zod validation below is the actual safety net
 * regardless of how the model was asked to respond.
 */
export class AnthropicLlmClient implements LlmClient {
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
    this.model = options?.model ?? "claude-haiku-4-5-20251001";
  }

  async extract<T>(request: LlmExtractionRequest<T>): Promise<LlmExtractionResponse<T>> {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 2048,
        messages: [
          {
            role: "user",
            content: `${request.instructions}\n\nRespond with ONLY a single JSON object, no prose, no markdown fences.\n\n---\n${request.sourceText}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status} ${await response.text()}`);
    }

    const body = (await response.json()) as {
      content: { type: string; text?: string }[];
      usage: { input_tokens: number; output_tokens: number };
    };

    const text = body.content.find((block) => block.type === "text")?.text;
    if (!text) {
      throw new Error("Anthropic response contained no text block to parse as JSON.");
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(text);
    } catch {
      throw new Error(`Model response was not valid JSON: ${text.slice(0, 200)}`);
    }

    // The one line that matters: reject, don't coerce, on schema mismatch.
    const validated = request.schema.parse(parsedJson);

    return {
      data: validated,
      tokensUsed: body.usage.input_tokens + body.usage.output_tokens,
    };
  }
}
