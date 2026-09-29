import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { allRoutes, footerNav, mobileNav, primaryNav } from "@/data/navigation";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import { siteUrl } from "@/lib/site";

const APP = join(__dirname, "..", "src", "app");
const pageFile = (route: string) => join(APP, route === "/" ? "" : route, "page.tsx");

describe("routes", () => {
  it("every brief page exists", () => {
    expect([...allRoutes]).toEqual([
      "/",
      "/about",
      "/programme",
      "/speakers",
      "/investment",
      "/talent",
      "/technology",
      "/startup-pitch",
      "/exhibition",
      "/partners",
      "/register",
      "/contact",
      "/faq",
      "/talentnigeria20",
    ]);
    for (const r of allRoutes) expect(existsSync(pageFile(r)), r).toBe(true);
  });

  it("every nav link points at a real page", () => {
    for (const l of [...primaryNav, ...mobileNav, ...footerNav]) {
      expect(existsSync(pageFile(l.href)), l.href).toBe(true);
    }
  });

  it("desktop nav matches the brief order", () => {
    expect(primaryNav.map((l) => l.label)).toEqual([
      "About",
      "Programme",
      "Speakers",
      "Investment",
      "Talent",
      "Technology",
      "Partners",
    ]);
  });
});

describe("sitemap and robots", () => {
  it("sitemap lists every route once, with absolute URLs", () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls).toHaveLength(allRoutes.length);
    expect(new Set(urls).size).toBe(urls.length);
    for (const u of urls) expect(u.startsWith(siteUrl)).toBe(true);
  });

  it("robots allows the site, blocks the API, and points at the sitemap", () => {
    const r = robots();
    const rules = Array.isArray(r.rules) ? r.rules[0] : r.rules;
    expect(rules.allow).toBe("/");
    expect(rules.disallow).toEqual(["/api/"]);
    expect(r.sitemap).toBe(`${siteUrl}/sitemap.xml`);
  });
});
