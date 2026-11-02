import { LABELS } from "@/config/labels";
import { ICON_SIZE, ShieldIcon } from "@/components/icons/Icon";

export function ScamExplainer() {
  return (
    <section className="animate-rise-in mt-4 flex flex-col gap-5 sm:flex-row">
      <div className="flex flex-1 flex-col gap-3 rounded-3xl border-2 border-mark-gold/20 bg-mark-gold/5 p-6 text-sm text-ink sm:p-8">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-mark-gold/20 text-xl">⚠️</span>
          <h2 className="font-display text-lg font-black">{LABELS.bursaries.scamExplainerTitle}</h2>
        </div>
        <p className="font-medium text-ink-soft">{LABELS.bursaries.scamExplainerIntro}</p>
        <ul className="mt-1 flex flex-col gap-2 font-medium">
          {LABELS.bursaries.scamWarningSigns.map((sign, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-mark-gold mt-0.5">•</span>
              <span className="text-ink-soft">{sign}</span>
            </li>
          ))}
        </ul>
        <p className="mt-1 font-bold text-mark-gold">{LABELS.bursaries.scamExplainerOutro}</p>
      </div>

      <div className="flex flex-1 flex-col gap-3 rounded-3xl border-2 border-brand-teal/20 bg-brand-teal/5 p-6 text-sm text-ink sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-teal/20 text-brand-teal">
            <ShieldIcon size={ICON_SIZE.md} />
          </div>
          <h2 className="font-display text-lg font-black text-brand-teal">
            {LABELS.bursaries.scamShieldTitle}
          </h2>
        </div>
        <p className="font-medium leading-relaxed text-ink-soft">
          {LABELS.bursaries.scamShieldBody}
        </p>
      </div>
    </section>
  );
}