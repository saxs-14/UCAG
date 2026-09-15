/**
 * Trains the bursary/internship scam classifier
 * (lib/ingestion/bursaryScamModel/) and writes the trained weights to
 * model.json, which classify.ts imports directly at runtime -- no
 * filesystem access or ML runtime needed in production, just a JSON
 * import, matching how config/institutions.seed.ts embeds static data.
 *
 * A plain multinomial Naive Bayes over a bag-of-words, not a neural net:
 * the dataset is small (see trainingData.ts's own caveat about it being
 * hand-written, not scraped), the two classes use genuinely distinct
 * vocabulary by construction, and Naive Bayes is the right amount of
 * model for that -- auditable, deterministic, and it doesn't need a
 * training framework dependency in a repo that otherwise has none.
 *
 * Usage: npm run train:bursary-scam-model
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { TRAINING_DATA, type LabeledListing, type ScamLabel } from "../lib/ingestion/bursaryScamModel/trainingData";
import { tokenize, type TrainedBursaryScamModel } from "../lib/ingestion/bursaryScamModel/shared";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Stratified split: every 5th example of each class (in file order) goes
 * to the test set, so the held-out set actually exercises both classes
 * rather than risking an all-one-class split from a naive slice. */
function stratifiedSplit(data: LabeledListing[]): { train: LabeledListing[]; test: LabeledListing[] } {
  const byLabel: Record<ScamLabel, LabeledListing[]> = { scam: [], legitimate: [] };
  for (const item of data) byLabel[item.label].push(item);

  const train: LabeledListing[] = [];
  const test: LabeledListing[] = [];
  for (const label of Object.keys(byLabel) as ScamLabel[]) {
    byLabel[label].forEach((item, i) => {
      if (i % 5 === 4) test.push(item);
      else train.push(item);
    });
  }
  return { train, test };
}

function trainNaiveBayes(train: LabeledListing[]) {
  const wordCount: Record<ScamLabel, Map<string, number>> = {
    scam: new Map(),
    legitimate: new Map(),
  };
  const classDocCount: Record<ScamLabel, number> = { scam: 0, legitimate: 0 };
  const vocabSet = new Set<string>();

  for (const { text, label } of train) {
    classDocCount[label] += 1;
    for (const token of tokenize(text)) {
      vocabSet.add(token);
      wordCount[label].set(token, (wordCount[label].get(token) ?? 0) + 1);
    }
  }

  const vocabulary = Array.from(vocabSet).sort();
  const totalDocs = train.length;
  const classLogPrior = {
    scam: Math.log(classDocCount.scam / totalDocs),
    legitimate: Math.log(classDocCount.legitimate / totalDocs),
  };

  const classTotalWords: Record<ScamLabel, number> = {
    scam: Array.from(wordCount.scam.values()).reduce((a, b) => a + b, 0),
    legitimate: Array.from(wordCount.legitimate.values()).reduce((a, b) => a + b, 0),
  };

  // Laplace (add-one) smoothing so an unseen-for-this-class word never
  // zeroes out the whole class score.
  const wordLogProb: { scam: number[]; legitimate: number[] } = { scam: [], legitimate: [] };
  for (const label of ["scam", "legitimate"] as ScamLabel[]) {
    wordLogProb[label] = vocabulary.map((word) => {
      const count = wordCount[label].get(word) ?? 0;
      return Math.log((count + 1) / (classTotalWords[label] + vocabulary.length));
    });
  }

  return { vocabulary, classLogPrior, wordLogProb };
}

function predict(
  text: string,
  model: Pick<TrainedBursaryScamModel, "vocabulary" | "classLogPrior" | "wordLogProb">
): { label: ScamLabel; scamProbability: number } {
  const wordIndex = new Map(model.vocabulary.map((w, i) => [w, i]));
  let scamScore = model.classLogPrior.scam;
  let legitScore = model.classLogPrior.legitimate;

  for (const token of tokenize(text)) {
    const idx = wordIndex.get(token);
    if (idx === undefined) continue; // unseen word: skip rather than penalise either class
    scamScore += model.wordLogProb.scam[idx];
    legitScore += model.wordLogProb.legitimate[idx];
  }

  // Numerically stable softmax over the two log-scores.
  const max = Math.max(scamScore, legitScore);
  const scamExp = Math.exp(scamScore - max);
  const legitExp = Math.exp(legitScore - max);
  const scamProbability = scamExp / (scamExp + legitExp);

  return { label: scamProbability >= 0.5 ? "scam" : "legitimate", scamProbability };
}

function evaluate(
  test: LabeledListing[],
  model: Pick<TrainedBursaryScamModel, "vocabulary" | "classLogPrior" | "wordLogProb">
) {
  let truePositive = 0; // predicted scam, actually scam
  let falsePositive = 0; // predicted scam, actually legitimate
  let falseNegative = 0; // predicted legitimate, actually scam
  let correct = 0;

  for (const item of test) {
    const { label } = predict(item.text, model);
    if (label === item.label) correct += 1;
    if (label === "scam" && item.label === "scam") truePositive += 1;
    if (label === "scam" && item.label === "legitimate") falsePositive += 1;
    if (label === "legitimate" && item.label === "scam") falseNegative += 1;
  }

  const accuracy = correct / test.length;
  const precision = truePositive + falsePositive === 0 ? 1 : truePositive / (truePositive + falsePositive);
  const recall = truePositive + falseNegative === 0 ? 1 : truePositive / (truePositive + falseNegative);
  const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);

  return { accuracy, precision, recall, f1 };
}

function main() {
  const { train, test } = stratifiedSplit(TRAINING_DATA);
  console.log(`Training on ${train.length} examples, testing on ${test.length} held-out examples...`);

  const { vocabulary, classLogPrior, wordLogProb } = trainNaiveBayes(train);
  const metrics = evaluate(test, { vocabulary, classLogPrior, wordLogProb });

  console.log("\nHeld-out test set results (synthetic data -- see trainingData.ts's caveat):");
  console.log(`  accuracy:  ${(metrics.accuracy * 100).toFixed(1)}%`);
  console.log(`  precision: ${(metrics.precision * 100).toFixed(1)}% (of listings flagged scam, how many really were)`);
  console.log(`  recall:    ${(metrics.recall * 100).toFixed(1)}% (of real scams, how many got flagged)`);
  console.log(`  f1:        ${(metrics.f1 * 100).toFixed(1)}%`);

  const model: TrainedBursaryScamModel = {
    vocabulary,
    classLogPrior,
    wordLogProb,
    trainedAt: new Date().toISOString(),
    metrics: { trainSize: train.length, testSize: test.length, ...metrics },
  };

  const outPath = path.join(__dirname, "..", "lib", "ingestion", "bursaryScamModel", "model.json");
  writeFileSync(outPath, JSON.stringify(model, null, 2) + "\n");
  console.log(`\nWrote trained model to ${outPath}`);
}

main();
