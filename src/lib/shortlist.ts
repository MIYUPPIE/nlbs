import type { ShortlistEntry, Track } from "@/data/talent-shortlist";

/**
 * Search and confirmation rules for the Talent Fund shortlist finder.
 * Pure functions, unit-tested in tests/shortlist.test.ts.
 */

/** Lower case, accents and apostrophes removed, any other punctuation becomes a space. */
export function normalizeName(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’`‘]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const tokens = (s: string) => normalizeName(s).split(" ").filter(Boolean);

/** Names in the PDF are typed by applicants ("NWAKUDU PRECIOUS", "Chibueze onyekachi"). Show them in one style. */
export function displayName(s: string): string {
  return s
    .toLowerCase()
    .replace(/(^|[\s\-(])(\p{L})/gu, (_, sep: string, ch: string) => sep + ch.toUpperCase())
    .replace(/\s*,\s*/g, ", ")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")");
}

export const MIN_QUERY_LENGTH = 3;
export const MAX_RESULTS = 8;

export type NameMatch = {
  /** Normalised name: the key used to confirm. Several entries can share it. */
  key: string;
  name: string;
};

type IndexEntry = { key: string; words: string[]; name: string };
const indexes = new WeakMap<readonly ShortlistEntry[], IndexEntry[]>();

/** One entry per distinct normalised name, built once per list (search runs on every keystroke). */
function indexOf(list: readonly ShortlistEntry[]): IndexEntry[] {
  let index = indexes.get(list);
  if (!index) {
    const byKey = new Map<string, IndexEntry>();
    for (const e of list) {
      const key = normalizeName(e.name);
      if (!byKey.has(key)) byKey.set(key, { key, words: key.split(" "), name: displayName(e.name) });
    }
    index = [...byKey.values()];
    indexes.set(list, index);
  }
  return index;
}

/**
 * Every word typed must start a different word of the name, in any order, so
 * "chidera okonkwo" finds "Okonkwo Chidera Gift". Applicants who share a
 * name collapse into one result; their track and state tell them apart at
 * the confirmation step, which is why results never show either.
 */
export function searchShortlist(
  list: readonly ShortlistEntry[],
  query: string,
): { matches: NameMatch[]; total: number; tooShort: boolean } {
  const q = tokens(query);
  if (q.join("").length < MIN_QUERY_LENGTH) return { matches: [], total: 0, tooShort: true };
  const hits: (NameMatch & { score: number })[] = [];
  for (const { key, words, name } of indexOf(list)) {
    const used = new Set<number>();
    const ok = q.every((t) => {
      const i = words.findIndex((w, j) => !used.has(j) && w.startsWith(t));
      if (i === -1) return false;
      used.add(i);
      return true;
    });
    if (!ok) continue;
    // Exact words first, then names with fewer extra words.
    const exact = q.filter((t) => words.includes(t)).length;
    hits.push({ key, name, score: exact * 100 - words.length });
  }
  hits.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  return {
    matches: hits.slice(0, MAX_RESULTS).map(({ key, name }) => ({ key, name })),
    total: hits.length,
    tooShort: false,
  };
}

/** The applicant's own answer for their track and state must match a shortlist entry with that name. */
export function confirmEntry(
  list: readonly ShortlistEntry[],
  key: string,
  answer: { track: Track | ""; state: string },
): ShortlistEntry | null {
  if (!answer.track || !answer.state) return null;
  return (
    list.find((e) => normalizeName(e.name) === key && e.track === answer.track && e.state === answer.state) ??
    null
  );
}

/** Attempts after which the finder also shows who to contact. */
export const HELP_AFTER_FAILED_ATTEMPTS = 2;

/** Shortlist grouped by state (alphabetical), each with its entries by track then name. */
export function groupByState(list: readonly ShortlistEntry[], trackOrder: readonly Track[]) {
  const by = new Map<string, ShortlistEntry[]>();
  for (const e of list) by.set(e.state, [...(by.get(e.state) ?? []), e]);
  return [...by.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([state, entries]) => ({
      state,
      total: entries.length,
      tracks: trackOrder.map((track) => ({
        track,
        names: entries
          .filter((e) => e.track === track)
          .map((e) => displayName(e.name))
          .sort((a, b) => a.localeCompare(b)),
      })),
    }));
}

export function slugify(s: string): string {
  return normalizeName(s).replace(/ /g, "-");
}
