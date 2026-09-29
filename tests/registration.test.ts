import { describe, expect, it } from "vitest";
import { createReference, delegateTypes, registrationSchema, sectors } from "@/lib/registration";
import { validRegistration } from "./fixtures";

const errorsFor = (input: unknown) => {
  const r = registrationSchema.safeParse(input);
  return r.success ? {} : Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message]));
};

describe("registrationSchema", () => {
  it("accepts a complete registration", () => {
    expect(registrationSchema.safeParse(validRegistration).success).toBe(true);
  });

  it("trims whitespace", () => {
    const r = registrationSchema.parse({ ...validRegistration, fullName: "  Ada Obi  " });
    expect(r.fullName).toBe("Ada Obi");
  });

  it("requires every brief-specified field", () => {
    const errs = errorsFor({});
    for (const f of [
      "fullName",
      "email",
      "phone",
      "organisation",
      "jobTitle",
      "sector",
      "country",
      "delegateType",
    ]) {
      expect(errs[f], f).toBeTruthy();
    }
  });

  it("accepts the optional plan fields blank or missing, and trims them", () => {
    const r = registrationSchema.parse(validRegistration);
    expect([r.whatsapp, r.nominatedBy, r.accessNeeds]).toEqual(["", "", ""]);
    const full = registrationSchema.parse({
      ...validRegistration,
      whatsapp: " +234 802 000 0000 ",
      nominatedBy: " Lagos Chamber ",
      accessNeeds: "Vegetarian",
    });
    expect([full.whatsapp, full.nominatedBy, full.accessNeeds]).toEqual([
      "+234 802 000 0000",
      "Lagos Chamber",
      "Vegetarian",
    ]);
  });

  it.each(["123", "whatsapp", "+234-ABC"])("rejects WhatsApp number %s", (whatsapp) => {
    expect(errorsFor({ ...validRegistration, whatsapp }).whatsapp).toMatch(/valid WhatsApp number/);
  });

  it("caps access needs at 300 characters", () => {
    expect(errorsFor({ ...validRegistration, accessNeeds: "x".repeat(301) }).accessNeeds).toBeTruthy();
  });

  it.each(["not-an-email", "a@b", "@example.com", "ada@"])("rejects email %s", (email) => {
    expect(errorsFor({ ...validRegistration, email }).email).toBe("Enter a valid email address.");
  });

  it.each(["+234 801 234 5678", "08012345678", "+44 (20) 7946-0958", "+1.212.555.0100"])(
    "accepts phone %s",
    (phone) => {
      expect(errorsFor({ ...validRegistration, phone }).phone).toBeUndefined();
    },
  );

  it.each(["123", "phone", "+234-ABC-DEF", "1234567890123456789012"])("rejects phone %s", (phone) => {
    expect(errorsFor({ ...validRegistration, phone }).phone).toBeTruthy();
  });

  it("offers exactly the delegate types from the brief", () => {
    expect([...delegateTypes]).toEqual([
      "Government",
      "Business",
      "Investor",
      "Startup",
      "Development Organisation",
      "Technology",
      "Media",
      "Student / Young Professional",
      "Other",
    ]);
  });

  it("rejects unknown delegate types and sectors", () => {
    expect(errorsFor({ ...validRegistration, delegateType: "VIP" }).delegateType).toBe(
      "Select a delegate type.",
    );
    expect(errorsFor({ ...validRegistration, sector: "Crypto" }).sector).toBe("Select your sector.");
    expect(sectors).toContain("Other");
  });

  it("rejects a filled honeypot", () => {
    expect(errorsFor({ ...validRegistration, website: "http://spam" }).website).toBeTruthy();
  });

  it("caps field lengths", () => {
    expect(errorsFor({ ...validRegistration, fullName: "x".repeat(101) }).fullName).toMatch(/100 characters/);
  });
});

describe("createReference", () => {
  it("produces N2-XXXX-XXXX without ambiguous characters", () => {
    for (let i = 0; i < 200; i++) {
      expect(createReference()).toMatch(/^N2-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/);
    }
  });

  it("is deterministic for a given random source", () => {
    expect(createReference(() => 0)).toBe("N2-AAAA-AAAA");
    expect(createReference(() => 0.9999)).toBe("N2-9999-9999");
  });
});
