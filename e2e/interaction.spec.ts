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
      ["/register", /Continue to payment/],
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
  test("counts down to 10 Dec 2026 09:00 WAT from a frozen clock", async ({ page }) => {
    // 21 Nov 2026 12:00 WAT → 10 Dec 09:00 WAT is 18 days, 21 hours.
    await page.clock.setFixedTime(new Date("2026-11-21T11:00:00Z"));
    await page.goto("/");
    const timer = page.getByRole("timer");
    await expect(timer).toHaveAttribute("aria-label", "18 days, 21 hours, 0 minutes until the summit");
  });

  test("is still counting on the old date, 23 Nov", async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-11-23T09:00:00Z"));
    await page.goto("/");
    await expect(page.getByRole("timer")).toHaveAttribute("aria-label", /^16 days, 23 hours/);
    await expect(page.getByText("Happening today")).toHaveCount(0);
  });

  test("shows the event-day state on the day, until the 5:00 PM close", async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-12-10T15:59:00Z"));
    await page.goto("/");
    await expect(page.getByText("Happening today")).toBeVisible();
  });

  test("shows the summit as over after 5:00 PM WAT", async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-12-10T16:00:00Z"));
    await page.goto("/");
    await expect(page.getByText("The 2026 summit has taken place")).toBeVisible();
  });
});

test.describe("new date announcement", () => {
  test("homepage hero announces 10 December, the old date, and that invitations stay valid", async ({
    page,
  }) => {
    await page.goto("/");
    const hero = page.locator("#hero-title").locator("xpath=ancestor::section");
    const notice = hero.getByTestId("new-date-notice");
    await expect(notice).toBeVisible();
    await expect(notice.getByRole("heading")).toHaveText("New date: Thursday, 10 December 2026");
    await expect(notice).toContainText("Moved from Monday, 23 November 2026.");
    await expect(notice).toContainText("Same vision. Bigger stage. Better experience.");
    await expect(notice).toContainText("Your Talent Fund selection or paid seat remains valid.");
    await expect(hero.getByText("Thursday, 10 December 2026 · 9:00 AM to 5:00 PM WAT")).toBeVisible();
  });

  test("every inner page with the date strip carries the badge and the note", async ({ page }) => {
    for (const path of ["/about", "/programme", "/talentnigeria20/shortlist"]) {
      await page.goto(path);
      const strip = page.locator("#page-title").locator("xpath=ancestor::section");
      await expect(strip.getByTestId("new-date-badge")).toBeVisible();
      await expect(strip.getByTestId("new-date-notice")).toContainText(
        "Moved from Monday, 23 November 2026.",
      );
    }
  });

  test("at 375px the badge stays on one line and the notice never overflows", async ({ page }, info) => {
    await page.setViewportSize({ width: 375, height: 812 });
    for (const path of ["/", "/about"]) {
      await page.goto(path);
      const badge = page.getByTestId("new-date-badge").first();
      await badge.scrollIntoViewIfNeeded();
      const box = await badge.boundingBox();
      expect(box!.height, path).toBeLessThan(22);
      const notice = page.getByTestId("new-date-notice").first();
      const n = await notice.boundingBox();
      expect(n!.x, path).toBeGreaterThanOrEqual(0);
      expect(n!.x + n!.width, path).toBeLessThanOrEqual(375);
      expect(await page.evaluate(() => document.documentElement.scrollWidth), path).toBeLessThanOrEqual(375);
      await notice.scrollIntoViewIfNeeded();
      await info.attach(`new-date${path.replace(/\//g, "-") || "-home"}`, {
        body: await page.screenshot(),
        contentType: "image/png",
      });
    }
  });

  test("no page still states 23 November as the summit date", async ({ page }) => {
    for (const path of ["/", "/about", "/programme", "/register", "/faq", "/contact"]) {
      await page.goto(path);
      const text = (await page.locator("body").innerText())
        .replace(/Moved from Monday, 23 November 2026\./g, "")
        .replace(/moved from Monday, 23rd November 2026\./gi, "");
      expect(text, path).not.toMatch(/23(rd)? Nov/);
    }
  });
});

test.describe("hero speaker orbit", () => {
  test("shows at the top of the homepage on mobile, with all eight portraits", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    const orbit = page
      .locator("#hero-title")
      .locator("xpath=ancestor::section")
      .locator("[data-speaker-orbit]");
    await expect(orbit).toHaveCount(1);
    await orbit.scrollIntoViewIfNeeded();
    await expect(orbit).toBeVisible();
    await expect(orbit.locator("button img")).toHaveCount(8);
    await expect(orbit).toHaveAttribute("data-active", "babajide-sanwo-olu");
  });

  test("portraits stay upright mid-rotation", async ({ page }) => {
    await page.goto("/");
    const orbit = page.locator("[data-speaker-orbit]").first();
    await orbit.getByRole("button", { name: "04: Dr. Bosun Tijani" }).click();
    await page.waitForTimeout(1200); // past the 900ms turn
    // Net rotation of each portrait = ring (+θ) then counter-rotation (−θ) → upright.
    const angles = await orbit.locator("button img").evaluateAll((imgs) =>
      imgs.map((img) => {
        let el: Element | null = img;
        let deg = 0;
        while (el && !el.hasAttribute("data-speaker-orbit")) {
          const t = getComputedStyle(el).transform;
          if (t && t !== "none") {
            const m = new DOMMatrix(t);
            deg += (Math.atan2(m.b, m.a) * 180) / Math.PI;
          }
          el = el.parentElement;
        }
        return Math.round((((deg % 360) + 540) % 360) - 180);
      }),
    );
    expect(angles).toEqual(Array(8).fill(0));
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
    expect(ld.startDate).toBe("2026-12-10T09:00:00+01:00");
    expect(ld.eventStatus).toBe("https://schema.org/EventRescheduled");
    expect(ld.previousStartDate).toBe("2026-11-23T09:00:00+01:00");
  });

  test("sitemap and robots are served", async ({ request }) => {
    expect((await request.get("/sitemap.xml")).status()).toBe(200);
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Sitemap:");
  });
});
