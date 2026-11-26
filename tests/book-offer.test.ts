import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { bookUrl, summitBook } from "@/data/book";

/** The book offered to delegates must say exactly what the book site and its checkout say. */
const ROOT = join(__dirname, "..");
const BOOK = join(ROOT, "../book/index.html");
const PHP = join(ROOT, "../central-backend/services/api/config/central.php");
const sha = (p: string) => createHash("sha256").update(readFileSync(p)).digest("hex");

describe("summit book offer", () => {
  it.skipIf(!existsSync(BOOK))("has the book site's price, ship date and tagline", () => {
    const html = readFileSync(BOOK, "utf8");
    expect(html).toContain(`price: '${summitBook.priceDisplay}',`);
    expect(html).toContain(`unitPrice: ${summitBook.price},`);
    expect(html).toContain(`shipDate: '${summitBook.shipDate}',`);
    expect(html.toLowerCase()).toContain(summitBook.pitch.replace(/\.$/, "").toLowerCase());
    expect(html).toContain(`alt="${summitBook.coverAlt}"`);
  });

  it.skipIf(!existsSync(PHP))("has the price and ship date the backend charges and emails", () => {
    const php = readFileSync(PHP, "utf8");
    expect(php).toContain(
      `'BOOK_PREORDER_PRICE_KOBO', ${(summitBook.price * 100).toLocaleString("en").replace(/,/g, "_")})`,
    );
    expect(php).toContain(`'BOOK_PREORDER_SHIP_DATE', '${summitBook.shipDate}'`);
    expect(php).toContain(`'BOOK_PREORDER_URL', '${summitBook.url}'`);
  });

  it.skipIf(!existsSync(join(ROOT, "../book/assets/cover-front.webp")))(
    "shows the book site's own front cover",
    () => {
      expect(sha(join(ROOT, "public", summitBook.cover.src))).toBe(
        sha(join(ROOT, "../book/assets/cover-front.webp")),
      );
    },
  );

  it("links to the pre-order page, tagged as coming from NLBS", () => {
    expect(bookUrl("seat_confirmed_page")).toBe(
      "https://advisingthefounder.com/preorder/?utm_source=nlbs&utm_medium=referral&utm_campaign=seat_confirmed_page",
    );
  });
});
