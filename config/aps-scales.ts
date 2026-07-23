/**
 * Default point-band definitions and NSC pass types. Per
 * docs/MASTER_PROMPT_v2.md sect. 2.2, these are seeded flagged VERIFY --
 * confirm against current DBE/Umalusi definitions before Tier 1 launch.
 * See NEEDS_VERIFICATION below for the exact verification status per item.
 */

import type { PointBand } from "@/lib/firestore/types";

export const NEEDS_VERIFICATION = true;

/** Standard 7-point NSC achievement-level scale. This is the default/
 * fallback scale -- most Tier 1 institutions use their own variant (see
 * config/institutions.seed.ts and lib/aps/), several don't use point bands
 * at all (Stellenbosch, UCT: raw percentage). Never apply this scale to an
 * institution whose apsRules document specifies a different one. */
export const STANDARD_NSC_SCALE: PointBand[] = [
  { minPercent: 80, maxPercent: 100, points: 7 },
  { minPercent: 70, maxPercent: 79, points: 6 },
  { minPercent: 60, maxPercent: 69, points: 5 },
  { minPercent: 50, maxPercent: 59, points: 4 },
  { minPercent: 40, maxPercent: 49, points: 3 },
  { minPercent: 30, maxPercent: 39, points: 2 },
  { minPercent: 0, maxPercent: 29, points: 1 },
];

/** Wits' 8-point scale splits the top band. Confirmed live on wits.ac.za
 * (see Phase 0 source research) but flagged for re-verification each cycle. */
export const WITS_8_POINT_SCALE: PointBand[] = [
  { minPercent: 90, maxPercent: 100, points: 8 },
  { minPercent: 80, maxPercent: 89, points: 7 },
  { minPercent: 70, maxPercent: 79, points: 6 },
  { minPercent: 60, maxPercent: 69, points: 5 },
  { minPercent: 50, maxPercent: 59, points: 4 },
  { minPercent: 40, maxPercent: 49, points: 3 },
  { minPercent: 30, maxPercent: 39, points: 2 },
  { minPercent: 0, maxPercent: 29, points: 1 },
];

export type NscPassType = "bachelors" | "diploma" | "higherCertificate";

export interface NscPassTypeDefinition {
  type: NscPassType;
  label: string;
  description: string;
  verificationStatus: "needsVerification";
}

/** Gates eligibility before APS even matters -- flagged VERIFY against
 * current Umalusi pass requirements before Tier 1 launch. */
export const NSC_PASS_TYPES: NscPassTypeDefinition[] = [
  {
    type: "bachelors",
    label: "Bachelor's Pass",
    description:
      "Qualifies for degree study. Requires an NSC with specific subject-level minimums including at least one South African official language at Home Language level -- exact current thresholds pending verification against Umalusi.",
    verificationStatus: "needsVerification",
  },
  {
    type: "diploma",
    label: "Diploma Pass",
    description:
      "Qualifies for diploma study. Lower subject-level thresholds than a Bachelor's pass -- exact current thresholds pending verification against Umalusi.",
    verificationStatus: "needsVerification",
  },
  {
    type: "higherCertificate",
    label: "Higher Certificate Pass",
    description:
      "Qualifies for higher-certificate study. The lowest of the three NSC pass types -- exact current thresholds pending verification against Umalusi.",
    verificationStatus: "needsVerification",
  },
];
