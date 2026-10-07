/**
 * Single source of truth for verified event facts.
 *
 * CONTENT RULE: only facts confirmed in the build brief or the convener's own
 * documents (latest/1.md, 2.md, the event flyer) live here. Where a document
 * contradicts the brief, the brief wins. Targets are targets. Never convert a
 * target into an achievement. Anything unconfirmed is `null`.
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
    /** ISO calendar date. */
    iso: "2026-11-30",
    display: "Monday, 30 November 2026",
    short: "30 Nov 2026",
    timeZone: "Africa/Lagos",
    /** Start time, local (flyer: "9:00 AM prompt"; FAQ: "9AM Plenary"). */
    startTime: "09:00",
    startDisplay: "9:00 AM WAT",
  },
  venue: {
    name: "Eko Convention Centre",
    city: "Lagos",
    country: "Nigeria",
    display: "Eko Convention Centre, Lagos",
    address: "Eko Hotels & Suites, Victoria Island, Lagos",
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
 * Contact details from the convener's documents (2.md footer, event flyer,
 * FAQ Q99). `socials` stays empty until full profile URLs are supplied; the
 * handle is shown as text.
 */
export const contact: {
  email: string | null;
  phone: string | null;
  socialHandle: string | null;
  secretariat: string | null;
  socials: { label: string; href: string }[];
} = {
  email: "info@nlbs.com.ng",
  phone: "+234 803 231 5349",
  socialHandle: "@Nigeria20Summit",
  secretariat: "5 Oremeji Oyo Road, Mokola, Ibadan, Oyo State. Lagos office by appointment.",
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
