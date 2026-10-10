import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { revealAll } from "./helpers";

/**
 * Talent Fund university pages against the fake backend
 * (e2e/servers/fake-central.mjs: UNILAG confirmed with 7 applications, OAU
 * received with 3, the rest invited with 0).
 */

const CENTRAL = "http://localhost:3299";
const PDF = Buffer.from("%PDF-1.4\n% university letter\n%%EOF\n");

test.describe("university page", () => {
  test("shows the student link and the backend's live numbers, never a guess", async ({ page }) => {
    await page.goto("/talentnigeria20/universities/unilag/");
    await expect(page.getByRole("heading", { level: 1, name: "University of Lagos" })).toBeVisible();
    await expect(page.locator("#student-link")).toHaveValue(
      "http://localhost:3200/talentnigeria20/?university=unilag",
    );
    await expect(page.getByTestId("university-count")).toHaveText("7");
    await expect(page.getByTestId("university-live").locator("[data-status]")).toHaveAttribute(
      "data-status",
      "confirmed",
    );
    await expect(page.getByText("Confirmed", { exact: true })).toBeVisible();
    // Unlisted: never indexed.
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });

  test("says numbers are unavailable when the backend fails, instead of showing one", async ({ page }) => {
    await page.route(`${CENTRAL}/api/v1/talent/universities`, (r) => r.fulfill({ status: 500, body: "{}" }));
    await page.goto("/talentnigeria20/universities/ui/");
    await expect(page.getByText("Live numbers are unavailable right now.")).toBeVisible();
    await expect(page.getByTestId("university-count")).toHaveCount(0);
  });

  test("Career Services confirmation sends exactly the backend contract", async ({ page }) => {
    await page.goto("/talentnigeria20/universities/oau/");
    await expect(page.getByTestId("university-count")).toHaveText("3");
    const form = page.getByRole("form", { name: /Confirm OAU/ });
    await form.getByRole("button", { name: "Confirm participation" }).click();
    await expect(form.getByRole("alert")).toContainText("Please correct the highlighted fields.");
    await expect(form.getByLabel(/Your full name/)).toBeFocused();

    await form.getByLabel(/Your full name/).fill("Prof. Bisi Lawal");
    await form.getByLabel(/Job title/).fill("Director, Career Services");
    await form.getByLabel(/Work email/).fill("careers@oau.example");
    await form.getByLabel(/Phone or WhatsApp/).fill("0803 111 2222");
    await form.getByLabel(/Students you expect/).fill("120");
    await form
      .locator("#f-letterhead")
      .setInputFiles({ name: "oau-letter.pdf", mimeType: "application/pdf", buffer: PDF });
    await expect(form.getByText("oau-letter.pdf")).toBeVisible();
    await form.getByLabel(/I am authorised to confirm/).check();
    await form.getByRole("button", { name: "Confirm participation" }).click();

    await expect(page.getByRole("heading", { name: "Confirmation received" })).toBeFocused();
    const sent = await (
      await page.request.get(`${CENTRAL}/__last/university?email=careers@oau.example`)
    ).json();
    expect(sent).toMatchObject({
      form: "university",
      university: "oau",
      focalName: "Prof. Bisi Lawal",
      focalTitle: "Director, Career Services",
      email: "careers@oau.example",
      phone: "0803 111 2222",
      expectedNominees: 120,
      consent: true,
      letterhead: {
        name: "oau-letter.pdf",
        type: "application/pdf",
        size: PDF.length,
        data: PDF.toString("base64"),
      },
    });
    expect(sent.privacyVersion).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(Object.keys(sent)).not.toContain("students");
  });

  test("rejects a letter that is not a PDF", async ({ page }) => {
    await page.goto("/talentnigeria20/universities/ui/");
    await page
      .locator("#f-letterhead")
      .setInputFiles({ name: "letter.docx", mimeType: "application/msword", buffer: Buffer.from("doc") });
    await expect(page.getByText("The letter must be a PDF.")).toBeVisible();
  });
});

test.describe("university index", () => {
  test("lists every invited university alphabetically with live status, linked to its page", async ({
    page,
  }) => {
    await page.goto("/talentnigeria20/universities/");
    await expect(page.getByRole("heading", { level: 1, name: "University nominations" })).toBeVisible();
    const cards = page
      .getByRole("list")
      .filter({ has: page.getByText("Ahmadu Bello University, Zaria") })
      .getByRole("link");
    await expect(cards).toHaveCount(21);
    await expect(cards.first()).toContainText("Ahmadu Bello University, Zaria");
    await expect(page.getByTestId("board-count-unilag")).toHaveText("7 applied");
    await expect(page.getByTestId("board-count-oau")).toHaveText("3 applied");
    await cards.filter({ hasText: "University of Lagos" }).click();
    await expect(page).toHaveURL(/\/talentnigeria20\/universities\/unilag\/$/);
  });
});

test.describe("student link", () => {
  test("a university's link preselects it on the application form", async ({ page }) => {
    await page.goto("/talentnigeria20/?university=unilag");
    await expect(page.getByLabel(/6\. Who referred you/)).toHaveValue("University");
    await expect(page.getByLabel(/Which university/)).toHaveValue("unilag");
  });

  test("an unknown university in the link is ignored", async ({ page }) => {
    await page.goto("/talentnigeria20");
    await page.evaluate(() => localStorage.clear());
    await page.goto("/talentnigeria20/?university=hogwarts");
    await expect(page.getByLabel(/6\. Who referred you/)).toHaveValue("");
  });

  test("another university needs its name", async ({ page }) => {
    await page.goto("/talentnigeria20");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByLabel(/6\. Who referred you/).selectOption("University");
    await page.getByLabel(/Which university/).selectOption("other");
    await expect(page.getByLabel(/Name of your university/)).toBeVisible();
  });
});

for (const route of ["/talentnigeria20/universities/", "/talentnigeria20/universities/unilag/"]) {
  for (const width of [1440, 390]) {
    test(`axe ${route} @${width}px: no serious or critical violations`, async ({ page }) => {
      test.setTimeout(90_000);
      await page.setViewportSize({ width, height: 900 });
      await page.goto(route, { waitUntil: "networkidle" });
      await revealAll(page);
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
      const blocking = results.violations
        .filter((v) => v.impact === "serious" || v.impact === "critical")
        .map((v) => ({ id: v.id, nodes: v.nodes.slice(0, 3).map((n) => n.target.join(" ")) }));
      expect(blocking).toEqual([]);
    });
  }
}
