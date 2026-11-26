import { readFileSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
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
    await expect(page).toHaveURL(/\/contact\/?\?topic=sponsorship/);
    await expect(page.getByLabel(/Topic/)).toHaveValue("Sponsorship");
  });
});

test.describe("speakers and flyer partners", () => {
  const loaded = (img: import("@playwright/test").Locator) =>
    img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0);

  test("speakers page shows all eight portraits, Chief Host first, with profiles", async ({ page }) => {
    await page.goto("/speakers");
    const cards = page.locator("#speaker-list [data-speaker]");
    await expect(cards).toHaveCount(8);
    await expect(cards.first()).toContainText("Chief Host");
    await expect(cards.first()).toContainText("Babajide Sanwo-Olu");
    for (const card of await cards.all()) {
      const img = card.locator("img");
      await img.scrollIntoViewIfNeeded();
      await expect.poll(() => loaded(img)).toBe(true);
    }
    // Every speaker also has a full in-page profile (the no-JS fallback).
    await expect(page.locator("#profiles article")).toHaveCount(8);
    await expect(page.locator("#profile-samson-ajayi")).toContainText("Robert Bosch Nigeria");
    await expect(page.locator("#profile-seye-olurotimi")).toContainText("MSME Africa");
    await expect(page.locator("#profile-taiwo-oyedele")).toContainText("Sources");
  });

  test("homepage orbit: click a dot, read the caption", async ({ page }) => {
    await page.goto("/");
    const orbit = page.locator("#speakers [data-speaker-orbit]");
    await orbit.scrollIntoViewIfNeeded();
    await expect(orbit).toHaveAttribute("data-active", "babajide-sanwo-olu");
    await expect(orbit).toContainText("Executive Governor of Lagos State");
    await orbit.getByRole("button", { name: "08: Dr. Seye Olurotimi" }).click();
    await expect(orbit).toHaveAttribute("data-active", "seye-olurotimi");
    await expect(orbit).toContainText("MSME Africa");
  });

  test("partners page shows the five flyer partners' logos", async ({ page }) => {
    await page.goto("/partners");
    for (const name of [
      "Keystone Bank",
      "Dmax Media",
      "allevents.ng",
      "TA Media Communications",
      "Praxis Medical Nigeria",
    ]) {
      const img = page.locator("#partners").getByRole("img", { name, exact: true });
      await img.scrollIntoViewIfNeeded();
      await expect.poll(() => loaded(img)).toBe(true);
    }
  });

  for (const route of ["/", "/partners"]) {
    test(`${route} partners section has exactly the five logos and no placeholder categories`, async ({
      page,
    }) => {
      await page.goto(route);
      const section = page.locator("#partners");
      await expect(section.locator("ul").first().locator("li img")).toHaveCount(5);
      await expect(section).not.toContainText("Partner to be announced");
      await expect(section).not.toContainText(/Strategic Partners|Government Partners|Media Partners/);
    });
  }
});

test.describe("reduced motion", () => {
  // Regression: motion's useReducedMotion caused hydration error #418 on every page.
  for (const route of ["/", "/about", "/partners", "/speakers"]) {
    test(`${route} hydrates without errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      expect(errors).toEqual([]);
    });
  }
});

test.describe("speaker orbit", () => {
  const orbit = (page: import("@playwright/test").Page) => page.locator("#speakers [data-speaker-orbit]");

  test("autoplays every 5s while on screen", async ({ page }) => {
    await page.clock.install();
    await page.goto("/");
    await orbit(page).scrollIntoViewIfNeeded();
    await page.mouse.move(0, 0); // not hovering the orbit
    await expect(orbit(page)).toHaveAttribute("data-active", "babajide-sanwo-olu");
    await page.clock.runFor(5100);
    await expect(orbit(page)).toHaveAttribute("data-active", "taiwo-oyedele");
    await page.clock.runFor(5100);
    await expect(orbit(page)).toHaveAttribute("data-active", "samson-ajayi");
  });

  test("the pause button stops it", async ({ page }) => {
    await page.clock.install();
    await page.goto("/");
    await orbit(page).scrollIntoViewIfNeeded();
    await orbit(page).getByRole("button", { name: "Pause speaker rotation" }).click();
    await page.mouse.move(0, 0);
    await page.clock.runFor(16000);
    await expect(orbit(page)).toHaveAttribute("data-active", "babajide-sanwo-olu");
    await expect(orbit(page).getByRole("button", { name: "Play speaker rotation" })).toBeVisible();
  });

  test("reduced motion starts paused", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.clock.install();
    await page.goto("/");
    await orbit(page).scrollIntoViewIfNeeded();
    await page.mouse.move(0, 0);
    await expect(orbit(page).getByRole("button", { name: "Play speaker rotation" })).toBeVisible();
    await page.clock.runFor(16000);
    await expect(orbit(page)).toHaveAttribute("data-active", "babajide-sanwo-olu");
  });

  test("dots work from the keyboard, wrapping both ways", async ({ page }) => {
    await page.goto("/");
    const first = orbit(page).getByRole("button", { name: "01: Babajide Sanwo-Olu" });
    await first.focus();
    await page.keyboard.press("ArrowRight");
    await expect(orbit(page)).toHaveAttribute("data-active", "taiwo-oyedele");
    await expect(orbit(page).getByRole("button", { name: "02: Taiwo Oyedele" })).toBeFocused();
    await page.keyboard.press("End");
    await expect(orbit(page)).toHaveAttribute("data-active", "seye-olurotimi");
    await page.keyboard.press("ArrowRight");
    await expect(orbit(page)).toHaveAttribute("data-active", "babajide-sanwo-olu");
    await page.keyboard.press("ArrowLeft");
    await expect(orbit(page)).toHaveAttribute("data-active", "seye-olurotimi");
  });

  test("every portrait loads", async ({ page }) => {
    await page.goto("/");
    await orbit(page).scrollIntoViewIfNeeded();
    const imgs = orbit(page).locator("button img");
    await expect(imgs).toHaveCount(8);
    for (const img of await imgs.all()) {
      await expect
        .poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0))
        .toBe(true);
    }
  });
});

test.describe("speaker profile modals", () => {
  const dialog = (page: import("@playwright/test").Page, id: string) => page.locator(`#speaker-dialog-${id}`);

  test("opens from the orbit, traps focus, closes on Escape and returns focus", async ({ page }) => {
    await page.goto("/");
    const orbit = page.locator("#speakers [data-speaker-orbit]");
    await orbit.scrollIntoViewIfNeeded();
    await orbit.getByRole("button", { name: "02: Taiwo Oyedele" }).click();
    const trigger = orbit.getByRole("link", { name: "View profile: Taiwo Oyedele" });
    await trigger.click();
    const d = dialog(page, "taiwo-oyedele");
    await expect(d).toBeVisible();
    await expect(page).toHaveURL(/\/$/); // the modal opened instead of navigating
    await expect(d.getByRole("heading", { level: 2, name: "Taiwo Oyedele" })).toBeVisible();
    await expect(d).toContainText("Coordinating Minister of the Economy");
    await expect(d.getByRole("link", { name: /Wikipedia/ })).toHaveAttribute("href", /^https:\/\//);
    // Focus starts on the close button, so the profile opens scrolled to the top.
    await expect(d.getByRole("button", { name: "Close profile of Taiwo Oyedele" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(d).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("opens from a speaker card and closes with the close button", async ({ page }) => {
    await page.goto("/speakers");
    await page.locator('#speaker-list [data-speaker="jumoke-oduwole"]').click();
    const d = dialog(page, "jumoke-oduwole");
    await expect(d).toBeVisible();
    await expect(d).toContainText("Stanford Law School");
    await expect(d.getByRole("heading", { level: 2 })).toBeInViewport();
    await d.getByRole("button", { name: "Close profile of Dr. Jumoke Oduwole" }).click();
    await expect(d).toBeHidden();
  });

  test("on mobile the modal opens at the top with the close button in view", async ({ page }) => {
    // Regression: the browser focused the first source link and opened the modal scrolled to the end.
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/speakers");
    await page.locator('#speaker-list [data-speaker="taiwo-oyedele"]').click();
    const d = dialog(page, "taiwo-oyedele");
    await expect(d.getByRole("button", { name: "Close profile of Taiwo Oyedele" })).toBeInViewport();
    await expect(d.getByRole("heading", { level: 2 })).toBeInViewport();
    await expect(d.getByRole("img", { name: "Portrait of Taiwo Oyedele" })).toBeInViewport();
  });

  test("closes on a backdrop click and locks page scroll while open", async ({ page }) => {
    await page.goto("/speakers");
    await page.locator('#speaker-list [data-speaker="seye-olurotimi"]').click();
    const d = dialog(page, "seye-olurotimi");
    await expect(d).toBeVisible();
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe("hidden");
    await page.mouse.click(5, 5); // backdrop
    await expect(d).toBeHidden();
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).not.toBe("hidden");
  });

  test("clicking the active portrait in the hero orbit opens that profile", async ({ page }) => {
    await page.goto("/");
    const hero = page.locator("section[aria-labelledby='hero-title'] [data-speaker-orbit]");
    await hero.locator("button img").first().click({ force: true }); // speaker 0 is active
    await expect(dialog(page, "babajide-sanwo-olu")).toBeVisible();
    await expect(dialog(page, "babajide-sanwo-olu")).toContainText("University of Lagos");
  });

  test("an open modal has no serious accessibility violations", async ({ page }) => {
    await page.goto("/speakers");
    await page.locator('#speaker-list [data-speaker="olayemi-cardoso"]').click();
    await expect(dialog(page, "olayemi-cardoso")).toBeVisible();
    const results = await new AxeBuilder({ page })
      .include("#speaker-dialog-olayemi-cardoso")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(results.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
  });
});

test.describe("speaker profiles without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("a profile link goes to the in-page profile on /speakers", async ({ page }) => {
    await page.goto("/");
    await page.locator("#speakers").getByRole("link", { name: "View profile: Babajide Sanwo-Olu" }).click();
    await expect(page).toHaveURL(/\/speakers\/#profile-babajide-sanwo-olu$/);
    await expect(page.locator("#profile-babajide-sanwo-olu")).toContainText(
      "Lagos State Development and Property Corporation",
    );
  });
});

test.describe("register page", () => {
  test("explains the price, the entry routes, the timeline and arrival", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByRole("heading", { level: 1, name: "Secure your seat" })).toBeVisible();
    await expect(page.getByText("800 seats · ₦15,000 per delegate")).toBeVisible();
    await expect(page.getByRole("link", { name: "Pay for your seat with your reference" })).toBeVisible();
    for (const c of ["Corporate C-Suite", "Investors, DFIs & Tech", "Media"]) {
      await expect(page.getByRole("heading", { name: c })).toBeVisible();
    }
    await expect(page.getByText("When you pay", { exact: true })).toBeVisible();
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

  test("the convener card shows the HBC logo, loaded", async ({ page }) => {
    await page.goto("/about");
    const logo = page.locator('main img[alt="HBC Business Help"]');
    await logo.scrollIntoViewIfNeeded();
    await expect(logo).toBeVisible();
    // Lazy image: poll, a single read can land before the request finishes under load.
    await expect
      .poll(() => logo.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0))
      .toBe(true);
  });
});

test("no page offers a document download", async ({ page }) => {
  for (const route of ROUTES) {
    await page.goto(route);
    await expect(page.locator("a[download], a[href$='.pdf'], a[href*='/downloads/']"), route).toHaveCount(0);
  }
});

test.describe("venue photos", () => {
  for (const [path, ids] of [
    [
      "/",
      [
        "lagos-victoria-island-aerial",
        "lagos-business-district",
        "room-lagos-auditorium",
        "room-wcn-panel",
        "room-ysan-delegates",
        "room-edo-entrepreneurs",
        "room-wcn-session",
      ],
    ],
    ["/about", ["venue-eko-hotels", "venue-eko-night", "lagos-business-district"]],
    ["/contact", ["venue-eko-night"]],
  ] as const) {
    test(`${path} shows real photos, loaded and without captions`, async ({ page }) => {
      await page.goto(path);
      for (const id of ids) {
        const img = page.locator(`img[src*="/photos/${id}.webp"]`).first();
        await img.scrollIntoViewIfNeeded();
        await expect(img).toHaveJSProperty("complete", true);
        expect(await img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
        await expect(page.locator(`[data-photo-credit="${id}"]`)).toHaveCount(0);
      }
    });
  }
});

test("/credits credits every photo with author, licence and source", async ({ page }) => {
  await page.goto("/credits");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("photographers");
  const { photos } = JSON.parse(readFileSync("src/data/photos.generated.json", "utf8")) as {
    photos: { id: string; licence: string }[];
  };
  await expect(page.locator("[data-photo-credit]")).toHaveCount(photos.length);
  for (const p of photos) {
    const credit = page.locator(`[data-photo-credit="${p.id}"]`);
    await expect(credit).toContainText("Wikimedia Commons");
    if (p.licence.startsWith("CC BY"))
      await expect(credit.getByRole("link", { name: p.licence })).toHaveAttribute(
        "href",
        /creativecommons\.org/,
      );
    else await expect(credit).toContainText(p.licence);
  }
  await page.goto("/");
  await expect(
    page.getByRole("navigation", { name: "Legal" }).getByRole("link", { name: "Photo Credits" }),
  ).toBeVisible();
});

test.describe("technology illustration", () => {
  for (const path of ["/", "/technology", "/exhibition"]) {
    test(`${path} shows the AI-generated technology banner`, async ({ page }) => {
      await page.goto(path);
      const img = page.locator('#technology [data-ai-generated="true"] img');
      await img.scrollIntoViewIfNeeded();
      await expect(img).toHaveJSProperty("complete", true);
      expect(await img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
      await expect(img).toHaveAttribute("alt", /^AI-generated illustration: /);
    });
  }

  test("/credits discloses it as AI-generated", async ({ page }) => {
    await page.goto("/credits");
    await expect(page.getByRole("heading", { name: "AI-generated illustrations" })).toBeVisible();
    await expect(page.locator('#technology-productivity[data-ai-generated="true"]')).toContainText(
      "AI-generated with",
    );
  });
});

test("every homepage section image loads, and AI ones are disclosed in alt text", async ({ page }) => {
  await page.goto("/");
  const frames = page.locator("[data-section-image]");
  expect(await frames.count()).toBeGreaterThanOrEqual(11);
  for (const frame of await frames.all()) {
    const img = frame.locator("img");
    await img.scrollIntoViewIfNeeded();
    await expect(img).toHaveJSProperty("complete", true);
    expect(await img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
    if ((await frame.getAttribute("data-ai-generated")) === "true") {
      await expect(img).toHaveAttribute("alt", /^AI-generated illustration: /);
    }
  }
  await expect(page.locator("main")).not.toContainText("not from Nigeria 2.0");
});
