import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { arrival, entryRoutes, preEventTimeline } from "@/data/registration-plan";

const APP = join(__dirname, "..", "src", "app");

describe("registration plan", () => {
  it("covers the plan's five delegate categories", () => {
    expect(entryRoutes.map((r) => r.category)).toEqual([
      "Stakeholders & Sponsors",
      "Government",
      "Corporate C-Suite",
      "Investors, DFIs & Tech",
      "Media",
    ]);
  });

  it("every route action points at a real page", () => {
    for (const r of entryRoutes) {
      if (!r.action) continue;
      const path = r.action.href.split("?")[0];
      expect(existsSync(join(APP, path, "page.tsx")), r.action.href).toBe(true);
    }
  });

  it("timeline runs from 21 days out to the day before", () => {
    expect(preEventTimeline.map((t) => t.when)).toEqual([
      "21 days before",
      "14 days before",
      "7 days before",
      "2 days before",
      "1 day before",
    ]);
  });

  it("publishes no registration-open time (convener removed it)", () => {
    expect(Object.keys(arrival)).not.toContain("registrationOpens");
    const page = readFileSync(join(APP, "register", "page.tsx"), "utf8");
    expect(page).not.toMatch(/registration opens|[78]:[03]0 ?AM/i);
  });

  it("sends nothing by WhatsApp (convener: email, and SMS the day before)", () => {
    expect(preEventTimeline.map((t) => t.channel)).toEqual(["Email", "Email", "Email", "Email", "SMS"]);
  });

  it("sends the QR code by email, not WhatsApp", () => {
    expect(preEventTimeline.find((t) => t.what.includes("QR code"))?.channel).toBe("Email");
    expect(arrival.bring.join(" ")).toMatch(/QR code \(sent by email/);
  });

  it("states there is no on-site registration", () => {
    expect(arrival.noOnSite).toMatch(/no on-site registration/i);
  });
});
