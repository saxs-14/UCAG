"use client";

import { useEffect, useMemo, useState } from "react";
import { matchProgramme } from "@/lib/matching/engine";
import { ResultCard } from "./ResultCard";
import { ShareBar } from "./ShareBar";
import { ApplicationChecklist } from "./ApplicationChecklist";
import { ApsImprovementSimulator } from "./ApsImprovementSimulator";
import { CourseComparisonTable } from "./CourseComparisonTable";
import { InterestQuiz } from "@/components/interests/InterestQuiz";
import { LABELS } from "@/config/labels";
import { useAuth } from "@/components/auth/AuthProvider";
import { useApplicationChecklist } from "@/lib/useApplicationChecklist";
import {
  SAMPLE_APPLICATION_WINDOWS,
  SAMPLE_APS_RULE,
  SAMPLE_FACULTY,
  SAMPLE_INSTITUTION,
  SAMPLE_PROGRAMMES,
  SAMPLE_SCHOOL,
} from "@/config/sampleData";
import type { SubjectMarkInput } from "@/lib/aps/types";
import type { MatchBucket, MatchResult } from "@/lib/matching/types";

const BUCKET_ORDER: MatchBucket[] = ["qualify", "almostQualify", "notYet"];

/**
 * Phase 3 checkpoint demo: matches the learner's entered marks against
 * the sample catalogue (config/sampleData.ts -- explicitly fictional, see
 * that file's header) and renders the three result buckets. This proves
 * the matching engine + result cards + apply-path logic end to end
 * without asserting any real institution's real programme requirements,
 * since none are verified yet (that's Phase 4).
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
  const MAX_COMPARE = 3;

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

  const results = useMemo(() => {
    return SAMPLE_PROGRAMMES.map((programme) => ({
      programme,
      matchResult: matchProgramme(programme, SAMPLE_APS_RULE, marks, {
        catalog: SAMPLE_PROGRAMMES,
      }),
    }));
  }, [marks]);

  if (marks.length === 0) {
    return (
      <p className="text-sm text-ink-faint">
        Enter at least one subject mark above to see matched programmes.
      </p>
    );
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

  const byBucket = new Map<MatchBucket, { programme: (typeof results)[number]["programme"]; matchResult: MatchResult }[]>();
  for (const bucket of BUCKET_ORDER) byBucket.set(bucket, []);
  for (const entry of results) byBucket.get(entry.matchResult.bucket)!.push(entry);

  return (
    <section className="flex w-full max-w-xl flex-col gap-6">
      <div className="rounded border border-dashed border-mark-gold bg-mark-gold-soft p-3 text-sm text-ink">
        These results are matched against <strong>sample/fictional programme data</strong>, not
        a real institution -- see config/sampleData.ts. Real, verified programme catalogues land
        in Phase 4.
      </div>

      <ShareBar marks={marks} />

      <ApsImprovementSimulator marks={marks} />

      <InterestQuiz entries={results} />

      <ApplicationChecklist checked={checklistChecked} onToggle={toggleChecklistItem} />

      {compareIds.length >= 2 && (
        <CourseComparisonTable
          programmes={compareIds
            .map((id) => results.find((r) => r.programme.id === id)?.programme)
            .filter((p): p is (typeof results)[number]["programme"] => p !== undefined)}
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
            {entries.map(({ programme, matchResult }) => (
              <ResultCard
                key={programme.id}
                programme={programme}
                institution={SAMPLE_INSTITUTION}
                faculty={SAMPLE_FACULTY}
                school={SAMPLE_SCHOOL}
                matchResult={matchResult}
                applicationWindow={SAMPLE_APPLICATION_WINDOWS.find(
                  (w) => w.programmeId === programme.id
                )}
                isShortlisted={user ? shortlist.includes(programme.id) : undefined}
                onToggleShortlist={user ? () => toggleShortlist(programme.id) : undefined}
                checkedChecklistIds={checklistChecked}
                isComparing={compareIds.includes(programme.id)}
                onToggleCompare={() => toggleCompare(programme.id)}
                compareDisabled={compareIds.length >= MAX_COMPARE}
              />
            ))}
          </div>
        );
      })}
    </section>
  );
}
