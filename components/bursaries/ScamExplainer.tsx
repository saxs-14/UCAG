import { LABELS } from "@/config/labels";

/** "How to spot a bursary scam" -- explicitly required, not optional
 * (docs/MASTER_PROMPT_v2.md Phase 5). */
export function ScamExplainer() {
  return (
    <section className="flex flex-col gap-2 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-800 dark:bg-amber-950">
      <h2 className="font-semibold">{LABELS.bursaries.scamExplainerTitle}</h2>
      <p>{LABELS.bursaries.scamExplainerIntro}</p>
      <ul className="list-inside list-disc">
        {LABELS.bursaries.scamWarningSigns.map((sign, i) => (
          <li key={i}>{sign}</li>
        ))}
      </ul>
      <p>{LABELS.bursaries.scamExplainerOutro}</p>
    </section>
  );
}
