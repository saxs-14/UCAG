import { createHash } from "node:crypto";
import { htmlToPlainText } from "./htmlToPlainText";
import { USER_AGENT } from "@/config/ingestion";
import type { Source } from "@/lib/firestore/types";
import type { FetchOutcome } from "./types";

const DEFAULT_TIMEOUT_MS = 20_000;

function bodyHash(body: string): string {
  return createHash("sha256").update(body).digest("hex");
}

export async function fetchSource(
  source: Pick<Source, "url" | "etag" | "lastModified">,
  fetchImpl: typeof fetch,
  maxChars: number,
  now = new Date()
): Promise<FetchOutcome> {
  const fetchedAt = now.toISOString();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const headers: Record<string, string> = {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml,application/pdf;q=0.9,*/*;q=0.8",
    };
    if (source.etag) headers["If-None-Match"] = source.etag;
    if (source.lastModified) headers["If-Modified-Since"] = source.lastModified;

    const res = await fetchImpl(source.url, { headers, signal: controller.signal });
    const etag = res.headers.get("etag");
    const lastModified = res.headers.get("last-modified");

    if (res.status === 304) {
      return { url: source.url, changed: false, statusCode: 304, etag: etag ?? source.etag, lastModified: lastModified ?? source.lastModified, body: null, error: null, fetchedAt };
    }
    if (!res.ok) {
      return { url: source.url, changed: false, statusCode: res.status, etag, lastModified, body: null, error: "HTTP " + res.status, fetchedAt };
    }

    const rawBody = await res.text();
    const body = htmlToPlainText(rawBody).slice(0, maxChars);
    const currentHash = bodyHash(body);
    const previousHash = (source as Source & { contentHash?: string }).contentHash ?? null;
    return {
      url: source.url,
      changed: previousHash === null || currentHash !== previousHash || (etag !== null && etag !== source.etag) || (lastModified !== null && lastModified !== source.lastModified),
      statusCode: res.status,
      etag,
      lastModified,
      body,
      error: null,
      fetchedAt,
      contentHash: currentHash,
    };
  } catch (err) {
    return { url: source.url, changed: false, statusCode: null, etag: null, lastModified: null, body: null, error: err instanceof Error && err.name === "AbortError" ? "Request timed out." : err instanceof Error ? err.message : String(err), fetchedAt };
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchSourceText(url: string, fetchImpl: typeof fetch, maxChars: number): Promise<string> {
  const outcome = await fetchSource({ url, etag: null, lastModified: null }, fetchImpl, maxChars);
  if (outcome.error || outcome.body === null) throw new Error(outcome.error ?? "Source returned no body.");
  return outcome.body;
}
