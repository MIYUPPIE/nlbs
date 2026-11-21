import { defineConfig, devices } from "@playwright/test";

/** Render-only config: one Chromium worker, 1x pixels, no web server. */
export default defineConfig({
  testDir: ".",
  testMatch: "video.spec.ts",
  outputDir: "../../test-results/summit-video",
  timeout: 30 * 60_000,
  workers: 1,
  reporter: "list",
  use: { ...devices["Desktop Chrome"], deviceScaleFactor: 1 },
});
