/**
 * POPIA-compliant Document Completeness & Classification Assistant.
 * Validates file metadata (type, size, categories) without uploading or storing PII.
 */

export interface DocumentFileMeta {
  id: string;
  name: string;
  category: "id" | "results" | "proofOfAddress" | "other";
  sizeBytes: number;
  mimeType: string;
  isValidType: boolean;
  isValidSize: boolean;
}

export interface DocumentChecklistResult {
  totalRequired: number;
  totalUploaded: number;
  hasId: boolean;
  hasResults: boolean;
  hasProofOfAddress: boolean;
  isComplete: boolean;
  missingCategories: string[];
}

const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export function validateDocumentFile(file: { name: string; size: number; type: string }): {
  isValidType: boolean;
  isValidSize: boolean;
  category: DocumentFileMeta["category"];
} {
  const isValidType = ALLOWED_MIME_TYPES.includes(file.type);
  const isValidSize = file.size <= MAX_FILE_SIZE_BYTES;

  const lowerName = file.name.toLowerCase();
  let category: DocumentFileMeta["category"] = "other";

  if (lowerName.includes("id") || lowerName.includes("identity") || lowerName.includes("passport")) {
    category = "id";
  } else if (lowerName.includes("result") || lowerName.includes("matric") || lowerName.includes("transcript") || lowerName.includes("report")) {
    category = "results";
  } else if (lowerName.includes("address") || lowerName.includes("proof") || lowerName.includes("utility")) {
    category = "proofOfAddress";
  }

  return { isValidType, isValidSize, category };
}

export function evaluateDocumentCompleteness(files: DocumentFileMeta[]): DocumentChecklistResult {
  const validFiles = files.filter((f) => f.isValidType && f.isValidSize);
  const hasId = validFiles.some((f) => f.category === "id");
  const hasResults = validFiles.some((f) => f.category === "results");
  const hasProofOfAddress = validFiles.some((f) => f.category === "proofOfAddress");

  const missingCategories: string[] = [];
  if (!hasId) missingCategories.push("Certified ID Copy or Passport");
  if (!hasResults) missingCategories.push("Matric / Grade 11 Results Statement");
  if (!hasProofOfAddress) missingCategories.push("Proof of Residential Address");

  const uploadedCount = [hasId, hasResults, hasProofOfAddress].filter(Boolean).length;

  return {
    totalRequired: 3,
    totalUploaded: uploadedCount,
    hasId,
    hasResults,
    hasProofOfAddress,
    isComplete: uploadedCount === 3,
    missingCategories,
  };
}
