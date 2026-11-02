# Frontend Redesign — Phase 1b-1: Calculator Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove two institution selectors that look functional but do nothing, compact
the subject-entry layout so the compulsory subject dropdowns are genuinely reachable
without scrolling on a phone screen, and replace the emoji in the touched files with
`lucide-react` icons.

**Architecture:** Two file rewrites (`components/CalculatorPage.tsx`,
`components/subject-form/SubjectForm.tsx`) plus a real-browser measurement task. No new
components, no data/backend changes, no route changes. `lucide-react` is already a
dependency (installed in Phase 1a).

**Tech Stack:** Next.js 15 (App Router), Tailwind CSS v4, TypeScript strict,
`lucide-react`, `chrome-devtools` MCP for the verification task.

## Global Constraints

- `tsc --noEmit`, `npm run lint` clean before each task's commit.
- No emoji used as a structural/navigational icon anywhere touched by this plan.
- Every existing piece of *working* logic in `SubjectForm.tsx` — mark computation
  (`marks` useMemo), validation (`handleCalculate`), elective add/remove/animation,
  language-conflict clearing (home language vs FAL) — must be preserved exactly. The
  only state being removed is `targetInstitution`, which this plan has confirmed (by
  reading `ResultsSection.tsx`, which takes only a `marks` prop and computes matches
  against the full catalog regardless of any institution selection) is never consumed
  anywhere — removing it changes no calculation behavior.
- `components/results/ResultsSection.tsx` and everything under `components/results/`
  is explicitly OUT OF SCOPE for this plan — that's Phase 1b-2, a separate plan, because
  it's a 1,419-line, 12-file surface that needs its own full read-through first.
- `components/SaveMarksButton.tsx` is a shared/adjacent component this plan does NOT
  modify — its own emoji/spacing is a separate, later cleanup pass, not blocking this
  plan's goal.
- **Scope expansion (owner, 2026-08-21):** Task 3's real browser measurement (see its
  report) found the no-scroll goal is NOT achievable by trimming
  `CalculatorPage.tsx`/`SubjectForm.tsx` alone — `PageHero.tsx` (296px) and
  `ApsFormulaBanner.tsx` (254px collapsed) together already exceed a 668px-tall mobile
  viewport before the form even starts. The owner approved expanding this plan to touch
  both, added as Tasks 4-6 below. `PageHero.tsx` is used on 4 pages
  (`CalculatorPage.tsx`, `app/account/page.tsx`, `app/statistics/page.tsx`,
  `app/bursaries/page.tsx`) — Task 4 adds an opt-in `compact` prop defaulting to `false`,
  so the other 3 pages are provably unaffected (they don't pass the prop).
  `ApsFormulaBanner.tsx` is used in 2 places (`CalculatorPage.tsx` and
  `components/results/ResultsSection.tsx`) with no props at all — Task 5 tightens its
  one and only layout, which benefits both call sites and changes no prop signature, so
  `ResultsSection.tsx` (out of scope for this plan) needs no edit.
- The owner decision on record (spec `docs/superpowers/specs/2026-08-20-frontend-redesign-design.md`
  §4, 2026-08-21): the two non-functional institution selectors are REMOVED, not wired
  up — results already compute against every institution, which is more useful than a
  fake single-institution filter.

---

## Task 1: Remove the two non-functional institution selectors

**Files:**
- Modify: `components/CalculatorPage.tsx` (full file rewrite below)
- Modify: `components/subject-form/SubjectForm.tsx:70` (remove one line) and
  `components/subject-form/SubjectForm.tsx:345-363` (remove the "Target Institution
  Rule" block from the Calculate action card)

**Interfaces:**
- Consumes: nothing new.
- Produces: `SubjectForm`'s public prop signature (`{ onMarksChange?, initialState? }`)
  is unchanged — `targetInstitution` was internal state, never exposed as a prop, so
  removing it has no effect on `CalculatorPage.tsx`'s usage of `<SubjectForm ... />`.

- [ ] **Step 1: Replace the full contents of `components/CalculatorPage.tsx`**

Replace the entire file with:

```tsx
"use client";

import { useEffect, useState } from "react";
import { PageHero } from "./PageHero";
import { SubjectForm } from "./subject-form/SubjectForm";
import { ResultsSection } from "./results/ResultsSection";
import { SaveMarksButton } from "./SaveMarksButton";
import { ApsFormulaBanner } from "./aps/ApsFormulaBanner";
import { useAuth } from "./auth/AuthProvider";
import { subjectMarksToFormState, type SubjectFormInitialState } from "@/config/subjects";
import type { SubjectMarkInput } from "@/lib/aps/types";

export function CalculatorPage() {
  const { user } = useAuth();
  const [marks, setMarks] = useState<SubjectMarkInput[]>([]);
  const [initialState, setInitialState] = useState<SubjectFormInitialState | undefined>(undefined);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      const { getUserProfile } = await import("@/lib/auth/profile");
      const profile = await getUserProfile(user.uid);
      if (!cancelled && profile?.marks.length) {
        setInitialState(subjectMarksToFormState(profile.marks));
        setFormKey((k) => k + 1);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <PageHero
        title="Find Your University Degree Pathways"
        subtitle="Enter your NSC Matric marks to instantly calculate your official APS score across South African universities, discover degrees you qualify for, and unlock personalized backup plans."
      />

      <div className="flex w-full max-w-3xl flex-col items-center gap-5 px-4">
        <ApsFormulaBanner />
        <SubjectForm key={formKey} onMarksChange={setMarks} initialState={initialState} />
        <SaveMarksButton marks={marks} />
        <ResultsSection marks={marks} />
      </div>
    </div>
  );
}
```

What changed from the original: removed the `TARGET_INSTITUTIONS` array (7 entries, each
with a raw emoji), the `selectedInstId` state, the `activeBranding` computation, the
`getInstitutionBranding` import, and the entire "Select Target University Formula" tab
strip `<div>`. Outer wrapping `gap-8` reduced to `gap-5` (the tab strip's removal frees
enough vertical rhythm that the wider gap is no longer needed to avoid feeling cramped).
Everything else — the `useEffect` profile-hydration logic, `formKey` remount trick,
component composition order — is unchanged.

- [ ] **Step 2: Remove `targetInstitution` state from `SubjectForm.tsx`**

Delete this line (originally line 70):

```tsx
  const [targetInstitution, setTargetInstitution] = useState<string>("ump");
```

- [ ] **Step 3: Remove the "Target Institution Rule" block from the Calculate action card**

Find this block inside the `<div className="flex flex-col gap-3 rounded-2xl border border-brand-teal/40 bg-brand-teal/5 p-5 shadow-sm">` action card (originally lines 346-363):

```tsx
        <div className="flex flex-col gap-1">
          <label htmlFor="target-institution" className="text-xs font-bold text-ink uppercase tracking-wider">
            Target Institution Rule
          </label>
          <select
            id="target-institution"
            className="min-h-11 rounded-xl border border-line bg-paper-raised px-3.5 py-2 text-sm font-semibold text-ink focus:border-brand-teal focus:outline-none"
            value={targetInstitution}
            onChange={(e) => setTargetInstitution(e.target.value)}
          >
            <option value="ump">University of Mpumalanga (UMP) -- LO ÷ 2 Rule</option>
            <option value="up">University of Pretoria (UP) -- LO Excluded Rule</option>
            <option value="wits">University of the Witwatersrand (Wits) -- LO Included + Bonus Rule</option>
            <option value="uj">University of Johannesburg (UJ) -- LO Excluded Rule</option>
            <option value="tut">Tshwane University of Technology (TUT) -- LO Excluded Rule</option>
            <option value="all">All South African Universities</option>
          </select>
        </div>

```

Delete it entirely (including the blank line after it, before `{validationError && (`).
Task 2 below rewrites this same action card further (padding, icons) — this step only
removes the dead selector so Task 2's full-block replacement starts from a smaller base.

- [ ] **Step 4: Run typecheck and lint**

Run: `npm run typecheck && npm run lint`
Expected: both clean. (`SubjectForm.tsx` is not yet fully rewritten — Task 2 does that —
so this step just confirms these two isolated removals don't break anything on their
own before the bigger rewrite.)

- [ ] **Step 5: Commit**

```bash
git add components/CalculatorPage.tsx components/subject-form/SubjectForm.tsx
git commit -m "fix: remove two institution selectors that never filtered anything"
```

---

## Task 2: Compact the subject-entry layout and replace emoji

**Files:**
- Modify: `components/subject-form/SubjectForm.tsx` (full file rewrite below, building on
  Task 1's edits)

**Interfaces:**
- Consumes: `lucide-react` icons `BookOpen`, `Target`, `AlertTriangle` (already an
  installed dependency, Phase 1a).
- Produces: no external interface change — same `{ onMarksChange?, initialState? }` props,
  same `SubjectMarkInput[]` shape emitted via `onMarksChange`.

- [ ] **Step 1: Replace the full contents of `components/subject-form/SubjectForm.tsx`**

Replace the entire file with:

```tsx
// cSpell:words Matric Mpumalanga Tshwane
"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, BookOpen, Target } from "lucide-react";
import { SubjectCombobox } from "./SubjectCombobox";
import { MarkInput } from "./MarkInput";
import {
  ELECTIVE_SUBJECTS,
  FIRST_ADDITIONAL_LANGUAGE_OPTIONS,
  HOME_LANGUAGE_OPTIONS,
  MATHEMATICS_CODES,
  MATHEMATICS_OPTIONS,
  getLanguageSubjectCode,
  type LanguageOption,
  type MathematicsOption,
  type SubjectFormInitialState,
} from "@/config/subjects";
import type { SubjectMarkInput } from "@/lib/aps/types";

const LIFE_ORIENTATION_CODE = "LO";
const MIN_ELECTIVES = 3;
const MAX_ELECTIVES = 4;

interface ElectiveSlot {
  code: string | null;
  percentage: number | null;
}

export function SubjectForm({
  onMarksChange,
  initialState,
}: {
  onMarksChange?: (marks: SubjectMarkInput[]) => void;
  initialState?: SubjectFormInitialState;
}) {
  const [homeLanguage, setHomeLanguage] = useState<LanguageOption | "">(
    initialState?.homeLanguage ?? ""
  );
  const [homeLanguageMark, setHomeLanguageMark] = useState<number | null>(
    initialState?.homeLanguageMark ?? null
  );

  const [firstAdditionalLanguage, setFirstAdditionalLanguage] = useState<LanguageOption | "">(
    initialState?.firstAdditionalLanguage ?? ""
  );
  const [firstAdditionalLanguageMark, setFirstAdditionalLanguageMark] = useState<number | null>(
    initialState?.firstAdditionalLanguageMark ?? null
  );

  const [mathematics, setMathematics] = useState<MathematicsOption | "">(
    initialState?.mathematics ?? ""
  );
  const [mathematicsMark, setMathematicsMark] = useState<number | null>(
    initialState?.mathematicsMark ?? null
  );

  const [lifeOrientationMark, setLifeOrientationMark] = useState<number | null>(
    initialState?.lifeOrientationMark ?? null
  );

  const [electives, setElectives] = useState<ElectiveSlot[]>(() => {
    const seeded: ElectiveSlot[] = initialState?.electives.map((e) => ({ ...e })) ?? [];
    while (seeded.length < MIN_ELECTIVES) {
      seeded.push({ code: null, percentage: null });
    }
    return seeded;
  });
  const [removingIndex, setRemovingIndex] = useState<number | null>(null);

  const [validationError, setValidationError] = useState<string | null>(null);

  const firstAdditionalLanguageOptions = FIRST_ADDITIONAL_LANGUAGE_OPTIONS.filter(
    (lang) => lang !== homeLanguage
  );

  const selectedElectiveCodes = electives.map((e) => e.code).filter(Boolean);

  const marks: SubjectMarkInput[] = useMemo(() => {
    const result: SubjectMarkInput[] = [];
    if (homeLanguage && homeLanguageMark !== null) {
      result.push({
        subjectCode: getLanguageSubjectCode(homeLanguage, "home"),
        percentage: homeLanguageMark,
      });
    }
    if (firstAdditionalLanguage && firstAdditionalLanguageMark !== null) {
      result.push({
        subjectCode: getLanguageSubjectCode(firstAdditionalLanguage, "firstAdditional"),
        percentage: firstAdditionalLanguageMark,
      });
    }
    if (mathematics && mathematicsMark !== null) {
      result.push({
        subjectCode: MATHEMATICS_CODES[mathematics],
        percentage: mathematicsMark,
      });
    }
    if (lifeOrientationMark !== null) {
      result.push({ subjectCode: LIFE_ORIENTATION_CODE, percentage: lifeOrientationMark });
    }
    for (const elective of electives) {
      if (elective.code && elective.percentage !== null) {
        result.push({ subjectCode: elective.code, percentage: elective.percentage });
      }
    }
    return result;
  }, [
    homeLanguage,
    homeLanguageMark,
    firstAdditionalLanguage,
    firstAdditionalLanguageMark,
    mathematics,
    mathematicsMark,
    lifeOrientationMark,
    electives,
  ]);

  function handleCalculate() {
    if (!homeLanguage || homeLanguageMark === null) {
      setValidationError("Please select your Home Language and enter a percentage mark.");
      return;
    }
    if (!firstAdditionalLanguage || firstAdditionalLanguageMark === null) {
      setValidationError("Please select your First Additional Language and enter a percentage mark.");
      return;
    }
    if (!mathematics || mathematicsMark === null) {
      setValidationError("Please select your Mathematics option and enter a percentage mark.");
      return;
    }
    if (lifeOrientationMark === null) {
      setValidationError("Please enter your Life Orientation percentage mark.");
      return;
    }
    const filledElectives = electives.filter((e) => e.code && e.percentage !== null);
    if (filledElectives.length < MIN_ELECTIVES) {
      setValidationError(`Please select and enter marks for at least ${MIN_ELECTIVES} elective subjects.`);
      return;
    }

    setValidationError(null);
    onMarksChange?.(marks);
  }

  function updateElective(index: number, patch: Partial<ElectiveSlot>) {
    setElectives((prev) => prev.map((e, i) => (i === index ? { ...e, ...patch } : e)));
  }

  function addElective() {
    if (electives.length >= MAX_ELECTIVES) return;
    setElectives((prev) => [...prev, { code: null, percentage: null }]);
  }

  function removeElective(index: number) {
    if (electives.length <= MIN_ELECTIVES) return;
    setRemovingIndex(index);
    window.setTimeout(() => {
      setElectives((prev) => prev.filter((_, i) => i !== index));
      setRemovingIndex(null);
    }, 200);
  }

  return (
    <form
      className="animate-rise-in stagger-1 flex w-full max-w-2xl flex-col gap-5"
      onSubmit={(e) => e.preventDefault()}
    >
      {/* Introduction Card */}
      <div className="flex flex-col gap-1 rounded-2xl border border-line bg-paper-raised p-4 shadow-sm">
        <h2 className="font-bold text-lg text-ink flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-brand-teal shrink-0" aria-hidden="true" />
          <span>Enter Your Matric Subjects & Percentages</span>
        </h2>
        <p className="text-xs text-ink-soft leading-relaxed">
          Enter your percentage marks for your 4 compulsory subjects and 3 to 4 electives below. Your APS points will automatically update for every university in South Africa.
        </p>
      </div>

      {/* Compulsory Subjects Fieldset */}
      <fieldset className="flex flex-col gap-3 rounded-2xl border border-line bg-paper-raised p-4 shadow-sm">
        <legend className="mb-1 flex items-center gap-2 rounded-full bg-brand-teal-soft px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-teal border border-brand-teal/20">
          <span aria-hidden className="h-2 w-2 rounded-full bg-brand-teal animate-pulse" />
          Compulsory NSC Subjects (4)
        </legend>

        {/* Home Language */}
        <div className="flex flex-col gap-2 rounded-xl bg-paper p-3 border border-line/60">
          <label className="text-sm font-semibold text-ink" htmlFor="home-language">
            Home Language
          </label>
          <select
            id="home-language"
            className="min-h-11 cursor-pointer rounded-xl border border-line bg-paper-raised px-3.5 py-2 text-sm text-ink font-medium transition-colors focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 focus:outline-none"
            value={homeLanguage}
            onChange={(e) => {
              const next = e.target.value as LanguageOption | "";
              setHomeLanguage(next);
              if (next === firstAdditionalLanguage) setFirstAdditionalLanguage("");
            }}
          >
            <option value="">Select Home Language...</option>
            {HOME_LANGUAGE_OPTIONS.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
          {homeLanguage && (
            <div className="mt-1 border-t border-line/40 pt-2">
              <MarkInput
                label={`${homeLanguage} (HL)`}
                percentage={homeLanguageMark}
                onChange={setHomeLanguageMark}
              />
            </div>
          )}
        </div>

        {/* First Additional Language */}
        <div className="flex flex-col gap-2 rounded-xl bg-paper p-3 border border-line/60">
          <label className="text-sm font-semibold text-ink" htmlFor="fal">
            First Additional Language (FAL)
          </label>
          <select
            id="fal"
            className="min-h-11 cursor-pointer rounded-xl border border-line bg-paper-raised px-3.5 py-2 text-sm text-ink font-medium transition-colors focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 focus:outline-none"
            value={firstAdditionalLanguage}
            onChange={(e) => setFirstAdditionalLanguage(e.target.value as LanguageOption | "")}
          >
            <option value="">Select First Additional Language...</option>
            {firstAdditionalLanguageOptions.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
          {firstAdditionalLanguage && (
            <div className="mt-1 border-t border-line/40 pt-2">
              <MarkInput
                label={`${firstAdditionalLanguage} (FAL)`}
                percentage={firstAdditionalLanguageMark}
                onChange={setFirstAdditionalLanguageMark}
              />
            </div>
          )}
        </div>

        {/* Mathematics */}
        <div className="flex flex-col gap-2 rounded-xl bg-paper p-3 border border-line/60">
          <label className="text-sm font-semibold text-ink" htmlFor="mathematics">
            Mathematics Option
          </label>
          <select
            id="mathematics"
            className="min-h-11 cursor-pointer rounded-xl border border-line bg-paper-raised px-3.5 py-2 text-sm text-ink font-medium transition-colors focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 focus:outline-none"
            value={mathematics}
            onChange={(e) => setMathematics(e.target.value as MathematicsOption | "")}
          >
            <option value="">Select Mathematics Type...</option>
            {MATHEMATICS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          {mathematics && (
            <div className="mt-1 border-t border-line/40 pt-2">
              <MarkInput label={mathematics} percentage={mathematicsMark} onChange={setMathematicsMark} />
            </div>
          )}
        </div>

        {/* Life Orientation */}
        <div className="rounded-xl bg-paper p-3 border border-line/60">
          <MarkInput
            label="Life Orientation"
            percentage={lifeOrientationMark}
            onChange={setLifeOrientationMark}
          />
        </div>
      </fieldset>

      {/* Elective Subjects Fieldset */}
      <fieldset className="flex flex-col gap-3 rounded-2xl border border-line bg-paper-raised p-4 shadow-sm">
        <legend className="mb-1 flex items-center gap-2 rounded-full bg-brand-coral-soft px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-coral border border-brand-coral/20">
          <span aria-hidden className="h-2 w-2 rounded-full bg-brand-coral animate-pulse" />
          Elective Subjects ({electives.length} of {MIN_ELECTIVES}-{MAX_ELECTIVES})
        </legend>

        {electives.map((elective, index) => {
          const availableOptions = ELECTIVE_SUBJECTS.filter(
            (s) => s.code === elective.code || !selectedElectiveCodes.includes(s.code)
          );
          const stagger = Math.min(index + 1, 6);
          return (
            <div
              key={index}
              className={`${removingIndex === index ? "animate-pop-out" : `stagger-${stagger} animate-pop-in`} flex flex-col gap-3 rounded-xl border border-line bg-paper p-3 shadow-2xs`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <SubjectCombobox
                    label={`Elective Subject ${index + 1}`}
                    options={availableOptions}
                    value={elective.code}
                    onChange={(code) => updateElective(index, { code, percentage: null })}
                  />
                </div>
                {electives.length > MIN_ELECTIVES && (
                  <button
                    type="button"
                    className="-m-2 mt-4 cursor-pointer p-2 text-xs font-semibold text-mark-red hover:underline active:scale-95"
                    onClick={() => removeElective(index)}
                    disabled={removingIndex === index}
                  >
                    Remove
                  </button>
                )}
              </div>
              {elective.code && (
                <div className="border-t border-line/40 pt-2">
                  <MarkInput
                    label={ELECTIVE_SUBJECTS.find((s) => s.code === elective.code)?.name ?? ""}
                    percentage={elective.percentage}
                    onChange={(percentage) => updateElective(index, { percentage })}
                  />
                </div>
              )}
            </div>
          );
        })}

        {electives.length < MAX_ELECTIVES && (
          <button
            type="button"
            className="inline-flex min-h-11 cursor-pointer items-center justify-center self-start rounded-xl border-2 border-dashed border-brand-teal/60 bg-brand-teal-soft/40 px-5 text-sm font-semibold text-brand-teal transition-all hover:bg-brand-teal-soft active:scale-95 shadow-2xs"
            onClick={addElective}
          >
            + Add 4th Elective Subject
          </button>
        )}
      </fieldset>

      {/* Calculate APS Action Button */}
      <div className="flex flex-col gap-3 rounded-2xl border border-brand-teal/40 bg-brand-teal/5 p-4 shadow-sm">
        {validationError && (
          <p role="alert" className="flex items-center gap-2 text-xs font-bold text-mark-red bg-mark-red-soft p-2.5 rounded-lg border border-mark-red/30">
            <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
            {validationError}
          </p>
        )}

        <button
          type="button"
          onClick={handleCalculate}
          className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-teal px-6 py-3 text-base font-extrabold text-white shadow-md transition-all hover:bg-teal-700 active:scale-[0.98]"
        >
          <Target className="h-5 w-5" aria-hidden="true" />
          <span>CALCULATE APS & MATCH PROGRAMMES</span>
        </button>
      </div>
    </form>
  );
}
```

What changed from the Task-1-edited version: `targetInstitution` state and its block are
already gone (Task 1). This step additionally: adds the three `lucide-react` imports;
replaces `📚` with `<BookOpen>`, `🎯` with `<Target>`, `⚠️` with `<AlertTriangle>`;
reduces padding across every card/fieldset/subject-block from `p-5`/`p-3.5` to
`p-4`/`p-3`; reduces the form's outer `gap-6` and each fieldset's inner `gap-4` to
`gap-5`/`gap-3` respectively. All state, validation, computation, and elective
add/remove/animation logic is byte-identical to the original — only spacing and icons
changed.

- [ ] **Step 2: Run typecheck and lint**

Run: `npm run typecheck && npm run lint`
Expected: both clean.

- [ ] **Step 3: Grep to confirm no emoji remain**

Run: `grep -P '[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]' components/subject-form/SubjectForm.tsx components/CalculatorPage.tsx`
Expected: no output.

- [ ] **Step 4: Run the existing test suite**

Run: `npm test`
Expected: no new failures. `SubjectForm.tsx` has no direct unit tests (confirmed by its
absence from the `lib/`-rooted `*.test.ts` files this repo uses), so this step is a pure
regression check that the rewrite didn't break anything covered elsewhere (e.g.
`config/subjects.test.ts`, which this file imports from).

- [ ] **Step 5: Commit**

```bash
git add components/CalculatorPage.tsx components/subject-form/SubjectForm.tsx
git commit -m "feat: compact subject-entry layout, replace emoji with lucide-react icons"
```

---

## Task 3: Verify the no-scroll goal with real browser measurement

**Files:** none (verification only)

**Interfaces:** none.

- [ ] **Step 1: Start the dev server and load the calculator page**

Run `npm run dev`, then using the `chrome-devtools` MCP tools (`new_page`/`select_page`,
`resize_page`, `navigate_page` with `type: "reload"`, `wait_for`), load
`http://localhost:3000/` fresh (not a stale cached tab — reload with `ignoreCache: true`
and `wait_for` on visible page text before measuring, matching the pattern already used
successfully in the Phase 1a checkpoint).

- [ ] **Step 2: Measure at the smallest common mobile viewport (375×667, iPhone SE)**

With the page at 375×667, use `evaluate_script` to get the bounding-box `top`/`bottom`
of the Home Language, First Additional Language, and Mathematics `<select>` elements
(query by their `id`s: `home-language`, `fal`, `mathematics`) relative to the viewport,
e.g.:

```js
() => {
  const ids = ["home-language", "fal", "mathematics"];
  return Object.fromEntries(ids.map((id) => {
    const el = document.getElementById(id);
    if (!el) return [id, null];
    const rect = el.getBoundingClientRect();
    return [id, { top: rect.top, bottom: rect.bottom, visibleWithoutScroll: rect.bottom <= window.innerHeight }];
  }));
}
```

- [ ] **Step 3: Measure at a typical modern mobile viewport (390×844, iPhone 12/13/14)**

Repeat Step 2 at 390×844.

- [ ] **Step 4: Report the actual result — do not assume success**

Record, in the task report, the exact `visibleWithoutScroll` boolean for all three
selects at both viewport sizes. There are four honest outcomes, and the report must
state which one actually happened:

1. All three visible without scroll at both sizes → goal met, done.
2. All three visible at 390×844 but not 375×667 → goal met for typical modern phones,
   not for the smallest common device; state this precisely rather than rounding up to
   "done."
3. Visible at neither size → goal not met. Do not silently accept this. First try
   trimming further WITHIN the two files this plan already owns (`CalculatorPage.tsx`,
   `SubjectForm.tsx`) — candidates: shrink the intro card further (drop its descriptive
   paragraph to one line, or remove the card's own border/shadow padding), reduce the
   fieldset legend's vertical margin. Re-measure after each change. If the goal still
   isn't met using only these two files, STOP — do not modify `PageHero.tsx` or
   `ApsFormulaBanner.tsx` to close the gap, since this plan's Global Constraints
   explicitly keep those out of scope (they're shared across other pages). Instead
   report the exact shortfall (which viewport, by how many px) as a checkpoint finding
   for the human to decide: accept the shortfall, or approve expanding this plan's
   scope to touch `PageHero.tsx`.
4. Visible at 375×667 but a layout bug makes it worse at 390×844 (unlikely, but the
   measurement code doesn't assume monotonic behavior — report whatever the numbers
   actually say).

- [ ] **Step 5: Take a screenshot at each measured viewport for the checkpoint record**

Use `take_screenshot` at both 375×667 and 390×844 after the reload, before running the
`evaluate_script` measurement (so the screenshot shows the real initial-load state a
learner would see).

**Result (controller, 2026-08-21, real chrome-devtools measurement):** Outcome 3 — not
met. At the achieved viewport (~502×668 — the resize tool did not land on exactly
375×667, but the shortfall is large enough that the width discrepancy doesn't change the
conclusion: a narrower width only increases text wrapping and thus height, it can't
help): Header nav 163px + `PageHero` 296px + `ApsFormulaBanner` (collapsed) 254px =
713px, already past the 668px viewport, before `SubjectForm`'s own intro card starts.
Home Language (`#home-language`) doesn't appear until 1035px down; Mathematics
(`#mathematics`) needs 1298px. Per this step's own instruction, trimming further inside
`CalculatorPage.tsx`/`SubjectForm.tsx` cannot close a 45px+ gap that exists before those
files' content even begins, so this was escalated to the human rather than attempting a
futile further trim or silently touching the out-of-scope files. Owner approved
expanding scope — see the Global Constraints "Scope expansion" note above and Tasks 4-6
below.

---

## Task 4: Add a `compact` mode to `PageHero`

**Files:**
- Modify: `components/PageHero.tsx` (full file rewrite below)
- Modify: `components/CalculatorPage.tsx` (pass `compact` prop — one-line change)

**Interfaces:**
- Produces: `PageHero`'s prop type gains `compact?: boolean` (default `false`). Existing
  call sites (`app/account/page.tsx`, `app/statistics/page.tsx`, `app/bursaries/page.tsx`)
  don't pass it, so they get `compact={false}` — byte-identical rendering to before.

- [ ] **Step 1: Replace the full contents of `components/PageHero.tsx`**

```tsx
export function PageHero({
  title,
  subtitle,
  compact = false,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      className={`hero-atmosphere w-full border-b border-white/10 shadow-md ${
        compact ? "py-5" : "py-10"
      }`}
    >
      <div
        className={`mx-auto flex w-full max-w-5xl flex-col px-6 sm:px-8 ${
          compact ? "gap-1.5" : "gap-3"
        }`}
      >
        {!compact && (
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/20 px-3.5 py-1 text-xs font-semibold text-teal-200 border border-teal-400/30 w-fit">
            <span>🇿🇦 South Africa Matric & University Admission Guide</span>
          </div>
        )}
        <h1
          className={`animate-rise-in font-extrabold tracking-tight text-white leading-tight ${
            compact ? "text-xl sm:text-2xl" : "text-3xl sm:text-4xl"
          }`}
        >
          {title}
        </h1>
        {subtitle && !compact && (
          <p className="animate-rise-in max-w-2xl text-sm sm:text-base text-teal-100/90 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
```

Rationale for what's dropped in compact mode (not just shrunk): the 🇿🇦 badge and the
subtitle are both re-statements of context the calculator's own intro card immediately
below already provides ("Enter Your Matric Subjects & Percentages" + its description) —
dropping them here isn't a content loss, it's removing duplication. The title alone,
smaller, is enough for a returning or link-arriving visitor to orient.

- [ ] **Step 2: Pass `compact` from `CalculatorPage.tsx`**

In `components/CalculatorPage.tsx`, change:

```tsx
      <PageHero
        title="Find Your University Degree Pathways"
        subtitle="Enter your NSC Matric marks to instantly calculate your official APS score across South African universities, discover degrees you qualify for, and unlock personalized backup plans."
      />
```

to:

```tsx
      <PageHero title="Find Your University Degree Pathways" compact />
```

(The `subtitle` prop is removed from this call site since compact mode never renders it
— passing it would be dead code.)

- [ ] **Step 3: Run typecheck and lint**

Run: `npm run typecheck && npm run lint`
Expected: both clean.

- [ ] **Step 4: Manually confirm the other 3 call sites are visually unaffected**

Using the `chrome-devtools` MCP against the running dev server, load `/account`,
`/statistics`, and `/bursaries` and take a screenshot of each hero section. Compare
against the Task 3 screenshots (or a fresh screenshot taken before this change, if those
weren't captured) — the hero on these three pages must look identical to before (full
badge, full title size, subtitle present), since none of them pass `compact`.

- [ ] **Step 5: Commit**

```bash
git add components/PageHero.tsx components/CalculatorPage.tsx
git commit -m "feat: add compact PageHero variant, use it on the calculator page"
```

---

## Task 5: Tighten `ApsFormulaBanner`'s collapsed layout

**Files:**
- Modify: `components/aps/ApsFormulaBanner.tsx` (full file rewrite below)

**Interfaces:**
- Produces: no prop signature change (`ApsFormulaBanner` still takes no props) — both
  call sites (`CalculatorPage.tsx`, `components/results/ResultsSection.tsx`) need no
  edit.

- [ ] **Step 1: Replace the full contents of `components/aps/ApsFormulaBanner.tsx`**

```tsx
"use client";

import { useState } from "react";
import { Lightbulb, Target } from "lucide-react";

export function ApsFormulaBanner() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="no-print w-full rounded-2xl border border-teal-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950 p-4 text-white shadow-md">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
            <Lightbulb className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-white">
                Important: APS Scores Vary by University!
              </h3>
              <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-2xs font-bold uppercase tracking-wider text-slate-950">
                Formula Rule
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xl line-clamp-2 sm:line-clamp-none">
              There is no single national APS number in South Africa. Each university converts your Matric marks using its own verified formula (e.g. UMP, Wits, UP, UJ, UCT).
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="self-start sm:self-center shrink-0 rounded-xl bg-teal-600 px-4 py-1.5 text-xs font-semibold text-white transition-all hover:bg-teal-500 active:scale-95 shadow-sm"
        >
          {expanded ? "Hide University Rules ▲" : "Compare University Rules ▼"}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 border-t border-white/10 pt-4 text-xs text-slate-200 animate-rise-in">
          <p className="font-semibold text-teal-300 mb-3 text-2xs uppercase tracking-wider">
            Official South African University APS Formula Breakdown:
          </p>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            <div className="rounded-xl bg-white/5 p-3.5 border border-white/10">
              <span className="font-bold text-teal-200 block border-b border-white/10 pb-1 mb-1">University of Mpumalanga (UMP)</span>
              <p className="text-2xs text-slate-300 leading-relaxed">
                Uses 7 subjects total. Life Orientation is counted at <strong>50% weight</strong>.
              </p>
            </div>

            <div className="rounded-xl bg-white/5 p-3.5 border border-white/10">
              <span className="font-bold text-teal-200 block border-b border-white/10 pb-1 mb-1">Wits University</span>
              <p className="text-2xs text-slate-300 leading-relaxed">
                Uses best 7 subjects including LO, plus bonus points for 60%+ in English & Maths.
              </p>
            </div>

            <div className="rounded-xl bg-white/5 p-3.5 border border-white/10">
              <span className="font-bold text-teal-200 block border-b border-white/10 pb-1 mb-1">University of Pretoria (UP)</span>
              <p className="text-2xs text-slate-300 leading-relaxed">
                Uses best 6 subjects. <strong>Life Orientation is completely excluded</strong> from total.
              </p>
            </div>

            <div className="rounded-xl bg-white/5 p-3.5 border border-white/10">
              <span className="font-bold text-teal-200 block border-b border-white/10 pb-1 mb-1">University of Johannesburg (UJ)</span>
              <p className="text-2xs text-slate-300 leading-relaxed">
                Uses 7-point scale. LO is excluded or capped depending on faculty requirements.
              </p>
            </div>

            <div className="rounded-xl bg-white/5 p-3.5 border border-white/10">
              <span className="font-bold text-teal-200 block border-b border-white/10 pb-1 mb-1">North-West University (NWU)</span>
              <p className="text-2xs text-slate-300 leading-relaxed">
                Best 6 subjects, Life Orientation excluded. Math Literacy restricted for STEM.
              </p>
            </div>

            <div className="rounded-xl bg-white/5 p-3.5 border border-white/10">
              <span className="font-bold text-slate-200 block border-b border-white/10 pb-1 mb-1">University of Cape Town (UCT)</span>
              <p className="text-2xs text-slate-300 leading-relaxed">
                Faculty points score (/600 or /800) using raw percentages, not standard point bands.
              </p>
            </div>
          </div>

          <div className="mt-3.5 rounded-xl bg-teal-500/10 p-3 text-2xs text-teal-200 border border-teal-500/20 flex items-center gap-2">
            <Target className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>
              <strong>UCAG Engine Guarantee:</strong> We calculate your exact points per university using their official rules automatically!
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
```

Changes: `p-5`→`p-4` outer, `gap-3.5`→`gap-2.5`, icon box `h-10 w-10`→`h-9 w-9` with the
💡 emoji replaced by a `Lightbulb` icon, heading `text-base`→`text-sm sm:text-base`,
description gets `line-clamp-2 sm:line-clamp-none` (capped at 2 lines on mobile, full
text from `sm:` up), button padding `py-2`→`py-1.5`, and the 🎯 emoji in the expanded
detail section replaced by a `Target` icon. The expanded-detail grid content itself
(6 university cards) is unchanged — it only affects height when the user opts to expand
it, not the collapsed-state measurement this task is trying to fix.

- [ ] **Step 2: Run typecheck and lint**

Run: `npm run typecheck && npm run lint`
Expected: both clean.

- [ ] **Step 3: Grep to confirm no emoji remain**

Run: `grep -P '[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]' components/aps/ApsFormulaBanner.tsx`
Expected: no output.

- [ ] **Step 4: Confirm the `ResultsSection.tsx` usage still renders correctly**

Using the `chrome-devtools` MCP, enter subject marks on the calculator (or use whatever
minimal path reaches a rendered `ResultsSection`) and screenshot the
`ApsFormulaBanner` instance rendered there — confirm the tighter layout doesn't clip or
overlap anything given `ResultsSection`'s surrounding context (this call site wasn't
part of the height problem being solved, so it should just look like a smaller,
tidier version of what was there before).

- [ ] **Step 5: Commit**

```bash
git add components/aps/ApsFormulaBanner.tsx
git commit -m "feat: tighten ApsFormulaBanner collapsed layout, replace emoji with icons"
```

---

## Task 6: Re-verify the no-scroll goal after the scope expansion

**Files:** none (verification only)

**Interfaces:** none.

- [ ] **Step 1: Repeat Task 3's measurement exactly**

Using the `chrome-devtools` MCP against a freshly reloaded (cache-busted) page, resize
to as close to 375×667 as the tool achieves, `wait_for` the page content, then run the
same `evaluate_script` measurement from Task 3 Step 2 against `#home-language`, `#fal`,
`#mathematics`. Repeat at 390×844.

- [ ] **Step 2: Report the real result**

Same four-outcome framework as Task 3 Step 4. If still not met, measure the new
header+hero+banner+intro-card height breakdown (same diagnostic technique as the
Task 3 finding above — walk `document.body`'s children and read `getBoundingClientRect()`
on each) to see exactly how much further trimming is needed and where, and report that
precisely rather than iterating blindly. Do not expand scope to a third file without
going back to the human, per the same rule Task 3 followed.

- [ ] **Step 3: Take fresh screenshots at both viewports**

For the checkpoint record, same as Task 3 Step 5.

- [ ] **Step 4: Full regression pass**

Run: `npm run typecheck && npm run lint && npm test && npm run build`
Expected: all clean — this is the final checkpoint for the whole Phase 1b-1 plan (Tasks
1-6), so it gets the same full verification as the Phase 1a checkpoint did.
