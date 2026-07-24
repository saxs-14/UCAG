import { BursariesPage } from "@/components/bursaries/BursariesPage";
import { LABELS } from "@/config/labels";

export const metadata = {
  title: `${LABELS.bursaries.pageTitle} -- ${LABELS.app.name}`,
};

export default function Bursaries() {
  return (
    <main id="main-content" className="flex min-h-screen flex-col items-center gap-6 p-6 sm:p-8">
      <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">{LABELS.bursaries.pageTitle}</h1>
      <BursariesPage />
    </main>
  );
}
