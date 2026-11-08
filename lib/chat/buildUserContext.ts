import { resolveSubjectLabel } from "@/config/subjects";
import { resolveApsRule } from "@/lib/matching/resolveApsRule";
import { calculateAps } from "@/lib/aps/engine";
import type { RealCatalog } from "@/lib/catalog/getRealCatalog";
import type { SubjectMark, UserProfile } from "@/lib/firestore/types";

/**
 * Builds the compact plain-text summary of a signed-in learner's own
 * saved marks/APS/shortlist that ChatWidget.tsx sends as `userContext`
 * (see lib/chat/validateChatRequest.ts and lib/chat/systemPrompt.ts).
 * Pure and synchronous so it's unit-testable without Firestore -- caller
 * passes the already-fetched profile and catalog.
 *
 * The APS figure is only included when a real institution-wide rule
 * (facultyId: null) resolves for the learner's chosen institution --
 * some institutions only have faculty-specific rules, where "their APS"
 * genuinely isn't one number without picking a programme. Omitting it
 * rather than guessing matches CLAUDE.md's core rule: unverified is
 * never displayed as a fact.
 */
export function buildUserContext(profile: UserProfile | null, catalog: RealCatalog | null): string | null {
  if (!profile) return null;

  const lines: string[] = [];

  if (profile.marks.length > 0) {
    const markLines = profile.marks
      .map((mark: SubjectMark) => `${resolveSubjectLabel(mark.subjectCode)}: ${mark.percentage}%`)
      .join(", ");
    lines.push(`Saved NSC marks: ${markLines}.`);
  }

  const institution = catalog?.institutions.find((i) => i.id === profile.institutionId);
  if (institution) {
    lines.push(`Preferred institution: ${institution.name}.`);

    if (profile.marks.length > 0 && catalog) {
      const rule = resolveApsRule(catalog.apsRules, institution.id, "");
      if (rule) {
        const result = calculateAps(rule, profile.marks);
        lines.push(`APS for ${institution.name} (computed by UCAG's calculator, a real result): ${result.score}.`);
      }
    }
  }

  if (profile.shortlist.length > 0 && catalog) {
    const programmesById = new Map(catalog.programmes.map((p) => [p.id, p]));
    const names = profile.shortlist
      .map((id) => programmesById.get(id)?.name)
      .filter((name): name is string => Boolean(name));
    if (names.length > 0) lines.push(`Shortlisted programmes: ${names.join(", ")}.`);
  }

  return lines.length > 0 ? lines.join(" ") : null;
}
