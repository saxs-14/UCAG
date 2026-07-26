/**
 * The single admission/intake cycle this whole app is currently
 * populated for. Reconfirm and bump this at the start of each new
 * application cycle -- everything that stamps a FactProvenance.academicYear
 * (lib/firestore/types.ts) without a more specific year of its own
 * (config/institutions.seed.ts's own institutions, and
 * app/api/admin/queue/[id]/route.ts's approve action, which has no
 * per-fact academicYear of its own to draw on) should import this rather
 * than hardcode a second copy that can drift out of sync.
 */
export const CURRENT_ACADEMIC_YEAR = 2027;
