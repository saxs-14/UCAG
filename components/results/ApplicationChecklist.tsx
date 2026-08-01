"use client";

import { APPLICATION_CHECKLIST_ITEMS } from "@/config/applicationDocuments";

interface ApplicationChecklistProps {
  checked: ReadonlySet<string>;
  onToggle: (id: string) => void;
  signedIn: boolean;
}

/**
 * Generic "prepare to apply" checklist -- feeds every result card's
 * readiness percentage (lib/readiness.ts). Deliberately generic, not
 * institution-specific: no real institution's actual document
 * requirements are verified yet (see config/applicationDocuments.ts),
 * so this is presented as personal guidance a learner can tick off, not
 * as a fact about any particular programme.
 */
export function ApplicationChecklist({ checked, onToggle, signedIn }: ApplicationChecklistProps) {
  const documents = APPLICATION_CHECKLIST_ITEMS.filter((item) => item.category === "documents");
  const timeline = APPLICATION_CHECKLIST_ITEMS.filter((item) => item.category === "timeline");
  const checkedCount = APPLICATION_CHECKLIST_ITEMS.filter((item) => checked.has(item.id)).length;

  return (
    <details className="no-print rounded border border-line bg-paper-raised p-3 text-sm">
      <summary className="cursor-pointer font-semibold text-ink">
        Prepare to apply ({checkedCount} of {APPLICATION_CHECKLIST_ITEMS.length})
      </summary>
      <p className="mt-2 text-xs text-ink-faint">
        General guidance, not a substitute for any institution&apos;s own checklist -- always
        confirm exact requirements on the institution&apos;s website.{" "}
        {signedIn
          ? "Saved to your account, so it follows you across devices."
          : "Saved on this device only, no account needed."}
      </p>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:gap-6">
        <fieldset className="flex flex-1 flex-col gap-1.5">
          <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">
            Documents
          </legend>
          {documents.map((item) => (
            <label key={item.id} className="flex items-start gap-2 text-ink">
              <input
                type="checkbox"
                id={item.id}
                name={item.id}
                checked={checked.has(item.id)}
                onChange={() => onToggle(item.id)}
                className="mt-0.5"
              />
              {item.label}
            </label>
          ))}
        </fieldset>

        <fieldset className="flex flex-1 flex-col gap-1.5">
          <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">
            Timeline
          </legend>
          {timeline.map((item) => (
            <label key={item.id} className="flex items-start gap-2 text-ink">
              <input
                type="checkbox"
                id={item.id}
                name={item.id}
                checked={checked.has(item.id)}
                onChange={() => onToggle(item.id)}
                className="mt-0.5"
              />
              {item.label}
            </label>
          ))}
        </fieldset>
      </div>
    </details>
  );
}
