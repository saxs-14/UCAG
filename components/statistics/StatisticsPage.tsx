import { StatChart, type ChartSpec } from "./StatChart";
import { LABELS } from "@/config/labels";
import type { Statistic } from "@/lib/firestore/types";

/**
 * Two sections per docs/MASTER_PROMPT_v2.md Phase 5: higher education and
 * schools. `statistics` is real data (lib/catalog/getRealStatistics.ts,
 * fetched server-side in app/statistics/page.tsx) -- config/sampleData.ts's
 * fictional SAMPLE_STATISTICS is gone from this page entirely. As of this
 * writing only "nsc-results-by-province" has a real, independently
 * corroborated dataset on record (see scripts/seed-real-bursaries-and-
 * statistics.mts for sourcing); every other chart below correctly
 * continues to render "data pending verification"
 * (lib/statistics/select.ts's getVerifiedStatisticsForDataset is the
 * enforcement point, not a client-side inference of "should render") --
 * that's the intended behavior for a dataset nobody has verified yet,
 * not a placeholder standing in for a demo.
 */
const HIGHER_EDUCATION_CHARTS: ChartSpec[] = [
  { id: "enrolments", title: "First-time undergraduate enrolments", datasetKey: "higher-ed-enrolments" },
  { id: "graduations", title: "Graduations by field of study", datasetKey: "higher-ed-graduations" },
  {
    id: "throughput",
    title: "Throughput by institution and field of study",
    datasetKey: "higher-ed-throughput",
  },
  {
    id: "funding",
    title: "Student funding coverage",
    datasetKey: "higher-ed-funding-coverage",
  },
];

const SCHOOLS_CHARTS: ChartSpec[] = [
  { id: "nsc-by-province", title: "NSC results by province", datasetKey: "nsc-results-by-province" },
  { id: "bachelor-pass", title: "Bachelor's pass rates", datasetKey: "bachelor-pass-rates" },
  {
    id: "subject-performance",
    title: "Subject-level performance",
    datasetKey: "subject-level-performance",
  },
  { id: "school-counts", title: "School counts", datasetKey: "school-counts" },
];

export function StatisticsPage({ statistics }: { statistics: Statistic[] }) {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-8">
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold tracking-tight text-ink">{LABELS.statistics.higherEducationHeading}</h2>
        {HIGHER_EDUCATION_CHARTS.map((spec, i) => (
          <StatChart key={spec.id} spec={spec} allStatistics={statistics} staggerIndex={i} />
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold tracking-tight text-ink">{LABELS.statistics.schoolsHeading}</h2>
        {SCHOOLS_CHARTS.map((spec, i) => (
          <StatChart key={spec.id} spec={spec} allStatistics={statistics} staggerIndex={i} />
        ))}
      </section>
    </div>
  );
}
