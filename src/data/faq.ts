import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseFaq, type FaqCategory, type FaqItem } from "@/lib/faq";

/**
 * Client-supplied FAQ. Source of truth: content/faq.md (paste updates there).
 * content/faq-overrides.json patches answers that are missing or malformed in
 * the source. Parsed at build time; the /faq page is fully static.
 */
const root = join(process.cwd(), "content");

function load(): FaqCategory[] {
  const md = readFileSync(join(root, "faq.md"), "utf8");
  const raw = JSON.parse(readFileSync(join(root, "faq-overrides.json"), "utf8")) as Record<string, string>;
  const overrides = Object.fromEntries(
    Object.entries(raw)
      .filter(([k]) => /^\d+$/.test(k))
      .map(([k, v]) => [Number(k), v]),
  );
  return parseFaq(md, { overrides });
}

export const faqCategories: FaqCategory[] = load();

export const faqItems: FaqItem[] = faqCategories.flatMap((c) => c.items);

export const faqByNumber = (n: number): FaqItem => {
  const item = faqItems.find((i) => i.number === n);
  if (!item) throw new Error(`FAQ ${n} not found`);
  return item;
};

/** Shown on the homepage. */
export const featuredFaqNumbers = [1, 2, 9, 16, 77, 78];
