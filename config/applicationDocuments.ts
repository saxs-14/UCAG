/**
 * Generic "prepare to apply" checklist -- docs/MASTER_PROMPT_v2.md's
 * "unverified is displayed as unverified" rule applies here too: no real
 * institution's actual document requirements are verified yet (that's
 * Phase 4 territory), so these items are deliberately generic, common-
 * sense guidance every SA university application realistically involves
 * -- never presented as a specific institution's official checklist. See
 * components/results/ApplicationChecklist.tsx for the disclaimer copy.
 */

export interface ApplicationChecklistItem {
  id: string;
  label: string;
  category: "documents" | "timeline";
}

export const APPLICATION_CHECKLIST_ITEMS: ApplicationChecklistItem[] = [
  {
    id: "certified-id",
    label: "Certified copy of your ID document (or birth certificate)",
    category: "documents",
  },
  {
    id: "certified-results",
    label: "Certified copy of your latest results / statement of results",
    category: "documents",
  },
  {
    id: "proof-of-residence",
    label: "Proof of residence, if the institution asks for one",
    category: "documents",
  },
  {
    id: "guardian-consent",
    label: "Parent or guardian's consent and involvement, if you're under 18",
    category: "documents",
  },
  {
    id: "application-fee",
    label: "Application fee paid, or a fee waiver requested if you qualify for one",
    category: "documents",
  },
  {
    id: "check-deadlines",
    label: "Checked each programme's exact closing date on the institution's own site",
    category: "timeline",
  },
  {
    id: "submitted-application",
    label: "Submitted your application before the closing date",
    category: "timeline",
  },
  {
    id: "checked-status",
    label: "Checked your application status after applying",
    category: "timeline",
  },
  {
    id: "accepted-offer",
    label: "Accepted your offer, if you received one, before its own deadline",
    category: "timeline",
  },
];
