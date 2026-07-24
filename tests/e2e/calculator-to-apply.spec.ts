import { test, expect } from "@playwright/test";

/**
 * The one path the brief names explicitly (docs/MASTER_PROMPT_v2.md Phase
 * 9): enter marks -> see results -> reach an apply link. Runs against
 * config/sampleData.ts's [Sample] Demo University (explicitly fictional,
 * see that file's header) since no real, verified programme catalogue
 * exists yet -- Phase 4 ingestion isn't connected to a live project. The
 * marks below are chosen to clear [Sample] BSc Computer Science's
 * requirements (minAps 30, Mathematics level 5+, Physical Sciences level
 * 4+) with real margin, and its application window is "open" with a real
 * (fake-domain) applyUrl on record.
 */
test("learner enters marks, sees they qualify, and reaches a real apply link", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Home Language").selectOption("English");
  await page.getByLabel("English (Home Language)").fill("80");

  await page.getByLabel("First Additional Language").selectOption("Afrikaans");
  await page.getByLabel("Afrikaans (First Additional)").fill("70");

  await page.getByLabel("Mathematics", { exact: true }).selectOption("Mathematics");
  await page.getByLabel("Mathematics", { exact: true }).nth(1).fill("75");

  await page.getByLabel("Life Orientation (compulsory)").fill("60");

  async function pickElective(index: number, query: string, optionName: string, mark: string) {
    const combobox = page.getByLabel(`Elective ${index}`);
    await combobox.fill(query);
    await page.getByRole("option", { name: new RegExp(optionName) }).click();
    await page.getByLabel(optionName, { exact: true }).fill(mark);
  }

  await pickElective(1, "Physical", "Physical Sciences", "70");
  await pickElective(2, "Life Sci", "Life Sciences", "70");
  await pickElective(3, "Geography", "Geography", "70");

  await expect(page.getByRole("heading", { name: "You qualify" })).toBeVisible();

  const qualifyCard = page
    .locator("article")
    .filter({ hasText: "[Sample] BSc Computer Science" });
  await expect(qualifyCard).toBeVisible();
  await expect(qualifyCard.getByText("YOU QUALIFY")).toBeVisible();

  const applyLink = qualifyCard.getByRole("link", { name: /apply/i });
  await expect(applyLink).toBeVisible();
  await expect(applyLink).toHaveAttribute("href", "https://example.test/apply/bsc-cs");
  await expect(applyLink).toHaveAttribute("target", "_blank");
});
