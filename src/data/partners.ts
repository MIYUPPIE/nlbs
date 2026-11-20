/**
 * Partners: the five organisations under "In partnership with" on the
 * convener's event flyer (Nov 2026, assets-src/partners/flyer-nov-2026.jpeg),
 * in the flyer's order. No other partners are confirmed, so the site lists
 * these and nothing else (no placeholder categories).
 *
 * Logos are uniform 480x240 tiles built by scripts/build-partner-logos.mjs,
 * which documents each logo's source. To add a partner, add its source to that
 * script, run it, and add `{ name, logo: "/partners/<file>" }` here.
 */
export type Partner = {
  name: string;
  logo: string;
};

/** Pixel size of every file in public/partners (2:1). */
export const PARTNER_LOGO_SIZE = { width: 480, height: 240 } as const;

export const partners: Partner[] = [
  { name: "Keystone Bank", logo: "/partners/keystone-bank.png" },
  { name: "Dmax Media", logo: "/partners/dmax-media.png" },
  { name: "allevents.ng", logo: "/partners/allevents-ng.png" },
  { name: "TA Media Communications", logo: "/partners/ta-media.png" },
  { name: "Praxis Medical Nigeria", logo: "/partners/praxis-medical.png" },
];

export const partnershipBenefits = [
  {
    title: "Shape the agenda",
    detail: "Contribute to the conversations on capital, talent and technology.",
  },
  {
    title: "Meet decision makers",
    detail: "Engage with leaders across government, business and investment.",
  },
  {
    title: "Back the Talent Fund",
    detail: "Support the Nigeria 2.0 Talent Fund target of 10,000 youth.",
  },
  {
    title: "Show your innovation",
    detail: "Present products and platforms at the Innovation Exhibition.",
  },
];
