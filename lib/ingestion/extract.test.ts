import { describe, expect, it } from "vitest";
import { extractStructuredData } from "./extract";
import {
  applicationWindowExtractionSchema,
  type ApplicationWindowExtraction,
} from "./schemas/applicationWindow";
import type { LlmClient, LlmExtractionRequest, LlmExtractionResponse } from "./llm/client";

/** A fake LlmClient -- no real provider is called anywhere in this test
 * file. Proves the pipeline's abstraction (lib/ingestion/llm/client.ts)
 * is provider-agnostic and that validation/error-handling work correctly
 * without needing a configured LLM_API_KEY. */
class FakeLlmClient implements LlmClient {
  constructor(private readonly behavior: "returnValid" | "returnInvalidShape" | "throwNetworkError") {}

  async extract<T>(request: LlmExtractionRequest<T>): Promise<LlmExtractionResponse<T>> {
    if (this.behavior === "throwNetworkError") {
      throw new Error("simulated network failure");
    }

    const raw =
      this.behavior === "returnValid"
        ? {
            opensOn: "2027-04-01",
            closesOn: "2027-11-30",
            lateClosesOn: null,
            confidence: 0.95,
            extractionNotes: "Found on the admissions page's key dates table.",
          }
        : { opensOn: "2027-04-01" }; // missing required fields -- must fail validation, not be coerced

    // Mirrors what a real client implementation does: parse (throws on
    // mismatch), never silently patch missing fields with defaults.
    const validated = request.schema.parse(raw);
    return { data: validated, tokensUsed: 150 };
  }
}

const baseRequest: LlmExtractionRequest<ApplicationWindowExtraction> = {
  sourceText: "Applications open 1 April 2027 and close 30 November 2027.",
  instructions: "Extract the application opening and closing dates as JSON.",
  schema: applicationWindowExtractionSchema,
};

describe("extractStructuredData", () => {
  it("returns validated typed data on success", async () => {
    const outcome = await extractStructuredData(new FakeLlmClient("returnValid"), baseRequest);
    expect(outcome.success).toBe(true);
    if (outcome.success) {
      expect(outcome.data.opensOn).toBe("2027-04-01");
      expect(outcome.tokensUsed).toBe(150);
    }
  });

  it("rejects (does not coerce) output that fails schema validation", async () => {
    const outcome = await extractStructuredData(
      new FakeLlmClient("returnInvalidShape"),
      baseRequest
    );
    expect(outcome.success).toBe(false);
    if (!outcome.success) {
      expect(outcome.error).toBeTruthy();
    }
  });

  it("turns a client-level failure (e.g. network error) into a loggable outcome instead of throwing", async () => {
    const outcome = await extractStructuredData(
      new FakeLlmClient("throwNetworkError"),
      baseRequest
    );
    expect(outcome.success).toBe(false);
    if (!outcome.success) {
      expect(outcome.error).toMatch(/network failure/);
    }
  });
});
