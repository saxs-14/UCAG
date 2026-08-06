import "server-only";
import { getAdminDb } from "@/lib/firebase/admin";
import { isFactVerified } from "@/lib/firestore/types";
import type { Institution, Programme } from "@/lib/firestore/types";
import type { ChatTool, ToolCall } from "@/lib/chat/geminiChatClient";

/**
 * The one function-calling tool the chat assistant can call
 * (lib/chat/geminiChatClient.ts's ChatTool), for a precise, live answer
 * about a specific institution/programme instead of relying only on the
 * whole-catalog text dump in lib/chat/systemPrompt.ts. Reuses the same
 * isFactVerified()-gated reads every other real-data surface in this
 * app uses -- no new trust logic, just a narrower, on-demand lookup
 * over data that's already trusted.
 */

export interface LookupableCatalog {
  institutions: Institution[];
  programmes: Programme[];
}

export interface LookupVerifiedFactResult {
  found: boolean;
  summary: string;
}

/** Pure matching logic, split out from the Firestore fetch so it's
 * testable without an emulator -- same pattern as
 * lib/catalog/getRealChatContext.ts's formatChatContext(). Substring,
 * case-insensitive match, first hit wins: the catalog is small enough
 * today (8 institutions) that this is unambiguous. */
export function matchVerifiedFact(
  catalog: LookupableCatalog,
  args: { institutionName: string; programmeName: string }
): LookupVerifiedFactResult {
  const institutionNeedle = args.institutionName.trim().toLowerCase();
  const institution = catalog.institutions.find(
    (i) => i.name.toLowerCase().includes(institutionNeedle) || i.shortName.toLowerCase().includes(institutionNeedle)
  );
  if (!institution) {
    return { found: false, summary: `No verified institution on record matching "${args.institutionName}".` };
  }

  const programmeNeedle = args.programmeName.trim().toLowerCase();
  const programme = catalog.programmes.find(
    (p) => p.institutionId === institution.id && p.name.toLowerCase().includes(programmeNeedle)
  );
  if (!programme) {
    return {
      found: false,
      summary: `${institution.name} is on record, but no verified programme matching "${args.programmeName}" was found for it.`,
    };
  }

  const requirements = programme.subjectRequirements
    .map(
      (r) =>
        `${r.subjectCode}${r.minLevel !== undefined ? ` level ${r.minLevel}` : ""}${r.minPercent !== undefined ? ` ${r.minPercent}%` : ""}`
    )
    .concat(programme.additionalRequirements)
    .join("; ");

  return {
    found: true,
    summary: `${programme.name} at ${institution.name}${
      programme.minAps !== null ? ` -- minimum APS ${programme.minAps}` : ""
    }${requirements ? ` -- requires ${requirements}` : ""} (verified ${programme.verifiedOn}, source ${programme.sourceUrl}).`,
  };
}

async function lookupVerifiedFact(args: { institutionName: string; programmeName: string }): Promise<LookupVerifiedFactResult> {
  const db = getAdminDb();
  const [institutionsSnap, programmesSnap] = await Promise.all([
    db.collection("institutions").get(),
    db.collection("programmes").get(),
  ]);
  const institutions = institutionsSnap.docs
    .map((doc) => ({ ...(doc.data() as Omit<Institution, "id">), id: doc.id }))
    .filter(isFactVerified);
  const programmes = programmesSnap.docs
    .map((doc) => ({ ...(doc.data() as Omit<Programme, "id">), id: doc.id }))
    .filter(isFactVerified);
  return matchVerifiedFact({ institutions, programmes }, args);
}

function toLookupArgs(call: ToolCall): { institutionName: string; programmeName: string } {
  return {
    institutionName: typeof call.args.institutionName === "string" ? call.args.institutionName : "",
    programmeName: typeof call.args.programmeName === "string" ? call.args.programmeName : "",
  };
}

export const LOOKUP_VERIFIED_FACT_CHAT_TOOL: ChatTool = {
  declaration: {
    name: "lookupVerifiedFact",
    description:
      "Look up a specific programme's verified admission requirements at a specific South African institution, from UCAG's own verified records. Use this when a learner asks about a specific real programme or institution not already fully covered by the verified records already given to you.",
    parameters: {
      type: "object",
      properties: {
        institutionName: {
          type: "string",
          description: "The institution's name, e.g. 'University of Mpumalanga' or 'UMP'.",
        },
        programmeName: {
          type: "string",
          description: "The programme's name, e.g. 'Bachelor of Arts in Media, Communication and Culture'.",
        },
      },
      required: ["institutionName", "programmeName"],
    },
  },
  execute: async (call) => (await lookupVerifiedFact(toLookupArgs(call))).summary,
};
