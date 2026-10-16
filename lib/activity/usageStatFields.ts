/**
 * Pure constants/types, deliberately split out of lib/activity/trackUsage.ts
 * (which is "server-only"-guarded) so the admin report page -- a Client
 * Component, needing only the field list/names to render its table -- can
 * import this without pulling the Admin SDK, and everything it transitively
 * imports, into the browser bundle. Importing anything at all, even a type
 * or a plain array, from a server-only module into a Client Component
 * bundles the whole module and trips the "server-only" package's own
 * build-time guard (CLAUDE.md non-negotiable #1).
 */
export const USAGE_STAT_FIELDS = [
  "calculatorCompletions",
  "programmeSearches",
  "fundingDiscoveryViews",
] as const;

export type UsageStatField = (typeof USAGE_STAT_FIELDS)[number];
