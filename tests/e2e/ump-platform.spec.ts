// cSpell:words Mpumalanga edbs NSFAS
import { test, expect } from "@playwright/test";

/**
 * End-to-end test suite for the UMP AI Education Platform routes.
 * Verifies navigation, filtering, provenances, and CTA deep-links.
 */
test.describe("UMP AI Education Platform E2E", () => {
  test("navigates UMP Hub, opens Programme Explorer, and filters by faculty", async ({ page }) => {
    // 1. Visit UMP Hub
    await page.goto("/ump");
    await expect(page.getByRole("heading", { name: /University of Mpumalanga/i })).toBeVisible();
    await expect(page.getByText("Faculties & Schools")).toBeVisible();

    // 2. Click "Browse Programmes" CTA
    await page.getByRole("link", { name: /Browse .* Programmes/i }).first().click();
    await expect(page).toHaveURL(/\/ump\/programmes/);
    await expect(page.getByRole("heading", { name: "UMP Programme Explorer" })).toBeVisible();

    // 3. Filter by Faculty of Economics, Development and Business Sciences
    const facultyFilter = page.getByLabel("Faculty");
    await facultyFilter.selectOption("ump-faculty-edbs");
    await expect(page).toHaveURL(/faculty=ump-faculty-edbs/);
  });

  test("visits UMP Funding Hub and checks provenance notices", async ({ page }) => {
    await page.goto("/ump/funding");
    await expect(page.getByRole("heading", { name: "UMP Funding & Bursaries" })).toBeVisible();
    await expect(page.getByText("NSFAS (National Student Financial Aid Scheme)")).toBeVisible();
    await expect(page.getByText("Apply for NSFAS first")).toBeVisible();
  });

  test("visits UMP Career Roadmaps and expands a roadmap step", async ({ page }) => {
    await page.goto("/ump/careers");
    await expect(page.getByRole("heading", { name: "UMP Career Roadmaps" })).toBeVisible();
    await expect(page.getByText("Grade 12 → UMP ICT Degree → Software Engineer")).toBeVisible();

    // Expand the first milestone card
    const schoolStep = page.getByRole("button", { name: /Grade 12 — Build Your Foundation/i });
    await expect(schoolStep).toBeVisible();
    await schoolStep.click();
    await expect(page.getByText("Achieve at least level 4 (50%) in Mathematics")).toBeVisible();
  });

  test("visits UMP Campus Guide and Peer Mentors", async ({ page }) => {
    await page.goto("/ump/campus");
    await expect(page.getByRole("heading", { name: "UMP Campus Guide" })).toBeVisible();
    await expect(page.getByText("Mbombela Campus (Main Campus)")).toBeVisible();

    await page.goto("/ump/mentors");
    await expect(page.getByRole("heading", { name: "UMP Student Peer Mentors" })).toBeVisible();
    await expect(page.getByText("Sibusiso Nkosi")).toBeVisible();
  });

  test("verifies Application Document Assistant POPIA privacy shield", async ({ page }) => {
    await page.goto("/application/documents");
    await expect(page.getByRole("heading", { name: "Application Document Assistant" })).toBeVisible();
    await expect(page.getByText("POPIA Compliant Privacy Guarantee")).toBeVisible();
  });
});
