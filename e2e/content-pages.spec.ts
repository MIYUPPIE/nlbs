import { readFileSync } from "node:fs";
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

test.describe("register page", () => {
  test("explains the invitation routes, the timeline and arrival", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByRole("heading", { level: 1, name: "Request your invitation" })).toBeVisible();
    for (const c of ["Corporate C-Suite", "Investors, DFIs & Tech", "Media"]) {
      await expect(page.getByRole("heading", { name: c })).toBeVisible();
    }
    await expect(page.getByText("21 days before")).toBeVisible();
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
