import { describe, expect, it } from "vitest";
import { dealFlow, dealPhases } from "@/data/content";

describe("deal flow", () => {
  it("keeps the brief's six steps in order", () => {
    expect(dealFlow.map((s) => s.step)).toEqual([
      "Business",
      "Qualification",
      "Matchmaking",
      "Meeting",
      "Partnership",
      "Potential Deal",
    ]);
  });

  it("groups consecutive steps into phases that cover every step once", () => {
    expect(dealPhases).toEqual([
      { phase: "Before the summit", start: 0, count: 3 },
      { phase: "At the summit", start: 3, count: 1 },
      { phase: "After the summit", start: 4, count: 2 },
    ]);
    expect(dealPhases.reduce((n, p) => n + p.count, 0)).toBe(dealFlow.length);
  });

  it("never claims a completed deal", () => {
    const text = dealFlow
      .map((s) => `${s.step} ${s.detail}`)
      .join(" ")
      .toLowerCase();
    expect(text).not.toMatch(/\b(closed|signed|completed|secured)\b/);
  });
});
