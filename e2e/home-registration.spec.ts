import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { trackErrors } from "./helpers";

/**
 * Homepage delegate registration (src/components/sections/RegistrationSection.tsx),
 * on the build forced open. The visitor's clock is pinned so the days-left
 * count is deterministic.
 */

const lagos = (iso: string) => new Date(`${iso}+01:00`);

const serious = async (page: Page, include: string) =>
  (
    await new AxeBuilder({ page }).include(include).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()
  ).violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => v.id);

test.describe("homepage registration", () => {
  test("sits straight after the hero, with the deadline and days left", async ({ page }) => {
    const errors = trackErrors(page);
    await page.clock.setFixedTime(lagos("2026-11-23T12:00:00"));
    await page.goto("/");
    const order = await page.evaluate(() =>
      [...document.querySelectorAll("main > section")]
        .slice(0, 3)
        .map((s) => s.id || s.getAttribute("aria-labelledby")),
    );
    expect(order).toEqual(["hero-title", "register", "shortlist"]);

    const section = page.locator("#register");
    await expect(section.getByRole("heading", { level: 2, name: "Request your invitation" })).toBeVisible();
    await expect(section.getByText("Delegate registration is open")).toBeVisible();
    await expect(section.locator('time[datetime="2026-12-06"]')).toHaveText("6 December 2026");
    await expect(section.getByTestId("registration-days-left")).toHaveText("14 days left");
    await expect(section.getByText("2 days before the summit, with the venue map.")).toBeVisible();

    // The hero repeats the deadline under its buttons.
    const hero = page.getByTestId("hero-registration-deadline");
    await expect(hero).toContainText("Delegate registration open until 6 December 2026");
    await expect(hero.getByTestId("registration-days-left")).toHaveText("14 days left");
    expect(errors).toEqual([]);
  });

  test("says 'Last day to register' on 6 December", async ({ page }) => {
    await page.clock.setFixedTime(lagos("2026-12-06T18:00:00"));
    await page.goto("/");
    await expect(page.locator("#register").getByTestId("registration-days-left")).toHaveText(
      "Last day to register",
    );
  });

  test("the hero's Register button is above the fold on desktop and phone", async ({ page }) => {
    for (const [width, height] of [
      [1440, 900],
      [390, 844],
    ]) {
      await page.setViewportSize({ width, height });
      await page.goto("/");
      const button = page
        .locator("#hero-title")
        .locator("..")
        .getByRole("link", { name: "Register for the Summit" });
      await expect(button, `${width}px`).toBeInViewport();
    }
  });

  test("the main button opens the form", async ({ page }) => {
    await page.goto("/");
    await page.locator("#register").getByRole("link", { name: "Request your invitation" }).click();
    await expect(page).toHaveURL(/\/register\/?#request$/);
    await expect(page.getByRole("button", { name: "Request Invitation" })).toBeVisible();
  });

  test("a 'Register as' shortcut preselects the delegate type", async ({ page }) => {
    await page.goto("/");
    await page.locator("#register").getByRole("link", { name: "Investor", exact: true }).click();
    await expect(page).toHaveURL(/\/register\/?\?type=Investor#request$/);
    await expect(page.getByLabel(/Delegate Type/)).toHaveValue("Investor");
  });

  for (const width of [1440, 1024, 768, 390, 375]) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      await page.locator("#register").scrollIntoViewIfNeeded();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test("has no serious accessibility violations", async ({ page }) => {
    await page.goto("/");
    await page.locator("#register").scrollIntoViewIfNeeded();
    expect(await serious(page, "#register")).toEqual([]);
    expect(await serious(page, '[data-testid="hero-registration-deadline"]')).toEqual([]);
  });
});
