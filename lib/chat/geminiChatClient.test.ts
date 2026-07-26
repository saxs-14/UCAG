import { afterEach, describe, expect, it, vi } from "vitest";
import { GeminiChatClient, __resetGeminiChatRateLimiterForTests } from "./geminiChatClient";

const OK_BODY = {
  candidates: [{ content: { parts: [{ text: "APS stands for Admission Point Score." }] } }],
  usageMetadata: { promptTokenCount: 50, candidatesTokenCount: 12 },
};

const TEST_SYSTEM_PROMPT = "You are a test assistant.";

function fakeFetch(body: unknown, ok = true, status = 200): typeof fetch {
  return vi.fn(async () => ({
    ok,
    status,
    text: async () => JSON.stringify(body),
    json: async () => body,
  })) as unknown as typeof fetch;
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

  it("sends the given system prompt and full message history, and returns the reply text", async () => {
    vi.stubEnv("LLM_API_KEY", "fake-gemini-key");
    const fetchSpy = fakeFetch(OK_BODY);
    vi.stubGlobal("fetch", fetchSpy);

    const client = new GeminiChatClient({ minIntervalMs: 0 });
    const result = await client.reply(
      [{ role: "user", text: "What is APS?" }],
      TEST_SYSTEM_PROMPT
    );

    expect(result.text).toBe("APS stands for Admission Point Score.");
    expect(result.tokensUsed).toBe(62);

    const [url, init] = (fetchSpy as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    expect(url).toContain("generateContent");
    expect((init.headers as Record<string, string>)["x-goog-api-key"]).toBe("fake-gemini-key");
    const parsedBody = JSON.parse(init.body as string) as {
      systemInstruction: { parts: { text: string }[] };
      contents: { role: string; parts: { text: string }[] }[];
    };
    expect(parsedBody.systemInstruction.parts[0]!.text).toBe(TEST_SYSTEM_PROMPT);
    expect(parsedBody.contents).toEqual([{ role: "user", parts: [{ text: "What is APS?" }] }]);
  });

  it("sends multi-turn history with roles preserved", async () => {
    vi.stubEnv("LLM_API_KEY", "fake-gemini-key");
    const fetchSpy = fakeFetch(OK_BODY);
    vi.stubGlobal("fetch", fetchSpy);

    const client = new GeminiChatClient({ minIntervalMs: 0 });
    await client.reply(
      [
        { role: "user", text: "Hi" },
        { role: "model", text: "Hello!" },
        { role: "user", text: "What does 'almost qualify' mean?" },
      ],
      TEST_SYSTEM_PROMPT
    );

    const [, init] = (fetchSpy as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    const parsedBody = JSON.parse(init.body as string) as { contents: { role: string }[] };
    expect(parsedBody.contents.map((c) => c.role)).toEqual(["user", "model", "user"]);
  });

  it("throws a clear error when the response has no reply text", async () => {
    vi.stubEnv("LLM_API_KEY", "fake-gemini-key");
    vi.stubGlobal("fetch", fakeFetch({ candidates: [] }));

    const client = new GeminiChatClient({ minIntervalMs: 0 });
    await expect(
      client.reply([{ role: "user", text: "hi" }], TEST_SYSTEM_PROMPT)
    ).rejects.toThrow(/contained no reply text/);
  });

  it("throws on a non-ok response with no retries when maxRetries is 0", async () => {
    vi.stubEnv("LLM_API_KEY", "fake-gemini-key");
    vi.stubGlobal("fetch", fakeFetch({ error: "boom" }, false, 500));

    const client = new GeminiChatClient({ minIntervalMs: 0, maxRetries: 0 });
    await expect(
      client.reply([{ role: "user", text: "hi" }], TEST_SYSTEM_PROMPT)
    ).rejects.toThrow(/Gemini API error: 500/);
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
            error: {
              details: [{ "@type": "type.googleapis.com/google.rpc.RetryInfo", retryDelay: "1.5s" }],
            },
          }),
      })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => OK_BODY });
    vi.stubGlobal("fetch", fetchSpy);
    const sleep = vi.fn(async (ms: number) => {
      void ms;
    });

    const client = new GeminiChatClient({ minIntervalMs: 0, sleep });
    const result = await client.reply([{ role: "user", text: "hi" }], TEST_SYSTEM_PROMPT);

    expect(result.text).toBe("APS stands for Admission Point Score.");
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledWith(1500);
  });

  it("paces consecutive calls by default (production default is non-zero)", async () => {
    vi.stubEnv("LLM_API_KEY", "fake-gemini-key");
    vi.stubGlobal("fetch", fakeFetch(OK_BODY));
    const sleep = vi.fn(async (ms: number) => {
      void ms;
    });

    // No minIntervalMs override -- exercises the real production default.
    const client = new GeminiChatClient({ sleep });
    await client.reply([{ role: "user", text: "hi" }], TEST_SYSTEM_PROMPT);
    await client.reply([{ role: "user", text: "hi again" }], TEST_SYSTEM_PROMPT);

    expect(sleep).toHaveBeenCalledTimes(1);
  });
});
