/**
 * Firestore data model for UCAG v2.
 *
 * Governing rule (see CLAUDE.md): unverified is displayed as unverified,
 * never as a fact. Every fact-bearing document carries `sourceUrl`,
 * `verifiedOn`, and `academicYear` (or `year` for historical statistics,
 * where "academic year" isn't the right concept). `isFactVerified()` below
 * is the single type guard every render path must pass through -- it is
 * the enforcement mechanism, not a comment reminding someone to check.
 *
 * Deviations from the brief's literal collection sketch, each justified:
 * - `institutions`, `faculties`, `schools` gained the provenance triple.
 *   The brief's field list omitted it for these three, but application
 *   portal URLs and faculty/school structure are exactly the kind of
 *   thing a learner acts on -- the brief's own cadence table (Phase 4)
 *   requires human verification for faculty/school structure changes,
 *   which only makes sense if these documents carry verifiedOn/sourceUrl.
 * - `institutions` gained `tier` (1 | 2 | 3). The brief's Phase 0 scope
 *   decision requires tiered rollout; there was nowhere in the original
 *   schema to record which tier an institution is in.
 * - `apsRules` gained `formulaType` and `bonusRules`. Phase 4 research
 *   (see docs/MASTER_PROMPT_v2.md discussion) confirmed at least four
 *   distinct real formulas (point-band sum, point-band-with-flat-bonus,
 *   raw-percentage sum, applicant-score-out-of-600-with-equity-bonus)
 *   across just six universities -- a boolean `usesRawPercentage` alone
 *   can't discriminate between all of them, and `compute()` can't live
 *   in Firestore since Firestore stores data, not functions. The actual
 *   formula implementations live in lib/aps/ (Phase 2), keyed by
 *   `formulaType`; this collection holds only the configuration.
 * - `statistics` keeps the brief's `year` (not `academicYear`) since a
 *   historical dataset year and a forward-looking application cycle are
 *   different concepts; `isStatVerified()` is the equivalent guard for it.
 */

// ---------------------------------------------------------------------------
// Provenance -- the core trust primitive
// ---------------------------------------------------------------------------

export interface FactProvenance {
  sourceUrl: string;
  /** ISO date string, e.g. "2026-07-23" -- when this fact was last confirmed against sourceUrl. */
  verifiedOn: string;
  /** The application/intake year this fact applies to, e.g. 2027. */
  academicYear: number;
}

/** The single gate every public render path for a fact-bearing document must pass. */
export function isFactVerified<T extends Partial<FactProvenance>>(
  doc: T
): doc is T & FactProvenance {
  return (
    typeof doc.sourceUrl === "string" &&
    doc.sourceUrl.length > 0 &&
    typeof doc.verifiedOn === "string" &&
    doc.verifiedOn.length > 0 &&
    typeof doc.academicYear === "number" &&
    Number.isFinite(doc.academicYear)
  );
}

export interface StatProvenance {
  sourceUrl: string;
  verifiedOn: string;
  publisher: string;
  year: number;
}

export function isStatVerified<T extends Partial<StatProvenance>>(
  doc: T
): doc is T & StatProvenance {
  return (
    typeof doc.sourceUrl === "string" &&
    doc.sourceUrl.length > 0 &&
    typeof doc.verifiedOn === "string" &&
    doc.verifiedOn.length > 0 &&
    typeof doc.publisher === "string" &&
    doc.publisher.length > 0 &&
    typeof doc.year === "number"
  );
}

// ---------------------------------------------------------------------------
// institutions / faculties / schools
// ---------------------------------------------------------------------------

export type InstitutionType =
  | "traditionalUniversity"
  | "universityOfTechnology"
  | "comprehensiveUniversity"
  | "distanceUniversity"
  | "tvetCollege"
  | "privateProvider";

/** Tier 1 = launch-ready, full catalogue + verified APS rules. Tier 2 =
 * schema present, partially populated, labelled "coming soon" in the UI.
 * Tier 3 = schema only, no data. See docs/MASTER_PROMPT_v2.md sect. 2. */
export type InstitutionTier = 1 | 2 | 3;

export interface Institution extends FactProvenance {
  id: string;
  name: string;
  shortName: string;
  type: InstitutionType;
  province: string;
  tier: InstitutionTier;
  campuses: string[];
  websiteUrl: string;
  applicationPortalUrl: string | null;
  /** Some institutions (e.g. UKZN for first-time undergrads) don't run
   * their own portal -- applications route through a shared third party
   * like the Central Applications Office. When set, applicationPortalUrl
   * may point at that shared portal instead of an institution subdomain. */
  appliesThroughThirdParty: string | null;
  statusCheckUrl: string | null;
  nbtRequired: boolean;
  logoUrl: string | null;
}

export interface Faculty extends FactProvenance {
  id: string;
  institutionId: string;
  name: string;
  code: string;
}

export interface School extends FactProvenance {
  id: string;
  facultyId: string;
  name: string;
  code: string;
}

// ---------------------------------------------------------------------------
// programmes
// ---------------------------------------------------------------------------

export type QualificationType =
  | "higherCertificate"
  | "diploma"
  | "advancedDiploma"
  | "bachelorsDegree"
  | "bachelorsDegreeExtended"
  | "postgraduateDiploma"
  | "honoursDegree";

export type ModeOfDelivery = "contact" | "online" | "blended";

export interface SubjectRequirement {
  subjectCode: string;
  /** Minimum NSC achievement level (1-7), when the institution uses bands. */
  minLevel?: number;
  /** Minimum raw percentage, when the institution uses raw percentages. */
  minPercent?: number;
}

export interface Programme extends FactProvenance {
  id: string;
  institutionId: string;
  facultyId: string;
  schoolId: string;
  name: string;
  qualificationType: QualificationType;
  nqfLevel: number;
  saqaId: string | null;
  duration: string;
  campuses: string[];
  modeOfDelivery: ModeOfDelivery;
  minAps: number | null;
  subjectRequirements: SubjectRequirement[];
  additionalRequirements: string[];
  careerOutcomes: string[];
  applyUrl: string | null;
}

// ---------------------------------------------------------------------------
// apsRules -- see file header for why this differs from the brief's sketch
// ---------------------------------------------------------------------------

export type ApsFormulaType =
  | "pointBandSum"
  | "pointBandWithBonus"
  | "percentageSum"
  | "facultyPointScore"
  | "applicantScoreWeighted";

export interface PointBand {
  minPercent: number;
  maxPercent: number;
  points: number;
}

export type LoPolicy = "exclude" | "include" | "halfWeight" | "capAt";
export type MathLitPolicy = "equal" | "penalised" | "excludedForSomeProgrammes";
export type NbtPolicy = "none" | "required" | "requiredForSomeFaculties";

export interface ApsBonusRule {
  /** Subject code this bonus applies to, or "*" for any/equity-based rules. */
  subjectCode: string;
  /** Optional eligibility condition beyond the subject/mark, e.g. school quintile. */
  condition?: "quintile1to3" | "none";
  minMarkPercent?: number;
  bonusPoints: number;
  description: string;
}

export interface ApsRule extends FactProvenance {
  id: string;
  institutionId: string;
  scaleName: string;
  formulaType: ApsFormulaType;
  /** Point bands, if formulaType uses bands. Empty for percentage-based formulas. */
  bands: PointBand[];
  usesRawPercentage: boolean;
  loPolicy: LoPolicy;
  loCap?: number;
  bestNSubjects: number;
  excludedSubjects: string[];
  mathLitPolicy: MathLitPolicy;
  /** Multiplier applied to a Mathematical Literacy subject's counted value
   * when mathLitPolicy is "penalised", e.g. 0.5. Defaults to 1 (no-op) when
   * unset -- unset until a real institution's verified penalty factor is on
   * record; do not fabricate a number here without a sourceUrl backing it. */
  mathLitPenaltyFactor?: number;
  nbtPolicy: NbtPolicy;
  bonusRules: ApsBonusRule[];
  /** Maximum attainable score under this formula, e.g. 42 or 600. Undefined if uncapped. */
  maxScore?: number;
  notes: string;
}

// ---------------------------------------------------------------------------
// applicationWindows
// ---------------------------------------------------------------------------

export type ApplicationWindowStatus =
  | "open"
  | "openingSoon"
  | "closed"
  | "unknown";

export interface ApplicationWindow extends FactProvenance {
  id: string;
  institutionId: string;
  /** Null when the window applies institution-wide rather than to one programme. */
  programmeId: string | null;
  opensOn: string | null;
  closesOn: string | null;
  lateClosesOn: string | null;
  status: ApplicationWindowStatus;
}

// ---------------------------------------------------------------------------
// subjects -- the NSC taxonomy. See config/subjects.ts for the seed data.
// ---------------------------------------------------------------------------

export type SubjectCategory =
  | "homeLanguage"
  | "firstAdditionalLanguage"
  | "mathematics"
  | "lifeOrientation"
  | "elective";

export type LanguageType = "home" | "firstAdditional" | "secondAdditional" | null;

export type VerificationStatus = "verified" | "needsVerification";

export interface Subject {
  code: string;
  name: string;
  category: SubjectCategory;
  /** DBE "designated list" subjects -- referenced by some institutions' faculty requirements. */
  isDesignated: boolean;
  isCompulsory: boolean;
  languageType: LanguageType;
  verificationStatus: VerificationStatus;
  sourceUrl?: string;
  /** UI grouping only (e.g. "Commerce", "Sciences") -- not a DBE-official
   * taxonomy, just an organisational aid for the elective picker. Not
   * subject to the same verification requirement as the subject's
   * existence/name/designated-list status. */
  groupLabel?: string;
}

// ---------------------------------------------------------------------------
// bursaries / internships
// ---------------------------------------------------------------------------

export type BursaryLevelRequired =
  | "matricOnly"
  | "currentlyEnrolled"
  | "completedQualification";

/** Auto-reject triggers -- see CLAUDE.md non-negotiables. A listing with any
 * risk flag must never be published, but the flag is kept on the record so
 * the admin console can show why something was rejected. */
export type BursaryRiskFlag =
  | "requiresUpfrontPayment"
  | "noVerifiableProviderWebsite"
  | "sourcedFromSocialMediaOnly";

export interface Bursary extends FactProvenance {
  id: string;
  name: string;
  provider: string;
  fieldsOfStudy: string[];
  levelRequired: BursaryLevelRequired;
  closesOn: string | null;
  value: string;
  criteria: string[];
  applyUrl: string;
  riskFlags: BursaryRiskFlag[];
}

export interface Internship extends FactProvenance {
  id: string;
  title: string;
  provider: string;
  fieldsOfStudy: string[];
  minQualification: string;
  matricOnly: boolean;
  province: string | null;
  closesOn: string | null;
  applyUrl: string;
}

// ---------------------------------------------------------------------------
// statistics
// ---------------------------------------------------------------------------

export interface Statistic extends StatProvenance {
  id: string;
  dataset: string;
  dimension: string;
  metric: string;
  value: number;
  unit: string;
}

// ---------------------------------------------------------------------------
// sources / ingestionRuns / verificationQueue -- the ingestion pipeline (Phase 4)
// ---------------------------------------------------------------------------

export type SourceType = "governmentStatistics" | "governmentRegister" | "institutionAdmissions" | "institutionPortal" | "bursaryProvider";

export interface Source {
  id: string;
  url: string;
  publisher: string;
  type: SourceType;
  robotsAllowed: boolean;
  lastFetchedAt: string | null;
  etag: string | null;
  fetchIntervalHours: number;
  /** 0-1, adjusted over time based on corroboration history. */
  reliabilityScore: number;
}

export interface IngestionRun {
  id: string;
  startedAt: string;
  finishedAt: string | null;
  sourceIds: string[];
  tokensUsed: number;
  costEstimate: number;
  itemsProposed: number;
  itemsAutoPublished: number;
  itemsQueued: number;
  errors: string[];
}

export type VerificationQueueStatus = "pending" | "approved" | "rejected" | "edited";

export interface VerificationQueueItem {
  id: string;
  collection: string;
  docId: string;
  field: string;
  currentValue: unknown;
  proposedValue: unknown;
  /** 0-1 */
  confidence: number;
  sourceUrl: string;
  extractedAt: string;
  corroboratingSources: string[];
  status: VerificationQueueStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
}

// ---------------------------------------------------------------------------
// userProfiles -- see Phase 6 (POPIA) for consent flow detail
// ---------------------------------------------------------------------------

export interface SubjectMark {
  subjectCode: string;
  percentage: number;
}

export interface ConsentRecord {
  consentedAt: string;
  consentedBy: "self" | "guardian";
  guardianName?: string;
  guardianEmail?: string;
}

export interface UserProfile {
  uid: string;
  marks: SubjectMark[];
  shortlist: string[];
  consentRecord: ConsentRecord | null;
  isMinor: boolean;
  guardianConsentAt: string | null;
  createdAt: string;
}
