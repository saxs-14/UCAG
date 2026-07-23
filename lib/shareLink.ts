import type { SubjectMarkInput } from "@/lib/aps/types";

const PAIR_SEPARATOR = ",";
const KV_SEPARATOR = ":";

/** Encodes marks into a compact query-string value so a results page is
 * shareable as a plain URL -- no account or saved-results ID required
 * (docs/MASTER_PROMPT_v2.md sect. 3: "Results shareable as a link"). */
export function encodeMarksToQuery(marks: SubjectMarkInput[]): string {
  return marks
    .filter((m) => m.subjectCode && Number.isFinite(m.percentage))
    .map((m) => `${encodeURIComponent(m.subjectCode)}${KV_SEPARATOR}${m.percentage}`)
    .join(PAIR_SEPARATOR);
}

export function decodeMarksFromQuery(query: string | null | undefined): SubjectMarkInput[] {
  if (!query) return [];
  return query
    .split(PAIR_SEPARATOR)
    .map((pair) => {
      const [rawCode, rawPercentage] = pair.split(KV_SEPARATOR);
      const subjectCode = rawCode ? decodeURIComponent(rawCode) : "";
      // Number("") is 0, not NaN -- an empty percentage must not silently
      // become a valid 0% mark.
      const percentage = rawPercentage ? Number(rawPercentage) : NaN;
      return { subjectCode, percentage };
    })
    .filter((m) => m.subjectCode.length > 0 && Number.isFinite(m.percentage));
}

export function buildShareUrl(baseUrl: string, marks: SubjectMarkInput[]): string {
  const url = new URL(baseUrl);
  url.searchParams.set("marks", encodeMarksToQuery(marks));
  return url.toString();
}
