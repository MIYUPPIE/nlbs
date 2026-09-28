import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { ROUTES, revealAll } from "./helpers";

for (const width of [1440, 390]) {
  for (const route of ROUTES) {
    test(`axe ${route} @${width}px: no serious or critical violations`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(route, { waitUntil: "networkidle" });
      await revealAll(page);
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
      const blocking = results.violations
        .filter((v) => v.impact === "serious" || v.impact === "critical")
        .map((v) => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.slice(0, 3).map((n) => n.target.join(" ")),
        }));
      expect(blocking).toEqual([]);
    });
  }
}

test("page has one h1, a main landmark and a skip link", async ({ page }) => {
  for (const route of ROUTES) {
    await page.goto(route);
    await expect(page.locator("h1"), route).toHaveCount(1);
    await expect(page.locator("main#main"), route).toHaveCount(1);
  }
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
});
