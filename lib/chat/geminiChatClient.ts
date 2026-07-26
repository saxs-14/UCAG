import "server-only";
import { getLlmEnv } from "@/lib/env/server";
import type { ChatMessage } from "./validateChatRequest";

/**
 * A second, independent Gemini caller alongside
 * lib/ingestion/llm/geminiClient.ts, not a shared abstraction --
 * deliberately. That client's whole shape (schema-validated structured
 * JSON extraction, throw-on-mismatch) doesn't fit a conversational
 * free-text reply, and this codebase already has precedent for
 * provider clients duplicating a small amount of request/response
 * plumbing rather than forcing two different jobs through one shared
 * interface (see geminiClient.ts's own comment on AnthropicClient.ts).
 * The pacing + 429-retry logic below is intentionally the same shape as
 * that file's, for the same reason documented there: the free tier's 15
 * requests/minute cap is real and shared across every Gemini consumer in
 * this process, ingestion and chat alike.
 */

const DEFAULT_MIN_INTERVAL_MS = 4200; // ~14.3 req/min, matches getLlmClient.ts's ingestion pacing
const DEFAULT_MAX_RETRIES = 2;
const MAX_BACKOFF_MS = 65_000;
const FALLBACK_BACKOFF_MS = 10_000;

let lastRequestAt = 0;

export function __resetGeminiChatRateLimiterForTests(): void {
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
    const raw = retryInfo?.retryDelay;
    if (!raw) return null;
    const seconds = Number.parseFloat(raw.replace(/s$/, ""));
    return Number.isFinite(seconds) ? Math.ceil(seconds * 1000) : null;
  } catch {
    return null;
  }
}

export interface ChatClientOptions {
  model?: string;
  minIntervalMs?: number;
  maxRetries?: number;
  sleep?: (ms: number) => Promise<void>;
}

export interface ChatReply {
  text: string;
  tokensUsed: number;
}

export class GeminiChatClient {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly minIntervalMs: number;
  private readonly maxRetries: number;
  private readonly sleep: (ms: number) => Promise<void>;

  constructor(options?: ChatClientOptions) {
    const env = getLlmEnv();
    if (!env.LLM_API_KEY) {
      throw new Error(
        "LLM_API_KEY is not configured -- copy .env.example to .env.local and set it before the chat assistant can respond."
      );
    }
    this.apiKey = env.LLM_API_KEY;
    this.model = options?.model ?? process.env.LLM_MODEL ?? "gemini-flash-lite-latest";
    this.minIntervalMs = options?.minIntervalMs ?? DEFAULT_MIN_INTERVAL_MS;
    this.maxRetries = options?.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.sleep = options?.sleep ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
  }

  private async waitForPacing(): Promise<void> {
    if (this.minIntervalMs <= 0) return;
    const remaining = this.minIntervalMs - (Date.now() - lastRequestAt);
    if (remaining > 0) await this.sleep(remaining);
  }

  /** systemPrompt is a caller-supplied parameter, not a client-internal
   * constant -- it's built per-request from live, verified Firestore
   * data (lib/chat/systemPrompt.ts + lib/catalog/getRealChatContext.ts),
   * not something this transport-level class should own or cache. */
  async reply(messages: ChatMessage[], systemPrompt: string): Promise<ChatReply> {
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
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: messages.map((m) => ({
              role: m.role,
              parts: [{ text: m.text }],
            })),
          }),
        }
      );

      if (response.ok) {
        return GeminiChatClient.parseResponse(await response.json());
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

  private static parseResponse(body: {
    candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
    usageMetadata?: {
      promptTokenCount?: number;
      candidatesTokenCount?: number;
      thoughtsTokenCount?: number;
    };
  }): ChatReply {
    const text = body.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error("Gemini response contained no reply text.");
    }
    const usage = body.usageMetadata;
    return {
      text: text.trim(),
      tokensUsed:
        (usage?.promptTokenCount ?? 0) +
        (usage?.candidatesTokenCount ?? 0) +
        (usage?.thoughtsTokenCount ?? 0),
    };
  }
}
