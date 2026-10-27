/**
 * Talent Fund university nominations. Guards: the university list mirrors the
 * backend (App\Talent\Universities), applicants referred by a university must
 * name it, the confirmation form sends exactly the backend contract, live
 * numbers come only from the backend (never a fallback number), and the pages
 * stay unlisted like /sponsors.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { studentLink, universities, universityBySlug } from "@/data/universities";
import { allRoutes } from "@/data/navigation";
import { centralConfig, fetchUniversityStats } from "@/lib/central";
import { prepare } from "@/lib/outgoing";
import {
  conditionalErrors,
  NIGERIAN_STATES,
  stripOtherTracks,
  talentApplicationSchema,
  universityFromQuery,
} from "@/lib/talent-form";
import { universityFormSchema } from "@/lib/university-form";
import sitemap from "@/app/sitemap";
import { metadata as indexMetadata } from "@/app/talentnigeria20/universities/page";
import { generateMetadata, generateStaticParams } from "@/app/talentnigeria20/universities/[slug]/page";

const SRC = join(__dirname, "..", "src");
const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) =>
    statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : [join(dir, f)],
  );

const PDF = "JVBERi0xLjQKJSVFT0YK"; // "%PDF-1.4\n%%EOF\n"

const validConfirmation = {
  university: "unilag",
  focalName: "Dr. Folake Adeyemi",
  focalTitle: "Director, Career Services",
  email: "careers@unilag.example",
  phone: "+2348031112222",
  expectedNominees: "100",
  letterhead: { name: "unilag.pdf", type: "application/pdf", size: 15, data: PDF },
  message: "We confirm participation.",
  consent: true,
  website: "",
};

describe("university list", () => {
  it("mirrors the backend list exactly (central-backend App\\Talent\\Universities)", () => {
    expect(universities.map((u) => u.slug)).toEqual([
      "unilag",
      "ui",
      "covenant",
      "oau",
      "abu",
      "unn",
      "unilorin",
      "futa",
      "uniben",
      "uniport",
      "lasu",
      "pau",
      "babcock",
      "unijos",
      "futminna",
      "buk",
      "landmark",
      "unical",
      "funaab",
      "nile",
      "baze",
    ]);
  });

  it("has unique slugs and states spelled as the talent form spells them", () => {
    expect(new Set(universities.map((u) => u.slug)).size).toBe(universities.length);
    for (const u of universities) {
      expect(u.slug).toMatch(/^[a-z]+$/);
      expect(NIGERIAN_STATES as readonly string[]).toContain(u.state);
    }
  });

  it("student links point at the application form with the slug", () => {
    expect(studentLink("https://www.nlbs.com.ng", "unilag")).toBe(
      "https://www.nlbs.com.ng/talentnigeria20/?university=unilag",
    );
    expect(universityFromQuery(" UNILAG ")).toBe("unilag");
    expect(universityFromQuery("hogwarts")).toBeNull();
  });
});

describe("talent applicants referred by a university", () => {
  it("must name it, or name another university", () => {
    expect(conditionalErrors({ referral: "University" }).university).toBe("Select your university.");
    expect(conditionalErrors({ referral: "University", university: "fake" }).university).toBeDefined();
    expect(conditionalErrors({ referral: "University", university: "other" }).universityOther).toBe(
      "Which university?",
    );
    expect(conditionalErrors({ referral: "University", university: "unilag" })).toEqual({});
    expect(conditionalErrors({ referral: "NITDA" })).toEqual({});
  });

  it("only keeps university fields when a university referred them", () => {
    const base = talentApplicationSchema.parse({
      fullName: "Ada Obi",
      whatsapp: "08031234567",
      email: "ada@example.com",
      state: "Lagos",
      ageBand: "18-24",
      referral: "NYSC",
      nyscCallUpNumber: "NYSC/UNILAG/2024/123456",
      nyscStateCode: "LA/24A/1234",
      university: "unilag",
      universityOther: "x",
      track: "Skills",
      skillLevel: "Beginner - I am learning",
      problem: "Small farmers cannot reach buyers in Lagos.",
      videoUrl: "https://youtu.be/x",
      skill: "AI",
      available: "Yes",
      priorSupport: "No",
      devices: "I have laptop + internet",
      pitch: "I learn fast and finish what I start every time.",
      consent: true,
      website: "",
    });
    expect(stripOtherTracks(base)).toMatchObject({ university: "", universityOther: "" });
    expect(stripOtherTracks({ ...base, referral: "University" })).toMatchObject({
      university: "unilag",
      universityOther: "",
    });
  });
});

describe("university confirmation form", () => {
  it("sends exactly the backend contract (contracts/fixtures/nlbs-university.json fields)", () => {
    const p = prepare.university(validConfirmation);
    expect(p.ok).toBe(true);
    if (!p.ok) return;
    expect(Object.keys(p.fields).sort()).toEqual(
      [
        "university",
        "focalName",
        "focalTitle",
        "email",
        "phone",
        "expectedNominees",
        "letterhead",
        "message",
        "consent",
        "website",
      ].sort(),
    );
    expect(p.fields.expectedNominees).toBe(100);
    expect(prepare.university({ ...validConfirmation, expectedNominees: "" })).toMatchObject({
      fields: { expectedNominees: null },
    });
    expect(prepare.university({ ...validConfirmation, letterhead: null })).toMatchObject({
      fields: { letterhead: null },
    });
  });

  it("refuses an unknown university, a non-PDF letter, a bad estimate and no consent", () => {
    const bad = (patch: object) => universityFormSchema.safeParse({ ...validConfirmation, ...patch }).success;
    expect(bad({ university: "hogwarts" })).toBe(false);
    expect(bad({ letterhead: { ...validConfirmation.letterhead, data: "aGVsbG8=" } })).toBe(false);
    expect(bad({ expectedNominees: "lots" })).toBe(false);
    expect(bad({ expectedNominees: "0" })).toBe(false);
    expect(bad({ consent: false })).toBe(false);
    expect(bad({})).toBe(true);
  });
});

describe("live numbers", () => {
  const config = { apiUrl: "https://api.example", siteKey: "pk_test" };
  const reply = (status: number, body: unknown) =>
    (async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;

  it("reads status and counts from the backend, with the public key", async () => {
    let seen: Request | null = null;
    const f = (async (url: string, init: RequestInit) => {
      seen = new Request(url, init);
      return new Response(
        JSON.stringify({
          ok: true,
          universities: [{ slug: "unilag", status: "confirmed", applications: 7 }],
        }),
      );
    }) as unknown as typeof fetch;
    const stats = await fetchUniversityStats(config, f);
    expect(stats?.get("unilag")).toEqual({ slug: "unilag", status: "confirmed", applications: 7 });
    expect(seen!.url).toBe("https://api.example/api/v1/talent/universities");
    expect(seen!.headers.get("X-Site-Key")).toBe("pk_test");
  });

  it("drops malformed rows and returns null, never a made-up number, when it cannot know", async () => {
    const stats = await fetchUniversityStats(
      config,
      reply(200, {
        ok: true,
        universities: [
          { slug: "ui", status: "leading", applications: 5 },
          { slug: "oau", status: "invited", applications: -1 },
        ],
      }),
    );
    expect(stats?.size).toBe(0);
    expect(await fetchUniversityStats(config, reply(500, {}))).toBeNull();
    expect(await fetchUniversityStats(config, reply(200, { ok: false }))).toBeNull();
    expect(
      await fetchUniversityStats(config, (async () => {
        throw new Error("offline");
      }) as unknown as typeof fetch),
    ).toBeNull();
    expect(await fetchUniversityStats(null)).toBeNull();
    expect(centralConfig({})).toBeNull();
  });
});

describe("unlisted pages", () => {
  it("build one page per university, never indexed, never in the sitemap", async () => {
    expect(generateStaticParams()).toHaveLength(universities.length);
    expect(indexMetadata.robots).toMatchObject({ index: false, follow: false });
    const m = await generateMetadata({ params: Promise.resolve({ slug: "unilag" }) });
    expect(m.robots).toMatchObject({ index: false, follow: false });
    expect(m.title).toBe("Talent Fund: University of Lagos");
    expect((allRoutes as readonly string[]).some((r) => r.includes("universities"))).toBe(false);
    expect(sitemap().some((e) => e.url.includes("universities"))).toBe(false);
  });

  it("are not linked from anywhere else on the site", () => {
    const own = [
      join(SRC, "app", "talentnigeria20", "universities"),
      join(SRC, "components", "talent", "UniversityStats.tsx"),
      join(SRC, "data", "universities.ts"),
      join(SRC, "lib", "university-form.ts"),
    ];
    const linking = walk(SRC).filter(
      (f) =>
        !own.some((o) => f.startsWith(o)) && readFileSync(f, "utf8").includes("talentnigeria20/universities"),
    );
    expect(linking).toEqual([]);
  });

  it("every university page name matches its slug", () => {
    for (const u of universities) expect(universityBySlug(u.slug)?.name).toBe(u.name);
  });
});
