/**
 * Advising The Founder, the summit book (book/index.html, sold at
 * advisingthefounder.com/preorder/ through the central backend). Offered to
 * delegates once their seat is paid. Same price and ship date as the book
 * site's CONFIG; tests/book-offer.test.ts compares them.
 */
export const summitBook = {
  title: "Advising The Founder",
  author: "Dr. Wale Busari",
  price: 10_000,
  priceDisplay: "₦10,000",
  shipDate: "10 December 2026",
  cover: { src: "/book/advising-the-founder.webp", width: 705, height: 1125 },
  /** The book's own tagline (book/index.html hero). */
  pitch: "The CEO's Playbook for guiding visionaries through chaos, conflict and scale without meltdown.",
  coverAlt:
    "Front cover of Advising The Founder by Dr. Wale Busari: The CEO's Playbook for Guiding Visionaries Through Chaos, Conflict and Scale without Meltdown",
  url: "https://advisingthefounder.com/preorder/",
};

/** The pre-order link with where the buyer came from (book site analytics). */
export function bookUrl(campaign: string): string {
  return `${summitBook.url}?utm_source=nlbs&utm_medium=referral&utm_campaign=${encodeURIComponent(campaign)}`;
}
