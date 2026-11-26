import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { ROUTES, trackErrors } from "./helpers";

/**
 * @closed: runs against `npm run build:e2e:closed`, a build with registration
 * forced closed (what ships from 7 Dec 2026, when registration closes; the
 * Talent Fund closed 10 Nov). `npm run test:e2e` runs these after the main suite.
 */

const WHATSAPP = "https://chat.whatsapp.com/Lf7XCgLgJbD3wS886uthYO?s=cl&p=a&mlu=4&ilr=4&iam=2";

const serious = async (page: Page) =>
  (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => v.id);

const overflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

test.describe("registration closed @closed", () => {
  test("/register says registration is closed and shows no form", async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto("/register/");
    await expect(page.getByRole("heading", { level: 1, name: "Registration is closed" })).toBeVisible();
    await expect(page.locator('[data-registration="closed"]')).toBeVisible();
    await expect(page.locator("form")).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Continue to payment/ })).toHaveCount(0);
    await expect(page.getByText("7 December 2026").first()).toBeVisible();
    // Confirmed delegates still get the arrival details.
    await expect(page.getByText(/no on-site registration/i).first()).toBeVisible();
    await page
      .locator('[data-registration="closed"]')
      .getByRole("link", { name: /Check the Talent Fund shortlist/ })
      .click();
    await expect(page).toHaveURL(/\/talentnigeria20\/shortlist\/?$/);
    expect(errors).toEqual([]);
  });

  test("no page links to the registration form any more", async ({ page }) => {
    // Walks every route; under a full parallel run it needs more than the 30s default.
    test.slow();
    for (const route of ROUTES) {
      await page.goto(route);
      // Only the footer's "Registration" link to the closed page remains.
      const links = page.locator('main a[href^="/register"], header a[href^="/register"]');
      await expect(links, route).toHaveCount(0);
      await expect(page.getByRole("link", { name: /^Register( for the Summit)?$/ }), route).toHaveCount(0);
    }
  });

  test("the header button goes to the shortlist, on desktop and in the mobile drawer", async ({ page }) => {
    await page.goto("/about/");
    await page.getByRole("banner").getByRole("link", { name: "Check the shortlist" }).click();
    await expect(page).toHaveURL(/\/talentnigeria20\/shortlist\/?$/);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/about/");
    await page.getByRole("button", { name: /menu/i }).click();
    await page.getByRole("dialog").getByRole("link", { name: "Check the Talent Fund shortlist" }).click();
    await expect(page).toHaveURL(/\/talentnigeria20\/shortlist\/?$/);
  });

  test("the Talent Fund application is closed and points to the shortlist", async ({ page }) => {
    await page.goto("/talentnigeria20/");
    await expect(page.getByRole("heading", { name: "Applications for 2026 have closed" })).toBeVisible();
    await page.getByRole("main").getByRole("link", { name: "Check the shortlist" }).click();
    await expect(page).toHaveURL(/\/talentnigeria20\/shortlist\/?$/);
  });
});

test.describe("seat payment page @closed", () => {
  test("offers no payment and no registration once closed, but still checks a seat", async ({ page }) => {
    await page.goto("/register/pay/");
    await expect(page.getByRole("heading", { name: "Check your seat" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Register and pay in one step" })).toHaveCount(0);

    await page.goto("/register/pay/?ref=N2-OLDR-EG01");
    await expect(page.getByRole("heading", { name: "This seat was not paid for" })).toBeVisible();
    await expect(page.getByText(/no payment at the door/)).toBeVisible();
    await expect(page.getByRole("button", { name: /Pay .* with Paystack/ })).toHaveCount(0);
  });
});

test.describe("homepage shortlist @closed", () => {
  test("sits straight after the hero, and the hero button scrolls to it", async ({ page }) => {
    await page.goto("/");
    const order = await page.evaluate(() =>
      [...document.querySelectorAll("main > section")]
        .slice(0, 2)
        .map((s) => s.id || s.getAttribute("aria-labelledby")),
    );
    expect(order).toEqual(["hero-title", "shortlist"]);
    // The registration section and the hero's deadline line are gone once closed.
    await expect(page.locator("#register")).toHaveCount(0);
    await expect(page.getByTestId("hero-registration-deadline")).toHaveCount(0);
    await expect(page.getByTestId("home-shortlist-tracks")).toContainText("794");
    await page.getByRole("link", { name: "Check the Talent Fund shortlist" }).first().click();
    await expect(page).toHaveURL(/#shortlist$/);
    await expect(page.getByRole("heading", { name: /young Nigerians made the shortlist/ })).toBeInViewport();
  });

  test("search, confirm and join from the homepage", async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto("/#shortlist");
    const finder = page.locator("#find-your-name");
    await finder.getByLabel("Your full name").fill("okonkwo chidera");
    await finder.getByRole("button", { name: /Okonkwo Chidera Gift/ }).click();
    await finder
      .locator("label")
      .filter({ has: page.getByRole("radio", { name: /^Capital/ }) })
      .click();
    await finder.getByLabel(/Location/).selectOption("Abia");
    await finder.getByLabel(/I am Okonkwo/).check();
    expect(await serious(page)).toEqual([]);
    await finder.getByRole("button", { name: "Confirm my details" }).click();
    await expect(finder.getByTestId("whatsapp-join")).toHaveAttribute("href", WHATSAPP);
    expect(errors).toEqual([]);
  });

  test("an unknown name links to the full list by state", async ({ page }) => {
    await page.goto("/");
    await page.locator("#find-your-name").getByLabel("Your full name").fill("Zzyzx Qwerty");
    await page
      .locator("#find-your-name")
      .getByRole("link", { name: "browse the full list by state", exact: true })
      .click();
    await expect(page).toHaveURL(/\/talentnigeria20\/shortlist\/#full-list$/);
    await expect(page.getByRole("heading", { name: "The full shortlist by state" })).toBeInViewport();
  });

  for (const width of [1440, 1280, 1024, 768, 390, 375]) {
    test(`/ and /register have no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const path of ["/", "/register/"]) {
        await page.goto(path);
        expect(await overflow(page), path).toBeLessThanOrEqual(0);
      }
    });
  }

  test("/ and /register have no serious accessibility violations", async ({ page }) => {
    for (const path of ["/", "/register/"]) {
      await page.goto(path);
      expect(await serious(page), path).toEqual([]);
    }
  });
});
