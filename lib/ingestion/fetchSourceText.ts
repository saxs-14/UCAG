import { htmlToPlainText } from "./htmlToPlainText";
import { USER_AGENT } from "@/config/ingestion";

/** Shared by every orchestrator (applicationWindowPipeline,
 * programmeRequirementsPipeline, ...): fetch a source URL with the
 * project's bot user-agent, strip HTML down to plain text, and cap
 * length -- a direct token-cost lever, not just truncation for its own
 * sake. Extracted out once a second orchestrator needed the exact same
 * three lines, rather than duplicating fetch/strip/cap logic per task. */
export async function fetchSourceText(
  url: string,
  fetchImpl: typeof fetch,
  maxChars: number
): Promise<string> {
  const res = await fetchImpl(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  return htmlToPlainText(html).slice(0, maxChars);
}
