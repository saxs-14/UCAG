"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { matchProgramme } from "@/lib/matching/engine";
import { resolveApsRule } from "@/lib/matching/resolveApsRule";
import { ResultCard } from "./ResultCard";
import { UnscoredProgrammeCard } from "./UnscoredProgrammeCard";
import { ConfettiBurst } from "./ConfettiBurst";
import { ShareBar } from "./ShareBar";
import { ApplicationChecklist } from "./ApplicationChecklist";
import { ApsImprovementSimulator } from "./ApsImprovementSimulator";
import { CourseComparisonTable } from "./CourseComparisonTable";
import { ApplicationMission } from "@/components/mission/ApplicationMission";
import { AdmissionPathwayGraph } from "@/components/pathway/AdmissionPathwayGraph";
import { ApsFormulaBanner } from "@/components/aps/ApsFormulaBanner";
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

export function ResultsSection({ marks }: { marks: SubjectMarkInput[] }) {
  const { user } = useAuth();
  const [shortlist, setShortlist] = useState<string[]>([]);
  const { checked: checklistChecked, toggle: toggleChecklistItem } = useApplicationChecklist(user?.uid);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [catalog, setCatalog] = useState<RealCatalog | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | MatchBucket>("all");
  const MAX_COMPARE = 3;

  useEffect(() => {
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
    return () => { cancelled = true; };
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
    import("@/lib/auth/profile").then(({ getUserProfile }) =>
      getUserProfile(user.uid).then((profile) => setShortlist(profile?.shortlist ?? []))
    );
  }, [user]);

  const { scored, unscored } = useMemo((): { scored: ScoredEntry[]; unscored: UnscoredEntry[] } => {
    if (!catalog) return { scored: [], unscored: [] };

    const institutionsById = new Map(catalog.institutions.map((i) => [i.id, i]));
    const facultiesById = new Map(catalog.faculties.map((f) => [f.id, f]));
    const schoolsById = new Map(catalog.schools.map((s) => [s.id, s]));

    const scoredResults: ScoredEntry[] = [];
    const unscoredResults: UnscoredEntry[] = [];

    for (const programme of catalog.programmes) {
      const institution = institutionsById.get(programme.institutionId);
      const faculty = facultiesById.get(programme.facultyId);
      const school = schoolsById.get(programme.schoolId);
      if (!institution || !faculty || !school) continue;

      const apsRule = resolveApsRule(catalog.apsRules, programme.institutionId, programme.facultyId);
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

  const qualifyCount = useMemo(() => scored.filter((entry) => entry.matchResult.bucket === "qualify").length, [scored]);
  const almostCount = useMemo(() => scored.filter((entry) => entry.matchResult.bucket === "almostQualify").length, [scored]);
  const notYetCount = useMemo(() => scored.filter((entry) => entry.matchResult.bucket === "notYet").length, [scored]);

  const FILTERS = [
    { key: "all" as const, label: "All Matches" },
    { key: "qualify" as const, label: "You Qualify" },
    { key: "almostQualify" as const, label: "Near-Miss" },
    { key: "notYet" as const, label: "Not Yet" },
  ];

  const filterCounts = {
    all: scored.length,
    qualify: qualifyCount,
    almostQualify: almostCount,
    notYet: notYetCount,
  } as const;

  const hadQualifyRef = useRef(false);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    const nowQualifies = qualifyCount > 0;
    if (nowQualifies && !hadQualifyRef.current) {
      setCelebrate(true);
      hadQualifyRef.current = true;
      const timer = setTimeout(() => setCelebrate(false), 3000);
      return () => clearTimeout(timer);
    }
    hadQualifyRef.current = nowQualifies;
  }, [qualifyCount]);

  if (marks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-line/60 bg-paper-raised p-10 text-center">
        <span className="text-4xl mb-4">🎓</span>
        <h3 className="font-display text-xl font-bold text-ink">Enter your marks above</h3>
        <p className="mt-2 text-sm font-medium text-ink-soft">Add your subjects and percentages to unlock your personalized programme matches.</p>
      </div>
    );
  }

  if (catalogError) {
    return (
      <div className="rounded-3xl border border-mark-red/20 bg-mark-red/5 p-6 text-center">
        <p className="font-bold text-mark-red">Couldn&apos;t load the programme catalogue.</p>
        <p className="mt-1 text-sm font-medium text-mark-red/80">Please refresh the page and try again.</p>
      </div>
    );
  }

  if (!catalog) {
    return (
      <div className="flex items-center justify-center gap-3 rounded-3xl border border-line bg-white p-8 shadow-sm">
        <div className="h-6 w-6 animate-spin rounded-full border-4 border-brand-teal border-t-transparent"></div>
        <p className="font-bold text-ink-soft">Loading verified programmes...</p>
      </div>
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
      setShortlist(shortlist);
    }
  }

  const byBucket = new Map<MatchBucket, ScoredEntry[]>();
  for (const bucket of BUCKET_ORDER) byBucket.set(bucket, []);
  for (const entry of scored) byBucket.get(entry.matchResult.bucket)!.push(entry);

  if (scored.length === 0 && unscored.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-line/80 bg-paper-raised p-8 text-center shadow-sm">
        <span className="text-3xl mb-3">🛠️</span>
        <p className="font-display text-lg font-bold text-ink">No verified matches yet</p>
        <p className="mt-2 text-sm font-medium text-ink-soft">
          We&apos;re currently verifying and adding new university catalogues. Check back soon as more programmes are unlocked.
        </p>
      </div>
    );
  }

  return (
    <section className="flex w-full max-w-3xl flex-col gap-8">
      {celebrate && <ConfettiBurst />}
      
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-3xl font-black tracking-tight text-ink">Your Matches</h2>
        <ShareBar marks={marks} />
      </div>

      {scored.length > 0 && (
        <div className="sticky top-[4.5rem] z-20 -mx-2 rounded-2xl border border-line/60 bg-white/90 p-2 shadow-md backdrop-blur-md">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="tablist" aria-label="Filter programme matches">
            {FILTERS.map((filter) => {
              const count = filterCounts[filter.key];
              const selected = activeFilter === filter.key;
              return (
                <button
                  key={filter.key}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveFilter(filter.key)}
                  className={`min-h-12 rounded-xl text-sm font-bold transition-all focus:outline-none focus:ring-4 focus:ring-brand-teal/20 ${
                    selected 
                      ? "bg-ink text-white shadow-md" 
                      : "bg-transparent text-ink-soft hover:bg-slate-100 hover:text-ink"
                  }`}
                >
                  {filter.label} <span className={`ml-1 rounded-md px-1.5 py-0.5 text-[10px] ${selected ? "bg-white/20" : "bg-line"}`}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {compareIds.length >= 2 && (
        <CourseComparisonTable
          programmes={compareIds
            .map((id) => scored.find((r) => r.programme.id === id)?.programme)
            .filter((p): p is Programme => p !== undefined)}
          onRemove={(id) => setCompareIds((prev) => prev.filter((x) => x !== id))}
        />
      )}

      {(activeFilter === "all" ? BUCKET_ORDER : [activeFilter]).map((bucket) => {
        const entries = byBucket.get(bucket)!;
        if (entries.length === 0) return null;
        return (
          <div key={bucket} role="region" aria-label={LABELS.resultBuckets[bucket]} className="flex flex-col gap-5">
            <h2 className="animate-rise-in font-display text-2xl font-black tracking-tight text-ink flex items-center gap-3">
              {LABELS.resultBuckets[bucket]}
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-ink-soft">{entries.length}</span>
            </h2>
            <div className="flex flex-col gap-6">
              {entries.map(({ programme, matchResult }, i) => {
                const institution = catalog.institutions.find((i) => i.id === programme.institutionId)!;
                const faculty = catalog.faculties.find((f) => f.id === programme.facultyId)!;
                const school = catalog.schools.find((s) => s.id === programme.schoolId)!;
                return (
                  <ResultCard
                    key={programme.id}
                    staggerIndex={i}
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
                    allProgrammes={catalog.programmes}
                  />
                );
              })}
            </div>
          </div>
        );
      })}

      {activeFilter === "all" && unscored.length > 0 && (
        <div className="flex flex-col gap-5">
          <h2 className="animate-rise-in font-display text-2xl font-black tracking-tight text-ink flex items-center gap-3">
            Real programmes, score pending
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-ink-soft">{unscored.length}</span>
          </h2>
          <div className="flex flex-col gap-6">
            {unscored.map(({ programme, institution, faculty, school }, i) => (
              <UnscoredProgrammeCard
                key={programme.id}
                staggerIndex={i}
                programme={programme}
                institution={institution}
                faculty={faculty}
                school={school}
              />
            ))}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-line bg-paper-raised shadow-sm transition-all hover:shadow-md">
        <details className="group">
          <summary className="flex min-h-16 cursor-pointer items-center justify-between bg-white p-6 font-display text-xl font-black text-ink focus:outline-none focus:ring-4 focus:ring-brand-teal/20">
            More tools for planning your application
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-ink-soft shadow-sm transition-transform duration-300 group-open:rotate-180 group-open:bg-brand-teal/10 group-open:text-brand-teal">
              ▼
            </span>
          </summary>

          <div className="flex flex-col gap-8 border-t border-line/50 p-6 pt-8">
            <ApplicationMission
              marks={marks}
              shortlistCount={shortlist.length}
              checkedChecklistCount={checklistChecked.size}
              signedIn={!!user}
            />

            {scored.length > 0 && (
              <ApsFormulaBanner institutions={catalog.institutions} apsRules={catalog.apsRules} />
            )}

            {scored.length > 0 && (
              <AdmissionPathwayGraph
                marks={marks}
                scored={scored}
                institutions={catalog.institutions}
              />
            )}

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

            <ApplicationChecklist
              checked={checklistChecked}
              onToggle={toggleChecklistItem}
              signedIn={!!user}
            />
          </div>
        </details>
      </div>
    </section>
  );
}