import { expect, test, type Page } from "@playwright/test";
import { stubPaystack } from "./helpers";

const CENTRAL = "http://localhost:3299";

test.describe("registration", () => {
  test("shows inline validation and focuses the first invalid field", async ({ page }) => {
    await page.goto("/register");
    await page.getByRole("button", { name: /Continue to payment/ }).click();
    await expect(page.locator("form").getByRole("alert")).toContainText(
      "Please correct the highlighted fields.",
    );
    await expect(page.getByLabel(/Full Name/)).toBeFocused();
    await expect(page.getByLabel(/Full Name/)).toHaveAttribute("aria-invalid", "true");
    await expect(
      page.getByText("Enter a valid email address.").or(page.getByText("Email address is required.")),
    ).toBeVisible();
  });

  test("one seat: registers, then goes straight to Paystack for ₦15,000", async ({ page }) => {
    await stubPaystack(page);
    await page.goto("/register");
    await page.getByLabel(/Full Name/).fill("Ada Obi");
    await page.getByLabel(/Email Address/).fill("ada@example.com");
    await page.getByLabel(/Phone Number/).fill("+234 801 234 5678");
    await page.getByLabel(/^Organisation/).fill("Example Ltd");
    await page.getByLabel(/Job Title/).fill("Managing Director");
    await page.getByLabel(/Sector/).selectOption("Technology & Telecommunications");
    await page.getByLabel(/Delegate Type/).selectOption("Investor");
    await expect(page.getByTestId("order-total")).toContainText("₦15,000");
    await expect(page.getByTestId("refund-rule")).toContainText(
      "Seats are not refundable, but you can transfer yours",
    );
    await expect(page.getByTestId("refund-rule").getByRole("link", { name: "Terms" })).toHaveAttribute(
      "href",
      /\/terms\/?#registration$/,
    );
    await page.getByRole("button", { name: "Continue to payment · ₦15,000" }).click();

    await expect(page).toHaveURL(/^https:\/\/checkout\.paystack\.com\/n2-[a-z2-9]{4}-[a-z2-9]{4}-p1$/);

    // It really went to the central backend, from the browser, with the form name and no price.
    const sent = await (
      await page.request.get(`${CENTRAL}/__last/registration?email=ada@example.com`)
    ).json();
    expect(sent).toMatchObject({
      form: "registration",
      delegateType: "Investor",
      email: "ada@example.com",
      guests: [],
    });
    expect(sent).not.toHaveProperty("amount");
    expect(sent).not.toHaveProperty("seats");
  });

  test("a team of three: one order, one payment, each guest named", async ({ page }) => {
    await stubPaystack(page);
    await fillYou(page, "lead@example.com");
    await page.getByRole("button", { name: "One seat more" }).click();
    await page.getByRole("button", { name: "One seat more" }).click();
    await expect(page.getByTestId("seat-count")).toHaveText("3");
    await expect(page.getByTestId("order-total")).toContainText("₦45,000");

    // Guests are required, and need their own emails.
    await page.getByRole("button", { name: "Continue to payment · ₦45,000" }).click();
    await expect(page.getByText("Enter guest 1's full name.")).toBeVisible();
    await page.getByLabel(/Guest 1 full name/).fill("Ifeoma Nwosu");
    await page.getByLabel(/Guest 1 email/).fill("lead@example.com");
    await page.getByLabel(/Guest 2 full name/).fill("Bayo Lawal");
    await page.getByLabel(/Guest 2 email/).fill("bayo@example.com");
    await page.getByRole("button", { name: "Continue to payment · ₦45,000" }).click();
    await expect(page.getByText("Each person needs their own email address.")).toBeVisible();
    await page.getByLabel(/Guest 1 email/).fill("ifeoma@example.com");
    await page.getByRole("button", { name: "Continue to payment · ₦45,000" }).click();

    await expect(page).toHaveURL(/^https:\/\/checkout\.paystack\.com\//);
    const sent = await (
      await page.request.get(`${CENTRAL}/__last/registration?email=lead@example.com`)
    ).json();
    expect(sent.guests).toEqual([
      { fullName: "Ifeoma Nwosu", email: "ifeoma@example.com" },
      { fullName: "Bayo Lawal", email: "bayo@example.com" },
    ]);
  });

  test("when checkout cannot open, the registration is kept and they can pay later", async ({ page }) => {
    await page.route("**/api/v1/submissions", (route) =>
      route.fulfill({
        status: 201,
        contentType: "application/json",
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({
          ok: true,
          reference: "N2-SAVE-D001",
          payment: null,
          paymentError:
            "Only 1 seat is left, and this registration is for 3. Please contact us to change it.",
        }),
      }),
    );
    await fillYou(page, "later@example.com");
    await page.getByRole("button", { name: /Continue to payment/ }).click();
    const heading = page.getByRole("heading", { name: "Registration saved. One step left." });
    await expect(heading).toBeVisible();
    await expect(heading).toBeFocused();
    await expect(page.getByText("Only 1 seat is left")).toBeVisible();
    await expect(page.getByText("N2-SAVE-D001")).toBeVisible();
    await expect(page.getByRole("link", { name: "Pay later with my reference" })).toHaveAttribute(
      "href",
      /\/register\/pay\/?\?ref=N2-SAVE-D001$/,
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
    await page.getByLabel(/Full Name/).fill("Ada Obi");
    await page.getByLabel(/Email Address/).fill("ada@example.com");
    await page.getByLabel(/Phone Number/).fill("08012345678");
    await page.getByLabel(/^Organisation/).fill("Example Ltd");
    await page.getByLabel(/Job Title/).fill("MD");
    await page.getByLabel(/Sector/).selectOption("Other");
    await page.getByLabel(/Delegate Type/).selectOption("Other");
    await page.getByRole("button", { name: /Continue to payment/ }).click();
    await expect(page.locator("form").getByRole("alert")).toContainText("not open yet");
    await expect(page.getByRole("heading", { name: "Taking you to payment" })).toHaveCount(0);
  });
});

async function fillYou(page: Page, email: string) {
  await page.goto("/register");
  await page.getByLabel(/Full Name/).fill("Ada Obi");
  await page.getByLabel(/Email Address/).fill(email);
  await page.getByLabel(/Phone Number/).fill("+234 801 234 5678");
  await page.getByLabel(/^Organisation/).fill("Example Ltd");
  await page.getByLabel(/Job Title/).fill("Managing Director");
  await page.getByLabel(/Sector/).selectOption("Technology & Telecommunications");
  await page.getByLabel(/Delegate Type/).selectOption("Business");
}

test.describe("paying for a seat later (/register/pay)", () => {
  test("an earlier, free registrant pays with their reference", async ({ page }) => {
    await stubPaystack(page);
    await page.goto("/register/pay");
    await page.getByLabel("Your registration reference").fill("n2-oldr-eg01");
    await page.getByRole("button", { name: "Find my registration" }).click();
    await expect(page).toHaveURL(/\?ref=N2-OLDR-EG01$/);
    const heading = page.getByRole("heading", { name: "Confirm your seat", level: 2 });
    await expect(heading).toBeVisible();
    await expect(heading).toBeFocused();
    await expect(page.getByText("1 × ₦15,000 = ₦15,000")).toBeVisible();
    await expect(page.getByText("Only 37 seats left.")).toBeVisible();
    await page.getByRole("button", { name: "Pay ₦15,000 with Paystack" }).click();
    await expect(page).toHaveURL("https://checkout.paystack.com/n2-oldr-eg01-p1");
  });

  test("back from Paystack: confirms the seat once the payment lands", async ({ page }) => {
    await page.goto("/register/pay/?ref=N2-OLDR-EG02&trxref=N2-OLDR-EG02-P1&reference=N2-OLDR-EG02-P1");
    await expect(page.getByRole("heading", { name: "Confirming your payment" })).toBeVisible();
    await page.request.post(`${CENTRAL}/__pay/N2-OLDR-EG02`);
    const done = page.getByRole("heading", { name: "Your seat is confirmed" });
    await expect(done).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/photo ID/i)).toBeVisible();
    await expect(page.getByText(/transfer yours to a colleague/)).toBeVisible();

    // The moment they are in, offer the summit book.
    const offer = page.getByTestId("book-offer");
    await expect(offer.getByRole("heading", { name: "Advising The Founder" })).toBeVisible();
    await expect(offer).toContainText("₦10,000");
    await expect(offer).toContainText("Ships 10 December 2026");
    await expect(offer.getByRole("img", { name: /Front cover of Advising The Founder/ })).toBeVisible();
    await expect(offer.getByRole("link", { name: "Pre-order the book" })).toHaveAttribute(
      "href",
      "https://advisingthefounder.com/preorder/?utm_source=nlbs&utm_medium=referral&utm_campaign=seat_confirmed_page",
    );
  });

  test("a forgotten reference: the link goes to their inbox, the page reveals nothing", async ({ page }) => {
    await page.goto("/register/pay");
    await page.getByRole("button", { name: "Forgot your reference? Email me my link" }).click();
    await page.getByLabel("Email you registered with").fill("nope");
    await page.getByRole("button", { name: "Email me my link" }).click();
    await expect(page.locator("#forgot-error")).toHaveText("Enter a valid email address.");
    await page.getByLabel("Email you registered with").fill("ada@example.com");
    await page.getByRole("button", { name: "Email me my link" }).click();
    await expect(page.getByRole("status")).toContainText("If that email address has a registration");
    const sent = await (await page.request.get(`${CENTRAL}/__last/registration-links`)).json();
    expect(sent).toEqual({ email: "ada@example.com" });
  });

  test("an unknown reference says so and offers registration", async ({ page }) => {
    await page.goto("/register/pay/?ref=N2-ZZZZ-ZZZZ");
    await expect(page.locator("#pay-ref-error")).toContainText("could not find a registration");
    await expect(page.getByRole("link", { name: "Register and pay in one step" })).toBeVisible();
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
