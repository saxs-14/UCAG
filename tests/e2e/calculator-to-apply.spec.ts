import { test, expect } from "@playwright/test";

/**
 * The one path the brief names explicitly (docs/MASTER_PROMPT_v2.md Phase
 * 9): enter marks -> see results -> reach an apply link. Runs against real,
 * verified UMP data seeded into the local Firestore emulator (`npm run
 * seed:ump-data` + `npm run seed:aps-rules`) -- config/sampleData.ts's
 * fictional "[Sample]" catalogue no longer exists in ResultsSection.tsx
 * (see its own header comment: "Real, live-Firestore results").
 *
 * Target: Bachelor of Development Studies (minAps 26, only requirement is
 * English Home Language level 4+) -- chosen because it has the fewest
 * subject requirements of any seeded UMP programme, so it stays a reliable
 * "qualify" target even if other seeded programmes' requirements change.
 * The marks below sum to a UMP APS of 37 (best 6 subjects, LO excluded,
 * standard 7-point scale) with real margin above every seeded programme's
 * minAps, and UMP's one seeded application window is institution-wide
 * (programmeId: null) and "open" through 2026-11-30.
 */
test("learner enters marks, sees they qualify, and reaches a real apply link", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Home Language").selectOption("English");
  await page.getByLabel("English (HL)").fill("80");

  await page.getByLabel("First Additional Language").selectOption("Afrikaans");
  await page.getByLabel("Afrikaans (FAL)").fill("70");

  await page.getByRole("button", { name: /Continue/ }).click();

  await page.getByLabel("Mathematics type").selectOption("Mathematics");
  await page.getByLabel("Mathematics", { exact: true }).fill("75");

  await page.getByRole("button", { name: /Continue/ }).click();

  await page.getByLabel("Life Orientation", { exact: true }).fill("60");

  await page.getByRole("button", { name: /Continue/ }).click();

  async function pickElective(index: number, query: string, optionName: string, mark: string) {
    const label = `Elective Subject ${index}`;
    const combobox = page.getByLabel(label);
    await combobox.fill(query);
    const listbox = page.locator(`[id="combobox-listbox-${label}"]`);
    await listbox.getByRole("option", { name: new RegExp(optionName) }).click();
    await page.getByLabel(optionName, { exact: true }).fill(mark);
  }

  await pickElective(1, "Physical", "Physical Sciences", "70");
  await pickElective(2, "Life Sci", "Life Sciences", "70");
  await pickElective(3, "Geography", "Geography", "70");

  await page.getByRole("button", { name: /Continue/ }).click();
  await page.getByRole("button", { name: /Calculate/ }).click();

  // Generous timeout: the first Firestore-emulator query in a test run can
  // take longer than Playwright's 5s default, especially on a cold cache.
  await expect(page.getByRole("heading", { name: "You qualify" })).toBeVisible({ timeout: 15000 });

  const qualifyCard = page
    .getByRole("region", { name: "You qualify" })
    .locator("article")
    .filter({ hasText: "Bachelor of Development Studies" });
  await expect(qualifyCard).toBeVisible();
  await expect(qualifyCard.getByText("You qualify")).toBeVisible();

  const applyLink = qualifyCard.getByRole("link", { name: /apply/i });
  await expect(applyLink).toBeVisible();
  await expect(applyLink).toHaveAttribute(
    "href",
    "https://www.ump.ac.za/Study-with-us/Application-Process/Online-Applications"
  );
  await expect(applyLink).toHaveAttribute("target", "_blank");
});
