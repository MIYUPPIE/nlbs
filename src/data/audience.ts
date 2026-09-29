import type { IconName } from "@/components/ui/Icon";

/**
 * Who will be in the room, from the convener's audience profile
 * (latest/NLBS2026_Audience_Profile_Premium.pdf). Seat counts are the
 * profile's estimates for the 800 invitation-only seats, not confirmed
 * attendance. Named companies and institutions from the profile are left out
 * until they confirm, as are its combined AUM and revenue figures.
 */

export type AudienceGroup = {
  label: string;
  description: string;
  icon: IconName;
  /** Estimated seats out of the 800. */
  estimate: number;
};

export const audience: AudienceGroup[] = [
  {
    label: "Government & Policy",
    description: "Federal Ministers, State Governors and Commissioners, regulators and agencies",
    icon: "landmark",
    estimate: 80,
  },
  {
    label: "Capital & DFIs",
    description:
      "Chief executives of leading banks, development finance institutions, PE and VC fund managers",
    icon: "wallet",
    estimate: 100,
  },
  {
    label: "Corporates",
    description: "CEOs and MDs of leading listed companies and heads of regional multinationals",
    icon: "building",
    estimate: 200,
  },
  {
    label: "Tech & Innovation",
    description: "Founders of high-growth startups, technology companies and venture investors",
    icon: "cpu",
    estimate: 120,
  },
  {
    label: "Talent & Ecosystem",
    description: "University Vice-Chancellors, HR directors and skills and enterprise agencies",
    icon: "graduation",
    estimate: 100,
  },
  {
    label: "Investors & Diaspora",
    description:
      "Family offices, angel investors and Nigerian business leaders from the UK, US, UAE and South Africa",
    icon: "globe",
    estimate: 200,
  },
];

export type MixSlice = { label: string; percent: number };

/** Target delegate profile. Each list sums to 100. */
export const delegateMix: { id: string; title: string; slices: MixSlice[] }[] = [
  {
    id: "seniority",
    title: "Seniority",
    slices: [
      { label: "C-Suite / Board", percent: 45 },
      { label: "Founders / Investors", percent: 25 },
      { label: "Government DG / Minister", percent: 15 },
      { label: "Senior Directors / Heads", percent: 15 },
    ],
  },
  {
    id: "industry",
    title: "Industry",
    slices: [
      { label: "Financial Services", percent: 25 },
      { label: "Energy / Infrastructure / Manufacturing", percent: 20 },
      { label: "Technology / Telecoms", percent: 20 },
      { label: "Consumer / Health / Education", percent: 20 },
      { label: "Government / DFIs", percent: 15 },
    ],
  },
];

export const whyThisAudience: { title: string; detail: string }[] = [
  { title: "They have budgets", detail: "P&L responsibility or capital under management." },
  {
    title: "They make decisions",
    detail: "Procurement, investment, partnership and policy conversations.",
  },
  { title: "Hard to reach", detail: "A concentrated room of senior public and private-sector leaders." },
  { title: "Media amplification", detail: "Planned live coverage and digital distribution." },
];
