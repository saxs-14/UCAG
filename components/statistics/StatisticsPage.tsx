import { StatChart, type ChartSpec } from "./StatChart";
import { LABELS } from "@/config/labels";
import type { Statistic } from "@/lib/firestore/types";

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
      <div className="rounded-2xl border border-teal-500/30 bg-teal-950/40 p-5 text-white shadow-sm">
        <div className="flex items-center gap-2 font-bold text-sm text-teal-300 mb-1">
          <span>📊 Verified National Education Datasets</span>
        </div>
        <p className="text-xs leading-relaxed text-teal-100/90">
          All 8 datasets below display independently verified official figures sourced directly from the Department of Basic Education (DBE), Department of Higher Education and Training (DHET), Council on Higher Education (CHE), and NSFAS.
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="stats-heading text-xl font-bold tracking-tight text-ink">{LABELS.statistics.higherEducationHeading}</h2>
        {HIGHER_EDUCATION_CHARTS.map((spec, i) => (
          <StatChart key={spec.id} spec={spec} allStatistics={statistics} staggerIndex={i} />
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="stats-heading text-xl font-bold tracking-tight text-ink">{LABELS.statistics.schoolsHeading}</h2>
        {SCHOOLS_CHARTS.map((spec, i) => (
          <StatChart key={spec.id} spec={spec} allStatistics={statistics} staggerIndex={i} />
        ))}
      </section>
    </div>
  );
}
