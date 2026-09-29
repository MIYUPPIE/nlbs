import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { arrival, entryRoutes, preEventTimeline } from "@/data/registration-plan";
import { event } from "@/data/event";

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

  it("registration opens before the 9:00 AM start", () => {
    const toMinutes = (s: string) => {
      const [, h, m, ap] = /^(\d{1,2}):(\d{2}) (AM|PM)$/.exec(s) ?? [];
      return ((Number(h) % 12) + (ap === "PM" ? 12 : 0)) * 60 + Number(m);
    };
    const [sh, sm] = event.date.startTime.split(":").map(Number);
    expect(toMinutes(arrival.registrationOpens)).toBeLessThan(sh * 60 + sm);
  });

  it("states there is no on-site registration", () => {
    expect(arrival.noOnSite).toMatch(/no on-site registration/i);
  });
});
