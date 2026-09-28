import { expect, test } from "@playwright/test";
import { ROUTES, WIDTHS, trackErrors } from "./helpers";

for (const route of ROUTES) {
  test.describe(`responsive ${route}`, () => {
    for (const width of WIDTHS) {
      test(`${width}px: no horizontal overflow, no console errors`, async ({ page }) => {
        const errors = trackErrors(page);
        await page.setViewportSize({ width, height: 900 });
        await page.goto(route, { waitUntil: "networkidle" });
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(0);

        // Every heading must fit inside the viewport (catches oversized type).
        const wide = await page.evaluate((vw) => {
          return [...document.querySelectorAll("h1, h2")]
            .filter((h) => h.getBoundingClientRect().width > 0)
            .filter(
              (h) =>
                h.scrollWidth > (h as HTMLElement).clientWidth + 1 ||
                h.getBoundingClientRect().right > vw + 1,
            )
            .map((h) => h.textContent?.trim().slice(0, 40));
        }, width);
        expect(wide, "headings overflowing their box").toEqual([]);
        expect(errors).toEqual([]);
      });
    }
  });
}
