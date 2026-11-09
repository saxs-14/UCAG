import { resolveSubjectLabel } from "@/config/subjects";
import type { RealCatalog } from "@/lib/catalog/getRealCatalog";
import type { SubjectMark, UserProfile } from "@/lib/firestore/types";

/**
 * Builds the compact plain-text summary of a signed-in learner's own
 * saved marks/APS/shortlist that ChatWidget.tsx sends as `userContext`
 * (see lib/chat/validateChatRequest.ts and lib/chat/systemPrompt.ts).
 * Pure and synchronous so it's unit-testable without Firestore -- caller
 * passes the already-fetched profile and catalog.
 *
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

  if (profile.shortlist.length > 0 && catalog) {
    const programmesById = new Map(catalog.programmes.map((p) => [p.id, p]));
    const names = profile.shortlist
      .map((id) => programmesById.get(id)?.name)
      .filter((name): name is string => Boolean(name));
    if (names.length > 0) lines.push(`Shortlisted programmes: ${names.join(", ")}.`);
  }

  return lines.length > 0 ? lines.join(" ") : null;
}
