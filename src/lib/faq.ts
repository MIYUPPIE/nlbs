/**
 * Parser for the client-supplied FAQ document (content/faq.md).
 *
 * Pure and deterministic: same markdown in, same structure out. It validates
 * the document so a bad paste fails the build instead of silently dropping
 * or misnumbering questions.
 *
 * Expected shape (WhatsApp-style markdown):
 *
 *   *A. GENERAL & VISION [1-15]*
 *
 *   1. *What is Nigeria Leadership Business Summit?*
 *       It is a private-sector led ...
 */

export type FaqItem = { number: number; question: string; answer: string };

export type FaqCategory = {
  id: string;
  letter: string;
  title: string;
  range: [number, number];
  items: FaqItem[];
};

const CATEGORY_RE = /^\*([A-Z])\.\s+(.+?)\s*\[(\d+)\s*-\s*(\d+)\]\*\s*$/;
const QUESTION_RE = /^(\d+)\.\s+(.+)$/;

const SMALL_WORDS = new Set(["and", "of", "the", "for", "to", "in", "on", "a"]);

/** "TALENT FUND - CORE PRODUCT" → "Talent Fund: Core Product" */
export function titleCase(raw: string): string {
  return raw
    .replace(/\s+-\s+/g, ": ")
    .toLowerCase()
    .split(/\s+/)
    .map((w, i) => (i > 0 && SMALL_WORDS.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

export const slugify = (s: string): string =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Strip markdown emphasis markers, tidy spacing, ensure a question mark. */
export function cleanQuestion(raw: string): string {
  let q = raw.replace(/^\*+|\*+$/g, "").trim();
  q = q.replace(/\s+/g, " ");
  if (!/[?]$/.test(q)) q = `${q.replace(/[.:]$/, "")}?`;
  return q;
}

/** Brackets used as inline asides become parentheses; spacing is normalised. */
export function cleanAnswer(raw: string): string {
  return raw
    .replace(/\[([^\]]+)\]/g, "($1)")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:])/g, "$1")
    .trim();
}

/** A replacement answer, or a replacement question and/or answer. */
export type FaqOverride = string | { question?: string; answer?: string };

export type ParseOptions = {
  /** Replacements by question number (for missing, malformed or superseded source text). */
  overrides?: Record<number, FaqOverride>;
};

export function parseFaq(markdown: string, options: ParseOptions = {}): FaqCategory[] {
  const overrides = options.overrides ?? {};
  const categories: FaqCategory[] = [];
  let current: FaqCategory | null = null;
  let item: FaqItem | null = null;

  const finishItem = () => {
    if (!item || !current) return;
    const o = overrides[item.number];
    const answer = typeof o === "string" ? o : o?.answer;
    if (typeof o === "object" && o.question) item.question = cleanQuestion(o.question);
    item.answer = answer !== undefined ? answer.trim() : cleanAnswer(item.answer);
    current.items.push(item);
    item = null;
  };

  for (const rawLine of markdown.split(/\r?\n/)) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    const cat = CATEGORY_RE.exec(trimmed);
    if (cat) {
      finishItem();
      const title = titleCase(cat[2]);
      current = {
        id: slugify(title),
        letter: cat[1],
        title,
        range: [Number(cat[3]), Number(cat[4])],
        items: [],
      };
      categories.push(current);
      continue;
    }

    // Questions start at column 0; indented lines are answer text.
    const q = current && !/^\s/.test(line) ? QUESTION_RE.exec(trimmed) : null;
    if (q) {
      finishItem();
      item = { number: Number(q[1]), question: cleanQuestion(q[2]), answer: "" };
      continue;
    }

    if (item && trimmed && trimmed !== "---") {
      item.answer += ` ${trimmed}`;
    }
  }
  finishItem();

  validate(categories);
  return categories;
}

export class FaqFormatError extends Error {}

function validate(categories: FaqCategory[]) {
  if (categories.length === 0) throw new FaqFormatError("No FAQ categories found.");
  let expected = 1;
  for (const c of categories) {
    const [from, to] = c.range;
    if (c.items.length !== to - from + 1) {
      throw new FaqFormatError(
        `Category ${c.letter} declares [${from}-${to}] but has ${c.items.length} questions.`,
      );
    }
    for (const it of c.items) {
      if (it.number !== expected) {
        throw new FaqFormatError(`Expected question ${expected}, found ${it.number}.`);
      }
      if (it.number < from || it.number > to) {
        throw new FaqFormatError(`Question ${it.number} is outside category ${c.letter} [${from}-${to}].`);
      }
      if (!it.answer) {
        throw new FaqFormatError(`Question ${it.number} has no answer. Add one or an override.`);
      }
      expected++;
    }
  }
}

/** Case- and accent-insensitive match on question or answer. */
export function normalize(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function filterFaq(categories: FaqCategory[], query: string): FaqCategory[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return categories;
  return categories
    .map((c) => ({
      ...c,
      items: c.items.filter((it) => {
        const hay = normalize(`${it.number} ${it.question} ${it.answer}`);
        return terms.every((t) => hay.includes(t));
      }),
    }))
    .filter((c) => c.items.length > 0);
}

export type AnswerPart = { type: "text" | "url" | "email"; value: string };

/** Splits an answer into plain text, URLs and emails so they can be linked. */
export function linkify(text: string): AnswerPart[] {
  const re = /(https?:\/\/[^\s)]+[^\s).,;:])|([\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g;
  const parts: AnswerPart[] = [];
  let last = 0;
  for (const m of text.matchAll(re)) {
    const idx = m.index ?? 0;
    if (idx > last) parts.push({ type: "text", value: text.slice(last, idx) });
    parts.push(m[1] ? { type: "url", value: m[1] } : { type: "email", value: m[2] });
    last = idx + m[0].length;
  }
  if (last < text.length) parts.push({ type: "text", value: text.slice(last) });
  return parts;
}

export const faqAnchor = (n: number) => `q-${n}`;
