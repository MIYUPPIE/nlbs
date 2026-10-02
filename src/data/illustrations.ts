/**
 * AI-generated illustrations. Kept apart from src/data/photos.ts on purpose:
 * photos are real and credited to photographers; these are generated images
 * and must never show the summit, a real event or a real, named person.
 * Each one is disclosed as AI-generated on /credits.
 */
export type Illustration = {
  id: "technology-productivity";
  src: string;
  width: number;
  height: number;
  alt: string;
  /** Short description for the /credits page. */
  description: string;
  generator: string;
  createdOn: string;
};

export const illustrations: Illustration[] = [
  {
    id: "technology-productivity",
    src: "/illustrations/technology-productivity.webp",
    width: 1600,
    height: 900,
    alt: "AI-generated illustration: technology at work in Lagos at dusk, a farmer reading crop data on a tablet under drones, and a team at AI and data dashboards, linked by gold data lines",
    description:
      "Technology for a More Productive Nigeria (AI, FinTech, AgriTech, Enterprise and Public Technology).",
    generator: "Z Image (Tongyi-MAI) via Higgsfield",
    createdOn: "2026-10-02",
  },
];

export function illustration(id: Illustration["id"]): Illustration {
  const i = illustrations.find((x) => x.id === id);
  if (!i) throw new Error(`Illustration "${id}" is missing`);
  return i;
}
