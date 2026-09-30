import { expect, test } from "@playwright/test";

const CENTRAL = "http://localhost:3299";

test.describe("registration", () => {
  test("shows inline validation and focuses the first invalid field", async ({ page }) => {
    await page.goto("/register");
    await page.getByRole("button", { name: "Request Invitation" }).click();
    await expect(page.locator("form").getByRole("alert")).toContainText(
      "Please correct the highlighted fields.",
    );
    await expect(page.getByLabel(/Full Name/)).toBeFocused();
    await expect(page.getByLabel(/Full Name/)).toHaveAttribute("aria-invalid", "true");
    await expect(
      page.getByText("Enter a valid email address.").or(page.getByText("Email address is required.")),
    ).toBeVisible();
  });

  test("submits and shows a confirmation with a reference", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel(/Full Name/).fill("Ada Obi");
    await page.getByLabel(/Email Address/).fill("ada@example.com");
    await page.getByLabel(/Phone Number/).fill("+234 801 234 5678");
    await page.getByLabel(/^Organisation/).fill("Example Ltd");
    await page.getByLabel(/Job Title/).fill("Managing Director");
    await page.getByLabel(/Sector/).selectOption("Technology & Telecommunications");
    await page.getByLabel(/Delegate Type/).selectOption("Investor");
    await page.getByRole("button", { name: "Request Invitation" }).click();

    const heading = page.getByRole("heading", { name: "Request received" });
    await expect(heading).toBeVisible();
    await expect(heading).toBeFocused();
    await expect(page.getByText(/^N2-[A-Z2-9]{4}-[A-Z2-9]{4}$/)).toBeVisible();

    // It really went to the central backend, from the browser, with the form name.
    const sent = await (await page.request.get(`${CENTRAL}/__last/registration`)).json();
    expect(sent).toMatchObject({ form: "registration", delegateType: "Investor", email: "ada@example.com" });
  });

  test("preselects the delegate type from ?type=", async ({ page }) => {
    await page.goto("/register?type=Investor");
    await expect(page.getByLabel(/Delegate Type/)).toHaveValue("Investor");
    await page.goto("/register?type=NotAType");
    await expect(page.getByLabel(/Delegate Type/)).toHaveValue("");
  });

  test("surfaces a backend that refuses the site key honestly", async ({ page }) => {
    await page.route("**/api/v1/submissions", (route) =>
      route.fulfill({
        status: 401,
        contentType: "application/json",
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ ok: false, error: "Missing or invalid site key." }),
      }),
    );
    await page.goto("/register");
    await page.getByLabel(/Full Name/).fill("Ada Obi");
    await page.getByLabel(/Email Address/).fill("ada@example.com");
    await page.getByLabel(/Phone Number/).fill("08012345678");
    await page.getByLabel(/^Organisation/).fill("Example Ltd");
    await page.getByLabel(/Job Title/).fill("MD");
    await page.getByLabel(/Sector/).selectOption("Other");
    await page.getByLabel(/Delegate Type/).selectOption("Other");
    await page.getByRole("button", { name: "Request Invitation" }).click();
    await expect(page.locator("form").getByRole("alert")).toContainText("not open yet");
    await expect(page.getByRole("heading", { name: "Request received" })).toHaveCount(0);
  });
});

test.describe("enquiry", () => {
  test("preselects topic and submits", async ({ page }) => {
    await page.goto("/contact?topic=exhibition");
    await expect(page.getByLabel(/Topic/)).toHaveValue("Exhibition");
    await page.getByLabel(/Full Name/).fill("Ada Obi");
    await page.getByLabel(/Email Address/).fill("ada@example.com");
    await page.getByLabel(/Message/).fill("We would like to exhibit our platform.");
    await page.getByRole("button", { name: "Send enquiry" }).click();
    await expect(page.getByRole("heading", { name: "Message received" })).toBeVisible();
  });
});
