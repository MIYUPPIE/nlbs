import { expect, test } from "@playwright/test";

/** The static export served by Apache with public/.htaccess, as on cPanel. */
test.describe("static hosting (Apache + .htaccess)", () => {
  test("generated images and the manifest have the right content types", async ({ request }) => {
    for (const path of ["/icon", "/apple-icon", "/opengraph-image"]) {
      const res = await request.get(path);
      expect(res.status(), path).toBe(200);
      expect(res.headers()["content-type"], path).toBe("image/png");
    }
    expect((await request.get("/manifest.webmanifest")).headers()["content-type"]).toContain(
      "application/manifest+json",
    );
  });

  test("unknown pages get the site's 404 page with a 404 status", async ({ page }) => {
    const res = await page.goto("/no-such-page/");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("folders are never listed", async ({ request }) => {
    const res = await request.get("/_next/static/");
    expect(res.status()).toBe(403);
  });

  test("/apply is a temporary redirect to the portal, /talent/apply a permanent one", async ({ request }) => {
    const apply = await request.get("/apply", { maxRedirects: 0 });
    expect(apply.status()).toBe(302);
    expect(apply.headers().location).toMatch(/\/talentnigeria20\/$/);
    expect((await request.get("/talent/apply", { maxRedirects: 0 })).status()).toBe(301);
  });

  test("pages revalidate while hashed assets are cached for a year", async ({ page, request }) => {
    const res = await page.goto("/");
    expect(res?.headers()["cache-control"]).toContain("must-revalidate");
    const asset = await page.locator('script[src^="/_next/static/"]').first().getAttribute("src");
    const a = await request.get(asset!);
    expect(a.headers()["cache-control"]).toContain("immutable");
  });

  test("security headers are set", async ({ request }) => {
    const h = (await request.get("/")).headers();
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["x-frame-options"]).toBe("SAMEORIGIN");
  });
});
