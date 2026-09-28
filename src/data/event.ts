/**
 * Single source of truth for verified event facts.
 *
 * CONTENT RULE: only facts confirmed in the build brief live here.
 * Targets are targets. Never convert a target into an achievement.
 * Anything unconfirmed is `null` and renders as a labelled placeholder.
 */

export const event = {
  shortName: "Nigeria 2.0",
  name: "Nigerian Leadership Business Summit 2026",
  fullName: "Nigeria 2.0 Nigerian Leadership Business Summit 2026",
  edition: "2026 Edition",
  theme: "Nigeria 2.0: Unlocking Capital, Talent & Technology for a Resilient Economy",
  themeShort: "Unlocking Capital, Talent & Technology for a Resilient Economy",
  tagline: "Invest in People. Invest in Possibilities.",
  convener: "HBC Business Help",
  date: {
    /** ISO calendar date. No start/end time has been confirmed. */
    iso: "2026-11-27",
    display: "Friday, 27 November 2026",
    short: "27 Nov 2026",
    timeZone: "Africa/Lagos",
  },
  venue: {
    name: "Eko Convention Centre",
    city: "Lagos",
    country: "Nigeria",
    display: "Eko Convention Centre, Lagos",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Eko+Convention+Centre+Lagos+Nigeria",
  },
  previousEdition: {
    year: 2025,
    theme: "Leadership Beyond the Norm",
  },
  description:
    "Nigeria 2.0 brings together leaders, investors, businesses, policymakers, innovators and talent to unlock capital, talent and technology for a resilient Nigerian economy.",
  heroSupport:
    "Nigeria's business, investment and leadership community convenes to build practical pathways for capital, talent and technology to drive the country's next phase of economic growth.",
} as const;

/**
 * Contact details. All `null` until the convener confirms them.
 * Components render a clearly labelled placeholder for null values.
 */
export const contact: {
  email: string | null;
  phone: string | null;
  socials: { label: string; href: string }[];
} = {
  email: null,
  phone: null,
  socials: [],
};

export type StatKind = "expected" | "target";

export type Stat = {
  id: string;
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  /** Every figure is a projection. The UI prints this as a text badge. */
  kind: StatKind;
  note: string;
};

export const stats: Stat[] = [
  {
    id: "delegates",
    value: 800,
    suffix: "+",
    label: "Expected Delegates",
    kind: "expected",
    note: "Leaders from government, business, investment and talent.",
  },
  {
    id: "investment",
    value: 50,
    prefix: "$",
    suffix: "M+",
    label: "Target Investment Commitments",
    kind: "target",
    note: "The capital the summit is working to mobilise.",
  },
  {
    id: "talent",
    value: 10000,
    label: "Youth Talent Fund Target",
    kind: "target",
    note: "Young Nigerians the Nigeria 2.0 Talent Fund aims to reach.",
  },
  {
    id: "meetings",
    value: 200,
    suffix: "+",
    label: "Target B2B & B2G Meetings",
    kind: "target",
    note: "Structured business and government deal meetings.",
  },
];

export const statById = (id: string): Stat => {
  const stat = stats.find((s) => s.id === id);
  if (!stat) throw new Error(`Unknown stat: ${id}`);
  return stat;
};

export const formatStat = (stat: Stat, value = stat.value): string =>
  `${stat.prefix ?? ""}${value.toLocaleString("en-US")}${stat.suffix ?? ""}`;
