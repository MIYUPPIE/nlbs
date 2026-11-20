import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { trackErrors } from "./helpers";

/**
 * Talent Fund final shortlist: search, confirm name + talent option + state,
 * then (and only then) the WhatsApp group link. Data: the convener's PDF
 * (Okonkwo Chidera Gift, Abia, Capital; "Ibrahim Musa" is two applicants).
 */

const PATH = "/talentnigeria20/shortlist/";
/** Tracks are cards: a visually hidden radio inside a label. Click the card, as a person would. */
const pickTrack = (page: Page, track: string) =>
  page
    .locator("label")
    .filter({ has: page.getByRole("radio", { name: new RegExp(`^${track}`) }) })
    .click();

const WHATSAPP = "https://chat.whatsapp.com/Lf7XCgLgJbD3wS886uthYO?s=cl&p=a&mlu=4&ilr=4&iam=2";

test.describe("talent fund shortlist", () => {
  test("search, confirm and join: the link appears only after the details match", async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto(PATH);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/The final shortlist/);
    await expect(page.getByTestId("shortlist-stats")).toContainText("1,867");
    await expect(page.getByTestId("whatsapp-join")).toHaveCount(0);

    const search = page.getByLabel("Your full name");
    await expect(search).toBeEnabled();
    await search.fill("chidera okonkwo");
    await page.getByRole("button", { name: /Okonkwo Chidera Gift/ }).click();

    await expect(page.getByRole("heading", { name: "Confirm your details" })).toBeFocused();
    await expect(page.getByTestId("confirm-name")).toHaveText("Okonkwo Chidera Gift");

    // Missing answers are explained, not silently ignored.
    await page.getByRole("button", { name: "Confirm my details" }).click();
    await expect(page.getByTestId("confirm-error")).toHaveText(/Choose the talent option/);

    // Wrong talent option: no link.
    await pickTrack(page, "Skills");
    await page.getByLabel(/Location/).selectOption("Abia");
    await page.getByLabel(/I am Okonkwo Chidera Gift/).check();
    await page.getByRole("button", { name: "Confirm my details" }).click();
    await expect(page.getByTestId("confirm-error")).toContainText("do not match the shortlist");
    await expect(page.getByTestId("whatsapp-join")).toHaveCount(0);

    // Wrong state again: the contact line appears.
    await pickTrack(page, "Capital");
    await page.getByLabel(/Location/).selectOption("Lagos");
    await page.getByRole("button", { name: "Confirm my details" }).click();
    await expect(page.getByTestId("confirm-error")).toContainText("do not match the shortlist");
    await expect(page.getByText(/Think there is a mistake\?/)).toBeVisible();

    // Right details.
    await page.getByLabel(/Location/).selectOption("Abia");
    await page.getByRole("button", { name: "Confirm my details" }).click();
    await expect(page.getByRole("heading", { name: /you are on the shortlist/ })).toBeFocused();
    await expect(page.getByTestId("confirmed-details")).toContainText("Okonkwo Chidera Gift");
    await expect(page.getByTestId("confirmed-details")).toContainText("Capital");
    await expect(page.getByTestId("confirmed-details")).toContainText("Abia");
    const join = page.getByTestId("whatsapp-join");
    await expect(join).toHaveAttribute("href", WHATSAPP);
    await expect(join).toHaveAttribute("target", "_blank");
    await expect(join).toHaveAttribute("rel", /noopener/);
    expect(errors).toEqual([]);
  });

  test("applicants who share a name confirm with their own track and state", async ({ page }) => {
    await page.goto(PATH);
    await page.getByLabel("Your full name").fill("ibrahim musa");
    await page.getByRole("button", { name: /^Ibrahim Musa This is me$/ }).click();
    // Two applicants: Borno/Skills and Nasarawa/Skills. Another state does not pass.
    await pickTrack(page, "Skills");
    await page.getByLabel(/Location/).selectOption("Kano");
    await page.getByLabel(/I am Ibrahim Musa/).check();
    await page.getByRole("button", { name: "Confirm my details" }).click();
    await expect(page.getByTestId("confirm-error")).toContainText("do not match");
    await page.getByLabel(/Location/).selectOption("Nasarawa");
    await page.getByRole("button", { name: "Confirm my details" }).click();
    await expect(page.getByTestId("confirmed-details")).toContainText("Nasarawa");
    await expect(page.getByTestId("whatsapp-join")).toHaveAttribute("href", WHATSAPP);
  });

  test("an unknown name says so and points to help", async ({ page }) => {
    await page.goto(PATH);
    await page.getByLabel("Your full name").fill("Zzyzx Qwerty");
    await expect(page.getByTestId("search-status")).toHaveText("No shortlisted applicant matches that name.");
    await expect(page.getByText(/Think there is a mistake\?/)).toBeVisible();
  });

  test("the group link is not in the page HTML, and the page is noindex", async ({ page, request }) => {
    const res = await request.get(PATH);
    expect(res.status()).toBe(200);
    expect(res.headers()["x-robots-tag"]).toMatch(/noindex/);
    const html = await res.text();
    expect(html).not.toContain("chat.whatsapp.com");
    expect(html).toContain("Okonkwo Chidera Gift"); // full list renders without JS
    await page.goto(PATH);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });

  test("the full list by state opens without JavaScript", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto(PATH);
    const abia = page.locator("#state-abia");
    await abia.locator("summary").click();
    await expect(abia.getByText("Okonkwo Chidera Gift")).toBeVisible();
    await expect(page.getByTestId("shortlist-states").locator("> li")).toHaveCount(37);
    await ctx.close();
  });

  test("is reachable from /talent and the footer", async ({ page }) => {
    // The closed /talentnigeria20 page links here too; e2e builds force the form open, so that is unit-tested.
    await page.goto("/talent/");
    await expect(
      page.getByRole("contentinfo").getByRole("link", { name: "Talent Fund Shortlist", exact: true }),
    ).toBeVisible();
    await page.getByRole("main").getByRole("link", { name: "Check the shortlist" }).click();
    await expect(page).toHaveURL(/\/talentnigeria20\/shortlist\/?$/);
  });

  for (const width of [1440, 768, 390, 375]) {
    test(`no horizontal overflow at ${width}px, through to the join step`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(PATH);
      await page.getByLabel("Your full name").fill("okonkwo chidera");
      await page.getByRole("button", { name: /Okonkwo Chidera Gift/ }).click();
      await pickTrack(page, "Capital");
      await page.getByLabel(/Location/).selectOption("Abia");
      await page.getByLabel(/I am Okonkwo/).check();
      await page.getByRole("button", { name: "Confirm my details" }).click();
      await expect(page.getByTestId("whatsapp-join")).toBeVisible();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test("has no serious accessibility violations at each step", async ({ page }) => {
    await page.goto(PATH);
    const scan = async () => {
      const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
      return r.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => v.id);
    };
    await page.getByLabel("Your full name").fill("okonkwo");
    expect(await scan()).toEqual([]);
    await page.getByRole("button", { name: /Okonkwo Chidera Gift/ }).click();
    expect(await scan()).toEqual([]);
    await pickTrack(page, "Capital");
    await page.getByLabel(/Location/).selectOption("Abia");
    await page.getByLabel(/I am Okonkwo/).check();
    await page.getByRole("button", { name: "Confirm my details" }).click();
    expect(await scan()).toEqual([]);
  });
});
