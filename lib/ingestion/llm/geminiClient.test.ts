import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { GeminiLlmClient } from "./geminiClient";

const schema = z.object({ opensOn: z.string().nullable() });

function fakeFetch(body: unknown, ok = true, status = 200): typeof fetch {
  return vi.fn(async () => ({
    ok,
    status,
    text: async () => JSON.stringify(body),
    json: async () => body,
  })) as unknown as typeof fetch;
}

describe("GeminiLlmClient", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
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

    const client = new GeminiLlmClient();
    await expect(client.extract({ sourceText: "x", instructions: "y", schema })).rejects.toThrow(
      /Gemini API error: 429/
    );
  });
});
