import { describe, expect, it, vi } from "vitest";
import { runProgrammeRequirementsIngestion } from "./programmeRequirementsPipeline";
import type { LlmClient, LlmExtractionRequest, LlmExtractionResponse } from "./llm/client";
import type { Programme, Source, VerificationQueueItem } from "@/lib/firestore/types";
import type { BudgetCheckResult } from "./types";

function makeSource(overrides: Partial<Source>): Source {
  return {
    id: "test-source",
    url: "https://example.test/programmes",
    publisher: "Test University",
    type: "institutionAdmissions",
    institutionId: "test-uni",
    robotsAllowed: true,
    lastFetchedAt: null,
    etag: null,
    fetchIntervalHours: 720,
    reliabilityScore: 0.9,
    enabled: true,
    ...overrides,
  };
}

type ProgrammeFixture = {
  name?: string;
  facultyName?: string | null;
  minAps?: number | null;
  subjectCode?: string;
};

/** Mirrors FakeLlmClient in applicationWindowPipeline.test.ts. */
class FakeLlmClient implements LlmClient {
  constructor(
    private readonly behavior:
      | { kind: "returnValid"; programmes: ProgrammeFixture[] }
      | { kind: "returnInvalidShape" }
      | { kind: "throwNetworkError" }
  ) {}

  calls = 0;

  async extract<T>(request: LlmExtractionRequest<T>): Promise<LlmExtractionResponse<T>> {
    this.calls++;
    if (this.behavior.kind === "throwNetworkError") throw new Error("simulated network failure");

    const raw =
      this.behavior.kind === "returnValid"
        ? {
            programmes: this.behavior.programmes.map((p) => ({
              name: p.name ?? "BSc Computer Science",
              facultyName: p.facultyName ?? "Faculty of Science",
              qualificationType: "bachelorsDegree",
              nqfLevel: 7,
              duration: "3 years",
              minAps: p.minAps ?? 30,
              subjectRequirements: [
                { subjectCode: p.subjectCode ?? "MATH", minLevel: 5, minPercent: null },
              ],
              additionalRequirements: [],
              applyUrl: null,
              confidence: 0.9,
              extractionNotes: "found in qualification list",
            })),
          }
        : { programmes: [{ name: "Missing required fields" }] }; // fails schema validation

    const validated = request.schema.parse(raw);
    return { data: validated, tokensUsed: 500 };
  }
}

function fakeFetchOk(html: string): typeof fetch {
  return vi.fn(async () => ({ ok: true, text: async () => html })) as unknown as typeof fetch;
}

const ALWAYS_ALLOW: (estimated: number, used: number) => Promise<BudgetCheckResult> = async () => ({
  allowed: true,
  reason: null,
});

describe("runProgrammeRequirementsIngestion", () => {
  it("skips a disabled source without fetching or calling the LLM", async () => {
    const llm = new FakeLlmClient({ kind: "returnValid", programmes: [{}] });
    const fetchImpl = fakeFetchOk("<html></html>");
    const summary = await runProgrammeRequirementsIngestion([makeSource({ enabled: false })], {
      llmClient: llm,
      fetchImpl,
      getExistingProgramme: async () => null,
      persistProposal: async () => "id",
      checkBudgetLive: ALWAYS_ALLOW,
    });
    expect(summary.results[0]!.outcome).toBe("skippedDisabled");
    expect(llm.calls).toBe(0);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("skips a source robots.txt disallows", async () => {
    const llm = new FakeLlmClient({ kind: "returnValid", programmes: [] });
    const summary = await runProgrammeRequirementsIngestion([makeSource({ robotsAllowed: false })], {
      llmClient: llm,
      getExistingProgramme: async () => null,
      persistProposal: async () => "id",
      checkBudgetLive: ALWAYS_ALLOW,
    });
    expect(summary.results[0]!.outcome).toBe("skippedRobots");
    expect(llm.calls).toBe(0);
  });

  it("skips a source with no institutionId", async () => {
    const llm = new FakeLlmClient({ kind: "returnValid", programmes: [] });
    const summary = await runProgrammeRequirementsIngestion([makeSource({ institutionId: null })], {
      llmClient: llm,
      getExistingProgramme: async () => null,
      persistProposal: async () => "id",
      checkBudgetLive: ALWAYS_ALLOW,
    });
    expect(summary.results[0]!.outcome).toBe("skippedNoInstitution");
    expect(llm.calls).toBe(0);
  });

  it("records a fetchError and never calls the LLM when the page can't be fetched", async () => {
    const llm = new FakeLlmClient({ kind: "returnValid", programmes: [] });
    const summary = await runProgrammeRequirementsIngestion([makeSource({})], {
      llmClient: llm,
      fetchImpl: vi.fn(async () => ({ ok: false, text: async () => "" })) as unknown as typeof fetch,
      getExistingProgramme: async () => null,
      persistProposal: async () => "id",
      checkBudgetLive: ALWAYS_ALLOW,
    });
    expect(summary.results[0]!.outcome).toBe("fetchError");
    expect(llm.calls).toBe(0);
  });

  it("stops the entire run (not just the current source) when the budget is exceeded", async () => {
    const llm = new FakeLlmClient({ kind: "returnValid", programmes: [{}] });
    const summary = await runProgrammeRequirementsIngestion(
      [makeSource({ id: "a" }), makeSource({ id: "b" })],
      {
        llmClient: llm,
        fetchImpl: fakeFetchOk("<p>content</p>"),
        getExistingProgramme: async () => null,
        persistProposal: async () => "id",
        checkBudgetLive: async () => ({ allowed: false, reason: "Per-month token limit would be exceeded." }),
      }
    );
    expect(summary.results).toHaveLength(1);
    expect(summary.results[0]!.outcome).toBe("budgetExceeded");
    expect(llm.calls).toBe(0);
  });

  it("records an extractionError (does not crash the run) when the model returns invalid shape", async () => {
    const llm = new FakeLlmClient({ kind: "returnInvalidShape" });
    const summary = await runProgrammeRequirementsIngestion([makeSource({})], {
      llmClient: llm,
      fetchImpl: fakeFetchOk("<p>content</p>"),
      getExistingProgramme: async () => null,
      persistProposal: async () => "id",
      checkBudgetLive: ALWAYS_ALLOW,
    });
    expect(summary.results[0]!.outcome).toBe("extractionError");
  });

  it("records an extractionError when the model invents a subject code that isn't a real NSC code", async () => {
    const llm = new FakeLlmClient({ kind: "returnValid", programmes: [{ subjectCode: "NOT-A-REAL-CODE" }] });
    const summary = await runProgrammeRequirementsIngestion([makeSource({})], {
      llmClient: llm,
      fetchImpl: fakeFetchOk("<p>content</p>"),
      getExistingProgramme: async () => null,
      persistProposal: async () => "id",
      checkBudgetLive: ALWAYS_ALLOW,
    });
    expect(summary.results[0]!.outcome).toBe("extractionError");
  });

  it("queues every core field for a newly-found programme, and never auto-publishes", async () => {
    const llm = new FakeLlmClient({
      kind: "returnValid",
      programmes: [{ name: "BSc Computer Science", minAps: 32 }],
    });
    const persisted: Omit<VerificationQueueItem, "id">[] = [];
    const summary = await runProgrammeRequirementsIngestion([makeSource({})], {
      llmClient: llm,
      fetchImpl: fakeFetchOk("<p>Qualifications: BSc Computer Science, min APS 32.</p>"),
      getExistingProgramme: async () => null, // nothing on record yet
      persistProposal: async (item) => {
        persisted.push(item);
        return "queue-id";
      },
      checkBudgetLive: ALWAYS_ALLOW,
    });

    expect(summary.results[0]!.outcome).toBe("queued");
    expect(summary.results[0]!.programmesFound).toBe(1);
    // institutionId (certain, structural-identity field) + name, facultyId,
    // schoolId, qualificationType, nqfLevel, duration, minAps,
    // subjectRequirements, additionalRequirements, applyUrl = 11 fields
    expect(summary.itemsQueued).toBe(11);
    expect(persisted.every((p) => p.status === "pending")).toBe(true);
    expect(persisted.every((p) => p.collection === "programmes")).toBe(true);
    expect(persisted.every((p) => p.docId === "test-uni-bsc-computer-science")).toBe(true);
    const minApsProposal = persisted.find((p) => p.field === "minAps");
    expect(minApsProposal?.proposedValue).toBe(32);
    expect(minApsProposal?.currentValue).toBeNull();
    const institutionIdProposal = persisted.find((p) => p.field === "institutionId");
    expect(institutionIdProposal?.proposedValue).toBe("test-uni");
    expect(institutionIdProposal?.confidence).toBe(1);
  });

  it("reports noChange and writes nothing when the extracted programme matches what's already on record", async () => {
    const existing: Programme = {
      id: "test-uni-bsc-computer-science",
      institutionId: "test-uni",
      facultyId: "test-uni-fac-faculty-of-science",
      schoolId: "test-uni-fac-faculty-of-science",
      name: "BSc Computer Science",
      qualificationType: "bachelorsDegree",
      nqfLevel: 7,
      saqaId: null,
      duration: "3 years",
      campuses: [],
      modeOfDelivery: "contact",
      minAps: 30,
      subjectRequirements: [{ subjectCode: "MATH", minLevel: 5 }],
      additionalRequirements: [],
      careerOutcomes: [],
      applyUrl: null,
      fieldTags: [],
      sourceUrl: "https://example.test/programmes",
      verifiedOn: "2026-07-01",
      academicYear: 2027,
    };
    const llm = new FakeLlmClient({ kind: "returnValid", programmes: [{ name: "BSc Computer Science" }] });
    let proposalCount = 0;
    const summary = await runProgrammeRequirementsIngestion([makeSource({})], {
      llmClient: llm,
      fetchImpl: fakeFetchOk("<p>content</p>"),
      getExistingProgramme: async () => existing,
      persistProposal: async () => {
        proposalCount++;
        return "id";
      },
      checkBudgetLive: ALWAYS_ALLOW,
    });

    expect(summary.results[0]!.outcome).toBe("noChange");
    expect(proposalCount).toBe(0);
    expect(summary.itemsQueued).toBe(0);
  });

  it("sums tokensUsed across sources into totalTokensUsed", async () => {
    const llm = new FakeLlmClient({ kind: "returnValid", programmes: [{}] });
    const summary = await runProgrammeRequirementsIngestion(
      [makeSource({ id: "a" }), makeSource({ id: "b", institutionId: "other-uni" })],
      {
        llmClient: llm,
        fetchImpl: fakeFetchOk("<p>content</p>"),
        getExistingProgramme: async () => null,
        persistProposal: async () => "id",
        checkBudgetLive: ALWAYS_ALLOW,
      }
    );
    expect(summary.totalTokensUsed).toBe(1000); // 500 tokens per FakeLlmClient call x 2 sources
  });

  it("reports noChange (not queued) when a page genuinely has no programmes on it", async () => {
    const llm = new FakeLlmClient({ kind: "returnValid", programmes: [] });
    const summary = await runProgrammeRequirementsIngestion([makeSource({})], {
      llmClient: llm,
      fetchImpl: fakeFetchOk("<p>General homepage, no qualifications listed.</p>"),
      getExistingProgramme: async () => null,
      persistProposal: async () => "id",
      checkBudgetLive: ALWAYS_ALLOW,
    });
    expect(summary.results[0]!.outcome).toBe("noChange");
    expect(summary.results[0]!.programmesFound).toBe(0);
    expect(summary.itemsQueued).toBe(0);
  });
});
