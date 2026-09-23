import { htmlToPlainText } from "./htmlToPlainText";
import { USER_AGENT } from "@/config/ingestion";
import type { FetchOutcome } from "./types";

export async function fetchSource(
  url: string,
  fetchImpl: typeof fetch,
  maxChars: number,
  now = new Date()
): Promise<FetchOutcome> {
  const fetchedAt = now.toISOString();
  try {
    const res = await fetchImpl(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml,application/pdf;q=0.9,*/*;q=0.8",
      },
    });
    const etag = res.headers.get("etag");
    const lastModified = res.headers.get("last-modified");
    if (!res.ok) return { url, changed: false, statusCode: res.status, etag, lastModified, body: null, error: "HTTP " + res.status, fetchedAt };
    const html = await res.text();
    return { url, changed: true, statusCode: res.status, etag, lastModified, body: htmlToPlainText(html).slice(0, maxChars), error: null, fetchedAt };
  } catch (err) {
    return { url, changed: false, statusCode: null, etag: null, lastModified: null, body: null, error: err instanceof Error ? err.message : String(err), fetchedAt };
  }
}

export async function fetchSourceText(url: string, fetchImpl: typeof fetch, maxChars: number): Promise<string> {
  const outcome = await fetchSource(url, fetchImpl, maxChars);
  if (outcome.error || outcome.body === null) throw new Error(outcome.error ?? "Source returned no body.");
  return outcome.body;
}