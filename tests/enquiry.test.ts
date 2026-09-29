import { describe, expect, it } from "vitest";
import { enquirySchema, topicFromQuery } from "@/lib/enquiry";
import { validEnquiry } from "./fixtures";

describe("enquirySchema", () => {
  it("accepts a valid enquiry", () => {
    expect(enquirySchema.safeParse(validEnquiry).success).toBe(true);
  });

  it("treats organisation as optional", () => {
    const { organisation: _o, ...rest } = validEnquiry;
    void _o;
    expect(enquirySchema.parse(rest).organisation).toBe("");
  });

  it("requires a meaningful message", () => {
    const r = enquirySchema.safeParse({ ...validEnquiry, message: "hi" });
    expect(r.success).toBe(false);
  });

  it("rejects unknown topics", () => {
    expect(enquirySchema.safeParse({ ...validEnquiry, topic: "Tickets" }).success).toBe(false);
  });
});

describe("topicFromQuery", () => {
  it.each([
    ["partnership", "Partnership"],
    ["stakeholder", "Partnership"],
    ["sponsorship", "Sponsorship"],
    ["sponsor", "Sponsorship"],
    ["exhibition", "Exhibition"],
    ["pitch", "Startup Pitch Arena"],
    ["investment", "Investment"],
    ["talent", "Talent Fund"],
    ["speaking", "Speaking"],
    ["media", "Media"],
    ["EXHIBITION", "Exhibition"],
  ])("maps %s → %s", (q, expected) => {
    expect(topicFromQuery(q)).toBe(expected);
  });

  it("returns null for missing or unknown values", () => {
    expect(topicFromQuery(undefined)).toBeNull();
    expect(topicFromQuery("tickets")).toBeNull();
    expect(topicFromQuery(["exhibition", "media"])).toBe("Exhibition");
  });
});
