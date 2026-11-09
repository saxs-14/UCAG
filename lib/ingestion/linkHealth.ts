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

    // 401/403 specifically -- not response.ok, but still proof the
    // destination exists: DNS resolved, TCP/TLS connected, and a real
    // server answered with "access denied," which is categorically
    // different from "this doesn't exist" (404) or genuinely unreachable
    // (network error, below). University sites commonly return exactly
    // this to an automated/bot User-Agent (confirmed by hand: the same
    // URLs load real content in a normal browser) -- treating them as
    // dead was a false positive, not a real broken link.
    const alive = response.ok || response.status === 401 || response.status === 403;
    return { url, alive, statusCode: response.status, error: null, checkedAt };
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
