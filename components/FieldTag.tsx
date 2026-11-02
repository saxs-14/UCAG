import { fieldColor } from "@/lib/fieldColor";

const BG: Record<string, string> = {
  teal: "bg-brand-teal/10 text-brand-teal border border-brand-teal/20",
  coral: "bg-orange-500/10 text-orange-600 border border-orange-500/20",
  violet: "bg-indigo-500/10 text-indigo-600 border border-indigo-500/20",
  amber: "bg-amber-500/10 text-amber-700 border border-amber-500/20",
  green: "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20",
  gold: "bg-yellow-500/10 text-yellow-700 border border-yellow-500/20",
};

export function FieldTag({ field }: { field: string }) {
  return (
    <span className={`inline-flex items-center rounded-xl px-3 py-1 text-xs font-bold shadow-sm ${BG[fieldColor(field)]}`}>
      {field}
    </span>
  );
}