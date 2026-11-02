# Frontend Redesign — Phase 1b-2: Results Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring `components/results/` up to the same visual/interaction standard as the
redesigned Calculator (Phase 1b-1): replace its raw emoji with `lucide-react` icons,
reconcile its two divergent hand-rolled card styles onto the `.card-learner` design-token
convention established in Phase 1a, and build the four new learner-assistance features
the original design spec approved: Explain My APS, a gap-closer panel, a mentor snippet,
and a deadline countdown.

**Architecture:** Four new, self-contained files first (no existing file touches them
yet), then two full-file rewrites of the two existing card components to wire everything
in and do the emoji/style sweep in one pass each, then a small targeted edit to
`ResultsSection.tsx`, then a verification checkpoint. No engine/data-layer changes — see
"What this plan does NOT touch" below.

**Tech Stack:** Next.js 15 (App Router), Tailwind CSS v4, TypeScript strict,
`lucide-react` (already a dependency, Phase 1a), Vitest.

## Real-code findings this plan is built on

(Full survey in `.superpowers/sdd/progress.md`'s Phase 1b-2 section once logged; summary
here for anyone reading this plan cold.)

- `components/results/` is 12 files, 1,419 lines, confirmed against the original design
  spec's estimate.
- Emoji exist **only** in `components/results/ResultCard.tsx` — 8 occurrences: 📐 (line
  ~123, formula callout), ★ (bonus callout), ★/☆ (shortlist toggle), 📍 (campus line),
  ✓/✗ (requirement-met indicators), 💡 (next-step callout), 🚀 (apply CTA), ⏳ (opening
  soon). No other file in the folder has emoji.
- Two divergent, hand-rolled card styles exist, neither using the Phase 1a
  `--shadow-card`/`--shadow-card-hover`/`.card-learner` convention (`app/globals.css:103-112`):
  `ResultCard.tsx` uses `rounded-2xl border border-line bg-paper-raised p-5 shadow-sm
  hover:shadow-md`; `UnscoredProgrammeCard.tsx` uses `rounded-[32px] ... shadow-sm
  hover-fine:-translate-y-1 hover-fine:shadow-[0_26px_72px_-40px_rgba(17,72,88,0.18)]`.
  Both get migrated onto `.card-learner` (which itself already wraps `var(--shadow-card)`
  / `var(--shadow-card-hover)`) in this plan.
- **Gap-closer reality check** (spec originally said "show the shortfall already computed
  by `lib/matching/` in human terms — e.g. 'Raise Mathematics from 62% to 66%'"): the
  engine (`lib/matching/types.ts`) exposes exactly what's needed for this **without any
  engine changes** — `SubjectPercentReason` carries `achievedPercent`/`requiredPercent`
  directly, `SubjectLevelReason` carries `achievedLevel`/`requiredLevel`,
  `SubjectMissingReason`/`SubjectWrongVariantReason` carry no numeric gap (different
  phrasing needed), and `ApsGapReason` is an aggregate score gap not tied to one subject
  (phrased as a total-points message, not a fabricated single-subject target). Task 2
  below builds a formatter that handles all five variants honestly — no new engine logic.
- **Explain My APS**: `lib/aps/types.ts`'s `ApsResult` already carries everything needed
  — `countedSubjects: CountedSubject[]` (subjectCode, percentage, value, isLifeOrientation),
  `droppedSubjects`, `excludedSubjects`, `loTreatmentMessage`, `appliedBonuses`,
  `warnings`. The spec's own "flag for the implementation plan to check" concern (whether
  `lib/aps/` needs to start returning a breakdown) is resolved: it already does. Zero
  engine changes needed for Task 1.
- **Mentor snippet**: per the spec's owner decision (2026-08-21), show `getUmpMentors()`'s
  2 hardcoded entries as-is, only when the results include a University of Mpumalanga
  programme. Since Phase 1b-1 removed the old (non-functional) institution-target
  selector, "target institution" as a concept no longer exists in the UI — this plan
  triggers the snippet off whether any *scored* result's `institution.id === "ump"`,
  which is the real, current signal for "this learner's results include UMP" (confirmed
  `id: "ump"` / `shortName: "UMP"` in `config/institutions.seed.ts:26`).
- **Deadline countdown**: `ApplicationWindow` (`lib/firestore/types.ts:251-260`) already
  has `opensOn`/`closesOn`/`lateClosesOn` as `string | null` (ISO dates) flowing into
  every `ResultCard` today via its existing `applicationWindow` prop — this is a pure
  client-side date-math component over data already present, no new data flow needed.
- **Already built, not actually new**: the original spec listed a "Comparison view" and
  an "Application Readiness screen" as new features. Both already exist in the current
  codebase — `CourseComparisonTable.tsx` (71 lines, wired to `compareIds` state in
  `ResultsSection.tsx`) and `ApplicationChecklist.tsx` (78 lines, wired to
  `calculateReadiness()` and `ResultCard`'s readiness bar). **This plan does not rebuild
  either** — they're functional today. If they need visual polish to match the new card
  style, that's a natural candidate for a later, smaller follow-up plan, not this one.
- No component-level tests exist for any of the 11 non-`reasonText.ts` files in this
  folder (only `reasonText.test.ts` exists). This plan adds a unit test for the one new
  pure-logic file it introduces (`gapCloserText.ts`, Task 2), matching the existing
  `reasonText.test.ts` pattern — it does not attempt to backfill component tests for
  the other 11 files, which would be a much larger, separate effort.

## What this plan does NOT touch

- `lib/aps/`, `lib/matching/`, `lib/readiness.ts`, `lib/applicationStatus.ts` — no engine
  or business-logic changes anywhere in this plan. All four new features are pure UI over
  data these modules already compute.
- `CourseComparisonTable.tsx`, `ApplicationChecklist.tsx`, `ConfettiBurst.tsx`,
  `ShareBar.tsx`, `ReadinessBar.tsx`, `ApsImprovementSimulator.tsx`, `SmartBackupPlan.tsx`
  — all already functional, already reasonably consistent with the design system, and out
  of scope for this pass (their two `&rarr;` HTML-entity arrows in
  `ApsImprovementSimulator.tsx`/`SmartBackupPlan.tsx` aren't emoji and aren't touched
  here either — flagged as a minor future polish item, not blocking).
- Institution branding tokens / real per-institution color binding — explicitly Phase 2
  in the original spec (data wiring), not this phase.
- Real cross-institution mentor matching/filtering — explicitly out of scope per the
  owner's 2026-08-21 decision (UMP's 2 hardcoded entries, shown as-is).

## Global Constraints

- `tsc --noEmit`, `npm run lint` clean before each task's commit.
- No emoji used as a structural/navigational icon anywhere touched by this plan.
- Every existing piece of working logic in `ResultCard.tsx` and
  `UnscoredProgrammeCard.tsx` (shortlist toggle, compare toggle, readiness calculation,
  CTA resolution, backup plan, source-verification footer) must be preserved exactly —
  Tasks 5 and 6 are additive/cosmetic rewrites, not logic changes.
- Every new fact-bearing UI element must handle the "not yet available" case explicitly
  and visibly (per CLAUDE.md's overriding rule and the design spec's error-handling
  section) — the deadline countdown in particular must never show a fabricated or blank
  countdown when dates are missing/unverified.
- New pure-logic files get a Vitest unit test, matching the existing
  `reasonText.test.ts`/`applicationStatus.test.ts` pattern.

---

## Task 1: Build the "Explain My APS" breakdown component

**Files:**
- Create: `components/results/ApsBreakdown.tsx`

**Interfaces:**
- Consumes: `ApsResult` (from `lib/aps/types`), already computed per-card by
  `matchProgramme()`/`calculateAps()` upstream — no new data fetching.
- Produces: a `<ApsBreakdown apsResult={...} institutionName={...} />` component with no
  side effects, ready to be wired into `ResultCard.tsx` in Task 5.

- [ ] **Step 1: Create `components/results/ApsBreakdown.tsx`**

```tsx
import { resolveSubjectLabel } from "@/config/subjects";
import type { ApsResult } from "@/lib/aps/types";

interface ApsBreakdownProps {
  apsResult: ApsResult;
  institutionName: string;
}

/**
 * "Explain my APS" -- expandable per-subject breakdown showing exactly how
 * this card's score was built, using the countedSubjects/droppedSubjects/
 * excludedSubjects/appliedBonuses ApsResult already carries. Pure
 * presentation over data lib/aps/engine.ts already computes -- no new
 * calculation logic.
 */
export function ApsBreakdown({ apsResult, institutionName }: ApsBreakdownProps) {
  const valueUnit = apsResult.formulaType.startsWith("pointBand") ? "points" : "%";

  return (
    <details className="no-print rounded-xl border border-line bg-paper p-3.5 text-sm">
      <summary className="cursor-pointer font-semibold text-ink">
        Explain my APS for {institutionName}
      </summary>

      <p className="mt-2 text-xs text-ink-faint">{apsResult.loTreatmentMessage}</p>

      <table className="mt-3 w-full text-xs">
        <thead>
          <tr className="border-b border-line/60 text-left text-ink-faint">
            <th className="py-1 pr-2 font-semibold">Subject</th>
            <th className="py-1 pr-2 font-semibold">Mark</th>
            <th className="py-1 font-semibold">Counted as</th>
          </tr>
        </thead>
        <tbody>
          {apsResult.countedSubjects.map((subject) => (
            <tr key={subject.subjectCode} className="border-b border-line/30 last:border-0">
              <td className="py-1.5 pr-2 font-medium text-ink">
                {resolveSubjectLabel(subject.subjectCode)}
                {subject.isLifeOrientation && (
                  <span className="ml-1 text-2xs text-ink-faint">(LO)</span>
                )}
              </td>
              <td className="py-1.5 pr-2 font-mono tabular-nums text-ink-soft">
                {subject.percentage}%
              </td>
              <td className="py-1.5 font-mono tabular-nums font-bold text-brand-teal">
                {subject.value} {valueUnit}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-line font-bold text-ink">
            <td className="py-1.5 pr-2" colSpan={2}>
              Total
            </td>
            <td className="py-1.5 font-mono tabular-nums">
              {apsResult.score}
              {apsResult.maxScore ? ` / ${apsResult.maxScore}` : ""}
            </td>
          </tr>
        </tfoot>
      </table>

      {apsResult.droppedSubjects.length > 0 && (
        <p className="mt-2 text-2xs text-ink-faint">
          Not counted (best-{apsResult.countedSubjects.length} rule):{" "}
          {apsResult.droppedSubjects.map((code) => resolveSubjectLabel(code)).join(", ")}
        </p>
      )}
      {apsResult.excludedSubjects.length > 0 && (
        <p className="mt-1 text-2xs text-ink-faint">
          Excluded by {institutionName}&apos;s formula:{" "}
          {apsResult.excludedSubjects.map((code) => resolveSubjectLabel(code)).join(", ")}
        </p>
      )}
      {apsResult.appliedBonuses.length > 0 && (
        <p className="mt-2 rounded-lg bg-purple-100 px-2.5 py-1.5 text-2xs font-semibold text-purple-800 border border-purple-300">
          Bonus applied: {apsResult.appliedBonuses.map((b) => b.description).join(", ")}
        </p>
      )}
      {apsResult.warnings.length > 0 && (
        <p className="mt-2 rounded-lg bg-amber-50 px-2.5 py-1.5 text-2xs text-amber-900 border border-amber-200/80">
          {apsResult.warnings.join(" ")}
        </p>
      )}
    </details>
  );
}
```

- [ ] **Step 2: Run typecheck and lint**

Run: `npm run typecheck && npm run lint`
Expected: both clean. This is a new, standalone file — nothing imports it yet, so no
other file should be affected.

- [ ] **Step 3: Commit**

```bash
git add components/results/ApsBreakdown.tsx
git commit -m "feat: add ApsBreakdown component for Explain My APS (not yet wired in)"
```

---

## Task 2: Build the gap-closer text formatter

**Files:**
- Create: `components/results/gapCloserText.ts`
- Create: `components/results/gapCloserText.test.ts`

**Interfaces:**
- Consumes: `MatchReason` (from `lib/matching/types`) — same input type `reasonText.ts`
  already takes, same file location/pattern.
- Produces: `gapCloserText(reason: MatchReason): string | null` — returns `null` for a
  *met* reason (nothing to close) or for `ApsGapReason` when `met` is true; otherwise a
  human "how to close it" sentence. Returns `null` (not a fabricated sentence) for
  reason shapes that don't carry enough information for a specific closing action.

- [ ] **Step 1: Create `components/results/gapCloserText.ts`**

```tsx
import type { MatchReason } from "@/lib/matching/types";

/**
 * Turns an unmet MatchReason into a specific "how to close it" sentence,
 * for the gap-closer panel on Almost-Qualify cards. Sibling to
 * reasonText.ts (which states the shortfall) -- this states the action.
 * Every number here comes directly off the MatchReason the matching
 * engine already computed; this file adds no new calculation, only
 * phrasing. Returns null when a reason doesn't carry a specific
 * actionable target (met reasons, or shapes with no numeric gap) rather
 * than inventing one.
 */
export function gapCloserText(reason: MatchReason): string | null {
  switch (reason.type) {
    case "aps":
      if (reason.met) return null;
      return `Raise your total APS by ${reason.gap} point${reason.gap === 1 ? "" : "s"} across any of your subjects to close this gap.`;
    case "subjectPercent":
      if (reason.met) return null;
      return `Raise ${reason.label} from ${reason.achievedPercent}% to ${reason.requiredPercent}% to meet this requirement.`;
    case "subjectLevel":
      if (reason.met) return null;
      return `Raise ${reason.label} from level ${reason.achievedLevel} to level ${reason.requiredLevel} to meet this requirement.`;
    case "subjectMissing":
      return `Add ${reason.label} as one of your subjects to meet this requirement.`;
    case "subjectWrongVariant":
      return `This requires ${reason.requiredLabel} specifically -- ${reason.achievedLabel} doesn't count toward it.`;
  }
}
```

- [ ] **Step 2: Create `components/results/gapCloserText.test.ts`**

```tsx
import { describe, expect, it } from "vitest";
import { gapCloserText } from "./gapCloserText";
import type { MatchReason } from "@/lib/matching/types";

describe("gapCloserText", () => {
  it("returns null for a met APS reason", () => {
    const reason: MatchReason = { type: "aps", met: true, required: 30, achieved: 32, gap: 0 };
    expect(gapCloserText(reason)).toBeNull();
  });

  it("phrases an unmet APS gap as a total-points action", () => {
    const reason: MatchReason = { type: "aps", met: false, required: 32, achieved: 28, gap: 4 };
    expect(gapCloserText(reason)).toBe(
      "Raise your total APS by 4 points across any of your subjects to close this gap."
    );
  });

  it("uses singular 'point' for a 1-point APS gap", () => {
    const reason: MatchReason = { type: "aps", met: false, required: 30, achieved: 29, gap: 1 };
    expect(gapCloserText(reason)).toBe(
      "Raise your total APS by 1 point across any of your subjects to close this gap."
    );
  });

  it("phrases an unmet subjectPercent reason with a from/to target", () => {
    const reason: MatchReason = {
      type: "subjectPercent",
      subjectCode: "MATH",
      label: "Mathematics",
      met: false,
      requiredPercent: 66,
      achievedPercent: 62,
      gap: 4,
    };
    expect(gapCloserText(reason)).toBe(
      "Raise Mathematics from 62% to 66% to meet this requirement."
    );
  });

  it("returns null for a met subjectPercent reason", () => {
    const reason: MatchReason = {
      type: "subjectPercent",
      subjectCode: "MATH",
      label: "Mathematics",
      met: true,
      requiredPercent: 66,
      achievedPercent: 70,
      gap: 0,
    };
    expect(gapCloserText(reason)).toBeNull();
  });

  it("phrases an unmet subjectLevel reason with a level target", () => {
    const reason: MatchReason = {
      type: "subjectLevel",
      subjectCode: "PHYS",
      label: "Physical Sciences",
      met: false,
      requiredLevel: 5,
      achievedLevel: 4,
      gap: 1,
    };
    expect(gapCloserText(reason)).toBe(
      "Raise Physical Sciences from level 4 to level 5 to meet this requirement."
    );
  });

  it("phrases a subjectMissing reason as an add-this-subject action", () => {
    const reason: MatchReason = {
      type: "subjectMissing",
      subjectCode: "ACC",
      label: "Accounting",
    };
    expect(gapCloserText(reason)).toBe(
      "Add Accounting as one of your subjects to meet this requirement."
    );
  });

  it("phrases a subjectWrongVariant reason without a fabricated numeric target", () => {
    const reason: MatchReason = {
      type: "subjectWrongVariant",
      requiredSubjectCode: "MATH",
      requiredLabel: "Mathematics",
      achievedSubjectCode: "MATHLIT",
      achievedLabel: "Mathematical Literacy",
    };
    expect(gapCloserText(reason)).toBe(
      "This requires Mathematics specifically -- Mathematical Literacy doesn't count toward it."
    );
  });
});
```

- [ ] **Step 3: Run typecheck, lint, and the new test file**

Run: `npm run typecheck && npm run lint && npx vitest run components/results/gapCloserText.test.ts`
Expected: all clean, 8/8 tests passing.

- [ ] **Step 4: Commit**

```bash
git add components/results/gapCloserText.ts components/results/gapCloserText.test.ts
git commit -m "feat: add gapCloserText formatter for the gap-closer panel (not yet wired in)"
```

---

## Task 3: Build the mentor snippet component

**Files:**
- Create: `components/results/MentorSnippet.tsx`

**Interfaces:**
- Consumes: `getUmpMentors()` from `lib/mentors/getMentors.ts` (zero-arg, hardcoded,
  UMP-only, per the owner's 2026-08-21 decision — no new filtering logic).
- Produces: a `<MentorSnippet />` component (no props) ready to be conditionally rendered
  in `ResultsSection.tsx` in Task 7, only when the learner's results include UMP.

- [ ] **Step 1: Create `components/results/MentorSnippet.tsx`**

```tsx
import { Users } from "lucide-react";
import { getUmpMentors } from "@/lib/mentors/getMentors";

/**
 * Shows UMP's 2 hardcoded, verified mentors as-is -- per the owner's
 * 2026-08-21 decision, no cross-institution filtering or matching logic
 * (getUmpMentors() has none to call). Rendered by ResultsSection.tsx only
 * when the learner's results include a University of Mpumalanga
 * programme, since these mentors can only speak to UMP's programmes.
 */
export function MentorSnippet() {
  const mentors = getUmpMentors();
  if (mentors.length === 0) return null;

  return (
    <div className="no-print flex flex-col gap-3 rounded-2xl border border-line bg-paper-raised p-4 card-learner">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-brand-teal shrink-0" aria-hidden="true" />
        <h3 className="font-bold text-sm text-ink">Talk to a current UMP student</h3>
      </div>
      <p className="text-xs text-ink-soft">
        These verified UMP mentors have volunteered to answer questions from prospective
        students. Mentor coverage is UMP-only for now.
      </p>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {mentors.map((mentor) => (
          <div key={mentor.id} className="rounded-xl border border-line/60 bg-paper p-3 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-ink">{mentor.name}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-2xs font-bold uppercase tracking-wide ${
                  mentor.availability === "Available"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-900"
                }`}
              >
                {mentor.availability}
              </span>
            </div>
            <p className="mt-1 text-ink-soft">
              {mentor.programme} · {mentor.yearOfStudy}
            </p>
            <p className="mt-1 text-ink-faint">{mentor.expertise.join(", ")}</p>
            <a
              href={`mailto:${mentor.contactEmail}`}
              className="mt-2 inline-block font-semibold text-brand-teal hover:underline"
            >
              Email {mentor.name.split(" ")[0]}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Run typecheck and lint**

Run: `npm run typecheck && npm run lint`
Expected: both clean.

- [ ] **Step 3: Commit**

```bash
git add components/results/MentorSnippet.tsx
git commit -m "feat: add MentorSnippet component for UMP results (not yet wired in)"
```

---

## Task 4: Build the deadline countdown component

**Files:**
- Create: `components/results/DeadlineCountdown.tsx`

**Interfaces:**
- Consumes: `ApplicationWindow | undefined` and an `ApplicationWindowStatus` (same shape
  `ResultCard.tsx` already receives/derives) — no new data fetching, this reads the same
  prop `ResultCard` already has.
- Produces: a `<DeadlineCountdown applicationWindow={...} status={...} />` component
  ready to be wired into `ResultCard.tsx` in Task 5. Explicitly renders a "dates being
  verified" state rather than nothing when dates aren't available, per CLAUDE.md's
  overriding rule.

- [ ] **Step 1: Create `components/results/DeadlineCountdown.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { Clock, Hourglass } from "lucide-react";
import type { ApplicationWindow, ApplicationWindowStatus } from "@/lib/firestore/types";

interface DeadlineCountdownProps {
  applicationWindow: ApplicationWindow | undefined;
  status: ApplicationWindowStatus;
}

function daysUntil(dateIso: string, now: Date): number {
  const target = new Date(dateIso).getTime();
  return Math.ceil((target - now.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Live "N days left to apply" / "opens in N days" strip. Pure client-side
 * date math over data ResultCard already receives -- no new data flow.
 * Only ever renders a number when a real ISO date is present; an unknown
 * or missing date renders an explicit "dates being verified" state
 * instead of a blank space, per CLAUDE.md's overriding rule.
 */
export function DeadlineCountdown({ applicationWindow, status }: DeadlineCountdownProps) {
  const [now, setNow] = useState<Date | null>(null);

  // Computed on the client only, after mount -- avoids a server/client
  // render mismatch from "today" differing between server render time and
  // hydration time.
  useEffect(() => {
    setNow(new Date());
  }, []);

  if (!now) return null;

  if (status === "open" && applicationWindow) {
    const effectiveClose = applicationWindow.lateClosesOn ?? applicationWindow.closesOn;
    if (effectiveClose) {
      const days = daysUntil(effectiveClose, now);
      if (days >= 0) {
        const urgent = days <= 7;
        return (
          <span
            className={`no-print inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-2xs font-bold uppercase tracking-wide ${
              urgent ? "bg-rose-100 text-rose-800 border border-rose-300" : "bg-slate-100 text-slate-700 border border-slate-300"
            }`}
          >
            <Hourglass className="h-3 w-3 shrink-0" aria-hidden="true" />
            {days === 0 ? "Closes today" : `${days} day${days === 1 ? "" : "s"} left to apply`}
          </span>
        );
      }
    }
  }

  if (status === "openingSoon" && applicationWindow?.opensOn) {
    const days = daysUntil(applicationWindow.opensOn, now);
    if (days >= 0) {
      return (
        <span className="no-print inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-2xs font-bold uppercase tracking-wide text-emerald-800 border border-emerald-300">
          <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
          Opens in {days} day{days === 1 ? "" : "s"}
        </span>
      );
    }
  }

  if (status === "unknown") {
    return (
      <span className="no-print inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-2xs font-semibold uppercase tracking-wide text-slate-600 border border-slate-300">
        <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
        Dates being verified
      </span>
    );
  }

  return null;
}
```

- [ ] **Step 2: Run typecheck and lint**

Run: `npm run typecheck && npm run lint`
Expected: both clean.

- [ ] **Step 3: Commit**

```bash
git add components/results/DeadlineCountdown.tsx
git commit -m "feat: add DeadlineCountdown component (not yet wired in)"
```

---

## Task 5: Rewrite `ResultCard.tsx` — emoji sweep, card-style migration, wire in all three new components

**Files:**
- Modify: `components/results/ResultCard.tsx` (full file rewrite below)

**Interfaces:**
- Consumes: `ApsBreakdown` (Task 1), `gapCloserText` (Task 2), `DeadlineCountdown`
  (Task 4) — all now exist. Does NOT consume `MentorSnippet` (Task 3) — that's rendered
  once per results page in `ResultsSection.tsx`, not once per card (Task 7).
- Produces: `ResultCardProps` is unchanged — no new required props, so
  `ResultsSection.tsx`'s existing `<ResultCard ... />` call sites keep working without
  edits from this task (Task 7 is a separate, additive edit for the mentor snippet only).

- [ ] **Step 1: Replace the full contents of `components/results/ResultCard.tsx`**

```tsx
import Link from "next/link";
import { Check, Clock, Lightbulb, MapPin, Ruler, Rocket, Star, X } from "lucide-react";
import { deriveApplicationWindowStatus, resolveApplicationCta } from "@/lib/applicationStatus";
import { calculateReadiness } from "@/lib/readiness";
import { LABELS } from "@/config/labels";
import { reasonText } from "./reasonText";
import { gapCloserText } from "./gapCloserText";
import { ApsBreakdown } from "./ApsBreakdown";
import { DeadlineCountdown } from "./DeadlineCountdown";
import { CircledMark } from "@/components/CircledMark";
import { ReadinessBar } from "./ReadinessBar";
import { ReadinessScorecard } from "@/components/readiness/ReadinessScorecard";
import { SmartBackupPlan } from "./SmartBackupPlan";
import type { MatchResult } from "@/lib/matching/types";
import type {
  ApplicationWindow,
  Faculty,
  Institution,
  Programme,
  School,
} from "@/lib/firestore/types";

interface ResultCardProps {
  programme: Programme;
  institution: Institution;
  faculty: Faculty;
  school: School;
  matchResult: MatchResult;
  applicationWindow: ApplicationWindow | undefined;
  isShortlisted?: boolean;
  onToggleShortlist?: () => void;
  checkedChecklistIds: ReadonlySet<string>;
  isComparing: boolean;
  onToggleCompare: () => void;
  compareDisabled: boolean;
  staggerIndex?: number;
  allProgrammes?: Programme[];
}

const BUCKET_SPINE: Record<MatchResult["bucket"], string> = {
  qualify: "border-l-4 border-emerald-500",
  almostQualify: "border-l-4 border-amber-500",
  notYet: "border-l-4 border-slate-400",
};

const BUCKET_LABEL_STYLE: Record<MatchResult["bucket"], string> = {
  qualify: "bg-emerald-100 text-emerald-800 font-bold border-emerald-300",
  almostQualify: "bg-amber-100 text-amber-900 font-bold border-amber-300",
  notYet: "bg-slate-100 text-slate-700 font-semibold border-slate-300",
};

function findApsGap(matchResult: MatchResult): number | null {
  const apsReason = matchResult.reasons.find((r) => r.type === "aps");
  if (apsReason && apsReason.type === "aps" && !apsReason.met) return apsReason.gap;
  return null;
}

export function ResultCard({
  programme,
  institution,
  faculty,
  school,
  matchResult,
  applicationWindow,
  isShortlisted,
  onToggleShortlist,
  checkedChecklistIds,
  isComparing,
  onToggleCompare,
  compareDisabled,
  staggerIndex = 0,
  allProgrammes = [],
}: ResultCardProps) {
  const status = applicationWindow?.status ?? deriveApplicationWindowStatus(
    {
      opensOn: applicationWindow?.opensOn ?? null,
      closesOn: applicationWindow?.closesOn ?? null,
      lateClosesOn: applicationWindow?.lateClosesOn ?? null,
    },
    new Date()
  );
  const readiness = calculateReadiness(matchResult, checkedChecklistIds);
  const cta = resolveApplicationCta(
    status,
    {
      applyUrl: programme.applyUrl,
      statusCheckUrl: institution.statusCheckUrl,
      websiteUrl: institution.websiteUrl,
    },
    applicationWindow?.opensOn ?? null
  );

  const apsGap = matchResult.bucket === "almostQualify" ? findApsGap(matchResult) : null;
  const stagger = Math.min(staggerIndex + 1, 6);

  const gapClosers =
    matchResult.bucket === "almostQualify"
      ? matchResult.unmetReasons
          .map((reason) => gapCloserText(reason))
          .filter((text): text is string => text !== null)
      : [];

  return (
    <div className={`stagger-${stagger} animate-rise-in`}>
      <article className={`card-learner flex flex-col gap-4 rounded-2xl p-5 ${BUCKET_SPINE[matchResult.bucket]}`}>
        <header className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/40 pb-2.5">
            <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${BUCKET_LABEL_STYLE[matchResult.bucket]}`}>
              {LABELS.resultBuckets[matchResult.bucket]}
            </span>
            <div className="flex items-center gap-2">
              {matchResult.bucket === "qualify" && (
                <CircledMark
                  value={matchResult.apsResult.score}
                  variant="qualify"
                  size="sm"
                  label={`Your score for this programme: ${matchResult.apsResult.score}`}
                />
              )}
              {apsGap !== null && (
                <CircledMark
                  value={`-${apsGap}`}
                  variant="almost"
                  size="sm"
                  label={`${apsGap} points short of this programme's minimum`}
                />
              )}
            </div>
          </div>

          {/* Institution APS Formula Callout */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-lg bg-teal-950/80 px-2.5 py-1 font-semibold text-teal-200 border border-teal-500/30 text-2xs">
              <Ruler className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span>{institution.shortName || institution.name} Formula:</span>
              <span>{matchResult.apsResult.loTreatmentMessage}</span>
            </span>
            {matchResult.apsResult.appliedBonuses.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-purple-100 px-2.5 py-1 font-semibold text-purple-800 border border-purple-300 text-2xs">
                <Star className="h-3 w-3 shrink-0" aria-hidden="true" fill="currentColor" />
                <span>Bonus:</span>
                <span>{matchResult.apsResult.appliedBonuses.map((b) => b.description).join(", ")}</span>
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-ink">
                <Link href={`/programmes/${programme.id}`} className="hover:underline hover:text-brand-teal transition-colors">
                  {programme.name}
                </Link>
              </h3>
              <p className="text-xs font-semibold text-ink-soft">
                {programme.qualificationType} · NQF Level {programme.nqfLevel} · {programme.duration}
              </p>
              <p className="text-xs text-ink-faint">
                {faculty.name} · {school.name}
              </p>
            </div>
            <div className="no-print flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-1.5 rounded-lg border border-line bg-paper px-3 py-1.5 text-xs font-semibold text-ink-soft cursor-pointer hover:bg-slate-soft shadow-2xs">
                <input
                  type="checkbox"
                  id={`compare-${programme.id}`}
                  name={`compare-${programme.id}`}
                  checked={isComparing}
                  disabled={!isComparing && compareDisabled}
                  onChange={onToggleCompare}
                  className="h-3.5 w-3.5 cursor-pointer accent-brand-teal"
                />
                Compare
              </label>
              {onToggleShortlist && (
                <button
                  type="button"
                  onClick={onToggleShortlist}
                  className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 shadow-2xs ${
                    isShortlisted
                      ? "border-rose-500 bg-rose-600 text-white"
                      : "border-line bg-paper text-ink-soft hover:bg-slate-soft hover:text-ink"
                  }`}
                >
                  <Star className="h-3.5 w-3.5 shrink-0" aria-hidden="true" fill={isShortlisted ? "currentColor" : "none"} />
                  {isShortlisted ? "Shortlisted" : "Shortlist"}
                </button>
              )}
            </div>
          </div>
          {(programme.campuses?.length > 0 || programme.modeOfDelivery) && (
            <p className="flex items-center gap-1 text-xs text-ink-faint font-medium">
              <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
              {[programme.campuses?.length > 0 ? programme.campuses.join(", ") : null, programme.modeOfDelivery]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
          <DeadlineCountdown applicationWindow={applicationWindow} status={status} />
        </header>

        <ul className="flex flex-col gap-2 rounded-xl border border-line/60 bg-paper p-3.5 text-xs">
          {matchResult.reasons.map((reason, i) => {
            const met = "met" in reason ? reason.met : false;
            return (
              <li key={i} className="flex items-start gap-2.5">
                <span aria-hidden className={`mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${met ? "bg-emerald-600 text-white" : "bg-amber-600 text-white"}`}>
                  {met ? <Check className="h-2.5 w-2.5" strokeWidth={3} /> : <X className="h-2.5 w-2.5" strokeWidth={3} />}
                </span>
                <span className="text-ink font-medium leading-relaxed">{reasonText(reason)}</span>
              </li>
            );
          })}
          {matchResult.reasons.length === 0 && (
            <li className="text-ink-faint">No specific requirements on record for this programme.</li>
          )}
        </ul>

        {gapClosers.length > 0 && (
          <div className="flex flex-col gap-1.5 rounded-xl bg-amber-50 p-3 text-xs text-amber-900 border border-amber-200/80">
            <p className="font-bold uppercase tracking-wide text-2xs">How to close the gap</p>
            <ul className="flex flex-col gap-1">
              {gapClosers.map((text, i) => (
                <li key={i} className="font-medium leading-relaxed">
                  {text}
                </li>
              ))}
            </ul>
          </div>
        )}

        {matchResult.suggestedNextStep && (
          <p className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-900 border border-amber-200/80 font-medium">
            <Lightbulb className="h-3.5 w-3.5 shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              <strong>Next step: </strong>
              {matchResult.suggestedNextStep}
            </span>
          </p>
        )}

        <ApsBreakdown apsResult={matchResult.apsResult} institutionName={institution.shortName || institution.name} />

        <div className="flex flex-wrap items-center gap-2 border-t border-line pt-2.5 text-xs">
          {cta.kind === "apply" && (
            <a
              href={cta.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-teal-600 px-4 font-bold text-white transition-all hover:bg-teal-500 shadow-sm active:scale-95"
            >
              <Rocket className="h-4 w-4 shrink-0" aria-hidden="true" />
              {cta.label}
            </a>
          )}
          {cta.kind === "openingSoon" && (
            <span className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-emerald-100 px-3.5 font-bold text-emerald-800 border border-emerald-300">
              <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
              {cta.label}
            </span>
          )}
          {cta.kind === "statusCheck" && (
            <>
              <span className="inline-flex min-h-10 items-center rounded-xl bg-slate-100 px-3.5 font-semibold text-slate-700">
                {LABELS.applicationStatus.closed}
              </span>
              {cta.url && (
                <a
                  href={cta.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-10 items-center px-2 text-teal-700 font-bold hover:underline"
                >
                  {cta.label}
                </a>
              )}
            </>
          )}
          {cta.kind === "datesBeingVerified" && (
            <>
              <span className="inline-flex min-h-10 items-center rounded-xl bg-slate-100 px-3.5 font-semibold text-slate-700">
                {cta.label}
              </span>
              {cta.url && (
                <a
                  href={cta.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-10 items-center px-2 text-teal-700 font-bold hover:underline"
                >
                  Visit institution site
                </a>
              )}
            </>
          )}
        </div>

        <ReadinessBar readiness={readiness} />

        <ReadinessScorecard
          matchResult={matchResult}
          checkedItemIds={checkedChecklistIds}
          applicationWindow={applicationWindow}
        />

        {matchResult.bucket !== "qualify" && (
          <SmartBackupPlan
            programme={programme}
            institution={institution}
            matchResult={matchResult}
            allProgrammes={allProgrammes}
          />
        )}

        <p className="text-2xs font-mono tabular-nums text-ink-faint border-t border-line/40 pt-2">
          Verified {programme.verifiedOn} ·{" "}
          <a href={programme.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-ink">
            Official Source
          </a>
        </p>
      </article>
    </div>
  );
}
```

What changed from the original: (1) all 8 emoji replaced with `lucide-react` icons
(`Ruler`, `Star` ×2 — filled via `fill="currentColor"`/`fill={isShortlisted ? ... :
"none"}` to preserve the old filled-★-vs-outline-☆ shortlisted/not distinction, `MapPin`,
`Check`/`X`, `Lightbulb`, `Rocket`, `Clock`); (2) the card container's ad-hoc `rounded-2xl
border border-line bg-paper-raised p-5 shadow-sm transition-all hover:shadow-md` replaced
with the shared `card-learner` class (which already wraps `--shadow-card`/
`--shadow-card-hover`) plus `rounded-2xl p-5` for this card's specific radius/padding —
the `BUCKET_SPINE` left-border accent is preserved unchanged; (3) three new
elements wired in: `<DeadlineCountdown>` in the header (after the campus/mode line),
a "How to close the gap" block driven by `gapCloserText()` (only rendered when
`bucket === "almostQualify"` and at least one reason produces closer text, positioned
directly after the requirements list and before the existing `suggestedNextStep`
callout — that callout is `notYet`-only per `lib/matching/engine.ts`, so the two never
show for the same card), and `<ApsBreakdown>` (positioned after the next-step callout,
before the CTA row). All existing logic (`findApsGap`, `readiness`, `cta` resolution,
shortlist/compare toggles, `SmartBackupPlan`, the verification footer) is unchanged.

- [ ] **Step 2: Run typecheck and lint**

Run: `npm run typecheck && npm run lint`
Expected: both clean.

- [ ] **Step 3: Grep to confirm no emoji remain**

Run: `grep -P '[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}\x{2B00}-\x{2BFF}]' components/results/ResultCard.tsx`
Expected: no output. (If `grep -P`'s Unicode range syntax isn't supported in the
implementer's shell, as happened in Phase 1b-1, confirm by direct visual re-read of the
file instead and say so in the report.)

- [ ] **Step 4: Run the full test suite**

Run: `npm test`
Expected: no new failures. `ResultCard.tsx` has no direct unit tests today (confirmed
during Phase 1b-2 planning), so this is a pure regression check that the rewrite didn't
break anything covered elsewhere — particularly `lib/matching/engine.test.ts`,
`lib/readiness.test.ts`, `lib/applicationStatus.test.ts`, and the new
`gapCloserText.test.ts` from Task 2.

- [ ] **Step 5: Commit**

```bash
git add components/results/ResultCard.tsx
git commit -m "feat: redesign ResultCard -- emoji to icons, card-learner style, wire in ApsBreakdown/gap-closer/countdown"
```

---

## Task 6: Rewrite `UnscoredProgrammeCard.tsx` — card-style migration only

**Files:**
- Modify: `components/results/UnscoredProgrammeCard.tsx` (full file rewrite below)

**Interfaces:**
- No prop or behavior changes — this file has no emoji and no new-feature hooks apply to
  it (there's no `matchResult`/`apsResult` for an unscored programme, so Explain My APS,
  the gap-closer panel, and the deadline countdown all require data this card doesn't
  have). This task is purely the card-style reconciliation from the survey's finding #6.

- [ ] **Step 1: Replace the full contents of `components/results/UnscoredProgrammeCard.tsx`**

```tsx
import Link from "next/link";
import { LABELS } from "@/config/labels";
import type { Faculty, Institution, Programme, School } from "@/lib/firestore/types";

interface UnscoredProgrammeCardProps {
  programme: Programme;
  institution: Institution;
  faculty: Faculty;
  school: School;
  staggerIndex?: number;
}

/**
 * A real, verified, sourced programme -- name, minAps, subject
 * requirements, all confirmed against the institution's own page -- shown
 * WITHOUT a computed qualify/almost/not-yet verdict, because no verified
 * ApsRule (lib/firestore/types.ts) exists yet for this institution. See
 * components/results/ResultsSection.tsx for why that's a hard line, not a
 * shortcut: matchProgramme() converts a learner's raw percentages into
 * APS points using the institution's own formula (how many subjects
 * count, how Life Orientation is treated, etc.) -- without a verified
 * formula there is no honest number to compute, only a guess wearing the
 * same UI as a fact. This card is the deliberate alternative to that
 * guess: show everything that IS verified, say plainly what isn't yet.
 */
export function UnscoredProgrammeCard({
  programme,
  institution,
  faculty,
  school,
  staggerIndex = 0,
}: UnscoredProgrammeCardProps) {
  const stagger = Math.min(staggerIndex + 1, 6);
  return (
    <article className={`card-learner stagger-${stagger} animate-pop-in flex flex-col gap-4 rounded-2xl p-5`}>
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-brand-coral-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-coral">
            {LABELS.verification.apsRulesBeingVerified}
          </span>
          <span className="rounded-full bg-slate-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate">
            Verified programme
          </span>
        </div>
        <h3 className="text-lg font-semibold text-ink">
          <Link href={`/programmes/${programme.id}`} className="hover:underline">
            {programme.name}
          </Link>
        </h3>
        <p className="text-sm text-ink-soft">
          {institution.name} · {faculty.name} · {school.name}
        </p>
      </header>

      <ul className="flex flex-col gap-1 text-sm text-ink">
        {programme.minAps !== null && <li>Minimum APS: {programme.minAps}</li>}
        {programme.subjectRequirements.map((req, i) => (
          <li key={i}>
            {req.subjectCode}
            {req.minLevel !== undefined ? ` -- level ${req.minLevel}` : ""}
            {req.minPercent !== undefined ? ` -- ${req.minPercent}%` : ""}
          </li>
        ))}
        {programme.additionalRequirements.map((req, i) => (
          <li key={`extra-${i}`} className="text-ink-soft">
            {req}
          </li>
        ))}
      </ul>

      <p className="rounded bg-slate-soft p-2 text-sm text-ink-soft">
        We can&apos;t yet calculate your personal APS score for {institution.shortName} -- their exact APS
        formula (how many subjects count, how Life Orientation is weighted) hasn&apos;t been confirmed
        against an official source yet. The requirements above are real and verified; the score comparison
        is what&apos;s still pending.
      </p>

      <p className="text-xs font-mono tabular-nums text-ink-faint">
        Verified {programme.verifiedOn} ·{" "}
        <a href={programme.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
          Source
        </a>
      </p>
    </article>
  );
}
```

What changed: only the `<article>` className — `rounded-[32px] border border-line
bg-paper-raised p-5 shadow-sm transition-transform duration-200 hover-fine:-translate-y-1
hover-fine:shadow-[0_26px_72px_-40px_rgba(17,72,88,0.18)]` replaced with `card-learner
rounded-2xl p-5`, matching `ResultCard.tsx`'s Task 5 treatment so the two card types now
share one visual language instead of two. Every other line, including the animation
classes (`stagger-${stagger} animate-pop-in`, kept on the `<article>` itself since this
component — unlike `ResultCard.tsx` — has no separate wrapper `<div>`) and the full
explanatory copy, is untouched.

- [ ] **Step 2: Run typecheck and lint**

Run: `npm run typecheck && npm run lint`
Expected: both clean.

- [ ] **Step 3: Commit**

```bash
git add components/results/UnscoredProgrammeCard.tsx
git commit -m "style: migrate UnscoredProgrammeCard onto the card-learner design-token convention"
```

---

## Task 7: Wire the mentor snippet into `ResultsSection.tsx`

**Files:**
- Modify: `components/results/ResultsSection.tsx` (targeted edit, not a full rewrite —
  this file is 340 lines and this task only touches an import line and one render
  location)

**Interfaces:**
- Consumes: `MentorSnippet` (Task 3).
- Produces: no prop/behavior change to `ResultsSection` itself (`{ marks }` unchanged).

- [ ] **Step 1: Add the import**

Add, alongside the other `components/results/` imports near the top of the file:

```tsx
import { MentorSnippet } from "./MentorSnippet";
```

- [ ] **Step 2: Render it conditionally, once, after the `ApsFormulaBanner`**

Find the existing block that renders `<ApsFormulaBanner />` only when `scored.length > 0`
(confirmed at `ResultsSection.tsx:244` during planning: `{scored.length > 0 &&
<ApsFormulaBanner />}`). Immediately after that line, insert:

```tsx
        {scored.some((entry) => entry.institution?.id === "ump") && <MentorSnippet />}
```

The exact local variable name for each scored entry's institution depends on how
`ResultsSection.tsx` structures its `scored` array (confirmed during planning to be an
array of objects carrying `programme`/`matchResult`, with institution resolution nearby
in the same `useMemo` — the implementer should use whatever the existing scored-entry
shape's institution reference is called in this file, adding an `institution` field to
that shape first if it isn't already carried per-entry, rather than re-looking it up by
a separate map on every render). If the `scored` array as it exists today does NOT carry
an `institution` reference per entry, add one field to that array's shape (populated from
the same `institutions` lookup the rest of the file already uses) rather than
re-deriving institution objects inline in this conditional.

- [ ] **Step 3: Run typecheck and lint**

Run: `npm run typecheck && npm run lint`
Expected: both clean.

- [ ] **Step 4: Run the full test suite**

Run: `npm test`
Expected: no new failures.

- [ ] **Step 5: Commit**

```bash
git add components/results/ResultsSection.tsx
git commit -m "feat: show MentorSnippet on results when UMP is among the qualifying institutions"
```

---

## Task 8: Full browser verification and regression checkpoint

**Files:** none (verification only)

**Interfaces:** none.

- [ ] **Step 1: Start the dev server (and the Firestore/Auth emulator if not already
  running — required for real catalogue data; without it, SSR falls back to slow
  ECONNREFUSED retries before defaults, as found during the Phase 1b-1 checkpoint)**

- [ ] **Step 2: Reach a real, populated results view**

Using a real browser (chrome-devtools MCP or claude-in-chrome, whichever is connected),
load the Calculator (`/`), fill in a full set of compulsory + elective marks (matching
the approach used in the Phase 1b-1 checkpoint — native-setter + dispatched events for
selects/number inputs, real `.focus()` + option-click for the `SubjectCombobox`
electives), and click Calculate to reach a real, populated `ResultsSection`.

- [ ] **Step 3: Verify each new/changed piece renders correctly, with real evidence**

- `ResultCard.tsx`: screenshot at least one `qualify` card and one `almostQualify` card.
  Confirm: no emoji visible, icons render (Ruler/Star/MapPin/Check-X/Lightbulb/Rocket/
  Clock as applicable), card uses the `.card-learner` shadow/hover treatment, the
  bucket-colored left spine is still present.
- `DeadlineCountdown`: confirm it renders something (a countdown, an "opens in" message,
  or "dates being verified") rather than nothing, for whatever application-window data
  the seeded catalogue actually has.
- The "How to close the gap" panel: confirm it appears on an `almostQualify` card (if the
  test data produces one) with specific, non-generic phrasing (a real subject name and
  number, not a placeholder).
- `ApsBreakdown`: click to expand it on at least one card; confirm the per-subject table
  renders real subject labels, marks, and a total matching the card's own displayed
  score.
- `MentorSnippet`: confirm it appears when UMP is among the scored institutions (which,
  per the Phase 1b-2 planning survey, is true in the current seeded catalogue) and shows
  both of `getUmpMentors()`'s real entries (Sibusiso Nkosi, Nokuthula Zwane) with working
  `mailto:` links.
- `UnscoredProgrammeCard.tsx`: if the seeded catalogue has any unscored programmes,
  screenshot one and confirm the `.card-learner` styling matches `ResultCard.tsx`'s new
  look.

- [ ] **Step 4: Confirm nothing outside `components/results/` regressed**

Screenshot the Calculator page itself (`/`) to confirm Phase 1b-1's work is undisturbed.

- [ ] **Step 5: Full regression pass**

Run: `npm run typecheck && npm run lint && npm test && npm run build`
Expected: all clean — this is the Phase 1b-2 checkpoint, same bar as Phase 1a and
Phase 1b-1's final checkpoints. Stop the dev server before running `npm run build` (a
prior checkpoint in this project found running both concurrently causes a resource
contention crash on Windows).

- [ ] **Step 6: Report honestly**

Per CLAUDE.md's stop-and-confirm rule: report what was built, what (if anything) fell
short of the plan (e.g. if the seeded catalogue doesn't currently produce an
`almostQualify` result or an unscored programme, say so plainly rather than skipping that
verification silently), and wait for owner confirmation before starting any further
phase.
