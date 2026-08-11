import { describe, expect, it } from "vitest";
import { validateDocumentFile, evaluateDocumentCompleteness } from "./documentAssistant";

describe("documentAssistant.ts", () => {
  it("classifies certified ID files correctly", () => {
    const file = { name: "my_certified_id_copy.pdf", size: 1024 * 1024, type: "application/pdf" };
    const val = validateDocumentFile(file);
    expect(val.category).toBe("id");
    expect(val.isValidType).toBe(true);
    expect(val.isValidSize).toBe(true);
  });

  it("rejects files exceeding 5MB size limit", () => {
    const file = { name: "matric_results.pdf", size: 6 * 1024 * 1024, type: "application/pdf" };
    const val = validateDocumentFile(file);
    expect(val.isValidSize).toBe(false);
  });

  it("evaluates complete document checklist when all categories present", () => {
    const files = [
      { id: "1", name: "id.pdf", category: "id" as const, sizeBytes: 100, mimeType: "application/pdf", isValidType: true, isValidSize: true },
      { id: "2", name: "results.pdf", category: "results" as const, sizeBytes: 100, mimeType: "application/pdf", isValidType: true, isValidSize: true },
      { id: "3", name: "address.pdf", category: "proofOfAddress" as const, sizeBytes: 100, mimeType: "application/pdf", isValidType: true, isValidSize: true },
    ];
    const res = evaluateDocumentCompleteness(files);
    expect(res.isComplete).toBe(true);
    expect(res.missingCategories).toHaveLength(0);
  });
});
