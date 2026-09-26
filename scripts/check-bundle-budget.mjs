// Enforces docs/MASTER_PROMPT_v2.md Phase 8's calculator-route bundle
// budget in CI (docs/PROJECT_STATUS.md §3.7, previously "NOT DONE").
//
// The brief's original target was <200KB First Load JS. As of 2026-09-26
// the real figure is ~257KB, almost entirely Firebase Auth's SDK -- loaded
// globally (AuthProvider wraps every route) so the nav bar always knows
// sign-in state, even on routes like the calculator that don't otherwise
// need auth. Deferring that is a real UX/architecture change (the nav's
// sign-in link would need a skeleton/loading state), not something to
// slip in unreviewed just to satisfy this check. Owner decision
// (2026-09-26): enforce a documented ~260KB baseline now rather than
// leave the budget unenforced, and revisit the Auth-deferral refactor as
// its own piece of work later.
//
// Reads Next's own human-readable build output rather than hand-parsing
// its internal manifest JSON (which is undocumented and has changed
// shape across versions) -- the "First Load JS" figure printed here is
// the exact number this whole budget concept is about, and parsing the
// manifest instead would just be re-deriving the same number less
// reliably. Usage: `npm run build 2>&1 | tee build-output.log && npm run
// check:bundle-budget -- build-output.log` (see ci.yml).

import { readFileSync } from "node:fs";

const BUDGET_KB = 260;
const ROUTE = "/";

const logPath = process.argv[2];
if (!logPath) {
  console.error("Usage: node scripts/check-bundle-budget.mjs <build-output-log-path>");
  process.exit(2);
}

const log = readFileSync(logPath, "utf8");

// Matches a Next.js build-output route row, e.g.:
// "┌ ƒ /                                      25.1 kB         257 kB"
// Route column is whitespace-delimited (routes never contain spaces),
// followed by a "Size" and a "First Load JS" column, each a number+unit.
const ROW_PATTERN = /^[┌├└]\s*[ƒ○]\s+(\S+)\s+([\d.]+\s*\w+)\s+([\d.]+\s*\w+)\s*$/gm;

let match;
let found = null;
while ((match = ROW_PATTERN.exec(log)) !== null) {
  const [, route, , firstLoadJs] = match;
  if (route === ROUTE) {
    found = firstLoadJs;
    break;
  }
}

if (!found) {
  console.error(
    `check-bundle-budget: could not find a build-output row for route "${ROUTE}" in ${logPath}. ` +
      "Next's build-output table format may have changed -- update ROW_PATTERN above."
  );
  process.exit(2);
}

const kbMatch = found.match(/^([\d.]+)\s*kB$/);
if (!kbMatch) {
  console.error(`check-bundle-budget: unexpected First Load JS value "${found}" (expected e.g. "257 kB").`);
  process.exit(2);
}
const actualKb = parseFloat(kbMatch[1]);

if (actualKb > BUDGET_KB) {
  console.error(
    `check-bundle-budget: FAIL -- route "${ROUTE}" First Load JS is ${actualKb}KB, over the ${BUDGET_KB}KB budget.`
  );
  process.exit(1);
}

console.log(`check-bundle-budget: OK -- route "${ROUTE}" First Load JS is ${actualKb}KB (budget: ${BUDGET_KB}KB).`);
