import { describe, expect, it } from "vitest";
import { isPathAllowed, parseRobotsTxt } from "./robotsCheck";

describe("parseRobotsTxt", () => {
  it("groups Disallow/Allow rules under their User-agent", () => {
    const groups = parseRobotsTxt(`
User-agent: *
Disallow: /admin
Disallow: /search

User-agent: Googlebot
Allow: /
`);
    expect(groups).toHaveLength(2);
    expect(groups[0]!.userAgents).toEqual(["*"]);
    expect(groups[0]!.disallow).toEqual(["/admin", "/search"]);
    expect(groups[1]!.userAgents).toEqual(["Googlebot"]);
    expect(groups[1]!.allow).toEqual(["/"]);
  });

  it("ignores comments and blank lines", () => {
    const groups = parseRobotsTxt("# comment\n\nUser-agent: *\n# another comment\nDisallow: /x\n");
    expect(groups[0]!.disallow).toEqual(["/x"]);
  });
});

describe("isPathAllowed", () => {
  it("allows everything when robots.txt is empty (404 case)", () => {
    expect(isPathAllowed("", "UCAG-Ingestion-Bot/1.0", "/anything")).toBe(true);
  });

  it("respects a wildcard Disallow", () => {
    const robots = "User-agent: *\nDisallow: /admin\n";
    expect(isPathAllowed(robots, "UCAG-Ingestion-Bot/1.0", "/admin/settings")).toBe(false);
    expect(isPathAllowed(robots, "UCAG-Ingestion-Bot/1.0", "/programmes")).toBe(true);
  });

  it("prefers a specific user-agent group over the wildcard group", () => {
    const robots = "User-agent: *\nDisallow: /\n\nUser-agent: Googlebot\nAllow: /\n";
    expect(isPathAllowed(robots, "Googlebot", "/anything")).toBe(true);
    expect(isPathAllowed(robots, "UCAG-Ingestion-Bot/1.0", "/anything")).toBe(false);
  });

  it("does not match a custom bot name against a differently-named disallowed bot (UCT-style block)", () => {
    // Mirrors uct.ac.za: named AI crawlers blocked, everything else under
    // the general/permissive rule -- our custom bot name is not GPTBot.
    const robots = "User-agent: GPTBot\nDisallow: /\n\nUser-agent: *\nDisallow: /admin\n";
    expect(isPathAllowed(robots, "UCAG-Ingestion-Bot/1.0", "/students/requirements")).toBe(true);
    expect(isPathAllowed(robots, "GPTBot", "/students/requirements")).toBe(false);
  });

  it("longest matching prefix wins between conflicting Allow/Disallow", () => {
    const robots = "User-agent: *\nDisallow: /programmes\nAllow: /programmes/public\n";
    expect(isPathAllowed(robots, "UCAG-Ingestion-Bot/1.0", "/programmes/public/bsc-cs")).toBe(true);
    expect(isPathAllowed(robots, "UCAG-Ingestion-Bot/1.0", "/programmes/internal")).toBe(false);
  });

  it("an empty Disallow value means allow everything", () => {
    const robots = "User-agent: *\nDisallow:\n";
    expect(isPathAllowed(robots, "UCAG-Ingestion-Bot/1.0", "/anything")).toBe(true);
  });
});
