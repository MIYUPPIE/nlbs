/**
 * AI-generated illustrations. Kept apart from src/data/photos.ts on purpose:
 * photos are real and credited to photographers; these are generated images
 * and must never show the summit, a real event or a real, named person.
 * Each one is disclosed as AI-generated on /credits.
 */
export type IllustrationId =
  | "technology-productivity"
  | "pillars"
  | "audience"
  | "programme"
  | "investment"
  | "talent"
  | "startup-pitch"
  | "exhibition"
  | "deal-making"
  | "edition"
  | "faq";

export type Illustration = {
  id: IllustrationId;
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
  {
    id: "pillars",
    src: "/illustrations/pillars.webp",
    width: 1600,
    height: 900,
    alt: "AI-generated illustration: an investor reading growth charts on a tablet, two young professionals at laptops and an engineer holding a glowing circuit board, joined by gold lines",
    description: "Three Strategic Pillars: capital, talent and technology.",
    generator: "Z Image (Tongyi-MAI) via Higgsfield",
    createdOn: "2026-10-02",
  },
  {
    id: "audience",
    src: "/illustrations/audience.webp",
    width: 1600,
    height: 900,
    alt: "AI-generated illustration: Nigerian leaders in conversation in a bright lounge, an official in agbada and a cap beside business executives and a young founder",
    description: "Who will be in the room: leaders from government, business, investment and innovation.",
    generator: "Z Image (Tongyi-MAI) via Higgsfield",
    createdOn: "2026-10-02",
  },
  {
    id: "programme",
    src: "/illustrations/programme.webp",
    width: 1600,
    height: 900,
    alt: "AI-generated illustration: four speakers in armchairs on a stage, one speaking into a microphone, with the audience in silhouette",
    description: "Programme: panels and sessions.",
    generator: "Z Image (Tongyi-MAI) via Higgsfield",
    createdOn: "2026-10-02",
  },
  {
    id: "investment",
    src: "/illustrations/investment.webp",
    width: 1600,
    height: 900,
    alt: "AI-generated illustration: investors and founders shaking hands across a meeting table in a glass room overlooking the Lagos lagoon at sunset",
    description: "Capital: structured connections between investors and enterprises.",
    generator: "Z Image (Tongyi-MAI) via Higgsfield",
    createdOn: "2026-10-02",
  },
  {
    id: "talent",
    src: "/illustrations/talent.webp",
    width: 1600,
    height: 900,
    alt: "AI-generated illustration: a mentor guiding young graduates in caps and gowns as they work on laptops in a training room",
    description: "Talent and skills: young Nigerians being trained and placed.",
    generator: "Z Image (Tongyi-MAI) via Higgsfield",
    createdOn: "2026-10-02",
  },
  {
    id: "startup-pitch",
    src: "/illustrations/startup-pitch.webp",
    width: 1600,
    height: 900,
    alt: "AI-generated illustration: a founder pitching on a stage with a microphone, a growth chart on the screen behind and a panel of judges seated at a long table",
    description: "Startup Pitch Arena.",
    generator: "Z Image (Tongyi-MAI) via Higgsfield",
    createdOn: "2026-10-02",
  },
  {
    id: "exhibition",
    src: "/illustrations/exhibition.webp",
    width: 1600,
    height: 900,
    alt: "AI-generated illustration: visitors exploring a technology exhibition hall with drones overhead, a robotic arm, solar panels and demo screens",
    description: "Innovation Exhibition.",
    generator: "Z Image (Tongyi-MAI) via Higgsfield",
    createdOn: "2026-10-02",
  },
  {
    id: "deal-making",
    src: "/illustrations/deal-making.webp",
    width: 1600,
    height: 900,
    alt: "AI-generated illustration: a close-up handshake between two executives over a signed document and a fountain pen",
    description: "Structured deal-making.",
    generator: "Z Image (Tongyi-MAI) via Higgsfield",
    createdOn: "2026-10-02",
  },
  {
    id: "edition",
    src: "/illustrations/edition.webp",
    width: 1600,
    height: 900,
    alt: "AI-generated illustration: an abstract path of gold light stretching across a deep navy landscape to a glowing horizon",
    description: "Our journey: building on the previous year.",
    generator: "Z Image (Tongyi-MAI) via Higgsfield",
    createdOn: "2026-10-02",
  },
  {
    id: "faq",
    src: "/illustrations/faq.webp",
    width: 1600,
    height: 900,
    alt: "AI-generated illustration: a smiling host at a welcome desk answering a guest's question in a bright foyer",
    description: "FAQ: questions answered.",
    generator: "Z Image (Tongyi-MAI) via Higgsfield",
    createdOn: "2026-10-02",
  },
];

export function illustration(id: IllustrationId): Illustration {
  const i = illustrations.find((x) => x.id === id);
  if (!i) throw new Error(`Illustration "${id}" is missing`);
  return i;
}
