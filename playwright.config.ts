import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3200);

/**
 * Periodic eval lane. Runs against a production build:
 *   npm run build && npm run test:e2e
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["json", { outputFile: "test-results/e2e-report.json" }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: {
      // Lets the e2e suite exercise the success path without a real webhook.
      REGISTRATION_ALLOW_UNCONNECTED: "true",
      ENQUIRY_ALLOW_UNCONNECTED: "true",
      TALENT_ALLOW_UNCONNECTED: "true",
      SPONSOR_ALLOW_UNCONNECTED: "true",
      // Test-only private link token (e2e/sponsor-form.spec.ts).
      SPONSOR_FORM_TOKEN: "e2e-private-sponsor-link-token-0001",
      // The real window opens 1 Oct 2026; force it open so the form can be exercised.
      TALENT_APPLICATIONS_OVERRIDE: "open",
    },
  },
});
