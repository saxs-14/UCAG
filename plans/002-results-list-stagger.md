# 002 — Add the missing stagger to the results list

- **Status**: TODO
- **Commit**: 1522b53
- **Severity**: MEDIUM-HIGH
- **Category**: Cohesion & tokens
- **Estimated scope**: 3 files (`components/results/ResultCard.tsx`, `components/results/UnscoredProgrammeCard.tsx`, `components/results/ResultsSection.tsx`)

## Problem

The results page — the actual payoff moment of using the calculator — is the one list in the app with no entrance stagger. Every sibling list component already threads a `staggerIndex` prop through to the shared `.stagger-1`..`.stagger-6` classes (40ms per item), but `ResultCard` and `UnscoredProgrammeCard` don't accept one at all, so every card in every bucket animates in simultaneously.

Confirmed exemplars that already do this correctly, `components/bursaries/BursaryCard.tsx:14-22`:

```tsx
export function BursaryCard({ bursary, staggerIndex = 0 }: { bursary: Bursary; staggerIndex?: number }) {
  const stagger = Math.min(staggerIndex + 1, 6);
  return (
    <div className={`stagger-${stagger} animate-rise-in`}>
```

Current code with the gap, `components/results/ResultCard.tsx:69-82` (props) and `:118` (render):

```tsx
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
}: ResultCardProps) {
  ...
  return (
    <div className="animate-rise-in">
```

Same gap, `components/results/UnscoredProgrammeCard.tsx` — full current props (`:5-10`) and render (`:25-27`), no `staggerIndex` exists anywhere in this file:

```tsx
interface UnscoredProgrammeCardProps {
  programme: Programme;
  institution: Institution;
  faculty: Faculty;
  school: School;
}

export function UnscoredProgrammeCard({ programme, institution, faculty, school }: UnscoredProgrammeCardProps) {
  return (
    <article className="animate-rise-in flex flex-col gap-3 rounded-xl border-l-4 border-slate bg-paper-raised p-4">
```

Where these are rendered without ever passing an index, `components/results/ResultsSection.tsx:263-288` (inside the `BUCKET_ORDER.map` loop) and `:298-306` (the unscored list):

```tsx
{entries.map(({ programme, matchResult }) => {
  const institution = catalog.institutions.find((i) => i.id === programme.institutionId)!;
  const faculty = catalog.faculties.find((f) => f.id === programme.facultyId)!;
  const school = catalog.schools.find((s) => s.id === programme.schoolId)!;
  return (
    <ResultCard
      key={programme.id}
      programme={programme}
      institution={institution}
      faculty={faculty}
      school={school}
      matchResult={matchResult}
      ...
```

```tsx
{unscored.map(({ programme, institution, faculty, school }) => (
  <UnscoredProgrammeCard
    key={programme.id}
    programme={programme}
    institution={institution}
    faculty={faculty}
    school={school}
  />
))}
```

## Target

`ResultCard` and `UnscoredProgrammeCard` both accept an optional `staggerIndex` prop, apply the same `Math.min(staggerIndex + 1, 6)` capping rule already used everywhere else, and `ResultsSection` passes the entry's position within its own map.

```tsx
/* target — ResultCard.tsx prop shape */
interface ResultCardProps {
  // ...all existing props unchanged...
  staggerIndex?: number;
}
```

```tsx
/* target — ResultCard.tsx render */
export function ResultCard({ /* ...existing props..., */ staggerIndex = 0 }: ResultCardProps) {
  const stagger = Math.min(staggerIndex + 1, 6);
  // ...existing body...
  return (
    <div className={`stagger-${stagger} animate-rise-in`}>
```

```tsx
/* target — UnscoredProgrammeCard.tsx, same pattern */
interface UnscoredProgrammeCardProps {
  programme: Programme;
  institution: Institution;
  faculty: Faculty;
  school: School;
  staggerIndex?: number;
}

export function UnscoredProgrammeCard({
  programme,
  institution,
  faculty,
  school,
  staggerIndex = 0,
}: UnscoredProgrammeCardProps) {
  const stagger = Math.min(staggerIndex + 1, 6);
  return (
    <article className={`stagger-${stagger} animate-rise-in flex flex-col gap-3 rounded-xl border-l-4 border-slate bg-paper-raised p-4`}>
```

```tsx
/* target — ResultsSection.tsx, both .map() calls gain an index */
{entries.map(({ programme, matchResult }, i) => (
  <ResultCard key={programme.id} staggerIndex={i} /* ...all other existing props unchanged... */ />
))}
```
```tsx
{unscored.map(({ programme, institution, faculty, school }, i) => (
  <UnscoredProgrammeCard key={programme.id} staggerIndex={i} programme={programme} institution={institution} faculty={faculty} school={school} />
))}
```

## Repo conventions to follow

- The `Math.min(staggerIndex + 1, 6)` capping rule (never exceed `.stagger-6`, i.e. 240ms max delay) is already established in three places — copy it exactly: `components/bursaries/BursaryCard.tsx:15`, `components/bursaries/InternshipCard.tsx:15`, `components/statistics/StatChart.tsx:53`.
- `.stagger-1` through `.stagger-6` already exist in `app/globals.css:309-314` — do not add new stagger classes, reuse these.
- Default the prop to `0` (`staggerIndex = 0`) so any other caller of `ResultCard`/`UnscoredProgrammeCard` that doesn't pass it keeps working unchanged.

## Steps

1. In `components/results/ResultCard.tsx`, add `staggerIndex?: number;` to the `ResultCardProps` interface (currently ends at line 38, right before `const BUCKET_SPINE`).
2. In the same file, add `staggerIndex = 0` to the destructured props in the function signature (currently lines 69-82), and add `const stagger = Math.min(staggerIndex + 1, 6);` right after the existing `const apsGap = ...` line (currently line 110).
3. Change the outer `<div className="animate-rise-in">` (currently line 118) to `` <div className={`stagger-${stagger} animate-rise-in`}> ``.
4. In `components/results/UnscoredProgrammeCard.tsx`, add `staggerIndex?: number;` to the `UnscoredProgrammeCardProps` interface (currently lines 5-10), add `staggerIndex = 0` to the destructured function props (currently line 25), add `const stagger = Math.min(staggerIndex + 1, 6);` as the first line of the function body, and change the outer `<article className="animate-rise-in flex flex-col gap-3 rounded-xl border-l-4 border-slate bg-paper-raised p-4">` (currently line 27) to `` <article className={`stagger-${stagger} animate-rise-in flex flex-col gap-3 rounded-xl border-l-4 border-slate bg-paper-raised p-4`}> ``.
5. In `components/results/ResultsSection.tsx`, change the `entries.map(({ programme, matchResult }) => {` callback (currently starting at line 263, inside the `BUCKET_ORDER.map` loop) to include an index parameter, and pass `staggerIndex={i}` to the rendered `<ResultCard>` (currently lines 268-288) alongside its existing props.
6. In the same file, change the `unscored.map(({ programme, institution, faculty, school }) => (` callback (currently around line 298) to include an index parameter, and pass `staggerIndex={i}` to `<UnscoredProgrammeCard>` (currently lines 299-306).

## Boundaries

- Do NOT add stagger to the bucket headings (`h2` elements at `ResultsSection.tsx:260-262`) — only the cards themselves.
- Do NOT change `BUCKET_ORDER`, the bucket grouping logic, or anything about how `scored`/`unscored` are computed — this is a rendering-only change.
- Do NOT introduce a new stagger scale — reuse `.stagger-1`..`.stagger-6` exactly as every other list in the app does.
- If `ResultCard.tsx`'s props interface, `UnscoredProgrammeCard.tsx`'s structure, or `ResultsSection.tsx`'s two `.map()` call sites don't match what's described above (drift since commit `1522b53`), STOP and report instead of improvising.

## Verification

- **Mechanical**: `npm run typecheck` (clean — confirms the new optional prop doesn't break any existing caller), `npm run lint` (clean), `npx vitest run` (full suite green).
- **Feel check**: enter enough subject marks to get at least 4-5 matching programmes across different buckets (or add a temporary console log of `scored.length` to confirm you have enough), then:
  - Cards within the same bucket should visibly cascade in one after another (~40ms apart), not all pop in at the exact same frame.
  - A bucket with more than 6 cards should have its 7th+ card use the same delay as the 6th (capped), not keep growing indefinitely.
  - In Chrome DevTools' Animations panel, set playback to 10% and confirm the stagger is visible frame-by-frame.
  - Toggle `prefers-reduced-motion` and confirm the cards still all end up visible (the global override collapses the delay/duration, so this should look like a normal — if instant — reveal, not broken layout).
- **Done when**: the qualify/almost/not-yet result cards and the unscored-programme cards all visibly cascade in with the same 40ms-per-item rhythm every other list in the app already uses.
