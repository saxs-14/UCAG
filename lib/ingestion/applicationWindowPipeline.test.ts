import { describe, expect, it, vi } from "vitest";
import { runApplicationWindowIngestion } from "./applicationWindowPipeline";
import type { LlmClient, LlmExtractionRequest, LlmExtractionResponse } from "./llm/client";
import type { ApplicationWindow, Source, VerificationQueueItem } from "@/lib/firestore/types";
import type { BudgetCheckResult } from "./types";

function makeSource(overrides: Partial<Source>): Source {
  return {
    id: "test-source",
    url: "https://example.test/admissions",
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

/** Mirrors FakeLlmClient in extract.test.ts. */
class FakeLlmClient implements LlmClient {
  constructor(
    private readonly behavior:
      | { kind: "returnValid"; opensOn: string | null; closesOn: string | null; confidence?: number }
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
            opensOn: this.behavior.opensOn,
            closesOn: this.behavior.closesOn,
            lateClosesOn: null,
            confidence: this.behavior.confidence ?? 0.9,
            extractionNotes: "found in key dates table",
          }
        : { opensOn: "2027-04-01" }; // missing required fields

    const validated = request.schema.parse(raw);
    return { data: validated, tokensUsed: 200 };
  }
}

function fakeFetchOk(html: string): typeof fetch {
  return vi.fn(async () => ({ ok: true, text: async () => html })) as unknown as typeof fetch;
}

const ALWAYS_ALLOW: (estimated: number, used: number) => Promise<BudgetCheckResult> = async () => ({
  allowed: true,
  reason: null,
});

describe("runApplicationWindowIngestion", () => {
  it("skips a disabled source without fetching or calling the LLM", async () => {
    const llm = new FakeLlmClient({ kind: "returnValid", opensOn: "2027-04-01", closesOn: "2027-11-30" });
    const fetchImpl = fakeFetchOk("<html></html>");
    const summary = await runApplicationWindowIngestion([makeSource({ enabled: false })], {
      llmClient: llm,
      fetchImpl,
      getCurrentWindow: async () => null,
      persistProposal: async () => "id",
      checkBudgetLive: ALWAYS_ALLOW,
    });
    expect(summary.results[0]!.outcome).toBe("skippedDisabled");
    expect(llm.calls).toBe(0);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("skips a source robots.txt disallows", async () => {
    const llm = new FakeLlmClient({ kind: "returnValid", opensOn: null, closesOn: null });
    const summary = await runApplicationWindowIngestion([makeSource({ robotsAllowed: false })], {
      llmClient: llm,
      getCurrentWindow: async () => null,
      persistProposal: async () => "id",
      checkBudgetLive: ALWAYS_ALLOW,
    });
    expect(summary.results[0]!.outcome).toBe("skippedRobots");
    expect(llm.calls).toBe(0);
  });

  it("skips a source with no institutionId (government/institution-agnostic sources)", async () => {
    const llm = new FakeLlmClient({ kind: "returnValid", opensOn: null, closesOn: null });
    const summary = await runApplicationWindowIngestion([makeSource({ institutionId: null })], {
      llmClient: llm,
      getCurrentWindow: async () => null,
      persistProposal: async () => "id",
      checkBudgetLive: ALWAYS_ALLOW,
    });
    expect(summary.results[0]!.outcome).toBe("skippedNoInstitution");
    expect(llm.calls).toBe(0);
  });

  it("records a fetchError and never calls the LLM when the page can't be fetched", async () => {
    const llm = new FakeLlmClient({ kind: "returnValid", opensOn: null, closesOn: null });
    const summary = await runApplicationWindowIngestion([makeSource({})], {
      llmClient: llm,
      fetchImpl: vi.fn(async () => ({ ok: false, text: async () => "" })) as unknown as typeof fetch,
      getCurrentWindow: async () => null,
      persistProposal: async () => "id",
      checkBudgetLive: ALWAYS_ALLOW,
    });
    expect(summary.results[0]!.outcome).toBe("fetchError");
    expect(llm.calls).toBe(0);
  });

  it("stops the entire run (not just the current source) when the budget is exceeded", async () => {
    const llm = new FakeLlmClient({ kind: "returnValid", opensOn: "2027-04-01", closesOn: "2027-11-30" });
    const summary = await runApplicationWindowIngestion(
      [makeSource({ id: "a" }), makeSource({ id: "b" })],
      {
        llmClient: llm,
        fetchImpl: fakeFetchOk("<p>content</p>"),
        getCurrentWindow: async () => null,
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
    const summary = await runApplicationWindowIngestion([makeSource({})], {
      llmClient: llm,
      fetchImpl: fakeFetchOk("<p>content</p>"),
      getCurrentWindow: async () => null,
      persistProposal: async () => "id",
      checkBudgetLive: ALWAYS_ALLOW,
    });
    expect(summary.results[0]!.outcome).toBe("extractionError");
  });

  it("queues a proposal per changed date field, and never auto-publishes", async () => {
    const llm = new FakeLlmClient({ kind: "returnValid", opensOn: "2027-04-01", closesOn: "2027-11-30", confidence: 0.99 });
    const persisted: Omit<VerificationQueueItem, "id">[] = [];
    const summary = await runApplicationWindowIngestion([makeSource({})], {
      llmClient: llm,
      fetchImpl: fakeFetchOk("<p>Applications open 1 April 2027, close 30 November 2027.</p>"),
      getCurrentWindow: async () => null, // nothing on record yet
      persistProposal: async (item) => {
        persisted.push(item);
        return "queue-id";
      },
      checkBudgetLive: ALWAYS_ALLOW,
    });

    expect(summary.results[0]!.outcome).toBe("queued");
    // Nothing is on record yet (getCurrentWindow returns null), so all
    // three date fields go from undefined -> a value/null and register as
    // changed (opensOn, closesOn, lateClosesOn), plus the two first-time
    // structural fields (institutionId, programmeId) = 5.
    expect(summary.itemsQueued).toBe(5);
    expect(persisted.every((p) => p.status === "pending")).toBe(true);
    expect(persisted.every((p) => p.collection === "applicationWindows")).toBe(true);
    const opensOnProposal = persisted.find((p) => p.field === "opensOn");
    expect(opensOnProposal?.proposedValue).toBe("2027-04-01");
    expect(opensOnProposal?.currentValue).toBeNull();
  });

  it("reports noChange and writes nothing when the extracted dates match what's already on record", async () => {
    const existing: ApplicationWindow = {
      id: "test-uni-general",
      institutionId: "test-uni",
      programmeId: null,
      opensOn: "2027-04-01",
      closesOn: "2027-11-30",
      lateClosesOn: null,
      status: "open",
      sourceUrl: "https://example.test/admissions",
      verifiedOn: "2026-07-01",
      academicYear: 2027,
    };
    const llm = new FakeLlmClient({ kind: "returnValid", opensOn: "2027-04-01", closesOn: "2027-11-30" });
    let proposalCount = 0;
    const summary = await runApplicationWindowIngestion([makeSource({})], {
      llmClient: llm,
      fetchImpl: fakeFetchOk("<p>content</p>"),
      getCurrentWindow: async () => existing,
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
    const llm = new FakeLlmClient({ kind: "returnValid", opensOn: "2027-04-01", closesOn: "2027-11-30" });
    const summary = await runApplicationWindowIngestion(
      [makeSource({ id: "a" }), makeSource({ id: "b", institutionId: "other-uni" })],
      {
        llmClient: llm,
        fetchImpl: fakeFetchOk("<p>content</p>"),
        getCurrentWindow: async () => null,
        persistProposal: async () => "id",
        checkBudgetLive: ALWAYS_ALLOW,
      }
    );
    expect(summary.totalTokensUsed).toBe(400); // 200 tokens per FakeLlmClient call x 2 sources
  });
});
