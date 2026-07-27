/**
 * Deterministic color assignment for field-of-study tags
 * (components/FieldTag.tsx) -- spreads the 11 real fields that exist
 * in the seeded catalog (scripts/seed-real-bursaries-and-statistics.mts)
 * across the app's full decorative accent palette instead of every
 * card repeating the same one or two brand colors, which was a real
 * part of why the bursaries/internships pages read as monotone. Pure
 * decoration, not meaning -- unlike lib/matching's qualify/almost/not-
 * yet colors, there's no semantic significance to which field gets
 * which color here.
 */

export type FieldColor = "teal" | "coral" | "violet" | "amber" | "green" | "gold";

const FIELD_COLORS: Record<string, FieldColor> = {
  Agriculture: "green",
  Aviation: "teal",
  "Built Environment": "amber",
  Commerce: "violet",
  Education: "coral",
  Engineering: "amber",
  "Health Sciences": "green",
  Humanities: "violet",
  ICT: "teal",
  Law: "gold",
  Science: "coral",
};

/** A stable fallback for any field not in the table above (e.g. a
 * future dataset addition) -- hashes the string so the SAME unlisted
 * field always gets the SAME color rather than a random one on every
 * render, without needing this file edited first. */
export function fieldColor(field: string): FieldColor {
  const known = FIELD_COLORS[field];
  if (known) return known;
  const palette: FieldColor[] = ["teal", "coral", "violet", "amber", "green", "gold"];
  let hash = 0;
  for (let i = 0; i < field.length; i++) hash = (hash * 31 + field.charCodeAt(i)) >>> 0;
  return palette[hash % palette.length]!;
}
