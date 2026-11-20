import { defineConfig, devices } from "@playwright/test";

/** Render-only config: no web server, one Chromium worker, deterministic 1x output. */
export default defineConfig({
  testDir: ".",
  testMatch: "render.spec.ts",
  outputDir: "../../test-results/summit-carousel",
  timeout: 120_000,
  workers: 1,
  reporter: "list",
  use: { ...devices["Desktop Chrome"], deviceScaleFactor: 1 },
});
