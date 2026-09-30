import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { ROUTES } from "./helpers";

const LINK = "/sponsors";

test.describe("unlisted sponsor form", () => {
  test("is always available but hidden from search engines", async ({ page }) => {
    const res = await page.goto(LINK);
    expect(res?.status()).toBe(200);
    expect(res?.headers()["x-robots-tag"]).toContain("noindex");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    const sitemap = await page.request.get("/sitemap.xml");
    expect(await sitemap.text()).not.toContain("/sponsors");
  });

  test("no page on the site links to it", async ({ page }) => {
    for (const route of ROUTES) {
      await page.goto(route);
      await expect(page.locator('a[href*="/sponsors"]'), route).toHaveCount(0);
    }
  });

  test("switching track clears the tier and shows that track's tiers", async ({ page }) => {
    await page.goto(LINK);
    const tier = page.getByLabel(/^Tier/);
    await tier.selectOption("Diamond");
    await expect(page.getByLabel(/Category exclusivity/)).toBeVisible();
    await page.getByLabel(/Partnership track/).selectOption("Founding Stakeholder");
    await expect(page.getByLabel(/Partnership track/)).toHaveValue("Founding Stakeholder");
    await expect(tier).toHaveValue("");
    await expect(tier.locator("option")).toHaveText(["Select a tier", "Platinum", "Gold", "Silver"]);
  });

  test("submits a complete package request", async ({ page }) => {
    await page.goto(LINK);
    await page.getByRole("button", { name: "Request this package" }).click();
    await expect(page.locator("form").getByRole("alert")).toContainText("correct the highlighted fields");

    await page.getByLabel(/^Tier/).selectOption("Gold");
    await page.getByLabel(/Company name/).fill("Example Telecoms Ltd");
    await page.getByLabel(/^Industry/).selectOption("Technology & Telecommunications");
    await page.getByLabel(/Billing name and address/).fill("Example Telecoms Ltd, 1 Marina, Lagos");
    await page.getByLabel(/Full name/).fill("Ada Obi");
    await page.getByLabel(/Job title/).fill("Brand Director");
    await page.getByLabel(/Email address/).fill("ada@example.com");
    await page.getByLabel(/Phone number/).fill("+234 801 234 5678");
    await page.getByLabel(/Names and emails/).fill("Ada Obi, ada@example.com");
    await page.getByLabel(/does not reserve a slot/).check();
    await page.getByRole("button", { name: "Request this package" }).click();

    const heading = page.getByRole("heading", { name: "Package request received" });
    await expect(heading).toBeVisible();
    await expect(heading).toBeFocused();
    await expect(page.getByText(/^N2-[A-Z2-9]{4}-[A-Z2-9]{4}$/)).toBeVisible();

    const sent = await (await page.request.get("http://localhost:3299/__last/sponsor")).json();
    expect(sent).toMatchObject({
      form: "sponsor",
      tier: "Gold",
      passHolders: [{ name: "Ada Obi", email: "ada@example.com" }],
      passAllowance: 6,
    });
    expect(sent.acknowledge).toBeUndefined();
  });

  for (const width of [1440, 390]) {
    test(`axe @${width}px: no serious or critical violations`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(LINK, { waitUntil: "networkidle" });
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
      expect(results.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
    });
  }
});
