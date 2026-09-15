import { describe, expect, it, vi } from "vitest";
import { runBursaryIngestion } from "./bursaryPipeline";
import type { LlmClient, LlmExtractionRequest, LlmExtractionResponse } from "./llm/client";
import type { Bursary, Source, VerificationQueueItem } from "@/lib/firestore/types";
import type { BudgetCheckResult } from "./types";

function makeSource(overrides: Partial<Source>): Source {
  return {
    id: "test-source",
    url: "https://example.test/bursaries",
    publisher: "Test Provider",
    type: "bursaryProvider",
    institutionId: null,
    robotsAllowed: true,
    lastFetchedAt: null,
    etag: null,
    fetchIntervalHours: 168,
    reliabilityScore: 0.9,
    enabled: true,
    ...overrides,
  };
}

type BursaryFixture = {
  name?: string;
  provider?: string;
  value?: string;
  criteria?: string[];
  providerWebsiteUrl?: string | null;
  description?: string;
};

const CLEAN_DESCRIPTION =
  "The Test Bursary covers tuition and accommodation for engineering students who " +
  "achieve at least 70% for Mathematics in matric. Apply through the official " +
  "provider website; there is no cost to apply and selection is based on academic merit.";

const SCAM_DESCRIPTION =
  "Amazing news, you have been chosen for a guaranteed cash bursary! To unlock your " +
  "funds today, just send a quick refundable fee via EFT before midnight or you will " +
  "lose this exclusive opportunity forever.";

/** Mirrors FakeLlmClient in programmeRequirementsPipeline.test.ts. */
class FakeLlmClient implements LlmClient {
  constructor(
    private readonly behavior:
      | { kind: "returnValid"; bursaries: BursaryFixture[] }
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
            bursaries: this.behavior.bursaries.map((b) => ({
              name: b.name ?? "Test Bursary",
              provider: b.provider ?? "Test Provider",
              fieldsOfStudy: ["Engineering"],
              levelRequired: "matricOnly",
              opensOn: null,
              closesOn: "2027-09-30",
              value: b.value ?? "Full tuition and accommodation",
              criteria: b.criteria ?? ["Matric with 70%+ average for Mathematics"],
              applyUrl: "https://example.test/apply",
              // Explicit `!== undefined` check, not `??` -- a fixture
              // overriding this to null (to test the "no verifiable
              // website" flag) must not fall through to the default.
              providerWebsiteUrl:
                b.providerWebsiteUrl !== undefined ? b.providerWebsiteUrl : "https://provider.example.test/",
              description: b.description ?? CLEAN_DESCRIPTION,
              confidence: 0.9,
              extractionNotes: "found in bursary list",
            })),
          }
        : { bursaries: [{ name: "Missing required fields" }] }; // fails schema validation

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

describe("runBursaryIngestion", () => {
  it("skips a disabled source without fetching or calling the LLM", async () => {
    const llm = new FakeLlmClient({ kind: "returnValid", bursaries: [{}] });
    const fetchImpl = fakeFetchOk("<html></html>");
    const summary = await runBursaryIngestion([makeSource({ enabled: false })], {
      llmClient: llm,
      fetchImpl,
      getExistingBursary: async () => null,
      persistProposal: async () => "id",
      checkBudgetLive: ALWAYS_ALLOW,
    });
    expect(summary.results[0]!.outcome).toBe("skippedDisabled");
    expect(llm.calls).toBe(0);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("skips a source robots.txt disallows", async () => {
    const llm = new FakeLlmClient({ kind: "returnValid", bursaries: [] });
    const summary = await runBursaryIngestion([makeSource({ robotsAllowed: false })], {
      llmClient: llm,
      getExistingBursary: async () => null,
      persistProposal: async () => "id",
      checkBudgetLive: ALWAYS_ALLOW,
    });
    expect(summary.results[0]!.outcome).toBe("skippedRobots");
    expect(llm.calls).toBe(0);
  });

  it("records a fetchError and never calls the LLM when the page can't be fetched", async () => {
    const llm = new FakeLlmClient({ kind: "returnValid", bursaries: [] });
    const summary = await runBursaryIngestion([makeSource({})], {
      llmClient: llm,
      fetchImpl: vi.fn(async () => ({ ok: false, text: async () => "" })) as unknown as typeof fetch,
      getExistingBursary: async () => null,
      persistProposal: async () => "id",
      checkBudgetLive: ALWAYS_ALLOW,
    });
    expect(summary.results[0]!.outcome).toBe("fetchError");
    expect(llm.calls).toBe(0);
  });

  it("stops the entire run (not just the current source) when the budget is exceeded", async () => {
    const llm = new FakeLlmClient({ kind: "returnValid", bursaries: [{}] });
    const summary = await runBursaryIngestion([makeSource({ id: "a" }), makeSource({ id: "b" })], {
      llmClient: llm,
      fetchImpl: fakeFetchOk("<p>content</p>"),
      getExistingBursary: async () => null,
      persistProposal: async () => "id",
      checkBudgetLive: async () => ({ allowed: false, reason: "Per-month token limit would be exceeded." }),
    });
    expect(summary.results).toHaveLength(1);
    expect(summary.results[0]!.outcome).toBe("budgetExceeded");
    expect(llm.calls).toBe(0);
  });

  it("records an extractionError (does not crash the run) when the model returns invalid shape", async () => {
    const llm = new FakeLlmClient({ kind: "returnInvalidShape" });
    const summary = await runBursaryIngestion([makeSource({})], {
      llmClient: llm,
      fetchImpl: fakeFetchOk("<p>content</p>"),
      getExistingBursary: async () => null,
      persistProposal: async () => "id",
      checkBudgetLive: ALWAYS_ALLOW,
    });
    expect(summary.results[0]!.outcome).toBe("extractionError");
  });

  it("queues every core field for a newly-found clean bursary, with an empty riskFlags proposal", async () => {
    const llm = new FakeLlmClient({ kind: "returnValid", bursaries: [{}] });
    const persisted: Omit<VerificationQueueItem, "id">[] = [];
    const summary = await runBursaryIngestion([makeSource({})], {
      llmClient: llm,
      fetchImpl: fakeFetchOk("<p>Test Bursary details</p>"),
      getExistingBursary: async () => null,
      persistProposal: async (item) => {
        persisted.push(item);
        return "queue-id";
      },
      checkBudgetLive: ALWAYS_ALLOW,
    });

    expect(summary.results[0]!.outcome).toBe("queued");
    expect(summary.results[0]!.bursariesFound).toBe(1);
    // name, provider, fieldsOfStudy, levelRequired, opensOn, closesOn,
    // value, criteria, applyUrl, riskFlags = 10 fields
    expect(summary.itemsQueued).toBe(10);
    expect(persisted.every((p) => p.status === "pending")).toBe(true);
    expect(persisted.every((p) => p.collection === "bursaries")).toBe(true);
    expect(persisted.every((p) => p.docId === "test-provider-test-bursary")).toBe(true);
    const riskFlagsProposal = persisted.find((p) => p.field === "riskFlags");
    expect(riskFlagsProposal?.proposedValue).toEqual([]);
    expect(summary.results[0]!.flaggedBursaryNames).toEqual([]);
  });

  it("still queues a scam-worded bursary (never silently drops it) and surfaces mlHighScamRisk", async () => {
    const llm = new FakeLlmClient({
      kind: "returnValid",
      bursaries: [{ description: SCAM_DESCRIPTION }],
    });
    const persisted: Omit<VerificationQueueItem, "id">[] = [];
    const summary = await runBursaryIngestion([makeSource({})], {
      llmClient: llm,
      fetchImpl: fakeFetchOk("<p>Guaranteed bursary, pay now</p>"),
      getExistingBursary: async () => null,
      persistProposal: async (item) => {
        persisted.push(item);
        return "queue-id";
      },
      checkBudgetLive: ALWAYS_ALLOW,
    });

    expect(summary.results[0]!.outcome).toBe("queued");
    const riskFlagsProposal = persisted.find((p) => p.field === "riskFlags");
    expect(riskFlagsProposal?.proposedValue).toContain("mlHighScamRisk");
    expect(summary.results[0]!.flaggedBursaryNames).toContain("Test Bursary");
    // Still queued and visible, not dropped -- a human decides.
    expect(persisted.some((p) => p.field === "name" && p.proposedValue === "Test Bursary")).toBe(true);
  });

  it("flags a listing with no verifiable provider website via the deterministic check", async () => {
    const llm = new FakeLlmClient({
      kind: "returnValid",
      bursaries: [{ providerWebsiteUrl: null }],
    });
    const persisted: Omit<VerificationQueueItem, "id">[] = [];
    await runBursaryIngestion([makeSource({})], {
      llmClient: llm,
      fetchImpl: fakeFetchOk("<p>content</p>"),
      getExistingBursary: async () => null,
      persistProposal: async (item) => {
        persisted.push(item);
        return "id";
      },
      checkBudgetLive: ALWAYS_ALLOW,
    });
    const riskFlagsProposal = persisted.find((p) => p.field === "riskFlags");
    expect(riskFlagsProposal?.proposedValue).toContain("noVerifiableProviderWebsite");
  });

  it("reports noChange and writes nothing when the extracted bursary matches what's already on record", async () => {
    const existing: Bursary = {
      id: "test-provider-test-bursary",
      name: "Test Bursary",
      provider: "Test Provider",
      fieldsOfStudy: ["Engineering"],
      levelRequired: "matricOnly",
      opensOn: null,
      closesOn: "2027-09-30",
      value: "Full tuition and accommodation",
      criteria: ["Matric with 70%+ average for Mathematics"],
      applyUrl: "https://example.test/apply",
      riskFlags: [],
      sourceUrl: "https://example.test/bursaries",
      verifiedOn: "2026-07-01",
      academicYear: 2027,
    };
    const llm = new FakeLlmClient({ kind: "returnValid", bursaries: [{}] });
    let proposalCount = 0;
    const summary = await runBursaryIngestion([makeSource({})], {
      llmClient: llm,
      fetchImpl: fakeFetchOk("<p>content</p>"),
      getExistingBursary: async () => existing,
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
    const llm = new FakeLlmClient({ kind: "returnValid", bursaries: [{}] });
    const summary = await runBursaryIngestion([makeSource({ id: "a" }), makeSource({ id: "b" })], {
      llmClient: llm,
      fetchImpl: fakeFetchOk("<p>content</p>"),
      getExistingBursary: async () => null,
      persistProposal: async () => "id",
      checkBudgetLive: ALWAYS_ALLOW,
    });
    expect(summary.totalTokensUsed).toBe(1000); // 500 tokens per FakeLlmClient call x 2 sources
  });

  it("reports noChange (not queued) when a page genuinely has no bursaries on it", async () => {
    const llm = new FakeLlmClient({ kind: "returnValid", bursaries: [] });
    const summary = await runBursaryIngestion([makeSource({})], {
      llmClient: llm,
      fetchImpl: fakeFetchOk("<p>General homepage, no bursaries listed.</p>"),
      getExistingBursary: async () => null,
      persistProposal: async () => "id",
      checkBudgetLive: ALWAYS_ALLOW,
    });
    expect(summary.results[0]!.outcome).toBe("noChange");
    expect(summary.results[0]!.bursariesFound).toBe(0);
    expect(summary.itemsQueued).toBe(0);
  });
});
