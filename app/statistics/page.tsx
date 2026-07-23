import { StatisticsPage } from "@/components/statistics/StatisticsPage";
import { LABELS } from "@/config/labels";

export const metadata = {
  title: `${LABELS.statistics.pageTitle} -- ${LABELS.app.name}`,
};

export default function Statistics() {
  return (
    <main className="flex min-h-screen flex-col items-center gap-6 p-8">
      <h1 className="text-3xl font-semibold">{LABELS.statistics.pageTitle}</h1>
      <StatisticsPage />
    </main>
  );
}
