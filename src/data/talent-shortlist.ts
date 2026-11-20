import data from "./talent-shortlist.generated.json";

/**
 * Nigeria 2.0 Talent Fund 2026 final shortlist (convener PDF, 16 November 2026).
 * Source: assets-src/talent/Nigeria_2.0_Talent_Fund_Final_Shortlist_16_November_2026.pdf,
 * turned into talent-shortlist.generated.json by scripts/extract-shortlist.mjs.
 * The PDF itself is never published (tests/content-integrity.test.ts); the page
 * at /talentnigeria20/shortlist renders this data instead.
 */

export type Track = "Skills" | "Jobs" | "Capital";
export type ShortlistEntry = { name: string; state: string; track: Track };

export const shortlistMeta = {
  source: data.source,
  sha256: data.sha256,
  publishedIso: data.publishedIso,
  published: "16 November 2026",
  /** The "N UNIQUE RECORDS" figure printed on the PDF. The extractor refuses to write if it differs from the rows. */
  declared: data.declared,
};

export const shortlistStates: readonly string[] = data.states;
export const shortlistTracks = data.tracks as readonly Track[];

export const shortlist: readonly ShortlistEntry[] = (data.rows as [string, number, number][]).map(
  ([name, s, t]) => ({ name, state: data.states[s], track: data.tracks[t] as Track }),
);

/** What each track means for a shortlisted applicant (same wording as the application form tracks). */
export const trackSummary: Record<Track, string> = {
  Skills: "12 weeks of free training",
  Jobs: "Internship or job placement",
  Capital: "Enterprise grant with mentorship",
};

/**
 * The shortlisted applicants' WhatsApp group, supplied by the convener (20 Nov 2026).
 * Stored encoded so it does not sit as plain text in the page source or bundle; it is
 * shown only after an applicant confirms their name, track and state. This keeps casual
 * scrapers out. It is not access control: the list itself is public.
 */
const WHATSAPP_GROUP_B64 =
  "aHR0cHM6Ly9jaGF0LndoYXRzYXBwLmNvbS9MZjdYQ2dMZ0piRDN3Uzg4NnV0aFlPP3M9Y2wmcD1hJm1sdT00Jmlscj00JmlhbT0y";

export function whatsappGroupUrl(): string {
  return atob(WHATSAPP_GROUP_B64);
}
