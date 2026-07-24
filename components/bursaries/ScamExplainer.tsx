import { LABELS } from "@/config/labels";

/** "How to spot a bursary scam" -- explicitly required, not optional
 * (docs/MASTER_PROMPT_v2.md Phase 5). */
export function ScamExplainer() {
  return (
    <section className="flex flex-col gap-2 rounded-lg border border-mark-gold bg-mark-gold-soft p-4 text-sm text-ink">
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
