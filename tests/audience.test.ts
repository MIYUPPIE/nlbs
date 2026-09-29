import { describe, expect, it } from "vitest";
import { audience, delegateMix } from "@/data/audience";
import { statById } from "@/data/event";

describe("audience profile", () => {
  it("seat estimates add up to the 800 expected delegates", () => {
    expect(audience.reduce((n, a) => n + a.estimate, 0)).toBe(statById("delegates").value);
  });

  it("matches the profile's six groups and estimates", () => {
    expect(audience.map((a) => [a.label, a.estimate])).toEqual([
      ["Government & Policy", 80],
      ["Capital & DFIs", 100],
      ["Corporates", 200],
      ["Tech & Innovation", 120],
      ["Talent & Ecosystem", 100],
      ["Investors & Diaspora", 200],
    ]);
  });

  it.each(delegateMix.map((m) => [m.title, m] as const))("%s mix sums to 100%%", (_, m) => {
    expect(m.slices.reduce((n, s) => n + s.percent, 0)).toBe(100);
  });
});
