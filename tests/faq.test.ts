import { describe, expect, it } from "vitest";
import {
  cleanAnswer,
  cleanQuestion,
  FaqFormatError,
  filterFaq,
  linkify,
  parseFaq,
  slugify,
  titleCase,
} from "@/lib/faq";
import { faqByNumber, faqCategories, faqItems, featuredFaqNumbers } from "@/data/faq";

const sample = `Intro text that is not a question.

---

*A. GENERAL & VISION [1-2]*

1. *What is it?*
    A summit [2026-2036] for leaders.

2. *Is it annual*
    Yes.
    Every year.

*B. TALENT FUND - CORE PRODUCT [3-3]*

3. *Where do I apply?*
    Visit http://example.com/apply, or email team@example.com.
`;

describe("parseFaq", () => {
  it("builds categories and items from the markdown", () => {
    const cats = parseFaq(sample);
    expect(cats.map((c) => [c.letter, c.title, c.id, c.range])).toEqual([
      ["A", "General & Vision", "general-and-vision", [1, 2]],
      ["B", "Talent Fund: Core Product", "talent-fund-core-product", [3, 3]],
    ]);
    expect(cats[0].items).toEqual([
      { number: 1, question: "What is it?", answer: "A summit (2026-2036) for leaders." },
      { number: 2, question: "Is it annual?", answer: "Yes. Every year." },
    ]);
  });

  it("applies overrides by question number", () => {
    const cats = parseFaq(sample, { overrides: { 2: "Yes, every November." } });
    expect(cats[0].items[1].answer).toBe("Yes, every November.");
  });

  it("rejects a missing answer", () => {
    expect(() => parseFaq(sample.replace("    Yes.\n    Every year.\n", ""))).toThrow(
      /Question 2 has no answer/,
    );
  });

  it("rejects out-of-sequence numbering", () => {
    expect(() => parseFaq(sample.replace("2. *Is it annual*", "4. *Is it annual*"))).toThrow(FaqFormatError);
  });

  it("rejects a category whose range does not match its questions", () => {
    expect(() => parseFaq(sample.replace("[1-2]", "[1-5]"))).toThrow(/declares \[1-5\]/);
  });

  it("rejects an empty document", () => {
    expect(() => parseFaq("nothing here")).toThrow(/No FAQ categories/);
  });
});

describe("helpers", () => {
  it("titleCase keeps ampersands and lowercases small words", () => {
    expect(titleCase("TRUST & LEGAL")).toBe("Trust & Legal");
    expect(titleCase("ATTENDEES & LOGISTICS")).toBe("Attendees & Logistics");
  });

  it("slugify", () => expect(slugify("Trust & Legal")).toBe("trust-and-legal"));

  it("cleanQuestion strips markers and ensures a question mark", () => {
    expect(cleanQuestion("*What is http://nlbs.com.ng/x")).toBe("What is http://nlbs.com.ng/x?");
    expect(cleanQuestion("*Why?*")).toBe("Why?");
  });

  it("cleanAnswer tidies spacing and brackets", () => {
    expect(cleanAnswer("  Yes ,  [N50M]   now .")).toBe("Yes, (N50M) now.");
  });

  it("linkify splits URLs and emails without trailing punctuation", () => {
    expect(linkify("Visit http://a.com/x, or mail b@c.com.ng.")).toEqual([
      { type: "text", value: "Visit " },
      { type: "url", value: "http://a.com/x" },
      { type: "text", value: ", or mail " },
      { type: "email", value: "b@c.com.ng" },
      { type: "text", value: "." },
    ]);
  });

  it("filterFaq matches all terms across question and answer, ignoring case", () => {
    const cats = parseFaq(sample);
    expect(filterFaq(cats, "ANNUAL every").flatMap((c) => c.items.map((i) => i.number))).toEqual([2]);
    expect(filterFaq(cats, "  ")).toBe(cats);
    expect(filterFaq(cats, "zzz")).toEqual([]);
    expect(filterFaq(cats, "3").flatMap((c) => c.items.map((i) => i.number))).toContain(3);
  });
});

describe("content/faq.md (the real document)", () => {
  it("parses all 101 questions in five categories", () => {
    expect(faqItems).toHaveLength(101);
    expect(faqItems.map((i) => i.number)).toEqual(Array.from({ length: 101 }, (_, i) => i + 1));
    expect(faqCategories.map((c) => [c.letter, c.title, c.items.length])).toEqual([
      ["A", "General & Vision", 15],
      ["B", "Talent Fund: Core Product", 30],
      ["C", "Partnership & Sponsorship", 30],
      ["D", "Attendees & Logistics", 17],
      ["E", "Trust & Legal", 9],
    ]);
  });

  it("every question ends with a question mark and every answer is non-empty", () => {
    for (const i of faqItems) {
      expect(i.question, `Q${i.number}`).toMatch(/\?$/);
      expect(i.answer.length, `Q${i.number}`).toBeGreaterThan(1);
      expect(i.question).not.toContain("*");
      expect(i.answer).not.toContain("*");
    }
  });

  it("keeps source answers verbatim where no override exists", () => {
    expect(faqByNumber(3).answer).toBe(
      "Nigeria 2.0: Unlocking Capital, Talent and Technology for a Resilient Economy.",
    );
    expect(faqByNumber(98).answer).toBe("Ethics line: ethicsnigeria20@nlbs.com.ng, response in 48 hours.");
  });

  it("answers the question the source left blank", () => {
    expect(faqByNumber(101).question).toBe("How do I start now?");
    expect(faqByNumber(101).answer).toMatch(/Register as a delegate/);
  });

  it("featured questions exist", () => {
    for (const n of featuredFaqNumbers) expect(() => faqByNumber(n)).not.toThrow();
  });
});
