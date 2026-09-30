import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3200);
const CENTRAL_PORT = 3299;

/**
 * Periodic eval lane. Runs the real static export, as cPanel serves it:
 *   npm run test:e2e   (builds out/ against the fake backend, then tests)
 * Apache 2.4 (Docker) serves out/ with the site's own public/.htaccess, and
 * e2e/servers/fake-central.mjs stands in for the central backend.
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
  webServer: [
    {
      command:
        `docker rm -f nlbs-e2e-apache >/dev/null 2>&1; docker run --rm --name nlbs-e2e-apache -p ${PORT}:80 ` +
        `-v "${process.cwd()}:/site:ro" ` +
        `-v "${process.cwd()}/e2e/servers/httpd.conf:/usr/local/apache2/conf/httpd.conf:ro" httpd:2.4`,
      url: `http://localhost:${PORT}/`,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      command: "node e2e/servers/fake-central.mjs",
      url: `http://localhost:${CENTRAL_PORT}/__health`,
      reuseExistingServer: !process.env.CI,
      timeout: 15_000,
      env: { FAKE_CENTRAL_PORT: String(CENTRAL_PORT), FAKE_CENTRAL_ORIGINS: `http://localhost:${PORT}` },
    },
  ],
});
