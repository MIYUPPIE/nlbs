/**
 * Talent Fund final shortlist (/talentnigeria20/shortlist). Guards:
 *   - the site data is exactly the convener's PDF (hash, declared count, re-parse),
 *   - search finds every applicant by their own name, in any word order,
 *   - the WhatsApp group link is the one supplied, and only the confirm step reveals it,
 *   - confirmation needs the right talent option AND state, never just a name,
 *   - the page is linked from the site but kept out of search engines and the sitemap.
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  shortlist,
  shortlistMeta,
  shortlistStates,
  shortlistTracks,
  whatsappGroupUrl,
} from "@/data/talent-shortlist";
import { allRoutes, footerSecondaryNav, mobileNav, shortlistPath } from "@/data/navigation";
import { NIGERIAN_STATES } from "@/lib/talent-form";
import {
  confirmEntry,
  displayName,
  groupByState,
  MAX_RESULTS,
  normalizeName,
  searchShortlist,
} from "@/lib/shortlist";
import sitemap from "@/app/sitemap";
import { metadata } from "@/app/talentnigeria20/shortlist/page";
import { parseShortlist } from "../scripts/extract-shortlist.mjs";

const ROOT = join(__dirname, "..");
const PDF = join(ROOT, "assets-src", "talent", shortlistMeta.source);
const WHATSAPP = "https://chat.whatsapp.com/Lf7XCgLgJbD3wS886uthYO?s=cl&p=a&mlu=4&ilr=4&iam=2";

const hasPdftotext = (() => {
  try {
    execFileSync("pdftotext", ["-v"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
})();

describe("shortlist data", () => {
  it("comes from the convener's PDF, unchanged", () => {
    expect(existsSync(PDF)).toBe(true);
    expect(createHash("sha256").update(readFileSync(PDF)).digest("hex")).toBe(shortlistMeta.sha256);
    expect(shortlistMeta.publishedIso).toBe("2026-11-16");
    expect(shortlistMeta.published).toBe("16 November 2026");
  });

  it.skipIf(!hasPdftotext)("re-parsing the PDF gives exactly the published rows", () => {
    const text = execFileSync("pdftotext", ["-layout", PDF, "-"], { encoding: "utf8", maxBuffer: 64 << 20 });
    const parsed = parseShortlist(text);
    expect(parsed.rows).toHaveLength(parsed.declared);
    expect(
      (parsed.rows as [string, number, number][]).map(([n, s, t]) => [
        n,
        shortlistStates[s],
        shortlistTracks[t],
      ]),
    ).toEqual(shortlist.map((e) => [e.name, e.state, e.track]));
  });

  it("has the 1,867 unique records the PDF declares, in its three tracks", () => {
    expect(shortlist).toHaveLength(1867);
    expect(shortlistMeta.declared).toBe(1867);
    const count = (t: string) => shortlist.filter((e) => e.track === t).length;
    expect([count("Skills"), count("Jobs"), count("Capital")]).toEqual([794, 292, 781]);
    // The PDF's "unique" count is case-sensitive: 5 applicants appear twice with different capitalisation
    // (e.g. "Ogbumba chinaza" / "Ogbumba Chinaza", same state and track). Published as supplied.
    expect(new Set(shortlist.map((e) => `${normalizeName(e.name)}|${e.state}|${e.track}`)).size).toBe(1862);
  });

  it("uses the application form's state names, covering all 36 states and the FCT", () => {
    expect([...shortlistStates]).toEqual([...NIGERIAN_STATES]);
    expect(new Set(shortlist.map((e) => e.state)).size).toBe(37);
    expect(groupByState(shortlist, shortlistTracks).reduce((n, g) => n + g.total, 0)).toBe(1867);
  });

  it("the parser refuses a list whose rows do not match the declared count", () => {
    const text =
      "16 NOVEMBER 2026 | 2 UNIQUE RECORDS\nFULL NAME   STATE   TRACK\nAda Obi    Lagos    Skills\n";
    expect(() => parseShortlist(text)).toThrow(/Parsed 1 rows, PDF declares 2/);
    expect(() =>
      parseShortlist("16 NOVEMBER 2026 | 1 UNIQUE RECORDS\nAda Obi    Atlantis    Skills\n"),
    ).toThrow(/Unparsed lines/);
  });
});

describe("names", () => {
  it("normalises case, accents, apostrophes and punctuation", () => {
    expect(normalizeName("  NWAKUDU   Précious, IFEOMA ")).toBe("nwakudu precious ifeoma");
    expect(normalizeName("Hauwa’u idris")).toBe("hauwau idris");
    expect(normalizeName("Aleke(Okonkwo) Precious")).toBe("aleke okonkwo precious");
  });

  it("displays applicant-typed names in one style", () => {
    expect(displayName("NWAKUDU PRECIOUS IFEOMA")).toBe("Nwakudu Precious Ifeoma");
    expect(displayName("Chibueze onyekachi")).toBe("Chibueze Onyekachi");
    expect(displayName("Hauwa’u idris")).toBe("Hauwa’u Idris");
    expect(displayName("Omeje (odo)faith chinaza")).toBe("Omeje (Odo)faith Chinaza");
    expect(displayName("EZENWAKA, CHINAZA MIRACLE")).toBe("Ezenwaka, Chinaza Miracle");
    expect(displayName("ijeoma-ade obi")).toBe("Ijeoma-Ade Obi");
  });
});

describe("search", () => {
  it("needs at least three letters", () => {
    expect(searchShortlist(shortlist, "ab").tooShort).toBe(true);
    expect(searchShortlist(shortlist, "  ").matches).toEqual([]);
  });

  it("matches words in any order, by prefix", () => {
    const r = searchShortlist(shortlist, "chidera okonkwo");
    expect(r.matches.map((m) => m.name)).toContain("Okonkwo Chidera Gift");
    expect(searchShortlist(shortlist, "okon chid").matches.map((m) => m.name)).toContain(
      "Okonkwo Chidera Gift",
    );
  });

  it("does not let one typed word satisfy two query words", () => {
    // "Abdullahi Abdullahi" style queries need two matching words in the name.
    for (const m of searchShortlist(shortlist, "abdullahi abdullahi").matches) {
      expect(m.key.split(" ").filter((w) => w.startsWith("abdullahi")).length).toBeGreaterThanOrEqual(2);
    }
  });

  it("returns nothing for a name that is not on the list", () => {
    const r = searchShortlist(shortlist, "Zzyzx Qwerty");
    expect(r.total).toBe(0);
    expect(r.matches).toEqual([]);
  });

  it("caps results and ranks exact words first", () => {
    const r = searchShortlist(shortlist, "muhammad");
    expect(r.total).toBeGreaterThan(MAX_RESULTS);
    expect(r.matches).toHaveLength(MAX_RESULTS);
    expect(r.matches[0].key.split(" ")).toContain("muhammad");
  });

  it("never reveals a track or state in results (that is what the applicant must confirm)", () => {
    for (const m of searchShortlist(shortlist, "fatima").matches) {
      expect(Object.keys(m).sort()).toEqual(["key", "name"]);
    }
  });

  it("finds every shortlisted applicant by their own full name", () => {
    const missing = shortlist.filter((e) => {
      const r = searchShortlist(shortlist, e.name);
      return !r.matches.some((m) => m.key === normalizeName(e.name));
    });
    expect(missing.map((e) => e.name)).toEqual([]);
  });
});

describe("confirmation", () => {
  const entry = shortlist.find((e) => e.name === "Okonkwo Chidera Gift")!;
  const key = normalizeName(entry.name);

  it("passes only with the right talent option and state", () => {
    expect(entry).toMatchObject({ state: "Abia", track: "Capital" });
    expect(confirmEntry(shortlist, key, { track: "Capital", state: "Abia" })).toEqual(entry);
    expect(confirmEntry(shortlist, key, { track: "Skills", state: "Abia" })).toBeNull();
    expect(confirmEntry(shortlist, key, { track: "Capital", state: "Lagos" })).toBeNull();
    expect(confirmEntry(shortlist, key, { track: "", state: "Abia" })).toBeNull();
    expect(confirmEntry(shortlist, key, { track: "Capital", state: "" })).toBeNull();
  });

  it("tells apart applicants who share a name by their track and state", () => {
    const groups = Map.groupBy(shortlist, (e) => normalizeName(e.name));
    const shared = [...groups.values()].filter((g) => g.length > 1);
    expect(shared.length).toBeGreaterThan(0);
    for (const g of shared) {
      for (const e of g) {
        expect(confirmEntry(shortlist, normalizeName(e.name), e)).toMatchObject({
          state: e.state,
          track: e.track,
        });
      }
    }
  });
});

describe("WhatsApp group", () => {
  it("is exactly the link the convener supplied", () => {
    expect(whatsappGroupUrl()).toBe(WHATSAPP);
  });

  it("never appears as plain text in the source (it is revealed only after confirmation)", () => {
    const walk = (d: string): string[] =>
      readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
    const hits = walk(join(ROOT, "src")).filter((p) => readFileSync(p, "utf8").includes("chat.whatsapp.com"));
    expect(hits).toEqual([]);
  });
});

describe("page", () => {
  it("is linked from the drawer and footer", () => {
    expect(shortlistPath).toBe("/talentnigeria20/shortlist");
    expect(mobileNav.some((l) => l.href === shortlistPath)).toBe(true);
    expect(footerSecondaryNav.some((l) => l.href === shortlistPath)).toBe(true);
    expect(existsSync(join(ROOT, "src", "app", "talentnigeria20", "shortlist", "page.tsx"))).toBe(true);
  });

  it("is linked from /talent and from the closed application page", () => {
    for (const f of ["src/app/talent/page.tsx", "src/components/talent/TalentWindowGate.tsx"]) {
      expect(readFileSync(join(ROOT, f), "utf8"), f).toContain("shortlistPath");
    }
  });

  it("lists young applicants by name, so it stays out of search engines and the sitemap", () => {
    expect(metadata.robots).toMatchObject({ index: false, follow: false });
    expect((allRoutes as readonly string[]).includes(shortlistPath)).toBe(false);
    expect(sitemap().some((e) => e.url.includes("shortlist"))).toBe(false);
    const htaccess = readFileSync(join(ROOT, "public", ".htaccess"), "utf8");
    expect(htaccess).toMatch(/talentnigeria20\/shortlist[\s\S]{0,80}X-Robots-Tag "noindex/);
  });

  it("does not publish the PDF itself", () => {
    expect(existsSync(join(ROOT, "public", shortlistMeta.source))).toBe(false);
  });
});
