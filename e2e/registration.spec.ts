import { expect, test, type Page } from "@playwright/test";
import { stubPaystack } from "./helpers";

const CENTRAL = "http://localhost:3299";

async function fillDetails(page: Page, email: string) {
  await page.getByLabel(/Full Name/).fill("Ada Obi");
  await page.getByLabel(/Email Address/).fill(email);
  await page.getByLabel(/Phone Number/).fill("+234 801 234 5678");
  await page.getByLabel(/^Organisation/).fill("Example Ltd");
  await page.getByLabel(/Job Title/).fill("Managing Director");
  await page.getByLabel(/Sector/).selectOption("Technology & Telecommunications");
  await page.getByLabel(/Delegate Type/).selectOption("Investor");
}

/** Step 1 -> step 2 (the payment page). */
async function toPayment(page: Page) {
  await page.getByRole("button", { name: "Next: payment" }).click();
  await expect(page.getByTestId("step-payment")).toBeVisible();
}

test.describe("registration with delegate classes", () => {
  test("asks for a class first and shows inline validation", async ({ page }) => {
    await page.goto("/register");
    await page.getByRole("button", { name: "Choose your class to continue" }).click();
    await expect(page.locator("form").getByRole("alert").first()).toContainText(
      "Please correct the highlighted fields.",
    );
    await expect(page.locator("#f-tier-error")).toHaveText("Choose your class.");
    await expect(page.getByRole("radio", { name: "VIP" })).toBeFocused();
    await expect(
      page.getByText("Enter a valid email address.").or(page.getByText("Email address is required.")),
    ).toBeVisible();
  });

  test("shows the four classes without prices, Basic full, and the price after choosing", async ({
    page,
  }) => {
    await page.goto("/register");
    for (const cls of ["vip", "executive", "business", "standard", "basic"]) {
      await expect(page.getByTestId(`class-${cls}`)).not.toContainText("₦");
    }
    await expect(page.getByTestId("order-total")).toHaveCount(0);
    await expect(page.getByTestId("step-label")).toHaveText("Step 1 of 2");
    await expect(page.getByTestId("class-basic")).toContainText("Full");
    await expect(page.getByRole("radio", { name: "Basic Entry Level" })).toBeDisabled();

    await page.getByRole("radio", { name: "Executive Class" }).check();
    // Still no price on step 1, even with a class chosen.
    await expect(page.getByTestId("order-total")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Next: payment" })).toBeVisible();
    await expect(page.locator("form")).not.toContainText("₦");

    await fillDetails(page, "step@example.com");
    await toPayment(page);
    await expect(page.getByTestId("step-label")).toHaveText("Step 2 of 2");
    await expect(page.getByTestId("order-total")).toContainText("Executive Class seat");
    await expect(page.getByTestId("order-total")).toContainText("Secure payment by Paystack");
    await expect(page.getByTestId("order-total")).toContainText("₦200,000");
    await expect(page.getByTestId("refund-rule")).toContainText(
      "Seats are not refundable, but you can transfer yours",
    );
    await expect(page.getByRole("button", { name: "Continue to payment · ₦200,000" })).toBeVisible();

    // Back keeps what was typed and the class.
    await page.getByRole("button", { name: "Back" }).click();
    await expect(page.getByTestId("step-payment")).toHaveCount(0);
    await expect(page.getByRole("radio", { name: "Executive Class" })).toBeChecked();
    await expect(page.getByLabel(/Email Address/)).toHaveValue("step@example.com");
  });

  test("a class the backend says is full cannot be picked", async ({ page }) => {
    await page.route("**/api/v1/nlbs/classes", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({
          ok: true,
          classes: [
            { key: "vip", left: 0, open: false },
            { key: "executive", left: 9, open: true },
          ],
        }),
      }),
    );
    await page.goto("/register");
    await expect(page.getByTestId("class-vip")).toContainText("Full");
    await expect(page.getByRole("radio", { name: "VIP" })).toBeDisabled();
    await expect(page.getByRole("radio", { name: "Executive Class" })).toBeEnabled();
  });

  test("registers and goes straight to Paystack for the class price", async ({ page }) => {
    await stubPaystack(page);
    await page.goto("/register?class=vip");
    await expect(page.getByRole("radio", { name: "VIP" })).toBeChecked();
    await fillDetails(page, "ada@example.com");
    await toPayment(page);
    await page.getByRole("button", { name: "Continue to payment · ₦250,000" }).click();
    await expect(page).toHaveURL(/^https:\/\/checkout\.paystack\.com\/n2-[a-z2-9]{4}-[a-z2-9]{4}-p1$/);

    const sent = await (
      await page.request.get(`${CENTRAL}/__last/registration?email=ada@example.com`)
    ).json();
    expect(sent).toMatchObject({
      form: "registration",
      tier: "vip",
      delegateType: "Investor",
      email: "ada@example.com",
    });
    expect(sent).not.toHaveProperty("amount");
  });

  test("when checkout cannot open, the registration is kept with a pay-later link and the book offer", async ({
    page,
  }) => {
    await page.route("**/api/v1/submissions", (route) =>
      route.fulfill({
        status: 201,
        contentType: "application/json",
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({
          ok: true,
          reference: "N2-SAVE-D001",
          payment: null,
          paymentError: "Standard is full. Please contact us to change your class.",
          payUrl: "https://api.example.test/pay/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        }),
      }),
    );
    await page.goto("/register");
    await page.getByRole("radio", { name: "Standard" }).check();
    await fillDetails(page, "later@example.com");
    await toPayment(page);
    await page.getByRole("button", { name: "Continue to payment · ₦100,000" }).click();

    const heading = page.getByRole("heading", { name: "Registration saved. One step left." });
    await expect(heading).toBeVisible();
    await expect(heading).toBeFocused();
    await expect(page.getByText("Standard is full")).toBeVisible();
    await expect(page.getByText("N2-SAVE-D001")).toBeVisible();
    await expect(page.getByRole("link", { name: "Pay ₦100,000 now" })).toHaveAttribute(
      "href",
      "https://api.example.test/pay/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    );
    const offer = page.getByTestId("book-offer");
    await expect(offer.getByRole("heading", { name: "Advising The Founder" })).toBeVisible();
    await expect(offer.getByRole("img", { name: /Front cover of Advising The Founder/ })).toBeVisible();
    await expect(offer.getByRole("link", { name: "Pre-order the book" })).toHaveAttribute(
      "href",
      "https://advisingthefounder.com/preorder/?utm_source=nlbs&utm_medium=referral&utm_campaign=registration_received",
    );
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
    await page.getByRole("radio", { name: "Business Class" }).check();
    await fillDetails(page, "ada@example.com");
    await toPayment(page);
    await page.getByRole("button", { name: /Continue to payment/ }).click();
    await expect(page.locator("form").getByRole("alert")).toContainText("not open yet");
    await expect(page.getByRole("heading", { name: "Taking you to payment" })).toHaveCount(0);
  });
});

test.describe("old seat payment page", () => {
  test("its address goes to registration", async ({ page }) => {
    await page.goto("/register/pay/?ref=N2-AB12-CD34");
    await expect(page).toHaveURL(/\/register\/?(\?.*)?$/);
    await expect(page.getByRole("radiogroup", { name: "Delegate class" })).toBeVisible();
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
