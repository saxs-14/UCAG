import { fieldColor } from "@/lib/fieldColor";

const BG: Record<string, string> = {
  teal: "bg-brand-teal-soft text-brand-teal",
  coral: "bg-brand-coral-soft text-brand-coral",
  violet: "bg-brand-violet-soft text-brand-violet",
  amber: "bg-brand-amber-soft text-brand-amber",
  green: "bg-mark-green-soft text-mark-green",
  gold: "bg-mark-gold-soft text-mark-gold",
};

/** A colored field-of-study pill -- see lib/fieldColor.ts for why each
 * field gets a distinct color instead of every card repeating the
 * same one or two brand colors. */
export function FieldTag({ field }: { field: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${BG[fieldColor(field)]}`}>
      {field}
    </span>
  );
}
