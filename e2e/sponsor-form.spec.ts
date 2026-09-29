import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const LINK = "/sponsor/e2e-private-sponsor-link-token-0001";

test.describe("private sponsor form", () => {
  test("a wrong or missing token is a 404", async ({ page }) => {
    for (const path of ["/sponsor/guess", "/sponsor/e2e-private-sponsor-link-token-0002", "/sponsor"]) {
      const res = await page.goto(path);
      expect(res?.status(), path).toBe(404);
    }
  });

  test("the private link is hidden from search engines and leaks no referrer", async ({ page }) => {
    const res = await page.goto(LINK);
    expect(res?.status()).toBe(200);
    expect(res?.headers()["x-robots-tag"]).toContain("noindex");
    expect(res?.headers()["referrer-policy"]).toBe("no-referrer");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    const sitemap = await page.request.get("/sitemap.xml");
    expect(await sitemap.text()).not.toContain("/sponsor");
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
