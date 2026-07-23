import { StatChart, type ChartSpec } from "./StatChart";
import { LABELS } from "@/config/labels";
import { SAMPLE_STATISTICS } from "@/config/sampleData";

/**
 * Two sections per docs/MASTER_PROMPT_v2.md Phase 5: higher education and
 * schools. Every chart below except sample-higher-ed-enrolments has zero
 * backing data on purpose -- see config/sampleData.ts SAMPLE_STATISTICS
 * header for why -- so most of this page is a live demonstration of the
 * "data pending verification" rule, not a demo dressed up to look
 * complete. Dataset keys here are what Phase 4 ingestion would need to
 * populate for each chart to go live.
 */
const HIGHER_EDUCATION_CHARTS: ChartSpec[] = [
  {
    id: "enrolments",
    title: "First-time undergraduate enrolments (sample data -- see note above)",
    datasetKey: "sample-higher-ed-enrolments",
  },
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
  { id: "nsc-by-province", title: "NSC results by province and district", datasetKey: "nsc-results-by-province" },
  { id: "bachelor-pass", title: "Bachelor's pass rates", datasetKey: "bachelor-pass-rates" },
  {
    id: "subject-performance",
    title: "Subject-level performance",
    datasetKey: "subject-level-performance",
  },
  { id: "school-counts", title: "School counts", datasetKey: "school-counts" },
];

export function StatisticsPage() {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-8">
      <div className="rounded border border-dashed border-amber-400 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
        Every real dataset below correctly shows &quot;data pending verification&quot; --
        extracting real figures from DHET/DBE&apos;s PDF-only publications
        (see config/sources.seed.ts) is Phase 4 ingestion work that isn&apos;t
        connected to a live pipeline yet. The one chart with data is explicitly
        labelled fictional.
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">{LABELS.statistics.higherEducationHeading}</h2>
        {HIGHER_EDUCATION_CHARTS.map((spec) => (
          <StatChart key={spec.id} spec={spec} allStatistics={SAMPLE_STATISTICS} />
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">{LABELS.statistics.schoolsHeading}</h2>
        {SCHOOLS_CHARTS.map((spec) => (
          <StatChart key={spec.id} spec={spec} allStatistics={SAMPLE_STATISTICS} />
        ))}
      </section>
    </div>
  );
}
