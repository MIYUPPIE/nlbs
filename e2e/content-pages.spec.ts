import { expect, test } from "@playwright/test";
import { ROUTES } from "./helpers";

test.describe("partners page", () => {
  test("shows both tracks with slot totals and no fees", async ({ page }) => {
    await page.goto("/partners");
    await expect(page.getByRole("heading", { name: "Founding Stakeholders" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Official Sponsors" })).toBeVisible();
    const tracks = page.locator("#tracks");
    await expect(tracks).toContainText("16 slots in total");
    await expect(tracks).toContainText("19 slots in total");
    await expect(page.getByRole("table", { name: "Official Sponsor benefits by tier" })).toBeVisible();
    await expect(page.locator("main")).not.toContainText(/[₦N]\d/);
  });

  test("sponsor enquiry opens the contact form on the Sponsorship topic", async ({ page }) => {
    await page.goto("/partners");
    await page.getByRole("link", { name: "Enquire as a Sponsor" }).click();
    await expect(page).toHaveURL(/\/contact\?topic=sponsorship/);
    await expect(page.getByLabel(/Topic/)).toHaveValue("Sponsorship");
  });
});

test.describe("register page", () => {
  test("explains the invitation routes, the timeline and arrival", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByRole("heading", { level: 1, name: "Request your invitation" })).toBeVisible();
    for (const c of ["Corporate C-Suite", "Investors, DFIs & Tech", "Media"]) {
      await expect(page.getByRole("heading", { name: c })).toBeVisible();
    }
    await expect(page.getByText("21 days before")).toBeVisible();
    await expect(page.getByText(/no on-site registration/i)).toBeVisible();
    await expect(page.getByLabel(/WhatsApp Number/)).toBeVisible();
    await expect(page.getByLabel(/Who nominated you/)).toBeVisible();
  });
});

test.describe("about page", () => {
  test("shows objectives, outcomes and the delegate profile", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByRole("heading", { name: "Foster Partnership" })).toBeVisible();
    await expect(
      page.getByText("A Policy Action Brief submitted to Federal and State Executives"),
    ).toBeVisible();
    await expect(page.getByText("Est. 200 seats").first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Seniority" })).toBeVisible();
  });
});

test("no page offers a document download", async ({ page }) => {
  for (const route of ROUTES) {
    await page.goto(route);
    await expect(page.locator("a[download], a[href$='.pdf'], a[href*='/downloads/']"), route).toHaveCount(0);
  }
});
