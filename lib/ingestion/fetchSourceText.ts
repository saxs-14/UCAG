import { createHash } from "node:crypto";
import { htmlToPlainText } from "./htmlToPlainText";
import { USER_AGENT } from "@/config/ingestion";
import type { Source } from "@/lib/firestore/types";
import type { FetchOutcome } from "./types";

const DEFAULT_TIMEOUT_MS = 20_000;
const MAX_RETRIES = 2;
const RETRY_BASE_MS = 500;

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
  if (source.robotsAllowed === false) return { url: source.url, changed: false, statusCode: null, etag: source.etag, lastModified: source.lastModified, body: null, error: "Source blocked by robots policy.", fetchedAt };
  if (source.lastFetchedAt && source.fetchIntervalHours > 0) {
    const lastFetchedMs = Date.parse(source.lastFetchedAt);
    const intervalMs = source.fetchIntervalHours * 60 * 60 * 1000;
    if (Number.isFinite(lastFetchedMs) && now.getTime() - lastFetchedMs < intervalMs) {
      return { url: source.url, changed: false, statusCode: null, etag: source.etag, lastModified: source.lastModified, body: null, error: "Source cadence not due.", fetchedAt };
    }
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const headers: Record<string, string> = {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml,application/pdf;q=0.9,*/*;q=0.8",
    };
    if (source.etag) headers["If-None-Match"] = source.etag;
    if (source.lastModified) headers["If-Modified-Since"] = source.lastModified;

    let res: Response;
    for (let attempt = 0; ; attempt++) {
      res = await fetchImpl(source.url, { headers, signal: controller.signal });
      if (!(res.status === 429 || res.status >= 500) || attempt >= MAX_RETRIES) break;
      const retryAfter = Number(res.headers.get("retry-after"));
      const delayMs = Number.isFinite(retryAfter) && retryAfter >= 0 ? Math.min(retryAfter * 1000, 5000) : RETRY_BASE_MS * 2 ** attempt;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
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
