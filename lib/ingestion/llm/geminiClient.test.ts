import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { GeminiLlmClient, __resetGeminiRateLimiterForTests } from "./geminiClient";

const schema = z.object({ opensOn: z.string().nullable() });

function fakeFetch(body: unknown, ok = true, status = 200): typeof fetch {
  return vi.fn(async () => ({
    ok,
    status,
    text: async () => JSON.stringify(body),
    json: async () => body,
  })) as unknown as typeof fetch;
}

const OK_BODY = {
  candidates: [{ content: { parts: [{ text: '{"opensOn":"2027-04-01"}' }] } }],
  usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 5 },
};

function quotaExceededBody(retryDelay: string) {
  return {
    error: {
      code: 429,
      status: "RESOURCE_EXHAUSTED",
      message: "You exceeded your current quota.",
      details: [
        { "@type": "type.googleapis.com/google.rpc.RetryInfo", retryDelay },
      ],
    },
  };
}

describe("GeminiLlmClient", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    __resetGeminiRateLimiterForTests();
  });

  it("throws immediately when LLM_API_KEY isn't configured, before ever calling fetch", () => {
    // Genuinely unset, not stubbed to "" -- LLM_API_KEY's schema field is
    // optional() for undefined, not for an empty string (see
    // lib/env/client.test.ts for the same lesson learned earlier).
    delete process.env.LLM_API_KEY;
    expect(() => new GeminiLlmClient()).toThrow(/LLM_API_KEY is not configured/);
  });

  it("sends the API key as a header, not a URL query param", async () => {
    vi.stubEnv("LLM_API_KEY", "fake-gemini-key");
    const fetchSpy = fakeFetch({
      candidates: [{ content: { parts: [{ text: '{"opensOn":"2027-04-01"}' }] } }],
      usageMetadata: { promptTokenCount: 100, candidatesTokenCount: 20 },
    });
    vi.stubGlobal("fetch", fetchSpy);

    const client = new GeminiLlmClient();
    await client.extract({ sourceText: "x", instructions: "y", schema });

    const [url, init] = (fetchSpy as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    expect(url).not.toContain("fake-gemini-key");
    expect((init.headers as Record<string, string>)["x-goog-api-key"]).toBe("fake-gemini-key");
  });

  it("parses a valid response and sums prompt + output tokens", async () => {
    vi.stubEnv("LLM_API_KEY", "fake-gemini-key");
    vi.stubGlobal(
      "fetch",
      fakeFetch({
        candidates: [{ content: { parts: [{ text: '{"opensOn":"2027-04-01"}' }] } }],
        usageMetadata: { promptTokenCount: 150, candidatesTokenCount: 25 },
      })
    );

    const client = new GeminiLlmClient();
    const result = await client.extract({ sourceText: "x", instructions: "y", schema });
    expect(result.data.opensOn).toBe("2027-04-01");
    expect(result.tokensUsed).toBe(175);
  });

  it("includes hidden thinking tokens in tokensUsed on reasoning-capable models", async () => {
    // Live-verified against a real key: gemini-flash-latest (the
    // reasoning-mandatory alias) spent 81-89 hidden thoughtsTokenCount
    // tokens replying to a one-word prompt. If this isn't summed in,
    // checkBudgetLive() silently undercounts real usage.
    vi.stubEnv("LLM_API_KEY", "fake-gemini-key");
    vi.stubGlobal(
      "fetch",
      fakeFetch({
        candidates: [{ content: { parts: [{ text: '{"opensOn":"2027-04-01"}' }] } }],
        usageMetadata: { promptTokenCount: 7, candidatesTokenCount: 1, thoughtsTokenCount: 88 },
      })
    );

    const client = new GeminiLlmClient();
    const result = await client.extract({ sourceText: "x", instructions: "y", schema });
    expect(result.tokensUsed).toBe(96);
  });

  it("rejects (does not coerce) a response that fails schema validation", async () => {
    vi.stubEnv("LLM_API_KEY", "fake-gemini-key");
    vi.stubGlobal(
      "fetch",
      fakeFetch({
        candidates: [{ content: { parts: [{ text: '{"wrongField": true}' }] } }],
        usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 5 },
      })
    );

    const client = new GeminiLlmClient();
    await expect(client.extract({ sourceText: "x", instructions: "y", schema })).rejects.toThrow();
  });

  it("throws a clear error on a non-JSON model response instead of silently returning garbage", async () => {
    vi.stubEnv("LLM_API_KEY", "fake-gemini-key");
    vi.stubGlobal(
      "fetch",
      fakeFetch({
        candidates: [{ content: { parts: [{ text: "not json at all" }] } }],
        usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 5 },
      })
    );

    const client = new GeminiLlmClient();
    await expect(client.extract({ sourceText: "x", instructions: "y", schema })).rejects.toThrow(
      /not valid JSON/
    );
  });

  it("throws on a non-ok HTTP response rather than trying to parse it as a result", async () => {
    vi.stubEnv("LLM_API_KEY", "fake-gemini-key");
    vi.stubGlobal("fetch", fakeFetch({ error: "quota exceeded" }, false, 429));

    // maxRetries: 0 isolates this test's concern (the error message on a
    // non-ok response) from the 429-retry behavior covered separately
    // below -- with the real default (2 retries), this exact body would
    // legitimately retry twice first (see the "retries on 429" tests).
    const client = new GeminiLlmClient({ maxRetries: 0 });
    await expect(client.extract({ sourceText: "x", instructions: "y", schema })).rejects.toThrow(
      /Gemini API error: 429/
    );
  });

  // Live-verified against a real key and a real batch ingestion run: the
  // free tier's 15 requests/minute cap is real and easy to hit, and
  // without retry logic every source after that failed outright. These
  // tests use an injected `sleep` spy so they run instantly regardless of
  // the real delay values being asserted on.
  describe("429 (quota exhausted) retry behavior", () => {
    it("waits the server-specified retryDelay and retries, succeeding on the second attempt", async () => {
      vi.stubEnv("LLM_API_KEY", "fake-gemini-key");
      const fetchSpy = vi
        .fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          text: async () => JSON.stringify(quotaExceededBody("2.5s")),
        })
        .mockResolvedValueOnce({ ok: true, status: 200, json: async () => OK_BODY });
      vi.stubGlobal("fetch", fetchSpy);
      const sleep = vi.fn(async () => {});

      const client = new GeminiLlmClient({ sleep });
      const result = await client.extract({ sourceText: "x", instructions: "y", schema });

      expect(result.data.opensOn).toBe("2027-04-01");
      expect(fetchSpy).toHaveBeenCalledTimes(2);
      expect(sleep).toHaveBeenCalledWith(2500); // parsed from "2.5s"
    });

    it("falls back to a fixed backoff when the 429 body has no parseable retryDelay", async () => {
      vi.stubEnv("LLM_API_KEY", "fake-gemini-key");
      const fetchSpy = vi
        .fn()
        .mockResolvedValueOnce({ ok: false, status: 429, text: async () => "not even json" })
        .mockResolvedValueOnce({ ok: true, status: 200, json: async () => OK_BODY });
      vi.stubGlobal("fetch", fetchSpy);
      const sleep = vi.fn(async () => {});

      const client = new GeminiLlmClient({ sleep });
      const result = await client.extract({ sourceText: "x", instructions: "y", schema });

      expect(result.data.opensOn).toBe("2027-04-01");
      expect(sleep).toHaveBeenCalledWith(10_000);
    });

    it("gives up after maxRetries and throws, rather than retrying forever", async () => {
      vi.stubEnv("LLM_API_KEY", "fake-gemini-key");
      const fetchSpy = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        text: async () => JSON.stringify(quotaExceededBody("0.01s")),
      });
      vi.stubGlobal("fetch", fetchSpy);
      const sleep = vi.fn(async () => {});

      const client = new GeminiLlmClient({ sleep, maxRetries: 2 });
      await expect(
        client.extract({ sourceText: "x", instructions: "y", schema })
      ).rejects.toThrow(/Gemini API error: 429/);
      expect(fetchSpy).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
      expect(sleep).toHaveBeenCalledTimes(2);
    });

    it("does not retry on a non-429 error", async () => {
      vi.stubEnv("LLM_API_KEY", "fake-gemini-key");
      const fetchSpy = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => "internal error",
      });
      vi.stubGlobal("fetch", fetchSpy);
      const sleep = vi.fn(async () => {});

      const client = new GeminiLlmClient({ sleep });
      await expect(
        client.extract({ sourceText: "x", instructions: "y", schema })
      ).rejects.toThrow(/Gemini API error: 500/);
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(sleep).not.toHaveBeenCalled();
    });
  });

  describe("request pacing (minIntervalMs)", () => {
    it("does not pace when minIntervalMs is unset (default 0)", async () => {
      vi.stubEnv("LLM_API_KEY", "fake-gemini-key");
      vi.stubGlobal("fetch", fakeFetch(OK_BODY));
      const sleep = vi.fn(async () => {});

      const client = new GeminiLlmClient({ sleep });
      await client.extract({ sourceText: "x", instructions: "y", schema });
      await client.extract({ sourceText: "x", instructions: "y", schema });

      expect(sleep).not.toHaveBeenCalled();
    });

    it("waits out the remaining interval before a second call when minIntervalMs is set", async () => {
      vi.stubEnv("LLM_API_KEY", "fake-gemini-key");
      vi.stubGlobal("fetch", fakeFetch(OK_BODY));
      const sleep = vi.fn(async (ms: number) => {
        void ms;
      });

      const client = new GeminiLlmClient({ sleep, minIntervalMs: 4200 });
      await client.extract({ sourceText: "x", instructions: "y", schema }); // first call: never paced
      await client.extract({ sourceText: "x", instructions: "y", schema }); // second: should pace

      expect(sleep).toHaveBeenCalledTimes(1);
      const waitedMs = sleep.mock.calls[0]![0];
      expect(waitedMs).toBeGreaterThan(0);
      expect(waitedMs).toBeLessThanOrEqual(4200);
    });

    it("paces across separate client instances (shared module-level clock)", async () => {
      // getLlmClient() constructs a fresh instance per API route call --
      // pacing only protects a real batch run if it survives that.
      vi.stubEnv("LLM_API_KEY", "fake-gemini-key");
      vi.stubGlobal("fetch", fakeFetch(OK_BODY));
      const sleep = vi.fn(async () => {});

      await new GeminiLlmClient({ sleep, minIntervalMs: 4200 }).extract({
        sourceText: "x",
        instructions: "y",
        schema,
      });
      await new GeminiLlmClient({ sleep, minIntervalMs: 4200 }).extract({
        sourceText: "x",
        instructions: "y",
        schema,
      });

      expect(sleep).toHaveBeenCalledTimes(1);
    });
  });
});
