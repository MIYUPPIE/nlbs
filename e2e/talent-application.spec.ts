import { expect, test, type Page } from "@playwright/test";

const PDF = Buffer.from("%PDF-1.4\n%test cv\n");

async function fillStep1(page: Page, overrides: { age?: string } = {}) {
  await page.getByLabel(/1\. Full Name/).fill("Amaka Obi");
  await page.getByLabel(/2\. WhatsApp Number/).fill("0803 123 4567");
  await page.getByLabel(/3\. Email/).fill("amaka@example.com");
  await page.getByLabel(/4\. State of Residence/).selectOption("Lagos");
  await page.getByText(overrides.age ?? "18-24", { exact: true }).click();
  await page.getByLabel(/6\. Who referred you/).selectOption("University");
}

/** Section 2: confirm the paid book pre-order (the fake backend knows BK-PAID-2222). */
async function passBookStep(page: Page, reference = "BK-PAID-2222") {
  await page.getByLabel(/Your pre-order reference/).fill(reference);
  await page.getByRole("button", { name: "Confirm my pre-order" }).click();
  await expect(page.getByText("Pre-order confirmed. You can continue.")).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();
}

/** Section 1 filled, book confirmed: lands on "Which track?". */
async function toTrack(page: Page) {
  await fillStep1(page);
  await page.getByRole("button", { name: "Continue" }).click();
  await passBookStep(page);
}

async function fillCommon(page: Page) {
  await page.getByText("Beginner - I am learning").click();
  await page
    .getByLabel(/Q2\./)
    .fill("Smallholder farmers in Kano lose harvests because they cannot reach cold storage.");
  await page.getByLabel(/Q3\./).fill("https://youtu.be/abc123");
  await page.getByRole("group", { name: /Q5\./ }).getByText("Yes", { exact: true }).click();
  await page.getByRole("group", { name: /Q6\./ }).getByText("No", { exact: true }).click();
  await page.getByText("I have smartphone only").click();
  await page
    .getByLabel(/Q8\./)
    .fill("I teach myself every night and I finish what I start. Give me the tools and I will build.");
  await page.getByLabel(/I confirm my answers are true/).check();
}

test.describe("talent fund application", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/talentnigeria20");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test("Skills track: completes all four sections and submits", async ({ page }) => {
    await fillStep1(page);
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByRole("heading", { name: /Section 2\. Pre-order the book/ })).toBeFocused();
    await passBookStep(page);
    await expect(page.getByRole("heading", { name: /Section 3\. Which track/ })).toBeFocused();
    await page.getByText("I want 12-week free training in tech").click();
    await page.getByRole("button", { name: "Continue" }).click();
    await fillCommon(page);
    await page.getByLabel(/Which skill do you want/).selectOption("Data Analytics");
    await page.getByRole("button", { name: "Submit application" }).click();
    await expect(page.getByRole("heading", { name: "Application received" })).toBeVisible();
    await expect(page.getByText(/^N2-[A-Z2-9]{4}-[A-Z2-9]{4}$/)).toBeVisible();
  });

  test("regression: arriving at the last section shows no errors before the applicant answers", async ({
    page,
  }) => {
    await toTrack(page);
    await page.getByText("I want an internship or job placement.").click();
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByRole("heading", { name: /Section 4/ })).toBeVisible();
    await expect(page.locator("form").getByRole("alert")).toHaveCount(0);
    await expect(page.locator('[aria-invalid="true"]')).toHaveCount(0);
    await expect(page.getByText("Upload your CV as a PDF.")).toHaveCount(0);
  });

  test("validates a section before moving on and focuses the first problem", async ({ page }) => {
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.locator("form").getByRole("alert")).toContainText(
      "Please complete the highlighted questions.",
    );
    await expect(page.getByLabel(/1\. Full Name/)).toBeFocused();
    await page.getByLabel(/2\. WhatsApp Number/).fill("0603 000 0000");
    await page.getByLabel(/2\. WhatsApp Number/).blur();
    await expect(page.getByText(/Enter a Nigerian mobile number/)).toBeVisible();
  });

  test("age 36+ is not eligible and cannot continue", async ({ page }) => {
    await fillStep1(page, { age: "36+" });
    await expect(page.getByText("Thank you, you are not eligible.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Continue" })).toBeDisabled();
    await page.getByRole("button", { name: "Change my answer" }).click();
    await expect(page.getByRole("button", { name: "Continue" })).toBeEnabled();
  });

  test("Q5 'No' is not eligible and blocks submission", async ({ page }) => {
    await toTrack(page);
    await page.getByText("I want 12-week free training in tech").click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("group", { name: /Q5\./ }).getByText("No", { exact: true }).click();
    await expect(page.getByText("Thank you, you are not eligible.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Submit application" })).toBeDisabled();
  });

  test("Jobs track: requires a PDF CV and accepts a valid one", async ({ page }) => {
    await toTrack(page);
    await page.getByText("I want an internship or job placement.").click();
    await page.getByRole("button", { name: "Continue" }).click();
    await fillCommon(page);
    await page.getByRole("button", { name: "Submit application" }).click();
    await expect(page.getByText("Upload your CV as a PDF.")).toBeVisible();
    await page
      .locator("#f-cv")
      .setInputFiles({ name: "cv.docx", mimeType: "application/msword", buffer: Buffer.from("x") });
    await expect(page.getByText("Your CV must be a PDF.")).toBeVisible();
    await page
      .locator("#f-cv")
      .setInputFiles({ name: "amaka-cv.pdf", mimeType: "application/pdf", buffer: PDF });
    await expect(page.getByText("amaka-cv.pdf")).toBeVisible();
    await page.getByLabel(/LinkedIn or portfolio link/).fill("https://linkedin.com/in/amaka");
    await page.getByRole("button", { name: "Submit application" }).click();
    await expect(page.getByRole("heading", { name: "Application received" })).toBeVisible();
  });

  test("Capital track asks for business name, CAC and revenue", async ({ page }) => {
    await toTrack(page);
    await page.getByText("I have a business and need N250K to N2M.").click();
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByLabel(/What is your business name/)).toBeVisible();
    await expect(page.getByLabel(/Do you have CAC registration/)).toBeVisible();
    await expect(page.getByLabel(/Monthly revenue/)).toBeVisible();
  });

  test("live counters for the 150-character problem and 30-word pitch", async ({ page }) => {
    await toTrack(page);
    await page.getByText("I want 12-week free training in tech").click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByLabel(/Q2\./).fill("abc");
    await expect(page.getByText("3/150 characters")).toBeVisible();
    await page.getByLabel(/Q8\./).fill(Array(31).fill("word").join(" "));
    await expect(page.getByText("31/30 words")).toBeVisible();
  });

  test("book step: cannot continue until a paid pre-order is confirmed", async ({ page }) => {
    await fillStep1(page);
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByRole("heading", { name: /Pre-order the book/ })).toBeVisible();

    // Continue without a reference.
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText(/Enter your pre-order reference/)).toBeVisible();
    await expect(page.getByRole("heading", { name: /Pre-order the book/ })).toBeVisible();

    // Someone else's / wrong reference, then an unpaid one.
    await page.getByLabel(/Your pre-order reference/).fill("BK-NOPE-5555");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText(/could not find a pre-order with this reference/)).toBeVisible();
    await page.getByLabel(/Your pre-order reference/).fill("bk-unpd-3333");
    await page.getByRole("button", { name: "Confirm my pre-order" }).click();
    await expect(page.getByText(/has not been paid yet/)).toBeVisible();
    await expect(page.getByRole("heading", { name: /Pre-order the book/ })).toBeVisible();

    // Paid: confirmed, then Continue moves on.
    await passBookStep(page);
    await expect(page.getByRole("heading", { name: /Which track/ })).toBeVisible();
  });

  test("book step links to the pre-order page prefilled, with a way back", async ({ page }) => {
    await fillStep1(page);
    await page.getByRole("button", { name: "Continue" }).click();
    const link = page.getByRole("link", { name: /Pre-order the book/ });
    await expect(link).toHaveAttribute("target", "_blank");
    const url = new URL((await link.getAttribute("href"))!);
    expect(url.origin + url.pathname).toBe("https://advisingthefounder.com/preorder/");
    expect(url.searchParams.get("from")).toBe("nlbs-talent");
    expect(url.searchParams.get("name")).toBe("Amaka Obi");
    expect(url.searchParams.get("email")).toBe("amaka@example.com");
    expect(url.searchParams.get("return")).toMatch(/^https?:\/\/[^/]+\/talentnigeria20\/$/);
    await expect(page.locator("form").getByText(/₦10,000/)).toBeVisible();
    // The step must not echo the applicant's own email or phone back on screen.
    const card = page.locator("form").getByText(/Every Talent Fund applicant pre-orders the book/);
    await expect(card).toHaveText(/same email or WhatsApp number you gave in Section 1/);
    await expect(card).not.toContainText("amaka@example.com");
    await expect(card).not.toContainText("0803 123 4567");
    await expect(page.getByRole("img", { name: /Advising The Founder by Dr\. Wale Busari/ })).toBeVisible();
  });

  test("coming back from the book site lands on a confirmed pre-order", async ({ page }) => {
    await fillStep1(page);
    await page.waitForTimeout(600); // draft saved
    await page.goto("/talentnigeria20/?preorder=bk-paid-2222");
    await expect(page.getByRole("heading", { name: /Pre-order the book/ })).toBeVisible();
    await expect(page.getByLabel(/Your pre-order reference/)).toHaveValue("BK-PAID-2222");
    await expect(page.getByText("Pre-order confirmed. You can continue.")).toBeVisible();
    await expect(page).toHaveURL(/\/talentnigeria20\/$/); // reference removed from the address bar
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByRole("heading", { name: /Which track/ })).toBeVisible();
  });

  test("a pre-order refused at submission sends the applicant back to the book step", async ({ page }) => {
    await toTrack(page);
    await page.getByText("I want 12-week free training in tech").click();
    await page.getByRole("button", { name: "Continue" }).click();
    await fillCommon(page);
    await page.getByLabel(/Which skill do you want/).selectOption("Data Analytics");
    await page.route("**/api/v1/submissions", (route) =>
      route.request().method() === "POST"
        ? route.fulfill({
            status: 422,
            contentType: "application/json",
            headers: { "access-control-allow-origin": "*" },
            body: JSON.stringify({
              ok: false,
              error: "Please correct the highlighted fields.",
              fieldErrors: {
                preorderReference:
                  "This pre-order has already been used for Talent Fund applications. Each copy covers one application.",
              },
            }),
          })
        : route.continue(),
    );
    await page.getByRole("button", { name: "Submit application" }).click();
    await expect(page.getByRole("heading", { name: /Pre-order the book/ })).toBeVisible();
    await expect(page.getByText(/already been used for Talent Fund applications/)).toBeVisible();
    await expect(page.getByText("Pre-order confirmed. You can continue.")).toHaveCount(0);
  });

  test("restores a draft after reload (without the CV)", async ({ page }) => {
    await page.getByLabel(/1\. Full Name/).fill("Draft Person");
    await page.waitForTimeout(600);
    await page.reload();
    await expect(page.getByLabel(/1\. Full Name/)).toHaveValue("Draft Person");
    await expect(page.getByText(/restored the answers/)).toBeVisible();
  });
});

test("/talent/apply redirects to the portal", async ({ page }) => {
  await page.goto("/talent/apply");
  await expect(page).toHaveURL(/\/talentnigeria20\/?$/);
});
