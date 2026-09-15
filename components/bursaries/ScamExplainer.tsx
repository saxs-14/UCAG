import { LABELS } from "@/config/labels";

/** "How to spot a bursary scam" -- explicitly required, not optional
 * (docs/MASTER_PROMPT_v2.md Phase 5) -- plus a trust callout for UCAG's
 * own automated screening (lib/ingestion/bursaryScamModel/), genuinely
 * true of every listing shown here: isSafeToPublish() (lib/bursaries/
 * filter.ts) re-checks riskFlags at render time regardless of how a
 * listing entered the system, so this holds for hand-seeded real data
 * too, not just anything that went through the AI ingestion pipeline. */
export function ScamExplainer() {
  return (
    <section className="animate-rise-in flex flex-col gap-4">
      <div className="flex flex-col gap-2 rounded-xl border border-mark-gold bg-mark-gold-soft p-4 text-sm text-ink">
        <h2 className="font-semibold">{LABELS.bursaries.scamExplainerTitle}</h2>
        <p>{LABELS.bursaries.scamExplainerIntro}</p>
        <ul className="list-inside list-disc">
          {LABELS.bursaries.scamWarningSigns.map((sign, i) => (
            <li key={i}>{sign}</li>
          ))}
        </ul>
        <p>{LABELS.bursaries.scamExplainerOutro}</p>
      </div>
      <div className="flex flex-col gap-1 rounded-xl border border-brand-teal bg-brand-teal-soft p-4 text-sm text-ink">
        <h2 className="flex items-center gap-2 font-semibold text-brand-teal">
          <span aria-hidden>🛡️</span>
          {LABELS.bursaries.scamShieldTitle}
        </h2>
        <p>{LABELS.bursaries.scamShieldBody}</p>
      </div>
    </section>
  );
}
