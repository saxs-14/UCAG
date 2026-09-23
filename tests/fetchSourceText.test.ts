import { describe, expect, it, vi } from "vitest";
import { fetchSource } from "@/lib/ingestion/fetchSourceText";

function source(overrides: Partial<Parameters<typeof fetchSource>[0]> = {}) {
  return {
    url: "https://example.test/source",
    etag: null,
    lastModified: null,
    robotsAllowed: true,
    fetchIntervalHours: 0,
    lastFetchedAt: null,
    contentHash: null,
    ...overrides,
  };
}

function response(status: number, body = "", headers: Record<string, string> = {}) {
  return new Response(body, { status, headers });
}

describe("fetchSource", () => {
  it("skips a source blocked by robots policy without making a request", async () => {
    const fetchImpl = vi.fn();

    const result = await fetchSource(source({ robotsAllowed: false }), fetchImpl, 1000);

    expect(result.skipped).toBe(true);
    expect(result.error).toBe("Source blocked by robots policy.");
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("skips a source before its configured cadence is due", async () => {
    const fetchImpl = vi.fn();
    const now = new Date("2026-09-23T12:00:00.000Z");

    const result = await fetchSource(
      source({
        fetchIntervalHours: 6,
        lastFetchedAt: "2026-09-23T08:00:00.000Z",
      }),
      fetchImpl,
      1000,
      now
    );

    expect(result.skipped).toBe(true);
    expect(result.error).toBeNull();
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("fetches when the configured cadence is due", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      response(200, "<html><body><h1>Programme update</h1></body></html>")
    );

    const result = await fetchSource(
      source({
        fetchIntervalHours: 6,
        lastFetchedAt: "2026-09-23T05:59:59.000Z",
      }),
      fetchImpl,
      1000,
      new Date("2026-09-23T12:00:00.000Z")
    );

    expect(result.skipped).not.toBe(true);
    expect(result.statusCode).toBe(200);
    expect(result.body).toContain("Programme update");
    expect(result.contentHash).toMatch(/^[a-f0-9]{64}$/);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("uses conditional request headers and treats HTTP 304 as unchanged", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      response(304, "", {
        etag: '"etag-2"',
        "last-modified": "Wed, 23 Sep 2026 10:00:00 GMT",
      })
    );

    const result = await fetchSource(
      source({
        etag: '"etag-1"',
        lastModified: "Tue, 22 Sep 2026 10:00:00 GMT",
        contentHash: "previous-hash",
      }),
      fetchImpl,
      1000
    );

    const [, options] = fetchImpl.mock.calls[0]!;
    expect(options.headers).toMatchObject({
      "If-None-Match": '"etag-1"',
      "If-Modified-Since": "Tue, 22 Sep 2026 10:00:00 GMT",
    });
    expect(result.statusCode).toBe(304);
    expect(result.changed).toBe(false);
    expect(result.body).toBeNull();
    expect(result.error).toBeNull();
  });

  it("retries transient HTTP failures and reports the retry count", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(response(503, "temporary failure"))
      .mockResolvedValueOnce(response(200, "<p>Recovered</p>"));

    const result = await fetchSource(source(), fetchImpl, 1000);

    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(result.statusCode).toBe(200);
    expect(result.retryCount).toBe(1);
    expect(result.error).toBeNull();
  });

  it("marks content unchanged when the normalized body hash is the same", async () => {
    const body = "<html><body><p>Same content</p></body></html>";
    const firstFetch = vi.fn().mockResolvedValue(response(200, body));
    const first = await fetchSource(source(), firstFetch, 1000);

    const secondFetch = vi.fn().mockResolvedValue(response(200, body));
    const second = await fetchSource(
      source({ contentHash: first.contentHash }),
      secondFetch,
      1000
    );

    expect(first.contentHash).toBeDefined();
    expect(second.contentHash).toBe(first.contentHash);
    expect(second.changed).toBe(false);
  });

  it("marks content changed when the normalized body hash changes", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      response(200, "<html><body><p>New content</p></body></html>")
    );

    const result = await fetchSource(
      source({ contentHash: "0000000000000000000000000000000000000000000000000000000000000000" }),
      fetchImpl,
      1000
    );

    expect(result.changed).toBe(true);
    expect(result.contentHash).toMatch(/^[a-f0-9]{64}$/);
  });
});
