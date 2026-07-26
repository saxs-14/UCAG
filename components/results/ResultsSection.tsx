"use client";

import { useEffect, useMemo, useState } from "react";
import { matchProgramme } from "@/lib/matching/engine";
import { ResultCard } from "./ResultCard";
import { UnscoredProgrammeCard } from "./UnscoredProgrammeCard";
import { ShareBar } from "./ShareBar";
import { ApplicationChecklist } from "./ApplicationChecklist";
import { ApsImprovementSimulator } from "./ApsImprovementSimulator";
import { CourseComparisonTable } from "./CourseComparisonTable";
import { InterestQuiz } from "@/components/interests/InterestQuiz";
import { LABELS } from "@/config/labels";
import { useAuth } from "@/components/auth/AuthProvider";
import { useApplicationChecklist } from "@/lib/useApplicationChecklist";
import type { RealCatalog } from "@/lib/catalog/getRealCatalog";
import type { SubjectMarkInput } from "@/lib/aps/types";
import type { Faculty, Institution, Programme, School } from "@/lib/firestore/types";
import type { MatchBucket, MatchResult } from "@/lib/matching/types";

const BUCKET_ORDER: MatchBucket[] = ["qualify", "almostQualify", "notYet"];

interface ScoredEntry {
  programme: Programme;
  matchResult: MatchResult;
}

interface UnscoredEntry {
  programme: Programme;
  institution: Institution;
  faculty: Faculty;
  school: School;
}

/**
 * Real, live-Firestore results -- config/sampleData.ts's fictional
 * "[Sample]" catalogue is gone from this component entirely. Every
 * programme rendered here passed isFactVerified() (lib/catalog/
 * getRealCatalog.ts): it has a real sourceUrl, a real verifiedOn date,
 * and was independently confirmed against the institution's own page
 * before an admin approved it through the verification queue.
 *
 * The one thing this deliberately does NOT do: compute a qualify/almost/
 * not-yet verdict for an institution with no verified ApsRule on record.
 * matchProgramme() needs that institution's actual APS formula (how many
 * subjects count, how Life Orientation is weighted, etc.) to convert a
 * learner's raw percentages into a real score -- guessing a plausible-
 * looking formula would produce a number that LOOKS like every other
 * verified fact on this page but isn't one. Programmes at an
 * unverified-formula institution still render (UnscoredProgrammeCard),
 * with everything that IS verified (name, minAps, subject requirements,
 * source) and a plain statement of what isn't yet -- never silently
 * hidden, never faked.
 *
 * Phase 6 addition: signed-in learners can shortlist a programme --
 * persisted to their userProfiles document, per-user-owned per
 * firestore.rules (see tests/firestore-rules.test.ts).
 */
export function ResultsSection({ marks }: { marks: SubjectMarkInput[] }) {
  const { user } = useAuth();
  const [shortlist, setShortlist] = useState<string[]>([]);
  const { checked: checklistChecked, toggle: toggleChecklistItem } = useApplicationChecklist();
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [catalog, setCatalog] = useState<RealCatalog | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const MAX_COMPARE = 3;

  useEffect(() => {
    // Dynamic import, same reasoning and pattern as the shortlist effect
    // below: firebase/firestore is the single heaviest piece of the
    // Firebase SDK, and an anonymous visitor who hasn't entered any
    // marks yet -- the state every "/" visit starts in -- shouldn't pay
    // for it (Phase 8's <200KB calculator-route budget). Gated on
    // `marks.length > 0` rather than firing on mount so the fetch (and
    // the import) only happens once there's actually something to match.
    if (marks.length === 0) return;
    let cancelled = false;
    import("@/lib/catalog/getRealCatalog").then(({ fetchRealCatalog }) =>
      fetchRealCatalog()
        .then((data) => {
          if (!cancelled) setCatalog(data);
        })
        .catch((err) => {
          if (!cancelled) setCatalogError(err instanceof Error ? err.message : String(err));
        })
    );
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally only re-triggers on the 0-to-nonzero transition, not on every mark edit.
  }, [marks.length > 0]);

  function toggleCompare(programmeId: string) {
    setCompareIds((prev) =>
      prev.includes(programmeId)
        ? prev.filter((id) => id !== programmeId)
        : prev.length < MAX_COMPARE
          ? [...prev, programmeId]
          : prev
    );
  }

  useEffect(() => {
    if (!user) {
      setShortlist([]);
      return;
    }
    // Dynamic import: lib/auth/profile.ts pulls in Firestore (and its
    // persistence layer), the single heaviest piece of the Firebase SDK.
    // An anonymous visitor -- the common case on "/" -- never triggers
    // this branch, so it never pays for that bundle weight (Phase 8's
    // <200KB calculator-route budget).
    import("@/lib/auth/profile").then(({ getUserProfile }) =>
      getUserProfile(user.uid).then((profile) => setShortlist(profile?.shortlist ?? []))
    );
  }, [user]);

  const { scored, unscored } = useMemo((): { scored: ScoredEntry[]; unscored: UnscoredEntry[] } => {
    if (!catalog) return { scored: [], unscored: [] };

    const institutionsById = new Map(catalog.institutions.map((i) => [i.id, i]));
    const facultiesById = new Map(catalog.faculties.map((f) => [f.id, f]));
    const schoolsById = new Map(catalog.schools.map((s) => [s.id, s]));
    const apsRuleByInstitution = new Map(catalog.apsRules.map((r) => [r.institutionId, r]));

    const scoredResults: ScoredEntry[] = [];
    const unscoredResults: UnscoredEntry[] = [];

    for (const programme of catalog.programmes) {
      const institution = institutionsById.get(programme.institutionId);
      const faculty = facultiesById.get(programme.facultyId);
      const school = schoolsById.get(programme.schoolId);
      // A programme whose institution/faculty/school links don't resolve
      // to a verified document of their own can't render an honest card
      // (no real institution/faculty/school name to show) -- skip it
      // rather than show a broken or misleading shell.
      if (!institution || !faculty || !school) continue;

      const apsRule = apsRuleByInstitution.get(programme.institutionId);
      if (apsRule) {
        scoredResults.push({
          programme,
          matchResult: matchProgramme(programme, apsRule, marks, { catalog: catalog.programmes }),
        });
      } else {
        unscoredResults.push({ programme, institution, faculty, school });
      }
    }

    return { scored: scoredResults, unscored: unscoredResults };
  }, [catalog, marks]);

  if (marks.length === 0) {
    return (
      <p className="text-sm text-ink-faint">
        Enter at least one subject mark above to see matched programmes.
      </p>
    );
  }

  if (catalogError) {
    return (
      <p role="alert" className="rounded bg-mark-red-soft p-3 text-sm text-mark-red">
        Couldn&apos;t load the programme catalogue right now -- please refresh and try again.
      </p>
    );
  }

  if (!catalog) {
    return <p className="text-sm text-ink-faint">Loading verified programme data...</p>;
  }

  async function toggleShortlist(programmeId: string) {
    if (!user) return;
    const next = shortlist.includes(programmeId)
      ? shortlist.filter((id) => id !== programmeId)
      : [...shortlist, programmeId];
    setShortlist(next);
    try {
      const { updateShortlist } = await import("@/lib/auth/profile");
      await updateShortlist(user.uid, next);
    } catch {
      // Roll back on failure rather than leaving the UI showing a state
      // that never actually saved.
      setShortlist(shortlist);
    }
  }

  const byBucket = new Map<MatchBucket, ScoredEntry[]>();
  for (const bucket of BUCKET_ORDER) byBucket.set(bucket, []);
  for (const entry of scored) byBucket.get(entry.matchResult.bucket)!.push(entry);

  if (scored.length === 0 && unscored.length === 0) {
    return (
      <p className="rounded border border-dashed border-line bg-paper-raised p-3 text-sm text-ink-soft">
        No verified programmes match your subjects yet -- we&apos;re still building out the verified
        catalogue institution by institution. Check back as more institutions are added.
      </p>
    );
  }

  return (
    <section className="flex w-full max-w-xl flex-col gap-6">
      <ShareBar marks={marks} />

      {scored.length > 0 && (
        <ApsImprovementSimulator
          marks={marks}
          scored={scored}
          apsRules={catalog.apsRules}
          programmes={catalog.programmes}
          institutions={catalog.institutions}
        />
      )}

      {scored.length > 0 && <InterestQuiz entries={scored} />}

      <ApplicationChecklist checked={checklistChecked} onToggle={toggleChecklistItem} />

      {compareIds.length >= 2 && (
        <CourseComparisonTable
          programmes={compareIds
            .map((id) => scored.find((r) => r.programme.id === id)?.programme)
            .filter((p): p is Programme => p !== undefined)}
          onRemove={(id) => setCompareIds((prev) => prev.filter((x) => x !== id))}
        />
      )}

      {BUCKET_ORDER.map((bucket) => {
        const entries = byBucket.get(bucket)!;
        if (entries.length === 0) return null;
        return (
          <div key={bucket} className="flex flex-col gap-3">
            <h2 className="animate-rise-in font-display text-xl font-bold tracking-tight text-ink">
              {LABELS.resultBuckets[bucket]}
            </h2>
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
                  applicationWindow={catalog.applicationWindows.find(
                    (w) =>
                      w.institutionId === programme.institutionId &&
                      (w.programmeId === programme.id || w.programmeId === null)
                  )}
                  isShortlisted={user ? shortlist.includes(programme.id) : undefined}
                  onToggleShortlist={user ? () => toggleShortlist(programme.id) : undefined}
                  checkedChecklistIds={checklistChecked}
                  isComparing={compareIds.includes(programme.id)}
                  onToggleCompare={() => toggleCompare(programme.id)}
                  compareDisabled={compareIds.length >= MAX_COMPARE}
                />
              );
            })}
          </div>
        );
      })}

      {unscored.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="animate-rise-in font-display text-xl font-bold tracking-tight text-ink">
            Real programmes, score not yet available
          </h2>
          {unscored.map(({ programme, institution, faculty, school }) => (
            <UnscoredProgrammeCard
              key={programme.id}
              programme={programme}
              institution={institution}
              faculty={faculty}
              school={school}
            />
          ))}
        </div>
      )}
    </section>
  );
}
