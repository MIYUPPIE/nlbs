/**
 * Privacy (NDPA 2023) gate tests for the NLBS site.
 *
 *  - src/data/legal.json is the generated copy of the backend's policy
 *    contract (central-backend/contracts/privacy/dist/nlbs/legal.json).
 *  - The request form speaks the backend's language (request types, fields).
 *  - What the site actually does in the browser (storage keys, outside
 *    scripts) is what the cookie policy says. Add a tracker or a new storage
 *    key without updating the policy and this fails.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { LEGAL, PRIVACY_PATHS, PRIVACY_VERSION, REQUEST_TYPES, privacyRequestSchema } from "@/lib/privacy";
import { prepare } from "@/lib/outgoing";
import { ACCESS_CONSENT_MESSAGE, registrationSchema } from "@/lib/registration";
import { allRoutes, legalNav } from "@/data/navigation";
import { validRegistration } from "./fixtures";

const ROOT = join(__dirname, "..");
const BACKEND = join(ROOT, "..", "central-backend");
const hasBackend = existsSync(join(BACKEND, "contracts", "privacy", "dist", "nlbs", "legal.json"));

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx|css)$/.test(name) ? [path] : [];
  });
}
const SOURCES = sourceFiles(join(ROOT, "src")).map((path) => ({ path, text: readFileSync(path, "utf8") }));

describe("policy contract", () => {
  it.skipIf(!hasBackend)("src/data/legal.json is exactly the backend's generated copy", () => {
    const dist = readFileSync(join(BACKEND, "contracts", "privacy", "dist", "nlbs", "legal.json"), "utf8");
    expect(
      readFileSync(join(ROOT, "src", "data", "legal.json"), "utf8"),
      "run: node ../tools/sync-legal.mjs nlbs",
    ).toBe(dist);
  });

  it("has the three documents, a dated version and the NDPC contact", () => {
    expect(Object.keys(LEGAL.docs).sort()).toEqual(["cookies", "privacy", "terms"]);
    expect(PRIVACY_VERSION).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(LEGAL.facts.regulatorEmail).toBe("dpo@ndpc.gov.ng");
    expect(LEGAL.docs.privacy.html).toContain("mailto:dpo@ndpc.gov.ng");
    expect(LEGAL.docs.privacy.html).toContain(`mailto:${LEGAL.facts.dpoEmail}`);
  });

  it("every policy path is a real page and is linked from the footer", () => {
    for (const path of Object.values(PRIVACY_PATHS)) {
      const route = path.replace(/\/$/, "");
      expect(allRoutes as readonly string[], path).toContain(route);
      expect(existsSync(join(ROOT, "src", "app", route, "page.tsx")), path).toBe(true);
      expect(
        legalNav.map((l) => l.href),
        path,
      ).toContain(route);
    }
  });

  it("internal links inside the documents point at policy pages", () => {
    for (const doc of Object.values(LEGAL.docs)) {
      for (const [, href] of doc.html.matchAll(/href="([^"]+)"/g)) {
        if (/^(https?:|mailto:|#)/.test(href)) continue;
        expect(Object.values(PRIVACY_PATHS)).toContain(href);
      }
    }
  });
});

describe("privacy request form", () => {
  const valid = {
    fullName: "Ada Obi",
    email: "ada@example.com",
    phone: "",
    requestType: "access",
    reference: "",
    details: "",
    confirm: "yes",
    website: "",
  };
  const errorsFor = (input: unknown) => {
    const r = privacyRequestSchema.safeParse(input);
    return r.success ? {} : Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message]));
  };

  it.skipIf(!hasBackend)("offers exactly the backend's request types, with the same words", () => {
    const php = readFileSync(
      join(BACKEND, "services", "api", "app", "Forms", "PrivacyRequestForm.php"),
      "utf8",
    );
    const block = php.match(/TYPES = \[([\s\S]*?)\];/)![1];
    const backend = [...block.matchAll(/'([a-z_]+)' => '([^']+)'/g)].map(([, value, label]) => ({
      value,
      label,
    }));
    expect(REQUEST_TYPES.map((t) => ({ value: t.value, label: t.label }))).toEqual(backend);
  });

  it("accepts a simple access request and sends confirm as true", () => {
    const p = prepare.privacy(valid);
    expect(p.ok).toBe(true);
    if (p.ok)
      expect(p.fields).toMatchObject({ requestType: "access", confirm: true, email: "ada@example.com" });
  });

  it("needs the identity confirmation", () => {
    expect(errorsFor({ ...valid, confirm: "" }).confirm).toMatch(/confirm the data is about you/);
  });

  it("needs details where we cannot act without them", () => {
    for (const requestType of ["correction", "objection", "automated_review", "other"]) {
      expect(errorsFor({ ...valid, requestType }).details, requestType).toBe(
        "Tell us a little more so we can act on your request.",
      );
    }
    expect(errorsFor({ ...valid, requestType: "deletion" }).details).toBeUndefined();
  });

  it("rejects an unknown request type", () => {
    expect(errorsFor({ ...valid, requestType: "hack" }).requestType).toBe(
      "Choose what you would like us to do.",
    );
  });
});

describe("explicit consent for dietary and access needs (sensitive data)", () => {
  const errorsFor = (input: unknown) => {
    const r = registrationSchema.safeParse(input);
    return r.success ? {} : Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message]));
  };

  it("is required only when needs are given", () => {
    expect(errorsFor({ ...validRegistration, accessNeeds: "Halal meals" }).accessNeedsConsent).toBe(
      ACCESS_CONSENT_MESSAGE,
    );
    expect(
      errorsFor({ ...validRegistration, accessNeeds: "Halal meals", accessNeedsConsent: "yes" }),
    ).toEqual({});
    expect(errorsFor({ ...validRegistration, accessNeeds: "" })).toEqual({});
  });

  it.skipIf(!hasBackend)("uses the backend's message word for word", () => {
    const php = readFileSync(
      join(BACKEND, "services", "api", "app", "Forms", "Nlbs", "RegistrationForm.php"),
      "utf8",
    );
    expect(php).toContain(`ACCESS_CONSENT_MESSAGE = '${ACCESS_CONSENT_MESSAGE}'`);
  });

  it("is sent as a boolean that is only true when there are needs to consent to", () => {
    const withNeeds = prepare.registration({
      ...validRegistration,
      accessNeeds: "Ramp",
      accessNeedsConsent: "yes",
    });
    const without = prepare.registration({
      ...validRegistration,
      accessNeeds: "",
      accessNeedsConsent: "yes",
    });
    expect(withNeeds.ok && withNeeds.fields.accessNeedsConsent).toBe(true);
    expect(without.ok && without.fields.accessNeedsConsent).toBe(false);
  });
});

describe("the site does what the cookie policy says", () => {
  it("every browser storage key is declared in the policy", () => {
    const used = new Set<string>();
    for (const { path, text } of SOURCES) {
      for (const [, arg] of text.matchAll(
        /(?:localStorage|sessionStorage)\.(?:setItem|getItem|removeItem)\(\s*([^,)]+)/g,
      )) {
        const literal = arg.match(/^["'`]([^"'`]+)["'`]$/);
        const constant = literal
          ? null
          : text.match(new RegExp(`const ${arg.trim()}\\s*=\\s*["'\`]([^"'\`]+)["'\`]`));
        const key = literal?.[1] ?? constant?.[1];
        expect(key, `${path}: storage key ${arg} must be a string literal or a const`).toBeTruthy();
        used.add(key!);
      }
    }
    expect([...used].sort()).toEqual([...LEGAL.facts.storage].sort());
  });

  it("sets no cookies", () => {
    for (const { path, text } of SOURCES) expect(text, path).not.toMatch(/document\.cookie/);
  });

  it("loads no outside scripts, frames or fonts that the policy does not list", () => {
    const allowed = LEGAL.facts.thirdPartyOrigins;
    for (const { path, text } of SOURCES) {
      expect(text, `${path}: next/script needs a policy entry and consent`).not.toMatch(
        /from "next\/script"/,
      );
      expect(text, `${path}: iframes load outside content`).not.toMatch(/<iframe/);
      for (const [, url] of text.matchAll(
        /<(?:script|link)[^>]+(?:src|href)=["'{`]+(https?:\/\/[^"'`}]+)/g,
      )) {
        expect(allowed, `${path} loads ${url}`).toContain(new URL(url).origin);
      }
      for (const host of [
        "googletagmanager.com",
        "google-analytics.com",
        "connect.facebook.net",
        "snap.licdn.com",
        "fonts.googleapis.com",
      ]) {
        expect(text, `${path} references ${host}`).not.toContain(host);
      }
    }
  });

  it("fonts are self-hosted at build time (next/font), so visitors never contact Google", () => {
    const layout = readFileSync(join(ROOT, "src", "app", "layout.tsx"), "utf8");
    expect(layout).toMatch(/from "next\/font\/google"/);
  });
});
