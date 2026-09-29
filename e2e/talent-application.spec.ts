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

  test("Skills track: completes all three sections and submits", async ({ page }) => {
    await fillStep1(page);
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByRole("heading", { name: /Section 2/ })).toBeFocused();
    await page.getByText("I want 12-week free training in tech").click();
    await page.getByRole("button", { name: "Continue" }).click();
    await fillCommon(page);
    await page.getByLabel(/Which skill do you want/).selectOption("Data Analytics");
    await page.getByRole("button", { name: "Submit application" }).click();
    await expect(page.getByRole("heading", { name: "Application received" })).toBeVisible();
    await expect(page.getByText(/^N2-[A-Z2-9]{4}-[A-Z2-9]{4}$/)).toBeVisible();
  });

  test("regression: arriving at section 3 shows no errors before the applicant answers", async ({ page }) => {
    await fillStep1(page);
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByText("I want an internship or job placement.").click();
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByRole("heading", { name: /Section 3/ })).toBeVisible();
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
    await fillStep1(page);
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByText("I want 12-week free training in tech").click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("group", { name: /Q5\./ }).getByText("No", { exact: true }).click();
    await expect(page.getByText("Thank you, you are not eligible.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Submit application" })).toBeDisabled();
  });

  test("Jobs track: requires a PDF CV and accepts a valid one", async ({ page }) => {
    await fillStep1(page);
    await page.getByRole("button", { name: "Continue" }).click();
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
    await fillStep1(page);
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByText("I have a business and need N250K to N2M.").click();
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByLabel(/What is your business name/)).toBeVisible();
    await expect(page.getByLabel(/Do you have CAC registration/)).toBeVisible();
    await expect(page.getByLabel(/Monthly revenue/)).toBeVisible();
  });

  test("live counters for the 150-character problem and 30-word pitch", async ({ page }) => {
    await fillStep1(page);
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByText("I want 12-week free training in tech").click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByLabel(/Q2\./).fill("abc");
    await expect(page.getByText("3/150 characters")).toBeVisible();
    await page.getByLabel(/Q8\./).fill(Array(31).fill("word").join(" "));
    await expect(page.getByText("31/30 words")).toBeVisible();
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
  await expect(page).toHaveURL(/\/talentnigeria20$/);
});
