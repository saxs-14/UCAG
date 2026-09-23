import { describe, expect, it } from "vitest";
import { fetchSource } from "./fetchSourceText";

function response(status: number, body: string, headers: Record<string, string> = {}): Response {
  return new Response(body, { status, headers });
}

describe("fetchSource", () => {
  it("returns body and HTTP metadata for a successful fetch", async () => {
    const result = await fetchSource(
      "https://example.test/source",
      async () => response(200, "<html><body>Hello</body></html>", {
        etag: '"abc"',
        "last-modified": "Wed, 23 Sep 2026 10:00:00 GMT",
      }),
      100,
      new Date("2026-09-23T10:00:00.000Z")
    );

    expect(result).toMatchObject({
      changed: true,
      statusCode: 200,
      etag: '"abc"',
      lastModified: "Wed, 23 Sep 2026 10:00:00 GMT",
      body: "Hello",
      error: null,
      fetchedAt: "2026-09-23T10:00:00.000Z",
    });
  });

  it("returns a structured failure instead of throwing", async () => {
    const result = await fetchSource(
      "https://example.test/source",
      async () => response(503, "unavailable"),
      100
    );

    expect(result.changed).toBe(false);
    expect(result.statusCode).toBe(503);
    expect(result.error).toBe("HTTP 503");
    expect(result.body).toBeNull();
  });

  it("records network failures", async () => {
    const result = await fetchSource(
      "https://example.test/source",
      async () => {
        throw new Error("network down");
      },
      100
    );

    expect(result.statusCode).toBeNull();
    expect(result.error).toBe("network down");
    expect(result.body).toBeNull();
  });
});
