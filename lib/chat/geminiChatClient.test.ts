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
    const [url, init] = fetchSpy.mock.calls[0] as unknown as [string, RequestInit];
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
