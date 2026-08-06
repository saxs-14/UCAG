# Chat Backend Innovation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make UCAG's chat assistant stream real-time replies with one grounded
function-call tool (safely falling back to today's behavior on any failure), add an
honest live trust banner from real Firestore counts, and add security headers — all
demoable by tomorrow's customer walkthrough without touching data coverage or the
app's verification guarantees.

**Architecture:** `GeminiChatClient` gains a `streamReply()` async generator that
speaks Gemini's `streamGenerateContent?alt=sse` endpoint and optionally attaches one
function-calling tool; a shared `lib/chat/sse.ts` module formats/parses the SSE wire
format used both for Gemini's incoming stream and this app's outgoing stream to the
browser. `app/api/chat/route.ts` peeks the first chunk (to preserve today's JSON-error
behavior on total failure) then streams the rest as `text/event-stream`.
`ChatWidget.tsx` reads that stream incrementally. A parallel, independent piece
(`getCatalogStats.ts` + `NavBar`) surfaces real verified-record counts. Security
headers are additive `next.config.ts` config, unrelated to the above.

**Tech Stack:** Next.js 15 App Router (TypeScript strict), Firebase Admin SDK
(Firestore), Gemini REST API (`generativelanguage.googleapis.com/v1beta`), Vitest +
`vi.stubGlobal("fetch", ...)` for testing, Zod (unchanged, no new schemas needed here).

## Global Constraints

- Secrets never reach the browser — every Gemini call stays server-side (unchanged;
  this plan doesn't touch that boundary).
- Every fact-bearing Firestore read goes through `isFactVerified()` before it's used —
  the new tool and the new stats aggregation both filter through it, same as every
  existing catalog read.
- No new institutions/programmes/facts are added or fabricated by this plan.
- `npm run typecheck` must stay clean after every task.
- Relevant Vitest suites must stay green after every task — run the full suite
  (`npm test`) at least once per task, not just the new file's tests.
- No secret-shaped file may be newly tracked by git — check `git status` before each
  commit.
- A failure in the new tool-calling path must degrade to today's known-working
  chat behavior, never a broken/blank reply.

---

## Task 1: Shared SSE helpers

**Files:**
- Create: `lib/chat/sse.ts`
- Test: `lib/chat/sse.test.ts`

**Interfaces:**
- Produces: `formatSseEvent(data: unknown, event?: string): string`,
  `splitSseFrames(buffer: string): { frames: ParsedSseFrame[]; rest: string }`,
  `interface ParsedSseFrame { event: string; data: string }` — all exported from
  `lib/chat/sse.ts`. No dependencies on any other new file.

- [ ] **Step 1: Write the failing test**

Create `lib/chat/sse.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { formatSseEvent, splitSseFrames } from "./sse";

describe("formatSseEvent", () => {
  it("formats a plain data frame with no event name", () => {
    expect(formatSseEvent({ text: "hi" })).toBe('data: {"text":"hi"}\n\n');
  });

  it("formats a named event frame", () => {
    expect(formatSseEvent({}, "done")).toBe("event: done\ndata: {}\n\n");
  });
});

describe("splitSseFrames", () => {
  it("returns no frames and the whole buffer as rest when there's no complete frame yet", () => {
    const result = splitSseFrames('data: {"text":"partial');
    expect(result.frames).toEqual([]);
    expect(result.rest).toBe('data: {"text":"partial');
  });

  it("extracts one complete frame and leaves the remainder as rest", () => {
    const result = splitSseFrames('data: {"text":"hi"}\n\ndata: {"text":"more');
    expect(result.frames).toEqual([{ event: "message", data: '{"text":"hi"}' }]);
    expect(result.rest).toBe('data: {"text":"more');
  });

  it("extracts multiple complete frames in one call", () => {
    const result = splitSseFrames(
      'data: {"text":"one"}\n\ndata: {"text":"two"}\n\n'
    );
    expect(result.frames).toEqual([
      { event: "message", data: '{"text":"one"}' },
      { event: "message", data: '{"text":"two"}' },
    ]);
    expect(result.rest).toBe("");
  });

  it("reads the event name when a frame has one", () => {
    const result = splitSseFrames('event: done\ndata: {}\n\n');
    expect(result.frames).toEqual([{ event: "done", data: "{}" }]);
  });

  it("ignores a frame with no data line", () => {
    const result = splitSseFrames("event: done\n\ndata: {\"text\":\"hi\"}\n\n");
    expect(result.frames).toEqual([{ event: "message", data: '{"text":"hi"}' }]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/chat/sse.test.ts`
Expected: FAIL — `Cannot find module './sse'` (the module doesn't exist yet).

- [ ] **Step 3: Write the implementation**

Create `lib/chat/sse.ts`:

```ts
/**
 * Minimal SSE helpers shared by both directions of this app's chat
 * streaming: lib/chat/geminiChatClient.ts uses splitSseFrames to parse
 * Gemini's incoming streamGenerateContent?alt=sse response, and
 * app/api/chat/route.ts uses formatSseEvent to write the outgoing
 * stream this app sends the browser -- which components/chat/ChatWidget.tsx
 * parses with splitSseFrames again. One tested wire format, three call
 * sites, instead of three separate ad-hoc parsers.
 */

export function formatSseEvent(data: unknown, event?: string): string {
  const lines: string[] = [];
  if (event) lines.push(`event: ${event}`);
  lines.push(`data: ${JSON.stringify(data)}`);
  return lines.join("\n") + "\n\n";
}

export interface ParsedSseFrame {
  event: string;
  data: string;
}

/** Splits a raw SSE byte buffer (already decoded to text) into complete
 * frames -- each terminated by a blank line, per the SSE spec -- plus
 * whatever incomplete tail remains for the next chunk. A frame with no
 * `data:` line is dropped; this app never sends a dataless frame on
 * purpose, so treating one as noise (rather than throwing) is the
 * simpler, equally-correct behavior. */
export function splitSseFrames(buffer: string): { frames: ParsedSseFrame[]; rest: string } {
  const frames: ParsedSseFrame[] = [];
  let rest = buffer;
  let boundary: number;

  while ((boundary = rest.indexOf("\n\n")) !== -1) {
    const rawFrame = rest.slice(0, boundary);
    rest = rest.slice(boundary + 2);

    const lines = rawFrame.split("\n");
    const eventLine = lines.find((l) => l.startsWith("event: "));
    const dataLine = lines.find((l) => l.startsWith("data: "));

    if (dataLine) {
      frames.push({
        event: eventLine ? eventLine.slice("event: ".length) : "message",
        data: dataLine.slice("data: ".length),
      });
    }
  }

  return { frames, rest };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/chat/sse.test.ts`
Expected: PASS (9 tests).

- [ ] **Step 5: Typecheck**

Run: `npm run typecheck`
Expected: clean, no errors.

- [ ] **Step 6: Commit**

```bash
git add lib/chat/sse.ts lib/chat/sse.test.ts
git commit -m "feat(chat): add shared SSE format/parse helpers"
```

---

## Task 2: Streaming + tool-calling in GeminiChatClient

**Files:**
- Modify: `lib/chat/geminiChatClient.ts` (full rewrite of its public surface — `reply()`
  and `ChatReply` are removed since nothing will call them after Task 4; `streamReply()`
  replaces them)
- Modify: `lib/chat/geminiChatClient.test.ts` (full rewrite, mirroring the removed
  `reply()` coverage against the new `streamReply()`)

**Interfaces:**
- Consumes: `splitSseFrames` from `lib/chat/sse.ts` (Task 1); `ChatMessage` from
  `./validateChatRequest` (existing, unchanged); `getLlmEnv` from `@/lib/env/server`
  (existing, unchanged).
- Produces (from `lib/chat/geminiChatClient.ts`):
  - `interface ToolDeclaration { name: string; description: string; parameters: { type: "object"; properties: Record<string, { type: string; description: string }>; required: string[] } }`
  - `interface ToolCall { name: string; args: Record<string, unknown> }`
  - `interface ChatTool { declaration: ToolDeclaration; execute: (call: ToolCall) => Promise<string> }`
  - `class GeminiChatClient` with `constructor(options?: ChatClientOptions)` (unchanged
    shape) and `streamReply(messages: ChatMessage[], systemPrompt: string, tool?: ChatTool): AsyncGenerator<string>`
  - `__resetGeminiChatRateLimiterForTests(): void` (unchanged, still exported)

- [ ] **Step 1: Write the failing tests**

Replace the full contents of `lib/chat/geminiChatClient.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { GeminiChatClient, __resetGeminiChatRateLimiterForTests, type ChatTool } from "./geminiChatClient";

const TEST_SYSTEM_PROMPT = "You are a test assistant.";

function sseBody(frames: Record<string, unknown>[]): string {
  return frames.map((f) => `data: ${JSON.stringify(f)}\n\n`).join("");
}

function textChunk(text: string) {
  return { candidates: [{ content: { parts: [{ text }] } }] };
}

function functionCallChunk(name: string, args: Record<string, unknown>) {
  return { candidates: [{ content: { parts: [{ functionCall: { name, args } }] } }] };
}

/** One fake streaming HTTP response per call -- chained with
 * mockResolvedValueOnce the same way the old reply() tests chained
 * plain JSON responses, just with an SSE body delivered in one read(). */
function streamResponse(frames: Record<string, unknown>[], ok = true, status = 200) {
  const bodyText = sseBody(frames);
  const encoder = new TextEncoder();
  let sent = false;
  return {
    ok,
    status,
    text: async () => bodyText,
    body: {
      getReader: () => ({
        read: async () => {
          if (sent) return { done: true, value: undefined };
          sent = true;
          return { done: false, value: encoder.encode(bodyText) };
        },
      }),
    },
  };
}

async function collect(gen: AsyncGenerator<string>): Promise<string> {
  let out = "";
  for await (const chunk of gen) out += chunk;
  return out;
}

describe("GeminiChatClient", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    __resetGeminiChatRateLimiterForTests();
  });

  it("throws immediately when LLM_API_KEY isn't configured", () => {
    delete process.env.LLM_API_KEY;
    expect(() => new GeminiChatClient()).toThrow(/LLM_API_KEY is not configured/);
  });

  it("streams text chunks as they arrive, and sends the full message history", async () => {
    vi.stubEnv("LLM_API_KEY", "fake-gemini-key");
    const fetchSpy = vi.fn(async () => streamResponse([textChunk("APS stands for "), textChunk("Admission Point Score.")]));
    vi.stubGlobal("fetch", fetchSpy);

    const client = new GeminiChatClient({ minIntervalMs: 0 });
    const text = await collect(
      client.streamReply(
        [
          { role: "user", text: "Hi" },
          { role: "model", text: "Hello!" },
          { role: "user", text: "What is APS?" },
        ],
        TEST_SYSTEM_PROMPT
      )
    );

    expect(text).toBe("APS stands for Admission Point Score.");
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("streamGenerateContent");
    expect(url).toContain("alt=sse");
    expect((init.headers as Record<string, string>)["x-goog-api-key"]).toBe("fake-gemini-key");
    const parsedBody = JSON.parse(init.body as string) as {
      systemInstruction: { parts: { text: string }[] };
      contents: { role: string; parts: { text: string }[] }[];
      tools?: unknown;
    };
    expect(parsedBody.systemInstruction.parts[0]!.text).toBe(TEST_SYSTEM_PROMPT);
    expect(parsedBody.contents.map((c) => c.role)).toEqual(["user", "model", "user"]);
    expect(parsedBody.tools).toBeUndefined();
  });

  it("throws a clear error when the stream contains no text and no function call", async () => {
    vi.stubEnv("LLM_API_KEY", "fake-gemini-key");
    vi.stubGlobal("fetch", vi.fn(async () => streamResponse([{ candidates: [{ finishReason: "STOP" }] }])));

    const client = new GeminiChatClient({ minIntervalMs: 0 });
    await expect(collect(client.streamReply([{ role: "user", text: "hi" }], TEST_SYSTEM_PROMPT))).rejects.toThrow(
      /contained no reply text/
    );
  });

  it("throws on a non-ok response with no retries when maxRetries is 0", async () => {
    vi.stubEnv("LLM_API_KEY", "fake-gemini-key");
    vi.stubGlobal("fetch", vi.fn(async () => streamResponse([], false, 500)));

    const client = new GeminiChatClient({ minIntervalMs: 0, maxRetries: 0 });
    await expect(collect(client.streamReply([{ role: "user", text: "hi" }], TEST_SYSTEM_PROMPT))).rejects.toThrow(
      /Gemini API error: 500/
    );
  });

  it("retries a 429 using the server-specified retryDelay, then succeeds", async () => {
    vi.stubEnv("LLM_API_KEY", "fake-gemini-key");
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: async () =>
          JSON.stringify({
            error: { details: [{ "@type": "type.googleapis.com/google.rpc.RetryInfo", retryDelay: "1.5s" }] },
          }),
      })
      .mockResolvedValueOnce(streamResponse([textChunk("ok")]));
    vi.stubGlobal("fetch", fetchSpy);
    const sleep = vi.fn(async () => {});

    const client = new GeminiChatClient({ minIntervalMs: 0, sleep });
    const text = await collect(client.streamReply([{ role: "user", text: "hi" }], TEST_SYSTEM_PROMPT));

    expect(text).toBe("ok");
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledWith(1500);
  });

  it("paces consecutive calls by default (production default is non-zero)", async () => {
    vi.stubEnv("LLM_API_KEY", "fake-gemini-key");
    vi.stubGlobal("fetch", vi.fn(async () => streamResponse([textChunk("ok")])));
    const sleep = vi.fn(async () => {});

    const client = new GeminiChatClient({ sleep });
    await collect(client.streamReply([{ role: "user", text: "hi" }], TEST_SYSTEM_PROMPT));
    await collect(client.streamReply([{ role: "user", text: "hi again" }], TEST_SYSTEM_PROMPT));

    expect(sleep).toHaveBeenCalledTimes(1);
  });

  it("calls the tool's executor on a function call and streams the follow-up reply", async () => {
    vi.stubEnv("LLM_API_KEY", "fake-gemini-key");
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(streamResponse([functionCallChunk("lookupVerifiedFact", { institutionName: "UMP" })]))
      .mockResolvedValueOnce(streamResponse([textChunk("UMP's programme requires APS 32.")]));
    vi.stubGlobal("fetch", fetchSpy);

    const execute = vi.fn(async () => "UMP programme: minimum APS 32.");
    const tool: ChatTool = {
      declaration: {
        name: "lookupVerifiedFact",
        description: "test tool",
        parameters: { type: "object", properties: {}, required: [] },
      },
      execute,
    };

    const client = new GeminiChatClient({ minIntervalMs: 0 });
    const text = await collect(client.streamReply([{ role: "user", text: "hi" }], TEST_SYSTEM_PROMPT, tool));

    expect(text).toBe("UMP's programme requires APS 32.");
    expect(execute).toHaveBeenCalledWith({ name: "lookupVerifiedFact", args: { institutionName: "UMP" } });

    // First call offered the tool; second call sent the function result back.
    const [, firstInit] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const firstBody = JSON.parse(firstInit.body as string) as { tools?: unknown };
    expect(firstBody.tools).toEqual([{ functionDeclarations: [tool.declaration] }]);

    const [, secondInit] = fetchSpy.mock.calls[1] as [string, RequestInit];
    const secondBody = JSON.parse(secondInit.body as string) as { contents: { role: string; parts: unknown[] }[] };
    expect(secondBody.contents.at(-1)).toEqual({
      role: "user",
      parts: [{ functionResponse: { name: "lookupVerifiedFact", response: { result: "UMP programme: minimum APS 32." } } }],
    });
  });

  it("falls back to a tool-less reply when the tool executor throws", async () => {
    vi.stubEnv("LLM_API_KEY", "fake-gemini-key");
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(streamResponse([functionCallChunk("lookupVerifiedFact", { institutionName: "UMP" })]))
      .mockResolvedValueOnce(streamResponse([textChunk("Here's what I generally know.")]));
    vi.stubGlobal("fetch", fetchSpy);

    const tool: ChatTool = {
      declaration: { name: "lookupVerifiedFact", description: "test tool", parameters: { type: "object", properties: {}, required: [] } },
      execute: vi.fn(async () => {
        throw new Error("Firestore unavailable");
      }),
    };

    const client = new GeminiChatClient({ minIntervalMs: 0 });
    const text = await collect(client.streamReply([{ role: "user", text: "hi" }], TEST_SYSTEM_PROMPT, tool));

    expect(text).toBe("Here's what I generally know.");
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    // The fallback call must NOT offer the tool again (avoids an infinite loop).
    const [, fallbackInit] = fetchSpy.mock.calls[1] as [string, RequestInit];
    const fallbackBody = JSON.parse(fallbackInit.body as string) as { tools?: unknown };
    expect(fallbackBody.tools).toBeUndefined();
  });

  it("falls back to a tool-less reply when the follow-up Gemini call fails", async () => {
    vi.stubEnv("LLM_API_KEY", "fake-gemini-key");
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(streamResponse([functionCallChunk("lookupVerifiedFact", { institutionName: "UMP" })]))
      .mockResolvedValueOnce(streamResponse([], false, 500))
      .mockResolvedValueOnce(streamResponse([textChunk("Here's what I generally know.")]));
    vi.stubGlobal("fetch", fetchSpy);

    const tool: ChatTool = {
      declaration: { name: "lookupVerifiedFact", description: "test tool", parameters: { type: "object", properties: {}, required: [] } },
      execute: vi.fn(async () => "UMP programme: minimum APS 32."),
    };

    const client = new GeminiChatClient({ minIntervalMs: 0, maxRetries: 0 });
    const text = await collect(client.streamReply([{ role: "user", text: "hi" }], TEST_SYSTEM_PROMPT, tool));

    expect(text).toBe("Here's what I generally know.");
    expect(fetchSpy).toHaveBeenCalledTimes(3);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run lib/chat/geminiChatClient.test.ts`
Expected: FAIL — `streamReply is not a function` (current file only has `reply()`).

- [ ] **Step 3: Write the implementation**

Replace the full contents of `lib/chat/geminiChatClient.ts`:

```ts
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

function extractText(chunk: GeminiStreamChunk): string | null {
  const part = chunk.candidates?.[0]?.content?.parts?.[0];
  return part && "text" in part && part.text ? part.text : null;
}

function extractFunctionCall(chunk: GeminiStreamChunk): { name: string; args: Record<string, unknown> } | null {
  const part = chunk.candidates?.[0]?.content?.parts?.[0];
  return part && "functionCall" in part ? part.functionCall : null;
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run lib/chat/geminiChatClient.test.ts`
Expected: PASS (9 tests).

- [ ] **Step 5: Typecheck**

Run: `npm run typecheck`
Expected: FAIL at this point — `app/api/chat/route.ts` still calls the now-removed
`client.reply(...)`. This is expected; Task 4 fixes it. Confirm the *only* errors are
in `app/api/chat/route.ts`, nothing else.

- [ ] **Step 6: Commit**

```bash
git add lib/chat/geminiChatClient.ts lib/chat/geminiChatClient.test.ts
git commit -m "feat(chat): replace GeminiChatClient.reply with streaming + tool-call support"
```

---

## Task 3: Verified-fact lookup tool

**Files:**
- Create: `lib/chat/tools/lookupVerifiedFact.ts`
- Test: `lib/chat/tools/lookupVerifiedFact.test.ts`

**Interfaces:**
- Consumes: `ChatTool`, `ToolCall` from `lib/chat/geminiChatClient.ts` (Task 2);
  `isFactVerified`, `Institution`, `Programme` from `@/lib/firestore/types` (existing);
  `getAdminDb` from `@/lib/firebase/admin` (existing).
- Produces: `LOOKUP_VERIFIED_FACT_CHAT_TOOL: ChatTool` and
  `matchVerifiedFact(catalog: { institutions: Institution[]; programmes: Programme[] }, args: { institutionName: string; programmeName: string }): { found: boolean; summary: string }`
  from `lib/chat/tools/lookupVerifiedFact.ts` — Task 4 imports
  `LOOKUP_VERIFIED_FACT_CHAT_TOOL` directly.

- [ ] **Step 1: Write the failing test**

Create `lib/chat/tools/lookupVerifiedFact.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { matchVerifiedFact } from "./lookupVerifiedFact";
import type { Institution, Programme } from "@/lib/firestore/types";

const PROVENANCE = { sourceUrl: "https://example.test/", verifiedOn: "2026-07-26", academicYear: 2027 };

function makeInstitution(overrides: Partial<Institution> = {}): Institution {
  return {
    id: "ump",
    name: "University of Mpumalanga",
    shortName: "UMP",
    type: "traditionalUniversity",
    province: "Mpumalanga",
    tier: 1,
    campuses: ["Mbombela"],
    websiteUrl: "https://www.ump.ac.za/",
    applicationPortalUrl: null,
    appliesThroughThirdParty: null,
    statusCheckUrl: null,
    nbtRequired: false,
    logoUrl: null,
    ...PROVENANCE,
    ...overrides,
  };
}

function makeProgramme(overrides: Partial<Programme> = {}): Programme {
  return {
    id: "ump-ba-media",
    institutionId: "ump",
    facultyId: "ump-fac",
    schoolId: "ump-fac",
    name: "Bachelor of Arts in Media, Communication and Culture",
    qualificationType: "bachelorsDegree",
    nqfLevel: 7,
    saqaId: null,
    duration: "3 years",
    campuses: [],
    modeOfDelivery: "contact",
    minAps: 32,
    subjectRequirements: [{ subjectCode: "MATH", minLevel: 2 }],
    additionalRequirements: ["English at NSC level 4"],
    careerOutcomes: [],
    applyUrl: null,
    fieldTags: [],
    ...PROVENANCE,
    ...overrides,
  };
}

describe("matchVerifiedFact", () => {
  it("returns a summary with APS, requirements, and provenance for a real match", () => {
    const result = matchVerifiedFact(
      { institutions: [makeInstitution()], programmes: [makeProgramme()] },
      { institutionName: "UMP", programmeName: "Media" }
    );
    expect(result.found).toBe(true);
    expect(result.summary).toContain("Bachelor of Arts in Media, Communication and Culture at University of Mpumalanga");
    expect(result.summary).toContain("minimum APS 32");
    expect(result.summary).toContain("MATH level 2");
    expect(result.summary).toContain("English at NSC level 4");
    expect(result.summary).toContain("verified 2026-07-26");
    expect(result.summary).toContain("https://example.test/");
  });

  it("matches by institution short name too", () => {
    const result = matchVerifiedFact(
      { institutions: [makeInstitution()], programmes: [makeProgramme()] },
      { institutionName: "ump", programmeName: "media" }
    );
    expect(result.found).toBe(true);
  });

  it("reports no match when the institution isn't on record", () => {
    const result = matchVerifiedFact(
      { institutions: [], programmes: [] },
      { institutionName: "Some Unknown College", programmeName: "Anything" }
    );
    expect(result.found).toBe(false);
    expect(result.summary).toContain('No verified institution on record matching "Some Unknown College"');
  });

  it("reports the institution but no matching programme when only the programme is missing", () => {
    const result = matchVerifiedFact(
      { institutions: [makeInstitution()], programmes: [makeProgramme()] },
      { institutionName: "UMP", programmeName: "Nonexistent Programme" }
    );
    expect(result.found).toBe(false);
    expect(result.summary).toContain("University of Mpumalanga is on record");
    expect(result.summary).toContain('no verified programme matching "Nonexistent Programme"');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/chat/tools/lookupVerifiedFact.test.ts`
Expected: FAIL — `Cannot find module './lookupVerifiedFact'`.

- [ ] **Step 3: Write the implementation**

Create `lib/chat/tools/lookupVerifiedFact.ts`:

```ts
import "server-only";
import { getAdminDb } from "@/lib/firebase/admin";
import { isFactVerified } from "@/lib/firestore/types";
import type { Institution, Programme } from "@/lib/firestore/types";
import type { ChatTool, ToolCall } from "@/lib/chat/geminiChatClient";

/**
 * The one function-calling tool the chat assistant can call
 * (lib/chat/geminiChatClient.ts's ChatTool), for a precise, live answer
 * about a specific institution/programme instead of relying only on the
 * whole-catalog text dump in lib/chat/systemPrompt.ts. Reuses the same
 * isFactVerified()-gated reads every other real-data surface in this
 * app uses -- no new trust logic, just a narrower, on-demand lookup
 * over data that's already trusted.
 */

export interface LookupableCatalog {
  institutions: Institution[];
  programmes: Programme[];
}

export interface LookupVerifiedFactResult {
  found: boolean;
  summary: string;
}

/** Pure matching logic, split out from the Firestore fetch so it's
 * testable without an emulator -- same pattern as
 * lib/catalog/getRealChatContext.ts's formatChatContext(). Substring,
 * case-insensitive match, first hit wins: the catalog is small enough
 * today (8 institutions) that this is unambiguous. */
export function matchVerifiedFact(
  catalog: LookupableCatalog,
  args: { institutionName: string; programmeName: string }
): LookupVerifiedFactResult {
  const institutionNeedle = args.institutionName.trim().toLowerCase();
  const institution = catalog.institutions.find(
    (i) => i.name.toLowerCase().includes(institutionNeedle) || i.shortName.toLowerCase().includes(institutionNeedle)
  );
  if (!institution) {
    return { found: false, summary: `No verified institution on record matching "${args.institutionName}".` };
  }

  const programmeNeedle = args.programmeName.trim().toLowerCase();
  const programme = catalog.programmes.find(
    (p) => p.institutionId === institution.id && p.name.toLowerCase().includes(programmeNeedle)
  );
  if (!programme) {
    return {
      found: false,
      summary: `${institution.name} is on record, but no verified programme matching "${args.programmeName}" was found for it.`,
    };
  }

  const requirements = programme.subjectRequirements
    .map(
      (r) =>
        `${r.subjectCode}${r.minLevel !== undefined ? ` level ${r.minLevel}` : ""}${r.minPercent !== undefined ? ` ${r.minPercent}%` : ""}`
    )
    .concat(programme.additionalRequirements)
    .join("; ");

  return {
    found: true,
    summary: `${programme.name} at ${institution.name}${
      programme.minAps !== null ? ` -- minimum APS ${programme.minAps}` : ""
    }${requirements ? ` -- requires ${requirements}` : ""} (verified ${programme.verifiedOn}, source ${programme.sourceUrl}).`,
  };
}

async function lookupVerifiedFact(args: { institutionName: string; programmeName: string }): Promise<LookupVerifiedFactResult> {
  const db = getAdminDb();
  const [institutionsSnap, programmesSnap] = await Promise.all([
    db.collection("institutions").get(),
    db.collection("programmes").get(),
  ]);
  const institutions = institutionsSnap.docs
    .map((doc) => ({ ...(doc.data() as Omit<Institution, "id">), id: doc.id }))
    .filter(isFactVerified);
  const programmes = programmesSnap.docs
    .map((doc) => ({ ...(doc.data() as Omit<Programme, "id">), id: doc.id }))
    .filter(isFactVerified);
  return matchVerifiedFact({ institutions, programmes }, args);
}

function toLookupArgs(call: ToolCall): { institutionName: string; programmeName: string } {
  return {
    institutionName: typeof call.args.institutionName === "string" ? call.args.institutionName : "",
    programmeName: typeof call.args.programmeName === "string" ? call.args.programmeName : "",
  };
}

export const LOOKUP_VERIFIED_FACT_CHAT_TOOL: ChatTool = {
  declaration: {
    name: "lookupVerifiedFact",
    description:
      "Look up a specific programme's verified admission requirements at a specific South African institution, from UCAG's own verified records. Use this when a learner asks about a specific real programme or institution not already fully covered by the verified records already given to you.",
    parameters: {
      type: "object",
      properties: {
        institutionName: {
          type: "string",
          description: "The institution's name, e.g. 'University of Mpumalanga' or 'UMP'.",
        },
        programmeName: {
          type: "string",
          description: "The programme's name, e.g. 'Bachelor of Arts in Media, Communication and Culture'.",
        },
      },
      required: ["institutionName", "programmeName"],
    },
  },
  execute: async (call) => (await lookupVerifiedFact(toLookupArgs(call))).summary,
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/chat/tools/lookupVerifiedFact.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Typecheck**

Run: `npm run typecheck`
Expected: still failing only in `app/api/chat/route.ts` (Task 4 fixes it) — confirm no
new errors from this task's files.

- [ ] **Step 6: Commit**

```bash
git add lib/chat/tools/lookupVerifiedFact.ts lib/chat/tools/lookupVerifiedFact.test.ts
git commit -m "feat(chat): add grounded lookupVerifiedFact tool for the chat assistant"
```

---

## Task 4: Wire streaming + tool into the chat API route

**Files:**
- Modify: `app/api/chat/route.ts`

**Interfaces:**
- Consumes: `GeminiChatClient.streamReply` (Task 2), `LOOKUP_VERIFIED_FACT_CHAT_TOOL`
  (Task 3), `formatSseEvent` (Task 1), plus existing
  `validateChatRequest`/`checkChatRateLimit`/`buildChatSystemPrompt`/
  `getRealChatContext`/`reportError` (all unchanged).
- Produces: `POST` handler now returns `Content-Type: text/event-stream` on success
  (200) instead of one JSON body — this is the contract Task 5's `ChatWidget.tsx`
  consumes. Frame shapes: `data: {"text":"..."}\n\n` per chunk,
  `event: done\ndata: {}\n\n` to end normally, `event: error\ndata: {"error":"..."}\n\n`
  if the stream fails partway. Non-200 responses (400/429/501/502) are unchanged plain
  JSON, exactly as today.

- [ ] **Step 1: Write the implementation**

Replace the full contents of `app/api/chat/route.ts`:

```ts
import { NextResponse, type NextRequest } from "next/server";
import { GeminiChatClient } from "@/lib/chat/geminiChatClient";
import { validateChatRequest } from "@/lib/chat/validateChatRequest";
import { checkChatRateLimit } from "@/lib/chat/rateLimiter";
import { buildChatSystemPrompt } from "@/lib/chat/systemPrompt";
import { getRealChatContext } from "@/lib/catalog/getRealChatContext";
import { LOOKUP_VERIFIED_FACT_CHAT_TOOL } from "@/lib/chat/tools/lookupVerifiedFact";
import { formatSseEvent } from "@/lib/chat/sse";
import { reportError } from "@/lib/errorReporting";

/**
 * Public, unauthenticated by design -- the calculator itself needs no
 * account (config/labels.ts's privacy copy: "Entering your subjects and
 * marks ... doesn't require signing up"), so gating help-chat behind
 * sign-in would be a worse, inconsistent experience for the exact same
 * anonymous learner. No conversation is persisted server-side, for the
 * same privacy-by-default reason -- see lib/chat/systemPrompt.ts and
 * components/chat/ChatWidget.tsx, which keeps history in React state
 * only.
 *
 * "Unauthenticated and free" is also why checkChatRateLimit exists:
 * without it, a single visitor could burn through the entire shared
 * Gemini free-tier quota (lib/ingestion/llm/geminiClient.ts) that admin
 * ingestion runs also depend on.
 *
 * Streams the reply as it's generated (text/event-stream) rather than
 * one JSON body -- see docs/superpowers/specs/2026-08-06-chat-backend-innovation-design.md.
 * The first chunk is awaited before any SSE headers are sent, so a
 * total failure (bad API key, network error) still returns today's
 * plain JSON 502 -- only a failure *after* streaming has started falls
 * back to an `event: error` frame instead.
 */
export async function POST(request: NextRequest) {
  const clientId =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const rateLimit = checkChatRateLimit(clientId);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "You've sent a lot of messages -- wait a bit before sending another." },
      { status: 429, headers: { "retry-after": String(Math.ceil((rateLimit.retryAfterMs ?? 0) / 1000)) } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const validation = validateChatRequest(body);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  let client: GeminiChatClient;
  try {
    client = new GeminiChatClient();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 501 }
    );
  }

  let iterator: AsyncGenerator<string>;
  let firstChunk: IteratorResult<string>;
  try {
    const context = await getRealChatContext();
    const systemPrompt = buildChatSystemPrompt(context);
    iterator = client.streamReply(validation.data.messages, systemPrompt, LOOKUP_VERIFIED_FACT_CHAT_TOOL);
    firstChunk = await iterator.next();
  } catch (err) {
    reportError(err, { scope: "chat-api" });
    return NextResponse.json(
      { error: "The assistant couldn't respond right now -- try again in a moment." },
      { status: 502 }
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        if (!firstChunk.done) {
          controller.enqueue(encoder.encode(formatSseEvent({ text: firstChunk.value })));
        }
        for await (const chunk of iterator) {
          controller.enqueue(encoder.encode(formatSseEvent({ text: chunk })));
        }
        controller.enqueue(encoder.encode(formatSseEvent({}, "done")));
      } catch (err) {
        reportError(err, { scope: "chat-api-stream" });
        controller.enqueue(
          encoder.encode(
            formatSseEvent({ error: "The assistant couldn't finish responding -- try again in a moment." }, "error")
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
    },
  });
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: clean — this was the last file with an error from Task 2's removal of
`reply()`.

- [ ] **Step 3: Run the full test suite**

Run: `npm test`
Expected: PASS. All existing suites (`rateLimiter.test.ts`, `validateChatRequest.test.ts`,
`getRealChatContext.test.ts`, plus Tasks 1-3's new tests) stay green — this route has
no dedicated test file today, so no route-level test to update.

- [ ] **Step 4: Manual smoke test**

Run: `npm run dev`, then in a separate terminal:

```bash
curl -N -X POST http://localhost:3000/api/chat \
  -H "content-type: application/json" \
  -d '{"messages":[{"role":"user","text":"What is APS?"}]}'
```

Expected: terminal prints a series of `data: {"text":"..."}` lines streaming in, ending
with `event: done`, not one delayed JSON blob. (Requires `LLM_API_KEY` set in
`.env.local` — if it's not configured, expect a `501` JSON error instead, which is
also correct/expected behavior, not a bug.)

- [ ] **Step 5: Commit**

```bash
git add app/api/chat/route.ts
git commit -m "feat(chat): stream API replies over SSE with the grounded tool wired in"
```

---

## Task 5: Stream-aware ChatWidget

**Files:**
- Modify: `components/chat/ChatWidget.tsx`

**Interfaces:**
- Consumes: `splitSseFrames` from `@/lib/chat/sse` (Task 1); the `/api/chat` SSE
  contract from Task 4. No other component imports from `ChatWidget.tsx` beyond how
  it's already mounted in `components/chat/ChatWidgetLoader.tsx` (unchanged).

- [ ] **Step 1: Write the implementation**

Replace the full contents of `components/chat/ChatWidget.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { LABELS } from "@/config/labels";
import { splitSseFrames } from "@/lib/chat/sse";

/**
 * A floating help assistant, mounted once in app/layout.tsx via a
 * next/dynamic({ ssr: false }) import -- see layout.tsx for why: it
 * keeps this out of the server-rendered HTML and initial JS bundle
 * entirely, which matters on the "/" route given Phase 8's <200KB
 * budget and low-data-mode commitment (app/globals.css). Nothing here
 * loads or runs until a visitor actually clicks the button.
 *
 * No conversation persistence -- plain useState, gone on reload. See
 * lib/chat/systemPrompt.ts and config/labels.ts's privacy-notice entry
 * for why: consistent with the calculator's own "nothing you type is
 * saved unless you create an account" promise, and this feature has no
 * account-linked storage story of its own to opt into.
 *
 * Replies stream in over SSE (app/api/chat/route.ts) rather than
 * arriving as one JSON blob -- streamingReply holds the in-progress
 * reply text (empty string while waiting for the first chunk, so the
 * thinking indicator still shows), and gets folded into `messages` once
 * the stream ends, errors, or the connection drops.
 */

interface DisplayMessage {
  role: "user" | "model";
  text: string;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingReply, setStreamingReply] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, [messages, isLoading, streamingReply]);

  async function handleSend() {
    const text = draft.trim();
    if (!text || isLoading) return;

    const nextMessages: DisplayMessage[] = [...messages, { role: "user", text }];
    setMessages(nextMessages);
    setDraft("");
    setError(null);
    setIsLoading(true);
    setStreamingReply("");

    let accumulated = "";
    const commitStreamedReply = () => {
      if (accumulated) {
        setMessages((prev) => [...prev, { role: "model", text: accumulated }]);
      }
      setStreamingReply(null);
    };

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!res.ok || !res.body) {
        const errBody = (await res.json().catch(() => ({}))) as { error?: string };
        setStreamingReply(null);
        if (res.status === 429) setError(LABELS.chat.rateLimitedError);
        else if (res.status === 501) setError(LABELS.chat.notConfiguredError);
        else setError(errBody.error ?? LABELS.chat.genericError);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const { frames, rest } = splitSseFrames(buffer);
        buffer = rest;

        for (const frame of frames) {
          const data = JSON.parse(frame.data) as { text?: string; error?: string };
          if (frame.event === "error") {
            commitStreamedReply();
            setError(data.error ?? LABELS.chat.genericError);
            return;
          }
          if (typeof data.text === "string") {
            accumulated += data.text;
            setStreamingReply(accumulated);
          }
        }
      }

      commitStreamedReply();
    } catch {
      commitStreamedReply();
      setError(LABELS.chat.genericError);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLElement>) {
    if (e.key === "Escape") setIsOpen(false);
  }

  return (
    <div className="no-print fixed bottom-4 right-4 z-40" onKeyDown={handleKeyDown}>
      {isOpen && (
        <div
          role="dialog"
          aria-label={LABELS.chat.assistantName}
          className="animate-rise-in mb-3 flex h-[28rem] w-[22rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-line bg-paper shadow-xl"
        >
          <header className="flex items-center justify-between gap-2 border-b border-line bg-paper-raised px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="font-display text-base font-semibold text-ink">
                {LABELS.chat.assistantName}
              </span>
              <span className="rounded-full bg-brand-teal-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-teal">
                {LABELS.chat.aiDisclosureBadge}
              </span>
            </div>
            <button
              type="button"
              aria-label={LABELS.chat.closeButtonLabel}
              onClick={() => setIsOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition-[background-color,color,transform] duration-150 ease-out hover:bg-slate-soft hover:text-ink active:scale-[0.97]"
            >
              ×
            </button>
          </header>

          <p className="border-b border-line bg-paper-raised px-4 py-2 text-xs text-ink-faint">
            {LABELS.chat.disclaimer}
          </p>

          <div ref={scrollRef} className="flex flex-1 flex-col gap-2 overflow-y-auto px-3 py-3">
            <div className="animate-pop-in max-w-[85%] rounded-2xl rounded-bl-sm bg-slate-soft px-3 py-2 text-sm text-ink">
              {LABELS.chat.greeting}
            </div>
            {messages.map((message, i) => (
              <div
                key={i}
                className={`animate-pop-in max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                  message.role === "user"
                    ? "self-end rounded-br-sm bg-brand-teal text-white"
                    : "self-start rounded-bl-sm bg-slate-soft text-ink"
                }`}
              >
                {message.text}
              </div>
            ))}
            {streamingReply !== null && (
              <div className="animate-pop-in self-start max-w-[85%] rounded-2xl rounded-bl-sm bg-slate-soft px-3 py-2 text-sm text-ink">
                {streamingReply || LABELS.chat.thinkingIndicator}
              </div>
            )}
            {error && (
              <div
                role="alert"
                className="animate-pop-in self-start rounded-2xl rounded-bl-sm bg-mark-red-soft px-3 py-2 text-sm text-mark-red"
              >
                {error}
              </div>
            )}
          </div>

          <form
            className="flex items-center gap-2 border-t border-line p-2"
            onSubmit={(e) => {
              e.preventDefault();
              void handleSend();
            }}
          >
            <label htmlFor="chat-message-input" className="sr-only">
              {LABELS.chat.inputPlaceholder}
            </label>
            <input
              ref={inputRef}
              id="chat-message-input"
              name="chatMessage"
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={LABELS.chat.inputPlaceholder}
              disabled={isLoading}
              className="h-11 flex-1 rounded-xl border border-line bg-paper-raised px-3 text-sm text-ink transition-colors focus:border-brand-coral focus:outline-none"
            />
            <button
              type="submit"
              disabled={isLoading || !draft.trim()}
              className="flex h-11 min-w-11 items-center justify-center rounded-full bg-brand-teal px-4 text-sm font-medium text-white transition-transform hover-fine:scale-[1.03] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {LABELS.chat.sendButtonLabel}
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        aria-label={isOpen ? LABELS.chat.closeButtonLabel : LABELS.chat.openButtonLabel}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((v) => !v)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-teal text-white shadow-lg transition-transform hover-fine:scale-105 active:scale-[0.97]"
      >
        {isOpen ? (
          <span aria-hidden className="text-2xl leading-none">
            ×
          </span>
        ) : (
          <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: clean.

- [ ] **Step 3: Run the full test suite**

Run: `npm test`
Expected: PASS — no existing test file targets `ChatWidget.tsx`, so nothing to update
there; confirms this change didn't break any other suite.

- [ ] **Step 4: Manual browser check**

Run: `npm run dev`, open `http://localhost:3000`, open the chat widget, and send a
message. Confirm: the reply visibly builds up token-by-token (not one delayed block),
the "Thinking..." indicator shows before the first chunk arrives, and the conversation
scrolls to follow the growing reply. Then ask about a specific verified programme (e.g.
one seeded via `npm run seed:*`) to exercise the tool-call path, and ask about a
programme that isn't on record to confirm the assistant still honestly says it can't
confirm that one.

- [ ] **Step 5: Commit**

```bash
git add components/chat/ChatWidget.tsx
git commit -m "feat(chat): render streamed replies token-by-token in ChatWidget"
```

---

## Task 6: Live trust banner from real catalog stats

**Files:**
- Create: `lib/catalog/getCatalogStats.ts`
- Test: `lib/catalog/getCatalogStats.test.ts`
- Modify: `components/NavBar.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: `isFactVerified`, `Institution`, `Programme`, `Bursary` from
  `@/lib/firestore/types` (existing); `getAdminDb` from `@/lib/firebase/admin`
  (existing).
- Produces: `interface CatalogStats { institutionCount: number; programmeCount: number; bursaryCount: number; lastVerifiedOn: string | null }`,
  `computeCatalogStats(raw: { institutions: Institution[]; programmes: Programme[]; bursaries: Bursary[] }): CatalogStats`,
  `getCatalogStats(): Promise<CatalogStats>` from `lib/catalog/getCatalogStats.ts`.
  `NavBar` gains a `stats: CatalogStats | null` prop. Independent of Tasks 1-5 — can be
  done in parallel by a different worker if running subagent-driven.

- [ ] **Step 1: Write the failing test**

Create `lib/catalog/getCatalogStats.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { computeCatalogStats } from "./getCatalogStats";
import type { Bursary, Institution, Programme } from "@/lib/firestore/types";

const PROVENANCE = { sourceUrl: "https://example.test/", verifiedOn: "2026-07-26", academicYear: 2027 };

function makeInstitution(overrides: Partial<Institution> = {}): Institution {
  return {
    id: "ump",
    name: "University of Mpumalanga",
    shortName: "UMP",
    type: "traditionalUniversity",
    province: "Mpumalanga",
    tier: 1,
    campuses: [],
    websiteUrl: "https://www.ump.ac.za/",
    applicationPortalUrl: null,
    appliesThroughThirdParty: null,
    statusCheckUrl: null,
    nbtRequired: false,
    logoUrl: null,
    ...PROVENANCE,
    ...overrides,
  };
}

function makeProgramme(overrides: Partial<Programme> = {}): Programme {
  return {
    id: "ump-ba-media",
    institutionId: "ump",
    facultyId: "x",
    schoolId: "x",
    name: "Programme",
    qualificationType: "bachelorsDegree",
    nqfLevel: 7,
    saqaId: null,
    duration: "3 years",
    campuses: [],
    modeOfDelivery: "contact",
    minAps: null,
    subjectRequirements: [],
    additionalRequirements: [],
    careerOutcomes: [],
    applyUrl: null,
    fieldTags: [],
    ...PROVENANCE,
    ...overrides,
  };
}

function makeBursary(overrides: Partial<Bursary> = {}): Bursary {
  return {
    id: "nsfas",
    name: "NSFAS Bursary",
    provider: "NSFAS",
    fieldsOfStudy: [],
    levelRequired: "matricOnly",
    opensOn: null,
    closesOn: null,
    value: "Full tuition",
    criteria: [],
    applyUrl: "https://www.nsfas.org.za/",
    riskFlags: [],
    ...PROVENANCE,
    ...overrides,
  };
}

describe("computeCatalogStats", () => {
  it("counts only verified records", () => {
    const unverified = makeInstitution({ id: "x", sourceUrl: "" });
    const stats = computeCatalogStats({
      institutions: [makeInstitution(), unverified],
      programmes: [makeProgramme()],
      bursaries: [makeBursary()],
    });
    expect(stats).toEqual({
      institutionCount: 1,
      programmeCount: 1,
      bursaryCount: 1,
      lastVerifiedOn: "2026-07-26",
    });
  });

  it("returns zero counts and a null date when nothing is verified", () => {
    const stats = computeCatalogStats({ institutions: [], programmes: [], bursaries: [] });
    expect(stats).toEqual({ institutionCount: 0, programmeCount: 0, bursaryCount: 0, lastVerifiedOn: null });
  });

  it("reports the most recent verifiedOn across all three collections", () => {
    const stats = computeCatalogStats({
      institutions: [makeInstitution({ verifiedOn: "2026-01-01" })],
      programmes: [makeProgramme({ verifiedOn: "2026-08-05" })],
      bursaries: [makeBursary({ verifiedOn: "2026-03-15" })],
    });
    expect(stats.lastVerifiedOn).toBe("2026-08-05");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/catalog/getCatalogStats.test.ts`
Expected: FAIL — `Cannot find module './getCatalogStats'`.

- [ ] **Step 3: Write the implementation**

Create `lib/catalog/getCatalogStats.ts`:

```ts
import "server-only";
import { getAdminDb } from "@/lib/firebase/admin";
import { isFactVerified } from "@/lib/firestore/types";
import type { Bursary, Institution, Programme } from "@/lib/firestore/types";

/**
 * Powers the header trust banner (components/NavBar.tsx): real,
 * currently-verified counts, not a static "coming soon" claim. Cached
 * in-memory for a few minutes, same pattern and same reasoning as
 * lib/chat/getRealChatContext.ts -- this changes on the order of admin
 * approvals, not every page view.
 */

export interface CatalogStats {
  institutionCount: number;
  programmeCount: number;
  bursaryCount: number;
  /** Most recent verifiedOn across every verified institution, programme,
   * and bursary -- null if nothing is verified yet. */
  lastVerifiedOn: string | null;
}

const CACHE_TTL_MS = 5 * 60 * 1000;
let cached: { stats: CatalogStats; fetchedAt: number } | null = null;

export function __resetCatalogStatsCacheForTests(): void {
  cached = null;
}

function latestVerifiedOn(dates: string[]): string | null {
  return dates.length ? dates.reduce((latest, d) => (d > latest ? d : latest)) : null;
}

export function computeCatalogStats(raw: {
  institutions: Institution[];
  programmes: Programme[];
  bursaries: Bursary[];
}): CatalogStats {
  const institutions = raw.institutions.filter(isFactVerified);
  const programmes = raw.programmes.filter(isFactVerified);
  const bursaries = raw.bursaries.filter(isFactVerified);

  return {
    institutionCount: institutions.length,
    programmeCount: programmes.length,
    bursaryCount: bursaries.length,
    lastVerifiedOn: latestVerifiedOn([
      ...institutions.map((i) => i.verifiedOn),
      ...programmes.map((p) => p.verifiedOn),
      ...bursaries.map((b) => b.verifiedOn),
    ]),
  };
}

function withId<T>(snap: FirebaseFirestore.QuerySnapshot): T[] {
  return snap.docs.map((doc) => ({ ...(doc.data() as Omit<T, "id">), id: doc.id }) as T);
}

export async function getCatalogStats(): Promise<CatalogStats> {
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.stats;
  }

  const db = getAdminDb();
  const [institutionsSnap, programmesSnap, bursariesSnap] = await Promise.all([
    db.collection("institutions").get(),
    db.collection("programmes").get(),
    db.collection("bursaries").get(),
  ]);

  const stats = computeCatalogStats({
    institutions: withId<Institution>(institutionsSnap),
    programmes: withId<Programme>(programmesSnap),
    bursaries: withId<Bursary>(bursariesSnap),
  });

  cached = { stats, fetchedAt: Date.now() };
  return stats;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/catalog/getCatalogStats.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Wire the banner into NavBar**

Replace the full contents of `components/NavBar.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { LABELS } from "@/config/labels";
import type { CatalogStats } from "@/lib/catalog/getCatalogStats";

const NAV_ITEMS = [
  { href: "/", label: LABELS.nav.calculator },
  { href: "/bursaries", label: LABELS.nav.bursaries },
  { href: "/statistics", label: LABELS.nav.statistics },
  { href: "/account", label: LABELS.nav.profile },
];

interface NavBarProps {
  /** Real, currently-verified record counts (lib/catalog/getCatalogStats.ts),
   * or null when the stats couldn't be fetched -- rendering nothing in
   * that case rather than a stale/fake number. Hidden below the `md`
   * breakpoint: app/layout.tsx already flags that a mobile visitor
   * arriving from a WhatsApp link should see the calculator with no
   * scrolling, so this desktop-only trust signal doesn't add height to
   * that path. */
  stats: CatalogStats | null;
}

/**
 * A real site header: solid institutional band, wordmark on the left,
 * navigation on the right, present on every page -- not just something
 * that appears as page-body text on "/". Previously the app name only
 * ever showed up as a large centered heading on the home page; every
 * other page had no persistent identity at the top at all, which is
 * part of why the site didn't read as "a website" (a CSIR page always
 * shows its header/logo, no matter which section you're on).
 */
export function NavBar({ stats }: NavBarProps) {
  const pathname = usePathname();

  return (
    <header className="no-print brand-band">
      <nav className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-2 sm:px-8">
        <Link href="/" className="flex min-h-11 items-center text-white">
          <Logo size={28} wordmarkClassName="text-lg text-white" />
        </Link>
        {stats && (
          <span className="hidden text-xs text-white/70 md:inline">
            {stats.institutionCount} institutions · {stats.programmeCount} verified programmes
            {stats.lastVerifiedOn ? ` · updated ${stats.lastVerifiedOn}` : ""}
          </span>
        )}
        <div className="flex flex-wrap gap-1 text-sm font-medium">
          {NAV_ITEMS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 items-center rounded px-3 transition-colors ${
                  active ? "bg-white/15 text-white" : "text-white/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
```

- [ ] **Step 6: Fetch stats in the root layout and pass them down**

In `app/layout.tsx`, add the import (alongside the existing `NavBar` import):

```ts
import { getCatalogStats } from "@/lib/catalog/getCatalogStats";
```

Change the function signature from:

```ts
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
```

to:

```ts
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Never blocks/breaks the page on a Firestore hiccup -- the banner is
  // a non-critical enhancement, same "degrade gracefully" precedent as
  // AuthProvider (see this file's Deployment notes in CLAUDE.md).
  const stats = await getCatalogStats().catch(() => null);
```

And change the `<NavBar />` usage to:

```tsx
<NavBar stats={stats} />
```

- [ ] **Step 7: Typecheck**

Run: `npm run typecheck`
Expected: clean.

- [ ] **Step 8: Run the full test suite**

Run: `npm test`
Expected: PASS.

- [ ] **Step 9: Manual browser check**

Run: `npm run dev`, open `http://localhost:3000` at a desktop width, confirm the
"N institutions · N verified programmes · updated {date}" text appears in the header
and the numbers match what's actually seeded (spot-check against
`npm run seed:institutions` output or Firestore directly). Then narrow the viewport
below the `md` breakpoint and confirm the banner disappears and no layout shift/extra
scroll is introduced on `/`.

- [ ] **Step 10: Commit**

```bash
git add lib/catalog/getCatalogStats.ts lib/catalog/getCatalogStats.test.ts components/NavBar.tsx app/layout.tsx
git commit -m "feat(catalog): add a live verified-record-count trust banner"
```

---

## Task 7: Security headers

**Files:**
- Modify: `next.config.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks — purely additive Next.js config.
- Produces: nothing consumed by other tasks — this is the last, independent piece.

- [ ] **Step 1: Write the implementation**

Replace the full contents of `next.config.ts`:

```ts
import type { NextConfig } from "next";

/**
 * next.config.ts previously set no headers at all. This CSP allows:
 * self (the app's own scripts/styles/images), 'unsafe-inline' for
 * script-src because app/layout.tsx's RICH_FONTS_SCRIPT is an inline
 * beforeInteractive <Script> with no nonce wired up (a nonce-based
 * tightening is a real follow-up, not attempted here under deadline
 * pressure), Google Fonts (the same RICH_FONTS_SCRIPT's stylesheet
 * link), and https://*.googleapis.com for connect-src -- the Firebase
 * client SDK (Auth + Firestore) talks to several *.googleapis.com
 * subdomains, and the wildcard avoids this list silently breaking sign-in
 * or a Firestore read if Firebase changes which exact subdomain it uses.
 * The Gemini API itself is never called from the browser (secrets never
 * reach the browser -- CLAUDE.md non-negotiable #1), so it isn't listed
 * here at all.
 */
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data:",
  "connect-src 'self' https://*.googleapis.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: clean.

- [ ] **Step 3: Run the full test suite**

Run: `npm test`
Expected: PASS — no test targets `next.config.ts`.

- [ ] **Step 4: Manual verification (do this one carefully — CSP is the one change in this whole plan that can silently break sign-in/Firestore)**

Run: `npm run build && npm run start` (a production build, matching CLAUDE.md's
existing deployment-verification convention — headers only apply in `next start`, not
reliably in `next dev`). With the browser DevTools console open:

1. Load `/`. Confirm zero CSP violation errors in the console.
2. Use the calculator (enter subjects/marks). Confirm results render — this exercises
   the client Firestore read path.
3. If a real Firebase project is configured locally, sign in (email or Google) and
   confirm it completes. If not configured, confirm the existing `authUnavailable`
   degraded state still shows with no console crash (same check CLAUDE.md's deployment
   section already documents for this exact scenario).
4. Open the chat widget and send a message — confirm streaming still works end-to-end
   (this is a same-origin `fetch` to `/api/chat`, not affected by `connect-src`'s
   external allowlist, but worth re-confirming after a config change).
5. Visit `/bursaries` and `/statistics` and confirm both render with no console errors.

If any CSP violation appears, add the specific blocked origin to the relevant
`next.config.ts` directive and repeat this step — do not weaken the policy back to
having no CSP at all as a shortcut.

- [ ] **Step 5: Commit**

```bash
git add next.config.ts
git commit -m "feat(security): add CSP and other baseline security headers"
```

---

## Final checkpoint

- [ ] Run `git status` and confirm no secret-shaped file (`.env*`, service account JSON,
  private keys) was ever staged or committed across Tasks 1-7.
- [ ] Run `npm run typecheck`, `npm test`, and `npm run build` once more, all green.
- [ ] Re-read `docs/superpowers/specs/2026-08-06-chat-backend-innovation-design.md`
  goal-by-goal and confirm each is met: streaming ✅, grounded tool with fallback ✅,
  trust banner ✅, security headers ✅, no new fact-bearing data added ✅.
- [ ] Do one full end-to-end manual pass of the demo path itself: open the app fresh,
  use the calculator, open chat, ask a question the tool can answer, ask about
  something not on record (confirm the honest refusal still holds), ask a general
  education question — all streamed, all correct.
