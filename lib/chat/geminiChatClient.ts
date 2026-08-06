import "server-only";
import { getLlmEnv } from "@/lib/env/server";
import { splitSseFrames } from "./sse";
import type { ChatMessage } from "./validateChatRequest";

/**
 * A second, independent Gemini caller alongside
 * lib/ingestion/llm/geminiClient.ts, not a shared abstraction --
 * deliberately. That client's whole shape (schema-validated structured
 * JSON extraction, throw-on-mismatch) doesn't fit a conversational,
 * streamed reply, and this codebase already has precedent for provider
 * clients duplicating a small amount of request/response plumbing
 * rather than forcing two different jobs through one shared interface
 * (see geminiClient.ts's own comment on AnthropicClient.ts). The pacing
 * + 429-retry logic below is intentionally the same shape as that
 * file's, for the same reason documented there: the free tier's 15
 * requests/minute cap is real and shared across every Gemini consumer
 * in this process, ingestion and chat alike.
 *
 * streamReply() replaces the old non-streaming reply(): every caller
 * (app/api/chat/route.ts) now wants tokens as they arrive, and the one
 * optional tool call this client supports needs a second request/response
 * round-trip anyway, which a plain single-shot reply() couldn't express
 * without route.ts reaching into this file's internals.
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
    const retryInfo = parsed.error?.details?.find((d) => d["@type"]?.endsWith("google.rpc.RetryInfo"));
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

export interface ToolDeclaration {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, { type: string; description: string }>;
    required: string[];
  };
}

export interface ToolCall {
  name: string;
  args: Record<string, unknown>;
}

/** A single function-calling tool this client can offer Gemini: its
 * declaration (sent to the model) paired with the executor that runs
 * when the model decides to call it. Kept as one unit -- rather than a
 * separate declaration + executor passed independently -- so it's
 * impossible to offer a tool the caller forgot to wire an executor for. */
export interface ChatTool {
  declaration: ToolDeclaration;
  execute: (call: ToolCall) => Promise<string>;
}

interface GeminiContent {
  role: "user" | "model";
  parts: GeminiPart[];
}

type GeminiPart =
  | { text: string }
  | { functionCall: { name: string; args: Record<string, unknown> } }
  | { functionResponse: { name: string; response: { result: string } } };

interface GeminiStreamChunk {
  candidates?: { content?: { parts?: GeminiPart[] }; finishReason?: string }[];
}

/** Gemini can pack multiple parts into one chunk (e.g. leading text plus
 * a trailing functionCall), so both extractors below scan every part
 * rather than assuming parts[0] is the only one that matters -- reading
 * only index 0 previously meant a functionCall sitting behind a text
 * part in the same chunk was silently missed, with no error and no log
 * line, just a context-only answer. */
function extractText(chunk: GeminiStreamChunk): string | null {
  const parts = chunk.candidates?.[0]?.content?.parts;
  if (!parts) return null;
  const text = parts
    .filter((part): part is { text: string } => "text" in part && !!part.text)
    .map((part) => part.text)
    .join("");
  return text || null;
}

function extractFunctionCall(chunk: GeminiStreamChunk): { name: string; args: Record<string, unknown> } | null {
  const parts = chunk.candidates?.[0]?.content?.parts;
  const part = parts?.find((p): p is Extract<GeminiPart, { functionCall: unknown }> => "functionCall" in p);
  return part ? part.functionCall : null;
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

  /** Low-level: one streamGenerateContent call, retried on 429 the same
   * way the old reply() was, yielding each parsed chunk as it arrives. */
  private async *streamRaw(
    contents: GeminiContent[],
    systemPrompt: string,
    tools?: ToolDeclaration[]
  ): AsyncGenerator<GeminiStreamChunk> {
    let attempt = 0;
    for (;;) {
      await this.waitForPacing();
      lastRequestAt = Date.now();

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:streamGenerateContent?alt=sse`,
        {
          method: "POST",
          headers: { "content-type": "application/json", "x-goog-api-key": this.apiKey },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents,
            ...(tools ? { tools: [{ functionDeclarations: tools }] } : {}),
          }),
        }
      );

      if (!response.ok) {
        const bodyText = await response.text();
        if (response.status === 429 && attempt < this.maxRetries) {
          const backoffMs = Math.min(parseRetryDelayMs(bodyText) ?? FALLBACK_BACKOFF_MS, MAX_BACKOFF_MS);
          attempt++;
          await this.sleep(backoffMs);
          continue;
        }
        throw new Error(`Gemini API error: ${response.status} ${bodyText}`);
      }

      if (!response.body) {
        throw new Error("Gemini streaming response had no body.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const { frames, rest } = splitSseFrames(buffer);
        buffer = rest;
        for (const frame of frames) {
          yield JSON.parse(frame.data) as GeminiStreamChunk;
        }
      }
      return;
    }
  }

  /** High-level: streams reply text for a conversation, optionally
   * offering one tool. If Gemini calls that tool, this runs the
   * executor and streams the follow-up reply instead of the raw
   * function-call. Any failure in that tool round-trip (the executor
   * throwing, or the follow-up Gemini call failing) falls back to a
   * plain reply with the tool omitted -- the caller never sees a
   * broken tool call, only a slightly plainer answer. */
  async *streamReply(messages: ChatMessage[], systemPrompt: string, tool?: ChatTool): AsyncGenerator<string> {
    const contents: GeminiContent[] = messages.map((m) => ({ role: m.role, parts: [{ text: m.text }] }));
    let yieldedAny = false;
    let functionCall: { name: string; args: Record<string, unknown> } | null = null;

    for await (const chunk of this.streamRaw(contents, systemPrompt, tool ? [tool.declaration] : undefined)) {
      const call = extractFunctionCall(chunk);
      if (call) {
        functionCall = call;
        break;
      }
      const text = extractText(chunk);
      if (text) {
        yieldedAny = true;
        yield text;
      }
    }

    if (functionCall && tool) {
      try {
        const toolResultText = await tool.execute(functionCall);
        const followUpContents: GeminiContent[] = [
          ...contents,
          { role: "model", parts: [{ functionCall }] },
          {
            role: "user",
            parts: [{ functionResponse: { name: functionCall.name, response: { result: toolResultText } } }],
          },
        ];
        for await (const chunk of this.streamRaw(followUpContents, systemPrompt)) {
          const text = extractText(chunk);
          if (text) {
            yieldedAny = true;
            yield text;
          }
        }
      } catch {
        for await (const chunk of this.streamRaw(contents, systemPrompt)) {
          const text = extractText(chunk);
          if (text) {
            yieldedAny = true;
            yield text;
          }
        }
      }
    }

    if (!yieldedAny) {
      throw new Error("Gemini response contained no reply text.");
    }
  }
}
