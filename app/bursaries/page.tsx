import { BursariesPage } from "@/components/bursaries/BursariesPage";
import { LABELS } from "@/config/labels";

export const metadata = {
  title: `${LABELS.bursaries.pageTitle} -- ${LABELS.app.name}`,
};

export default function Bursaries() {
  return (
    <main className="flex min-h-screen flex-col items-center gap-6 p-8">
      <h1 className="text-3xl font-semibold">{LABELS.bursaries.pageTitle}</h1>
      <BursariesPage />
    </main>
  );
}
