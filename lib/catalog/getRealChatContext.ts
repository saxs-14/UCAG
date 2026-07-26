import "server-only";
import { getAdminDb } from "@/lib/firebase/admin";
import { isFactVerified } from "@/lib/firestore/types";
import type {
  ApplicationWindow,
  Bursary,
  Institution,
  Internship,
  Programme,
} from "@/lib/firestore/types";

/**
 * Grounds the chat assistant (lib/chat/systemPrompt.ts) in UCAG's own
 * verified records -- institutions, programmes, bursaries, internships,
 * application windows -- the same real Firestore data every other page
 * reads, filtered through the same isFactVerified() gate. Without this,
 * the assistant had zero awareness that NSFAS, the Sasol Bursary, or the
 * one real UMP programme even exist in our own database, and could only
 * ever refuse or fall back to its own (unverifiable, possibly stale)
 * training data. This is what lets it say "yes, that's in our verified
 * records" instead of "I don't know" for the things we've actually
 * confirmed -- and still say "not verified yet" honestly for everything
 * else.
 *
 * Cached in-memory for a few minutes (module-level, same pattern as
 * lib/chat/rateLimiter.ts) -- the catalog changes on the order of admin
 * approvals, not every chat message, so re-querying Firestore on every
 * single reply would be pure waste.
 */

const CACHE_TTL_MS = 5 * 60 * 1000;
let cached: { text: string; fetchedAt: number } | null = null;

export function __resetChatContextCacheForTests(): void {
  cached = null;
}

interface RawChatContext {
  institutions: Institution[];
  programmes: Programme[];
  bursaries: Bursary[];
  internships: Internship[];
  applicationWindows: ApplicationWindow[];
}

/** Pure formatting, split out from the Firestore fetch so it's testable
 * without an emulator -- turns the raw verified records into a compact,
 * LLM-friendly text block. Terse on purpose: every token here is spent
 * on every single chat reply. */
export function formatChatContext(data: RawChatContext): string {
  const institutionsById = new Map(data.institutions.map((i) => [i.id, i]));
  const windowsByInstitution = new Map(data.applicationWindows.map((w) => [w.institutionId, w]));

  const institutionLines = data.institutions.length
    ? data.institutions
        .map((i) => {
          const window = windowsByInstitution.get(i.id);
          const dates =
            window && (window.opensOn || window.closesOn)
              ? ` -- applications ${window.opensOn ?? "?"} to ${window.closesOn ?? "?"}`
              : "";
          return `- ${i.name} (${i.shortName}) -- ${i.province}, ${i.type} -- ${i.websiteUrl}${dates}`;
        })
        .join("\n")
    : "(none on record yet)";

  const programmeLines = data.programmes.length
    ? data.programmes
        .map((p) => {
          const institution = institutionsById.get(p.institutionId);
          const reqs = p.subjectRequirements
            .map((r) => `${r.subjectCode}${r.minLevel !== undefined ? ` level ${r.minLevel}` : ""}${r.minPercent !== undefined ? ` ${r.minPercent}%` : ""}`)
            .concat(p.additionalRequirements)
            .join("; ");
          return `- ${p.name} -- ${institution?.name ?? p.institutionId}${p.minAps !== null ? ` -- minimum APS ${p.minAps}` : ""}${reqs ? ` -- requires ${reqs}` : ""}`;
        })
        .join("\n")
    : "(none on record yet)";

  const bursaryLines = data.bursaries.length
    ? data.bursaries
        .map(
          (b) =>
            `- ${b.name} (${b.provider}) -- ${b.value} -- ${b.opensOn || b.closesOn ? `applications ${b.opensOn ?? "?"} to ${b.closesOn ?? "?"}` : "application dates not confirmed"} -- ${b.applyUrl}`
        )
        .join("\n")
    : "(none on record yet)";

  const internshipLines = data.internships.length
    ? data.internships
        .map(
          (i) =>
            `- ${i.title} (${i.provider}) -- ${i.opensOn || i.closesOn ? `applications ${i.opensOn ?? "?"} to ${i.closesOn ?? "?"}` : "application dates not confirmed"} -- ${i.applyUrl}`
        )
        .join("\n")
    : "(none on record yet)";

  return `INSTITUTIONS ON RECORD (general info; not all have verified programmes yet):
${institutionLines}

VERIFIED PROGRAMMES (with sourced requirements):
${programmeLines}

VERIFIED BURSARIES:
${bursaryLines}

VERIFIED INTERNSHIPS:
${internshipLines}`;
}

async function fetchRawChatContext(): Promise<RawChatContext> {
  const db = getAdminDb();
  const [institutions, programmes, bursaries, internships, applicationWindows] = await Promise.all([
    db.collection("institutions").get(),
    db.collection("programmes").get(),
    db.collection("bursaries").get(),
    db.collection("internships").get(),
    db.collection("applicationWindows").get(),
  ]);

  const withId = <T>(snap: FirebaseFirestore.QuerySnapshot) =>
    snap.docs.map((doc) => ({ ...(doc.data() as Omit<T, "id">), id: doc.id }) as T);

  return {
    institutions: withId<Institution>(institutions).filter(isFactVerified),
    programmes: withId<Programme>(programmes).filter(isFactVerified),
    bursaries: withId<Bursary>(bursaries).filter(isFactVerified),
    internships: withId<Internship>(internships).filter(isFactVerified),
    applicationWindows: withId<ApplicationWindow>(applicationWindows).filter(isFactVerified),
  };
}

export async function getRealChatContext(): Promise<string> {
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.text;
  }
  const raw = await fetchRawChatContext();
  const text = formatChatContext(raw);
  cached = { text, fetchedAt: Date.now() };
  return text;
}
