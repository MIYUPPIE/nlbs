import { afterEach, describe, expect, it, vi } from "vitest";
import { POST as sponsorPOST } from "@/app/api/sponsor/route";
import sitemap from "@/app/sitemap";
import { MIN_TOKEN_LENGTH, sponsorAccessAllowed } from "@/lib/sponsor-access";
import { parsePassHolders, passLimit, sponsorFormSchema, tierOptions } from "@/lib/sponsor-form";

const TOKEN = "t".repeat(MIN_TOKEN_LENGTH);

const valid = {
  companyName: "Example Telecoms Ltd",
  industry: "Technology & Telecommunications",
  companyWebsite: "https://example.com",
  billingAddress: "Example Telecoms Ltd, 1 Marina, Lagos",
  contactName: "Ada Obi",
  jobTitle: "Brand Director",
  email: "ada@example.com",
  phone: "+234 801 234 5678",
  whatsapp: "",
  track: "Official Sponsor",
  tier: "Gold",
  exclusivity: "",
  objectives: "",
  callAvailability: "Weekdays after 2 PM",
  passHolders: "Ada Obi, ada@example.com\nTunde Bello; tunde@example.com",
  acknowledge: "yes",
  accessToken: TOKEN,
  website: "",
};

const errorsFor = (input: unknown) => {
  const r = sponsorFormSchema.safeParse(input);
  return r.success ? {} : Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message]));
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("private link access", () => {
  it("fails closed with no token configured", () => {
    expect(sponsorAccessAllowed(TOKEN, {})).toBe(false);
    expect(sponsorAccessAllowed("", { SPONSOR_FORM_TOKEN: "" })).toBe(false);
  });

  it("refuses a configured token that is too short to be private", () => {
    const short = "x".repeat(MIN_TOKEN_LENGTH - 1);
    expect(sponsorAccessAllowed(short, { SPONSOR_FORM_TOKEN: short })).toBe(false);
  });

  it("accepts only the exact token", () => {
    const env = { SPONSOR_FORM_TOKEN: TOKEN };
    expect(sponsorAccessAllowed(TOKEN, env)).toBe(true);
    expect(sponsorAccessAllowed(`${TOKEN}x`, env)).toBe(false);
    expect(sponsorAccessAllowed(TOKEN.toUpperCase(), env)).toBe(false);
    expect(sponsorAccessAllowed(undefined, env)).toBe(false);
    expect(sponsorAccessAllowed(42, env)).toBe(false);
  });

  it("is not listed in the sitemap", () => {
    expect(sitemap().some((e) => e.url.includes("/sponsor"))).toBe(false);
  });
});

describe("packages", () => {
  it("offers the tiers of the chosen track", () => {
    expect(tierOptions("Official Sponsor")).toEqual(["Diamond", "Gold", "Silver", "Supporting"]);
    expect(tierOptions("Founding Stakeholder")).toEqual(["Platinum", "Gold", "Silver"]);
    expect(tierOptions("Nope")).toEqual([]);
  });

  it("pass allowance follows the prospectus for sponsors and caps stakeholders at 10", () => {
    expect(["Diamond", "Gold", "Silver", "Supporting"].map((t) => passLimit("Official Sponsor", t))).toEqual([
      10, 6, 4, 2,
    ]);
    expect(passLimit("Founding Stakeholder", "Platinum")).toBe(10);
  });
});

describe("pass holders", () => {
  it("parses comma, semicolon and tab lines and skips blanks", () => {
    expect(parsePassHolders("Ada Obi, ADA@example.com\n\nTunde Bello;t@x.ng\nKemi A\tk@y.com")).toEqual({
      holders: [
        { name: "Ada Obi", email: "ada@example.com" },
        { name: "Tunde Bello", email: "t@x.ng" },
        { name: "Kemi A", email: "k@y.com" },
      ],
      error: null,
    });
  });

  it("points at the first bad line", () => {
    expect(parsePassHolders("Ada Obi, ada@example.com\nJust a name").error).toMatch(/^Line 2:/);
  });
});

describe("sponsorFormSchema", () => {
  it("accepts a complete request", () => {
    expect(errorsFor(valid)).toEqual({});
  });

  it("requires the booking essentials", () => {
    const errs = errorsFor({});
    for (const f of [
      "companyName",
      "industry",
      "billingAddress",
      "contactName",
      "jobTitle",
      "email",
      "phone",
      "track",
      "tier",
      "acknowledge",
    ]) {
      expect(errs[f], f).toBeTruthy();
    }
  });

  it("rejects a tier from the other track", () => {
    expect(errorsFor({ ...valid, tier: "Platinum" }).tier).toBe("Choose a tier for this track.");
  });

  it("rejects more pass holders than the tier allows", () => {
    const lines = Array.from({ length: 3 }, (_, i) => `Person ${i}, p${i}@example.com`).join("\n");
    expect(errorsFor({ ...valid, tier: "Supporting", passHolders: lines }).passHolders).toMatch(
      /up to 2 VIP passes\. You listed 3/,
    );
  });

  it("requires the deposit acknowledgement", () => {
    expect(errorsFor({ ...valid, acknowledge: "" }).acknowledge).toBeTruthy();
  });

  it("rejects a website without a scheme", () => {
    expect(errorsFor({ ...valid, companyWebsite: "example.com" }).companyWebsite).toBeTruthy();
  });
});

describe("/api/sponsor", () => {
  const req = (body: unknown) =>
    new Request("http://localhost/api/sponsor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    });

  it("is a 404 without the link's token, even for invalid data", async () => {
    vi.stubEnv("SPONSOR_FORM_TOKEN", TOKEN);
    expect((await sponsorPOST(req({ ...valid, accessToken: "guess" }))).status).toBe(404);
    expect((await sponsorPOST(req({}))).status).toBe(404);
    expect((await sponsorPOST(req("{nope"))).status).toBe(404);
  });

  it("is a 404 for everyone when no token is configured", async () => {
    vi.stubEnv("SPONSOR_FORM_TOKEN", "");
    expect((await sponsorPOST(req(valid))).status).toBe(404);
  });

  it("validates with the token and delivers parsed pass holders without the token", async () => {
    vi.stubEnv("SPONSOR_FORM_TOKEN", TOKEN);
    vi.stubEnv("SPONSOR_WEBHOOK_URL", "https://hooks.example.com/sponsor");
    vi.spyOn(console, "info").mockImplementation(() => {});
    const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    expect(
      (await sponsorPOST(req({ ...valid, tier: "Diamond", track: "Founding Stakeholder" }))).status,
    ).toBe(422);

    const res = await sponsorPOST(req(valid));
    expect(res.status).toBe(200);
    const sent = JSON.parse(String((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body));
    expect(sent.kind).toBe("sponsor");
    expect(sent.accessToken).toBeUndefined();
    expect(sent.acknowledge).toBeUndefined();
    expect(sent.passHolders).toEqual([
      { name: "Ada Obi", email: "ada@example.com" },
      { name: "Tunde Bello", email: "tunde@example.com" },
    ]);
    expect(sent.passAllowance).toBe(6);
    expect(JSON.stringify(sent)).not.toContain(TOKEN);
  });
});
