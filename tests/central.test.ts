/**
 * The static site talks to the central backend directly from the browser.
 * Covers the request it sends, how every backend answer maps to what the
 * visitor sees, and that each form's payload matches the backend's contract
 * fixtures (../central-backend/contracts/fixtures), so the two repos cannot
 * drift apart silently.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { centralConfig, NOT_OPEN, submitToCentral, type CentralForm } from "@/lib/central";
import { prepare } from "@/lib/outgoing";
import { validEnquiry, validRegistration } from "./fixtures";
import { validSkills } from "./talent-form.test";

const CONFIG = { apiUrl: "https://api.nlbs.com.ng", siteKey: "pk_test_123" };

const reply = (status: number, body: unknown) =>
  vi.fn(async () =>
    typeof body === "string"
      ? new Response(body, { status })
      : new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }),
  );

describe("centralConfig", () => {
  it("needs an http(s) URL and a public key", () => {
    expect(centralConfig({})).toBeNull();
    expect(
      centralConfig({ NEXT_PUBLIC_CENTRAL_API_URL: "api.nlbs.com.ng", NEXT_PUBLIC_CENTRAL_SITE_KEY: "pk_x" }),
    ).toBeNull();
    // A secret key must never be accepted as the browser key.
    expect(
      centralConfig({
        NEXT_PUBLIC_CENTRAL_API_URL: "https://api.nlbs.com.ng",
        NEXT_PUBLIC_CENTRAL_SITE_KEY: "sk_x",
      }),
    ).toBeNull();
    expect(
      centralConfig({
        NEXT_PUBLIC_CENTRAL_API_URL: " https://api.nlbs.com.ng/ ",
        NEXT_PUBLIC_CENTRAL_SITE_KEY: "pk_x",
      }),
    ).toEqual({ apiUrl: "https://api.nlbs.com.ng", siteKey: "pk_x" });
  });
});

describe("submitToCentral", () => {
  it("says the form is not open when the backend is not configured (never a fake success)", async () => {
    const f = reply(201, { ok: true, reference: "N2-AAAA-BBBB" });
    for (const form of ["registration", "enquiry", "talent", "sponsor"] as CentralForm[]) {
      expect(await submitToCentral(form, {}, null, f)).toEqual({ ok: false, error: NOT_OPEN[form] });
    }
    expect(f).not.toHaveBeenCalled();
  });

  it("posts JSON with the public key and the form name, honeypot included", async () => {
    const f = reply(201, { ok: true, reference: "N2-AAAA-BBBB" });
    const res = await submitToCentral("registration", { fullName: "Ada", website: "" }, CONFIG, f);
    expect(res).toEqual({ ok: true, reference: "N2-AAAA-BBBB" });
    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.nlbs.com.ng/api/v1/submissions");
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({ "X-Site-Key": "pk_test_123", "Content-Type": "application/json" });
    expect(JSON.parse(String(init.body))).toEqual({ fullName: "Ada", website: "", form: "registration" });
  });

  it("a payload cannot override the form name", async () => {
    const f = reply(201, { ok: true, reference: "N2-AAAA-BBBB" });
    await submitToCentral("enquiry", { form: "talent" }, CONFIG, f);
    expect(JSON.parse(String((f.mock.calls[0] as unknown as [string, RequestInit])[1].body)).form).toBe(
      "enquiry",
    );
  });

  it("200 for a retried reference also counts as success", async () => {
    expect(
      await submitToCentral("enquiry", {}, CONFIG, reply(200, { ok: true, reference: "N2-AAAA-BBBB" })),
    ).toEqual({ ok: true, reference: "N2-AAAA-BBBB" });
  });

  it("maps 422 field errors onto the form", async () => {
    const res = await submitToCentral(
      "registration",
      {},
      CONFIG,
      reply(422, {
        ok: false,
        error: "Please correct the highlighted fields.",
        fieldErrors: { email: "Bad." },
      }),
    );
    expect(res).toEqual({
      ok: false,
      error: "Please correct the highlighted fields.",
      fieldErrors: { email: "Bad." },
    });
  });

  it("shows the backend's closed-window message", async () => {
    const res = await submitToCentral(
      "talent",
      {},
      CONFIG,
      reply(403, { ok: false, error: "Applications for the 2026 Talent Fund have closed." }),
    );
    expect(res).toEqual({ ok: false, error: "Applications for the 2026 Talent Fund have closed." });
  });

  it.each([
    [403, { ok: false, error: "This origin is not allowed for this site." }, /could not send/],
    [401, { ok: false, error: "Missing or invalid site key." }, /not open yet/],
    [429, { ok: false, error: "Too many submissions." }, /wait a minute/],
    [413, { ok: false, error: "Submission is too large." }, /too large/],
    [500, "<html>Server error</html>", /could not send/],
    [502, "Bad gateway", /could not send/],
  ])("HTTP %i gives the visitor a plain message", async (status, body, message) => {
    const res = await submitToCentral("registration", {}, CONFIG, reply(status, body));
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(message);
  });

  it("a network failure asks the visitor to check their connection", async () => {
    const f = vi.fn(async () => {
      throw new TypeError("Failed to fetch");
    });
    expect(await submitToCentral("enquiry", {}, CONFIG, f)).toEqual({
      ok: false,
      error: "We could not reach the server. Check your connection and try again.",
    });
  });
});

describe("contract with the central backend", () => {
  const FIXTURES = join(__dirname, "..", "..", "central-backend", "contracts", "fixtures");
  const hasBackend = existsSync(FIXTURES);
  const ENVELOPE = ["kind", "form", "reference", "submittedAt", "event", "website"];
  const fixtureKeys = (name: string) =>
    Object.keys(JSON.parse(readFileSync(join(FIXTURES, `${name}.json`), "utf8")))
      .filter((k) => !ENVELOPE.includes(k))
      .sort();
  const sentKeys = (form: CentralForm, values: unknown) => {
    const p = prepare[form](values);
    if (!p.ok) throw new Error(p.error);
    return Object.keys(p.fields)
      .filter((k) => !ENVELOPE.includes(k))
      .sort();
  };

  it.skipIf(!hasBackend)("every NLBS form has a backend fixture", () => {
    const names = readdirSync(FIXTURES).filter((f) => f.startsWith("nlbs-"));
    for (const n of [
      "nlbs-registration.json",
      "nlbs-enquiry.json",
      "nlbs-sponsor.json",
      "nlbs-talent-jobs.json",
    ])
      expect(names).toContain(n);
  });

  it.skipIf(!hasBackend)("registration sends exactly the fields the backend fixture has", () => {
    expect(
      sentKeys("registration", { ...validRegistration, whatsapp: "", nominatedBy: "", accessNeeds: "" }),
    ).toEqual(fixtureKeys("nlbs-registration"));
  });

  it.skipIf(!hasBackend)("enquiry sends exactly the fields the backend fixture has", () => {
    expect(sentKeys("enquiry", validEnquiry)).toEqual(fixtureKeys("nlbs-enquiry"));
  });

  it.skipIf(!hasBackend)("sponsor sends exactly the fields the backend fixture has", () => {
    const sponsor = {
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
      callAvailability: "",
      passHolders: "",
      acknowledge: "yes",
      website: "",
    };
    expect(sentKeys("sponsor", sponsor)).toEqual(fixtureKeys("nlbs-sponsor"));
  });

  it.skipIf(!hasBackend)("talent sends exactly the fields the backend fixture has", () => {
    expect(sentKeys("talent", validSkills)).toEqual(fixtureKeys("nlbs-talent-jobs"));
  });
});

describe("static site guarantees", () => {
  const ROOT = join(__dirname, "..");

  it("has no server routes (plain files on cPanel cannot run them)", () => {
    expect(existsSync(join(ROOT, "src", "app", "api"))).toBe(false);
    expect(readFileSync(join(ROOT, "next.config.ts"), "utf8")).toMatch(/output:\s*"export"/);
  });

  it(".env.production holds no secret key", () => {
    const env = readFileSync(join(ROOT, ".env.production"), "utf8");
    expect(env).not.toMatch(/sk_[A-Za-z0-9]/);
    for (const line of env.split("\n").filter((l) => /^[A-Z_]+=/.test(l))) {
      expect(line, line).toMatch(/^NEXT_PUBLIC_/);
    }
    expect(env).toMatch(/^NEXT_PUBLIC_CENTRAL_SITE_KEY=pk_/m);
  });
});
