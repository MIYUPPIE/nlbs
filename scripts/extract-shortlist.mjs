#!/usr/bin/env node
/**
 * Turns the convener's Talent Fund shortlist PDF into site data.
 *
 *   node scripts/extract-shortlist.mjs [path/to/shortlist.pdf]
 *
 * Reads the PDF with `pdftotext -layout` (poppler-utils), keeps every
 * "FULL NAME  STATE  TRACK" row, and refuses to write anything unless:
 *   - the row count equals the "N UNIQUE RECORDS" figure printed in the PDF header,
 *   - every state is one of the 36 states or the FCT (as named on the application form),
 *   - every track is Skills, Jobs or Capital,
 *   - no line between the headers is left unparsed.
 * Writes src/data/talent-shortlist.generated.json. Never edit that file by hand.
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const PDF =
  process.argv[2] ??
  join(ROOT, "assets-src", "talent", "Nigeria_2.0_Talent_Fund_Final_Shortlist_16_November_2026.pdf");
const OUT = join(ROOT, "src", "data", "talent-shortlist.generated.json");

// Same names and order as NIGERIAN_STATES in src/lib/talent-form.ts (tests/shortlist.test.ts checks they agree).
const STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT (Abuja)",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];
const TRACKS = ["Skills", "Jobs", "Capital"];
const MONTHS = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
];

export function parseShortlist(text) {
  const header = text.match(/(\d{1,2}) ([A-Z]+) (\d{4}) \| ([\d,]+) UNIQUE RECORDS/);
  if (!header) throw new Error("Header '<date> | <n> UNIQUE RECORDS' not found");
  const month = MONTHS.indexOf(header[2]) + 1;
  if (month === 0) throw new Error(`Unknown month ${header[2]}`);
  const publishedIso = `${header[3]}-${String(month).padStart(2, "0")}-${header[1].padStart(2, "0")}`;
  const declared = Number(header[4].replace(/,/g, ""));

  const rows = [];
  const unparsed = [];
  for (const line of text.split("\n")) {
    const s = line.trim();
    if (
      !s ||
      s.startsWith("FULL NAME") ||
      s.startsWith("FINAL SHORTLIST") ||
      /^NIGERIA 2\.0 TALENT FUND 2026/.test(s) ||
      /UNIQUE RECORDS$/.test(s)
    )
      continue;
    const parts = s.split(/\s{2,}/);
    const [name, state, track] = parts;
    if (parts.length === 3 && STATES.includes(state) && TRACKS.includes(track)) {
      rows.push([name.replace(/\s+/g, " "), STATES.indexOf(state), TRACKS.indexOf(track)]);
    } else unparsed.push(line);
  }
  if (unparsed.length) throw new Error(`Unparsed lines:\n${unparsed.slice(0, 10).join("\n")}`);
  if (rows.length !== declared) throw new Error(`Parsed ${rows.length} rows, PDF declares ${declared}`);
  return { publishedIso, declared, rows };
}

if (process.argv[1] === import.meta.filename) {
  const text = execFileSync("pdftotext", ["-layout", PDF, "-"], { encoding: "utf8", maxBuffer: 64 << 20 });
  const { publishedIso, declared, rows } = parseShortlist(text);
  const sha256 = createHash("sha256").update(readFileSync(PDF)).digest("hex");
  const data = {
    source: basename(PDF),
    sha256,
    publishedIso,
    declared,
    states: STATES,
    tracks: TRACKS,
    rows,
  };
  writeFileSync(OUT, JSON.stringify(data) + "\n");
  console.log(`Wrote ${rows.length} shortlisted applicants (${publishedIso}) to ${OUT}`);
}
