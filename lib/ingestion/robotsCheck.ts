/**
 * Minimal robots.txt parser/checker -- enough to honour Disallow/Allow
 * directives per user-agent group, which is all the ingestion pipeline
 * needs (docs/MASTER_PROMPT_v2.md sect. 4: "respect robots.txt"). Not a
 * full spec implementation (no wildcard/$ support) -- sufficient for the
 * sites in config/sources.seed.ts, all of which use simple path prefixes.
 */

export interface RobotsGroup {
  userAgents: string[];
  disallow: string[];
  allow: string[];
}

export function parseRobotsTxt(text: string): RobotsGroup[] {
  const groups: RobotsGroup[] = [];
  let current: RobotsGroup | null = null;

  for (const rawLine of text.split("\n")) {
    const line = rawLine.split("#")[0]!.trim();
    if (!line) continue;

    const [rawField, ...rest] = line.split(":");
    const field = rawField?.trim().toLowerCase();
    const value = rest.join(":").trim();
    if (!field || !value) continue;

    if (field === "user-agent") {
      // A new User-agent line right after another User-agent line belongs
      // to the same group (multiple agents sharing one rule set).
      if (!current || current.disallow.length > 0 || current.allow.length > 0) {
        current = { userAgents: [value], disallow: [], allow: [] };
        groups.push(current);
      } else {
        current.userAgents.push(value);
      }
    } else if (field === "disallow" && current) {
      current.disallow.push(value);
    } else if (field === "allow" && current) {
      current.allow.push(value);
    }
  }

  return groups;
}

function matchesUserAgent(groupAgents: string[], userAgent: string): boolean {
  return groupAgents.some(
    (agent) => agent === "*" || userAgent.toLowerCase().includes(agent.toLowerCase())
  );
}

/**
 * True if `path` is allowed for `userAgent`. No robots.txt content (empty
 * string, e.g. a 404 was treated as "no restrictions") means allowed --
 * matches how every source with no robots.txt file was recorded in
 * config/sources.seed.ts. Longest matching prefix wins, per the de facto
 * robots.txt standard; ties go to Allow.
 */
export function isPathAllowed(robotsTxt: string, userAgent: string, path: string): boolean {
  if (!robotsTxt.trim()) return true;

  const groups = parseRobotsTxt(robotsTxt);
  const specific = groups.find((g) => matchesUserAgent(g.userAgents, userAgent) && !g.userAgents.includes("*"));
  const wildcard = groups.find((g) => g.userAgents.includes("*"));
  const group = specific ?? wildcard;
  if (!group) return true;

  let bestMatch: { length: number; allowed: boolean } | null = null;

  for (const rule of group.disallow) {
    if (rule === "" ) continue; // empty Disallow means "allow everything"
    if (path.startsWith(rule) && (!bestMatch || rule.length > bestMatch.length)) {
      bestMatch = { length: rule.length, allowed: false };
    }
  }
  for (const rule of group.allow) {
    if (path.startsWith(rule) && (!bestMatch || rule.length >= bestMatch.length)) {
      bestMatch = { length: rule.length, allowed: true };
    }
  }

  return bestMatch?.allowed ?? true;
}
