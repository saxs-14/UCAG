/**
 * Pieces shared between the training script (scripts/train-bursary-scam-model.mts)
 * and the runtime classifier (classify.ts), so tokenization can never drift
 * between train time and inference time -- a classic, easy-to-miss way a
 * text classifier silently degrades.
 */

const STOPWORDS = new Set([
  "a", "an", "the", "to", "of", "and", "or", "for", "in", "on", "at", "is",
  "are", "be", "will", "this", "that", "with", "your", "you", "we", "our",
  "it", "as", "by", "from", "has", "have", "into", "not", "no", "any",
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 2 && !STOPWORDS.has(token));
}

export interface TrainedBursaryScamModel {
  vocabulary: string[];
  /** log P(class) */
  classLogPrior: { scam: number; legitimate: number };
  /** wordLogProb.scam[i] = log P(vocabulary[i] | scam), same for legitimate */
  wordLogProb: { scam: number[]; legitimate: number[] };
  trainedAt: string;
  metrics: {
    trainSize: number;
    testSize: number;
    accuracy: number;
    precision: number;
    recall: number;
    f1: number;
  };
}
