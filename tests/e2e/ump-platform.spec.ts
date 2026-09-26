// cSpell:words Mpumalanga edbs NSFAS
import { test, expect } from "@playwright/test";

/**
 * End-to-end test suite for the UMP AI Education Platform routes.
 * Verifies navigation, filtering, provenances, and CTA deep-links.
 *
 * Rewritten 2026-09-26: like tests/e2e/calculator-to-apply.spec.ts, this
 * suite had rotted -- ci.yml never runs `test:e2e`, so nobody caught that
 * every heading assertion below used pre-redesign copy (the real headings
 * all now carry an emoji prefix, e.g. "🏛️ Campus Guide" not "UMP Campus
 * Guide"), that the faculty filter on /ump/programmes was redesigned from
 * a <select> into a row of filter-pill <Link>s (getByLabel(...)
 * .selectOption(...) never had anything to select), and that the careers
 * roadmap's first step renders pre-expanded (clicking it collapses, not
 * expands, so the original test's "click to expand" assertion was
 * exercising the wrong step). Fixed against the real current markup;
 * requires real UMP data seeded into the local Firestore emulator (`npm
 * run seed:ump-data`), same as calculator-to-apply.spec.ts.
 */
test.describe("UMP AI Education Platform E2E", () => {
  test("navigates UMP Hub, opens Programme Explorer, and filters by faculty", async ({ page }) => {
    // 1. Visit UMP Hub
    await page.goto("/ump");
    await expect(page.getByRole("heading", { name: /Academic Excellence/i })).toBeVisible();
    await expect(page.getByText("Faculties & Schools")).toBeVisible();

    // 2. Click the hero "Explore Programmes" CTA
    await page.getByRole("link", { name: /Explore Programmes/i }).click();
    await expect(page).toHaveURL(/\/ump\/programmes/);
    await expect(page.getByRole("heading", { name: /UMP Programmes/i })).toBeVisible();

    // 3. Filter by Faculty of Economics, Development and Business Sciences --
    // the faculty filter is a row of links (one per faculty), not a <select>.
    await page.locator('a[href*="faculty=ump-faculty-edbs"]').click();
    await expect(page).toHaveURL(/faculty=ump-faculty-edbs/);
  });

  test("visits UMP Funding Hub and checks provenance notices", async ({ page }) => {
    await page.goto("/ump/funding");
    await expect(page.getByRole("heading", { name: /Funding & Bursaries/i })).toBeVisible();
    await expect(page.getByText("NSFAS (National Student Financial Aid Scheme)")).toBeVisible();
    await expect(page.getByText("Apply for NSFAS first")).toBeVisible();
  });

  test("visits UMP Career Roadmaps and expands a roadmap step", async ({ page }) => {
    await page.goto("/ump/careers");
    await expect(page.getByRole("heading", { name: /Career Roadmaps/i })).toBeVisible();
    await expect(page.getByText("Grade 12 → UMP ICT Degree → Software Engineer")).toBeVisible();

    // The first milestone ("Grade 12 — Build Your Foundation") renders
    // pre-expanded, so it isn't a real test of the expand interaction --
    // use the second step instead, which starts collapsed.
    const admissionStep = page.getByRole("button", { name: /UMP Application & NSFAS/i });
    await expect(admissionStep).toBeVisible();
    await expect(page.getByText("Apply via the UMP online portal")).not.toBeVisible();
    await admissionStep.click();
    await expect(page.getByText("Apply via the UMP online portal")).toBeVisible();
  });

  test("visits UMP Campus Guide", async ({ page }) => {
    await page.goto("/ump/campus");
    await expect(page.getByRole("heading", { name: /Campus Guide/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Mbombela Campus" })).toBeVisible();
    await expect(page.getByText("Main Campus")).toBeVisible();
  });

  test("verifies Application Document Assistant POPIA privacy shield", async ({ page }) => {
    await page.goto("/application/documents");
    await expect(page.getByRole("heading", { name: "Application Document Assistant" })).toBeVisible();
    await expect(page.getByText("POPIA Compliant Privacy Guarantee")).toBeVisible();
  });
});
