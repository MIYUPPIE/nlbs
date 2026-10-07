import { expect, test } from "@playwright/test";

// Regression (Oct 2026): FAQ was only in the mobile drawer and the footer.
test.describe("faq in the desktop header", () => {
  for (const width of [1024, 1280, 1440]) {
    test(`is visible, fits and opens the FAQ at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/");
      const nav = page.getByRole("navigation", { name: "Main" });
      const faq = nav.getByRole("link", { name: "FAQ" });
      await expect(faq).toBeVisible();
      const fits = await page.evaluate(() => {
        const header = document.querySelector("header > div")!;
        const boxes = [...header.querySelectorAll("a, button")]
          .filter((el) => (el as HTMLElement).offsetParent && !el.classList.contains("sr-only"))
          .map((el) => el.getBoundingClientRect())
          .filter((r) => r.width > 0);
        const overlap = boxes.some((a, i) =>
          boxes.some(
            (b, j) =>
              i < j && a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom && b.top < a.bottom,
          ),
        );
        const oneRow = new Set(boxes.map((r) => Math.round(r.top + r.height / 2))).size <= 2;
        return { overlap, oneRow, overflow: document.documentElement.scrollWidth > innerWidth };
      });
      expect(fits).toEqual({ overlap: false, oneRow: true, overflow: false });
      await faq.click();
      await expect(page).toHaveURL(/\/faq\/?$/);
      await expect(nav.getByRole("link", { name: "FAQ" })).toHaveAttribute("aria-current", "page");
    });
  }
});

test.describe("faq", () => {
  test("lists all 101 questions in five categories", async ({ page }) => {
    await page.goto("/faq");
    await expect(page.locator("details")).toHaveCount(101);
    await expect(page.getByRole("navigation", { name: "FAQ categories" }).getByRole("link")).toHaveCount(5);
  });

  test("search filters, highlights and reports the count", async ({ page }) => {
    await page.goto("/faq");
    await page.getByLabel("Search the FAQ").fill("dress code");
    await expect(page.locator("details")).toHaveCount(1);
    await expect(page.getByText("1 of 101 questions match")).toBeVisible();
    await expect(page.locator("mark").first()).toHaveText(/dress/i);
    await page.getByLabel("Search the FAQ").fill("qwertyuiop");
    await expect(page.getByText("No matching questions")).toBeVisible();
    await page.getByRole("button", { name: "Clear search" }).first().click();
    await expect(page.locator("details")).toHaveCount(101);
  });

  test("deep link opens the answer", async ({ page }) => {
    await page.goto("/faq#q-79");
    const item = page.locator("#q-79 details");
    await expect(item).toHaveAttribute("open", "");
    await expect(item).toContainText("Business Formal / National.");
  });

  test("expand all and collapse all", async ({ page }) => {
    await page.goto("/faq");
    await page.getByRole("button", { name: "Expand all" }).click();
    await expect(page.locator("details[open]")).toHaveCount(101);
    await page.getByRole("button", { name: "Collapse all" }).click();
    await expect(page.locator("details[open]")).toHaveCount(0);
  });

  test("links URLs and emails in answers", async ({ page }) => {
    await page.goto("/faq#q-98");
    await expect(
      page.locator("#q-98").getByRole("link", { name: "ethicsnigeria20@nlbs.com.ng" }),
    ).toHaveAttribute("href", "mailto:ethicsnigeria20@nlbs.com.ng");
  });

  test("publishes FAQPage structured data for every question", async ({ page }) => {
    await page.goto("/faq");
    const ld = JSON.parse(
      (await page.locator('script[type="application/ld+json"]').first().textContent()) ?? "{}",
    );
    expect(ld["@type"]).toBe("FAQPage");
    expect(ld.mainEntity).toHaveLength(101);
  });

  test("works without JavaScript (native accordion)", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto("/faq");
    await page.getByText("What is dress code?").click();
    await expect(page.getByText("Business Formal / National.")).toBeVisible();
    await ctx.close();
  });

  test("homepage teaser links to the full FAQ", async ({ page }) => {
    await page.goto("/");
    const teaser = page.locator("#faq");
    await expect(teaser.locator("details")).toHaveCount(6);
    await teaser.getByRole("link", { name: "View all 101 questions" }).click();
    await expect(page).toHaveURL(/\/faq\/?$/);
  });
});
