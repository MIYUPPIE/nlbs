import { expect, test } from "@playwright/test";

const CENTRAL = "http://localhost:3299";

test.describe("privacy (NDPA)", () => {
  test("every page links the legal pages from the footer", async ({ page }) => {
    await page.goto("/");
    const legal = page.getByRole("navigation", { name: "Legal" });
    for (const [name, href] of [
      ["Privacy Policy", "/privacy/"],
      ["Cookie Policy", "/cookies/"],
      ["Terms of Use", "/terms/"],
      ["Privacy Request", "/privacy/request/"],
    ]) {
      await expect(legal.getByRole("link", { name })).toHaveAttribute(
        "href",
        new RegExp(`^${href.replace(/\/$/, "")}/?$`),
      );
    }
  });

  test("privacy policy names the controller, the DPO and the NDPC, with a working table of contents", async ({
    page,
  }) => {
    await page.goto("/privacy");
    await expect(page.getByRole("heading", { level: 1, name: "Privacy Policy" })).toBeVisible();
    await expect(page.getByText("HBC Professional Consulting Services").first()).toBeVisible();
    await expect(page.locator('a[href="mailto:dpo@ndpc.gov.ng"]')).toBeVisible();
    await expect(page.getByRole("heading", { name: "Automated decisions" })).toBeVisible();
    await page
      .getByRole("navigation", { name: "On this page" })
      .getByRole("link", { name: "Your rights" })
      .click();
    await expect(page).toHaveURL(/#your-rights$/);
    await expect(page.getByRole("heading", { name: "Your rights", exact: true })).toBeInViewport();
  });

  test("cookie policy lists the talent draft, the only thing kept in the browser", async ({ page }) => {
    await page.goto("/cookies");
    await expect(page.getByRole("rowheader", { name: "n2-talent-application-draft" })).toBeVisible();
  });

  test("terms load", async ({ page }) => {
    await page.goto("/terms");
    await expect(page.getByRole("heading", { level: 1, name: "Terms of Use" })).toBeVisible();
    await expect(page.getByText("laws of the Federal Republic of Nigeria")).toBeVisible();
  });

  test("a privacy request reaches the backend with the policy version", async ({ page }) => {
    await page.goto("/privacy/request");
    await page.getByLabel(/Full name/).fill("Ada Obi");
    await page.getByLabel(/Email address/).fill("ada@example.com");
    await page.getByLabel(/What would you like us to do/).selectOption("correction");
    await page.getByRole("button", { name: "Send request" }).click();
    await expect(page.getByText("Tell us a little more so we can act on your request.")).toBeVisible();
    await expect(page.getByText(/confirm the data is about you/).last()).toBeVisible();

    await page.getByLabel(/^Details/).fill("My job title is wrong: I am Chief Operating Officer.");
    await page.getByLabel(/The data is about me/).check();
    await page.getByRole("button", { name: "Send request" }).click();
    const heading = page.getByRole("heading", { name: "Request received" });
    await expect(heading).toBeFocused();

    const sent = await (await page.request.get(`${CENTRAL}/__last/privacy`)).json();
    expect(sent).toMatchObject({
      form: "privacy",
      requestType: "correction",
      email: "ada@example.com",
      confirm: true,
      privacyVersion: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
    });
  });

  test("dietary needs ask for explicit consent before registration is sent", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel(/Full Name/).fill("Ada Obi");
    await page.getByLabel(/Email Address/).fill("ada.consent@example.com");
    await page.getByLabel(/Phone Number/).fill("+234 801 234 5678");
    await page.getByLabel(/^Organisation/).fill("Example Ltd");
    await page.getByLabel(/Job Title/).fill("Managing Director");
    await page.getByLabel(/Sector/).selectOption("Technology & Telecommunications");
    await page.getByLabel(/Delegate Type/).selectOption("Investor");
    await expect(page.getByLabel(/I consent to the summit team/)).toHaveCount(0);
    await page.getByLabel(/Dietary or access needs/).fill("Halal meals");
    await page.getByRole("button", { name: "Request Invitation" }).click();
    await expect(page.getByText(/Tick the box to let us use your dietary or access needs/)).toBeVisible();

    await page.getByLabel(/I consent to the summit team/).check();
    await page.getByRole("button", { name: "Request Invitation" }).click();
    await expect(page.getByRole("heading", { name: "Request received" })).toBeVisible();
    const sent = await (await page.request.get(`${CENTRAL}/__last/registration`)).json();
    expect(sent).toMatchObject({
      accessNeeds: "Halal meals",
      accessNeedsConsent: true,
      privacyVersion: expect.any(String),
    });
  });

  test("forms link the privacy policy where data is collected", async ({ page }) => {
    for (const path of ["/register", "/contact", "/sponsors"]) {
      await page.goto(path);
      await expect(page.locator("form").getByRole("link", { name: "Privacy Policy" }), path).toBeVisible();
    }
  });
});
