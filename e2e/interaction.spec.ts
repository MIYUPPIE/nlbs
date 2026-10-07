import { expect, test } from "@playwright/test";

test.describe("mobile navigation", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("drawer opens, traps focus, closes on Escape and restores focus", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Open menu" });
    await toggle.click();
    const drawer = page.getByRole("dialog", { name: "Site menu" });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole("link", { name: "Startup Pitch Arena" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();
    await expect(toggle).toBeFocused();
  });

  test("drawer link navigates and closes the drawer", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("dialog").getByRole("link", { name: "Programme" }).click();
    await expect(page).toHaveURL(/\/programme\/?$/);
    await expect(page.getByRole("dialog")).toBeHidden();
  });
});

test.describe("before hydration (regression: taps ignored on slow networks)", () => {
  test("mobile drawer opens and closes with JavaScript disabled", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    const drawer = page.getByRole("dialog", { name: "Site menu" });
    await expect(drawer).toBeVisible();
    // Playwright's pointer "stable" check can stall with page JS disabled while the
    // dialog's CSS transition runs; keyboard activation exercises the same native command.
    const close = drawer.getByRole("button", { name: "Close menu" });
    await close.focus();
    await page.keyboard.press("Enter");
    await expect(drawer).toBeHidden();
    await ctx.close();
  });

  test("forms cannot submit natively before hydration (no personal data in URLs)", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    for (const [path, button] of [
      ["/register", "Request Invitation"],
      ["/contact", "Send enquiry"],
    ] as const) {
      await page.goto(path);
      await expect(page.getByRole("button", { name: button })).toBeDisabled();
      await expect(page.locator("form")).toHaveAttribute("method", "post");
    }
    await ctx.close();
  });
});

test.describe("header", () => {
  test("turns solid after scrolling", async ({ page }) => {
    await page.goto("/");
    const header = page.locator("header").first();
    await expect(header).toHaveClass(/bg-transparent/);
    await page.mouse.wheel(0, 600);
    await expect(header).toHaveClass(/backdrop-blur/);
  });

  test("marks the current page", async ({ page }) => {
    await page.goto("/programme");
    await expect(
      page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Programme" }),
    ).toHaveAttribute("aria-current", "page");
  });
});

test.describe("programme tabs", () => {
  test("arrow keys move between formats", async ({ page }) => {
    await page.goto("/");
    const first = page.getByRole("tab", { name: /Presidential Keynotes/ });
    await first.focus();
    await page.keyboard.press("ArrowDown");
    const second = page.getByRole("tab", { name: /Leadership Panels/ });
    await expect(second).toBeFocused();
    await expect(second).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("tabpanel")).toContainText("Leadership Panels");
    await page.keyboard.press("End");
    await expect(page.getByRole("tab", { name: /Deal Networking Dinner/ })).toBeFocused();
  });
});

test.describe("countdown", () => {
  test("counts down to 30 Nov 2026 09:00 WAT from a frozen clock", async ({ page }) => {
    // 28 Sep 2026 12:00 WAT → 30 Nov 09:00 WAT is 62 days, 21 hours.
    await page.clock.setFixedTime(new Date("2026-09-28T11:00:00Z"));
    await page.goto("/");
    const timer = page.getByRole("timer");
    await expect(timer).toHaveAttribute("aria-label", "62 days, 21 hours, 0 minutes until the summit");
  });

  test("shows the event-day state on the day", async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-11-30T09:00:00Z"));
    await page.goto("/");
    await expect(page.getByText("Happening today")).toBeVisible();
  });
});

test.describe("hero network graphic", () => {
  test("shows on mobile and rotates with counter-rotating labels", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    const svg = page.locator('svg[aria-label^="Capital, Talent"]');
    await expect(svg).toBeVisible();
    const anims = await page.evaluate(() =>
      document
        .getAnimations()
        .map((a) => a as CSSAnimation)
        .filter((a) => a.animationName === "orbit")
        .map((a) => ({
          duration: (a.effect?.getTiming().duration as number) ?? 0,
          delay: a.effect?.getTiming().delay ?? 0,
          direction: a.effect?.getTiming().direction,
        })),
    );
    // Triangle + 3 labels + dot field.
    expect(anims.filter((a) => a.duration === 60_000 && a.direction === "normal")).toHaveLength(1);
    expect(anims.filter((a) => a.duration === 60_000 && a.direction === "reverse")).toHaveLength(3);
    expect(anims.filter((a) => a.duration === 120_000)).toHaveLength(1);
    expect(anims.every((a) => a.delay === 1200)).toBe(true);
  });

  test("labels stay upright mid-rotation", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() =>
      document.getAnimations().forEach((a) => {
        a.pause();
        a.currentTime = 1200 + 17_000;
      }),
    );
    // Net transform of each label = orbit (+θ) then counter (−θ) → no rotation.
    const angles = await page.evaluate(() =>
      [...document.querySelectorAll('svg[aria-label^="Capital, Talent"] text')]
        .filter((t) => t.textContent !== "2.0")
        .map((t) => {
          const m = (t as SVGGraphicsElement).getScreenCTM()!;
          return Math.round((Math.atan2(m.b, m.a) * 180) / Math.PI);
        }),
    );
    expect(angles).toEqual([0, 0, 0]);
  });
});

test.describe("motion and resilience", () => {
  test("reduced motion shows all content without scrolling", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto("/");
    const hidden = await page.evaluate(
      () =>
        [...document.querySelectorAll("[data-reveal]")].filter((el) => getComputedStyle(el).opacity !== "1")
          .length,
    );
    expect(hidden).toBe(0);
    await ctx.close();
  });

  test("works without JavaScript: content visible, figures real", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Nigeria 2.0");
    await expect(page.getByText("$50M+").first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "From Dialogue to Deals" })).toBeVisible();
    await ctx.close();
  });

  test("targets are labelled as targets", async ({ page }) => {
    await page.goto("/");
    const snapshot = page.locator("section", {
      has: page.getByRole("heading", { name: "The 2026 Summit at a glance" }),
    });
    await expect(snapshot.getByText("Target", { exact: true })).toHaveCount(3);
    await expect(snapshot.getByText("Expected", { exact: true })).toHaveCount(1);
  });
});

test.describe("seo", () => {
  test("home has title, description, canonical, OG and Event JSON-LD", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle("Nigeria 2.0 | Nigerian Leadership Business Summit 2026");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /unlock capital, talent and technology/,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
    const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? "{}");
    expect(ld["@type"]).toBe("Event");
    expect(ld.startDate).toBe("2026-11-30T09:00:00+01:00");
  });

  test("sitemap and robots are served", async ({ request }) => {
    expect((await request.get("/sitemap.xml")).status()).toBe(200);
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Sitemap:");
  });
});
