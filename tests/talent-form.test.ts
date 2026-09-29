import { afterEach, describe, expect, it, vi } from "vitest";
import {
  applicationWindow,
  band,
  base64Bytes,
  countWords,
  eligibility,
  NIGERIAN_STATES,
  normalizeNigerianMobile,
  screen,
  stripOtherTracks,
  talentApplicationSchema,
  type TalentApplication,
} from "@/lib/talent-form";
import { POST } from "@/app/api/talent-application/route";

const PDF_B64 = Buffer.from("%PDF-1.4\n%fake cv\n").toString("base64");

export const validSkills = {
  fullName: "Amaka Obi",
  whatsapp: "0803 123 4567",
  email: "amaka@example.com",
  state: "Lagos",
  ageBand: "18-24",
  referral: "University",
  referralPartner: "",
  track: "Skills",
  skillLevel: "Beginner - I am learning",
  problem: "Smallholder farmers in Kano lose 30% of harvests because they cannot reach cold storage.",
  videoUrl: "https://youtu.be/abc123",
  skill: "Data Analytics",
  cv: null,
  portfolioUrl: "",
  businessName: "",
  cacStatus: "",
  monthlyRevenue: "",
  available: "Yes",
  priorSupport: "No",
  priorSupportFrom: "",
  devices: "I have smartphone only",
  pitch:
    "I teach myself every night after work and I finish what I start. Give me the tools and I will build solutions.",
  consent: true,
  website: "",
};

const errs = (input: unknown) => {
  const r = talentApplicationSchema.safeParse(input);
  return r.success ? {} : Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message]));
};

describe("normalizeNigerianMobile", () => {
  it.each([
    ["0803 123 4567", "+2348031234567"],
    ["08031234567", "+2348031234567"],
    ["+234 803 123 4567", "+2348031234567"],
    ["2348031234567", "+2348031234567"],
    ["0701-234-5678", "+2347012345678"],
    ["09112345678", "+2349112345678"],
  ])("%s → %s", (input, out) => expect(normalizeNigerianMobile(input)).toBe(out));

  it.each(["0603 123 4567", "0803123456", "+44 7700 900123", "080312345678", "phone"])(
    "rejects %s",
    (input) => expect(normalizeNigerianMobile(input)).toBeNull(),
  );
});

describe("helpers", () => {
  it("countWords", () => {
    expect(countWords("  one two\nthree  ")).toBe(3);
    expect(countWords("")).toBe(0);
  });
  it("base64Bytes", () => expect(base64Bytes(Buffer.from("hello").toString("base64"))).toBe(5));
  it("lists 36 states plus the FCT", () => expect(NIGERIAN_STATES).toHaveLength(37));
});

describe("talentApplicationSchema", () => {
  it("accepts a complete Skills application", () => {
    expect(errs(validSkills)).toEqual({});
  });

  it("requires every Section 1 and Section 3 field", () => {
    const e = errs({});
    for (const f of [
      "fullName",
      "whatsapp",
      "email",
      "state",
      "ageBand",
      "referral",
      "track",
      "skillLevel",
      "problem",
      "videoUrl",
      "available",
      "priorSupport",
      "devices",
      "pitch",
      "consent",
    ])
      expect(e[f], f).toBeTruthy();
  });

  it("caps the problem statement at 150 characters", () => {
    expect(errs({ ...validSkills, problem: "x".repeat(151) }).problem).toMatch(/150/);
  });

  it("caps the pitch at 30 words", () => {
    expect(errs({ ...validSkills, pitch: Array(31).fill("word").join(" ") }).pitch).toMatch(/30 words/);
    expect(errs({ ...validSkills, pitch: Array(30).fill("word").join(" ") }).pitch).toBeUndefined();
  });

  it("requires a real link for the video", () => {
    expect(errs({ ...validSkills, videoUrl: "my video" }).videoUrl).toMatch(/https/);
  });

  it("requires the partner name for Platinum Partner referrals", () => {
    expect(errs({ ...validSkills, referral: "Platinum Partner" }).referralPartner).toBeTruthy();
  });

  it("requires who gave prior support when answered yes", () => {
    expect(errs({ ...validSkills, priorSupport: "Yes" }).priorSupportFrom).toBeTruthy();
  });

  it("Skills track needs a skill", () => {
    expect(errs({ ...validSkills, skill: "" }).skill).toBeTruthy();
  });

  it("Jobs track needs a PDF CV and a portfolio link", () => {
    const e = errs({ ...validSkills, track: "Jobs" });
    expect(e.cv).toBeTruthy();
    expect(e.portfolioUrl).toBeTruthy();
    const ok = {
      ...validSkills,
      track: "Jobs",
      cv: { name: "cv.pdf", type: "application/pdf", size: 20, data: PDF_B64 },
      portfolioUrl: "https://linkedin.com/in/amaka",
    };
    expect(errs(ok)).toEqual({});
  });

  it("rejects a CV that is not really a PDF or is too large", () => {
    const base = { ...validSkills, track: "Jobs", portfolioUrl: "https://a.b" };
    const notPdf = Buffer.from("MZ executable").toString("base64");
    expect(
      errs({ ...base, cv: { name: "cv.pdf", type: "application/pdf", size: 10, data: notPdf } }).cv,
    ).toMatch(/PDF/);
    expect(
      errs({ ...base, cv: { name: "cv.docx", type: "application/msword", size: 10, data: PDF_B64 } }).cv,
    ).toMatch(/PDF/);
    expect(
      errs({ ...base, cv: { name: "cv.pdf", type: "application/pdf", size: 3_000_000, data: PDF_B64 } }).cv,
    ).toMatch(/2 MB/);
  });

  it("Capital track needs business name, CAC status and revenue", () => {
    const e = errs({ ...validSkills, track: "Capital" });
    expect(Object.keys(e).sort()).toEqual(["businessName", "cacStatus", "monthlyRevenue"]);
  });

  it("requires consent", () => {
    expect(errs({ ...validSkills, consent: false }).consent).toBeTruthy();
  });
});

describe("eligibility (auto-reject rules)", () => {
  it("rejects age 36+", () =>
    expect(eligibility({ ageBand: "36+", available: "Yes" })).toEqual({ eligible: false, reason: "age" }));
  it("rejects no availability", () =>
    expect(eligibility({ ageBand: "25-30", available: "No" })).toEqual({
      eligible: false,
      reason: "availability",
    }));
  it("accepts 31-35 who are available", () =>
    expect(eligibility({ ageBand: "31-35", available: "Yes" }).eligible).toBe(true));
});

const parse = (o: object) => talentApplicationSchema.parse(o) as TalentApplication;

describe("screen (PDF scoring rubric)", () => {
  it("awards video 30 + age/availability 15 for an 18-24 applicant", () => {
    const s = screen(parse(validSkills));
    expect(s.breakdown).toEqual({ video: 30, partnerReferral: 0, ageAndAvailability: 15 });
    expect(s.autoPoints).toBe(45);
    expect(s.bandRange).toEqual({
      ifReviewScoresZero: "Reject",
      ifReviewScoresFull: "Shortlist for interview",
    });
  });

  it("adds 15 for a partner referral and flags it for verification", () => {
    const s = screen(parse({ ...validSkills, referral: "Platinum Partner", referralPartner: "Acme" }));
    expect(s.autoPoints).toBe(60);
    expect(s.flags).toContain("partner_referral_unverified");
    expect(s.bandRange.ifReviewScoresZero).toBe("Waitlist");
  });

  it("gives no age points to 31-35", () => {
    expect(screen(parse({ ...validSkills, ageBand: "31-35" })).breakdown.ageAndAvailability).toBe(0);
  });

  it("flags generic problem statements", () => {
    expect(screen(parse({ ...validSkills, problem: "I want to make money" })).flags).toContain(
      "generic_problem_statement",
    );
    expect(screen(parse(validSkills)).flags).not.toContain("generic_problem_statement");
  });

  it("suggests re-placement per the PDF (Beginner → Skills, Advanced → Jobs)", () => {
    const jobsBeginner = parse({
      ...validSkills,
      track: "Jobs",
      cv: { name: "cv.pdf", type: "application/pdf", size: 20, data: PDF_B64 },
      portfolioUrl: "https://x.y",
    });
    expect(screen(jobsBeginner).suggestedTrack).toBe("Skills");
    expect(screen(jobsBeginner).flags).toContain("skill_level_track_mismatch");
    const skillsAdvanced = parse({ ...validSkills, skillLevel: "Advanced - I have clients / portfolio" });
    expect(screen(skillsAdvanced).suggestedTrack).toBe("Jobs");
    const capitalBeginner = parse({
      ...validSkills,
      track: "Capital",
      businessName: "Farm Co",
      cacStatus: "No, idea stage",
      monthlyRevenue: "No revenue yet",
    });
    expect(screen(capitalBeginner).suggestedTrack).toBe("Capital");
  });

  it("band cut-offs match the PDF", () => {
    expect([band(49), band(50), band(69), band(70), band(100)]).toEqual([
      "Reject",
      "Waitlist",
      "Waitlist",
      "Shortlist for interview",
      "Shortlist for interview",
    ]);
  });
});

describe("stripOtherTracks", () => {
  it("removes answers from tracks the applicant did not choose", () => {
    const d = parse({ ...validSkills, businessName: "leftover", portfolioUrl: "https://x.y" });
    const s = stripOtherTracks(d);
    expect(s.businessName).toBe("");
    expect(s.portfolioUrl).toBe("");
    expect(s.skill).toBe("Data Analytics");
  });
});

describe("applicationWindow (1-30 Oct 2026, Lagos)", () => {
  it.each([
    ["2026-09-30T22:59:59Z", "upcoming"],
    ["2026-09-30T23:00:00Z", "open"], // 00:00 WAT 1 Oct
    ["2026-10-30T22:59:59Z", "open"], // 23:59:59 WAT 30 Oct
    ["2026-10-30T23:00:00Z", "closed"],
  ])("%s → %s", (iso, status) => expect(applicationWindow(Date.parse(iso))).toBe(status));

  it("honours the override", () => {
    expect(applicationWindow(Date.parse("2026-01-01T00:00:00Z"), "open")).toBe("open");
    expect(applicationWindow(Date.parse("2026-10-10T00:00:00Z"), "closed")).toBe("closed");
  });
});

describe("POST /api/talent-application", () => {
  const req = (body: unknown) =>
    new Request("http://localhost/api/talent-application", { method: "POST", body: JSON.stringify(body) });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("refuses before the window opens", async () => {
    vi.stubEnv("TALENT_APPLICATIONS_OVERRIDE", "");
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-29T12:00:00Z"));
    const res = await POST(req(validSkills));
    vi.useRealTimers();
    expect(res.status).toBe(403);
    expect((await res.json()).error).toMatch(/open on 1 October/);
  });

  it("refuses ineligible applicants with the PDF's message", async () => {
    vi.stubEnv("TALENT_APPLICATIONS_OVERRIDE", "open");
    vi.stubEnv("NODE_ENV", "development");
    const res = await POST(req({ ...validSkills, ageBand: "36+" }));
    expect(res.status).toBe(422);
    expect((await res.json()).error).toBe("Thank you, you are not eligible.");
  });

  it("delivers a normalised, screened application to the webhook", async () => {
    vi.stubEnv("TALENT_APPLICATIONS_OVERRIDE", "open");
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("TALENT_WEBHOOK_URL", "https://hook.test/talent");
    vi.spyOn(console, "info").mockImplementation(() => {});
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}", { status: 200 }));
    const res = await POST(req({ ...validSkills, businessName: "leftover" }));
    expect(res.status).toBe(200);
    const sent = JSON.parse(String((fetchSpy.mock.calls[0][1] as RequestInit).body));
    expect(sent.kind).toBe("talent");
    expect(sent.whatsapp).toBe("+2348031234567");
    expect(sent.businessName).toBe("");
    expect(sent.screening.autoPoints).toBe(45);
    expect("website" in sent).toBe(false);
  });

  it("accepts a body carrying a 2 MB CV but not larger", async () => {
    vi.stubEnv("TALENT_APPLICATIONS_OVERRIDE", "open");
    vi.stubEnv("NODE_ENV", "development");
    const huge = "JVBERi0" + "A".repeat(3 * 1024 * 1024);
    const res = await POST(
      req({ ...validSkills, cv: { name: "a.pdf", type: "application/pdf", size: 1, data: huge } }),
    );
    expect(res.status).toBe(413);
  });
});
