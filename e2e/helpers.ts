import type { Page } from "@playwright/test";

export const ROUTES = [
  "/",
  "/about",
  "/programme",
  "/speakers",
  "/investment",
  "/talent",
  "/technology",
  "/startup-pitch",
  "/exhibition",
  "/partners",
  "/register",
  "/contact",
  "/faq",
] as const;

export const WIDTHS = [1440, 1280, 1024, 768, 640, 390, 375] as const;

/** Wheel-scroll the full page so scroll-reveal content becomes visible. */
export async function revealAll(page: Page) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 500) {
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(30);
  }
  await page.waitForTimeout(800);
}

/** Collect console errors and uncaught exceptions for a page. */
export function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}
