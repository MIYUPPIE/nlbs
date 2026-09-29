/**
 * Partnership structure (convener decision, 29 Sep 2026): Founding
 * Stakeholders + Official Sponsors from the prospectus and briefs, fees on
 * request. Guards the numbers, and keeps fees and internal sales material
 * off the site and out of the FAQ.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { faqCategories, faqItems } from "@/data/faq";
import {
  partnershipSteps,
  sponsorBenefits,
  totalSlots,
  trackById,
  trackComparison,
  tracks,
} from "@/data/partnership";
import { enquiryHref, topicFromQuery } from "@/lib/enquiry";

/** Naira amounts in any form: N50M, N15,000,000, ₦3M, N 12m. */
const NAIRA = /(?<![A-Za-z])[₦N]\s?\d[\d,.]*\s?(?:[kKmMbB]|bn|million|billion)?\b/;

describe("tracks", () => {
  it("Founding Stakeholders: 3 Platinum, 5 Gold, 8 Silver = 16", () => {
    const t = trackById("stakeholder");
    expect(t.tiers.map((x) => [x.name, x.slots])).toEqual([
      ["Platinum", 3],
      ["Gold", 5],
      ["Silver", 8],
    ]);
    expect(totalSlots(t)).toBe(16);
  });

  it("Official Sponsors: 1 Diamond, 3 Gold, 5 Silver, 10 Supporting = 19", () => {
    const t = trackById("sponsor");
    expect(t.tiers.map((x) => [x.name, x.slots])).toEqual([
      ["Diamond", 1],
      ["Gold", 3],
      ["Silver", 5],
      ["Supporting", 10],
    ]);
    expect(totalSlots(t)).toBe(19);
  });

  it("every sponsor benefit row has one value per sponsor tier", () => {
    const n = trackById("sponsor").tiers.length;
    for (const g of sponsorBenefits) for (const r of g.rows) expect(r.values, r.benefit).toHaveLength(n);
  });

  it("VIP passes match the prospectus (10, 6, 4, 2)", () => {
    const row = sponsorBenefits.flatMap((g) => g.rows).find((r) => r.benefit === "VIP delegate passes");
    expect(row?.values).toEqual(["10", "6", "4", "2"]);
  });

  it("only Stakeholders get agenda input, a guaranteed slot and the Policy Brief", () => {
    for (const q of [
      "Help set the agenda?",
      "Guaranteed speaking slot?",
      "Named on the Policy Brief to the Presidency?",
    ]) {
      const row = trackComparison.find((r) => r.question === q);
      expect(row?.stakeholder, q).toMatch(/^Yes/);
      expect(row?.sponsor, q).not.toMatch(/^Yes/);
    }
  });

  it("the deposit step matches the prospectus", () => {
    expect(partnershipSteps.map((s) => s.detail).join(" ")).toContain("50% deposit");
  });
});

describe("fees on request", () => {
  it("partnership data has no Naira amounts and says fees are on request", () => {
    const src = readFileSync(join(__dirname, "..", "src", "data", "partnership.ts"), "utf8");
    expect(src).not.toMatch(NAIRA);
    expect(trackComparison.find((r) => r.question === "Fee")).toEqual({
      question: "Fee",
      stakeholder: "On request",
      sponsor: "On request",
    });
  });

  it("no FAQ partnership question or answer states a fee", () => {
    const c = faqCategories.find((x) => x.letter === "C");
    for (const i of c?.items ?? []) {
      expect(`${i.question} ${i.answer}`, `Q${i.number}`).not.toMatch(NAIRA);
    }
  });

  it("no FAQ answer prices a partnership anywhere else either", () => {
    for (const i of faqItems) expect(i.answer, `Q${i.number}`).not.toMatch(/N(15|30|50)M/i);
  });

  it("the FAQ describes the two-track structure", () => {
    const q46 = faqItems.find((i) => i.number === 46);
    expect(q46?.answer).toMatch(/3 Platinum, 5 Gold and 8 Silver/);
    expect(q46?.answer).toMatch(/1 Diamond, 3 Gold, 5 Silver and 10 Supporting/);
  });
});

describe("internal material stays internal", () => {
  const text = JSON.stringify(tracks) + JSON.stringify(sponsorBenefits) + JSON.stringify(trackComparison);
  it.each(["Access Bank", "IFC", "CBN", "NIPC", "Ford Foundation", "KPMG", "Templars", "480", "594", "114"])(
    "does not mention %s",
    (term) => expect(text).not.toContain(term),
  );
});

describe("enquiry routing", () => {
  it("sends each track to its own enquiry topic", () => {
    expect(
      topicFromQuery(new URL(enquiryHref("stakeholder"), "http://x").searchParams.get("topic") ?? ""),
    ).toBe("Partnership");
    expect(topicFromQuery(new URL(enquiryHref("sponsor"), "http://x").searchParams.get("topic") ?? "")).toBe(
      "Sponsorship",
    );
  });
});
