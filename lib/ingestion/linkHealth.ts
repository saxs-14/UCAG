import { USER_AGENT } from "@/config/ingestion";

export interface LinkHealthResult {
  url: string;
  alive: boolean;
  statusCode: number | null;
  error: string | null;
  checkedAt: string;
}

/**
 * Checks whether a URL is alive. HEAD first (cheaper); falls back to GET
 * when a server rejects HEAD (405/501), which several of the sites in
 * config/sources.seed.ts do. Never throws -- a dead/unreachable link is a
 * result to report, not an exception to propagate.
 */
export async function checkLinkHealth(
  url: string,
  fetchImpl: typeof fetch = fetch,
  timeoutMs = 10000
): Promise<LinkHealthResult> {
  const checkedAt = new Date().toISOString();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let response = await fetchImpl(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": USER_AGENT },
    });

    if (response.status === 405 || response.status === 501) {
      response = await fetchImpl(url, {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
        headers: { "User-Agent": USER_AGENT },
      });
    }

    return { url, alive: response.ok, statusCode: response.status, error: null, checkedAt };
  } catch (err) {
    return {
      url,
      alive: false,
      statusCode: null,
      error: err instanceof Error ? err.message : String(err),
      checkedAt,
    };
  } finally {
    clearTimeout(timeout);
  }
}

/** Sequential, not Promise.all -- a per-domain rate limit (config/
 * ingestion.ts guardrails) means hammering every source at once is
 * exactly what NOT to do, even for a lightweight HEAD check. */
export async function checkLinksHealth(
  urls: string[],
  fetchImpl: typeof fetch = fetch
): Promise<LinkHealthResult[]> {
  const results: LinkHealthResult[] = [];
  for (const url of urls) {
    results.push(await checkLinkHealth(url, fetchImpl));
  }
  return results;
}
