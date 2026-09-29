import type { IconName } from "@/components/ui/Icon";

/**
 * Partnership structure from the convener's prospectus and the stakeholder
 * and sponsor briefs (latest/NLBS2026_4_Page_Sponsorship_Prospectus.pdf,
 * Nigeria_2_0_Stakeholders_vs_Sponsors_Premium.pdf).
 *
 * PUBLISHING RULES (convener decision, 29 Sep 2026):
 * - Two tracks: Founding Stakeholders and Official Sponsors. This replaces
 *   the earlier "Founding 800" Platinum/Gold structure from 2.md.
 * - Fees are sent on request. No Naira amounts appear here;
 *   tests/partnership.test.ts enforces it.
 * - The briefs' internal material stays off the site: named target
 *   companies, sales scripts, revenue targets and routing rules.
 */

export type TrackId = "stakeholder" | "sponsor";

export type Tier = { id: string; name: string; slots: number };

export type Track = {
  id: TrackId;
  name: string;
  /** Short positioning line from the briefs. */
  role: string;
  who: string;
  motivation: string[];
  title: string;
  tiers: Tier[];
  benefits: { title: string; detail: string; icon: IconName }[];
  engagement: string;
  cta: string;
};

export const tracks: Track[] = [
  {
    id: "stakeholder",
    name: "Founding Stakeholders",
    role: "Builders of the table",
    who: "Development finance institutions, banks, ministries, corporates and foundations focused on policy and deal flow.",
    motivation: ["Influence", "Access", "Deals"],
    title: "Founding Stakeholder",
    tiers: [
      { id: "platinum", name: "Platinum", slots: 3 },
      { id: "gold", name: "Gold", slots: 5 },
      { id: "silver", name: "Silver", slots: 8 },
    ],
    benefits: [
      {
        title: "Policy voice",
        detail: "Named on the Post-Summit Policy Brief to the Presidency.",
        icon: "landmark",
      },
      {
        title: "Curated meetings",
        detail: "One-on-one meetings with government and DFI leaders in private deal rooms.",
        icon: "handshake",
      },
      {
        title: "Chair a roundtable",
        detail: "Host and direct a sector roundtable at the summit.",
        icon: "users",
      },
      {
        title: "VIP dinner",
        detail: "Private dinner with Federal Ministers and leading industry CEOs.",
        icon: "sparkles",
      },
      {
        title: "CEO speaking slot",
        detail: "A guaranteed main-stage slot for your Group CEO.",
        icon: "mic",
      },
    ],
    engagement: "Join the pre-summit working group and help shape the agenda and the invitation list.",
    cta: "Enquire as a Stakeholder",
  },
  {
    id: "sponsor",
    name: "Official Sponsors",
    role: "Brand on the table",
    who: "Telcos, fintechs, consumer brands, law firms and consultancies seeking reach, association and leads.",
    motivation: ["Reach", "Brand", "Leads", "Media"],
    title: "Official Sponsor",
    tiers: [
      { id: "diamond", name: "Diamond", slots: 1 },
      { id: "gold", name: "Gold", slots: 3 },
      { id: "silver", name: "Silver", slots: 5 },
      { id: "supporting", name: "Supporting", slots: 10 },
    ],
    benefits: [
      {
        title: "Brand visibility",
        detail: "Logo on the stage backdrop, step-and-repeat wall and summit collateral.",
        icon: "layout",
      },
      {
        title: "Delegate passes",
        detail: "VIP passes to bring your clients into the room.",
        icon: "briefcase",
      },
      {
        title: "Exhibition and activation",
        detail: "A booth or table in the exhibition to meet delegates and generate leads.",
        icon: "rocket",
      },
      {
        title: "Email and media",
        detail: "Email features to registered delegates, media coverage and post-event content.",
        icon: "globe",
      },
    ],
    engagement:
      "Work with our marketing team on your activation. Sponsorship does not include agenda or policy input.",
    cta: "Enquire as a Sponsor",
  },
];

export const trackById = (id: TrackId): Track => {
  const t = tracks.find((x) => x.id === id);
  if (!t) throw new Error(`Unknown track: ${id}`);
  return t;
};

export const totalSlots = (track: Track): number => track.tiers.reduce((n, t) => n + t.slots, 0);

/** "The key differentiators" table from the stakeholder brief. */
export const trackComparison: { question: string; stakeholder: string; sponsor: string }[] = [
  { question: "Help set the agenda?", stakeholder: "Yes, through the working group", sponsor: "No" },
  {
    question: "Meet Ministers and DFIs one-on-one?",
    stakeholder: "Yes, curated meetings",
    sponsor: "Networking areas",
  },
  { question: "Guaranteed speaking slot?", stakeholder: "Yes", sponsor: "Subject to availability" },
  { question: "Named on the Policy Brief to the Presidency?", stakeholder: "Yes", sponsor: "No" },
  { question: "Fee", stakeholder: "On request", sponsor: "On request" },
];

type SponsorCell = string | null;

/**
 * Sponsor benefits by tier, from page 3 of the prospectus.
 * Columns follow `trackById("sponsor").tiers`. `null` means not included.
 */
export const sponsorBenefits: {
  group: string;
  rows: { benefit: string; values: [SponsorCell, SponsorCell, SponsorCell, SponsorCell] }[];
}[] = [
  {
    group: "Branding",
    rows: [
      { benefit: "Stage backdrop logo", values: ["Lead position", "Prominent", "Standard", "Listed"] },
      { benefit: "Branded lanyards", values: ["Exclusive", null, null, null] },
      { benefit: "Step-and-repeat wall", values: ["Logo", "Logo", "Logo", null] },
    ],
  },
  {
    group: "Engagement",
    rows: [
      { benefit: "Exhibition booth (3×3 m)", values: ["Premium", "Standard", "Table top", null] },
      { benefit: "VIP delegate passes", values: ["10", "6", "4", "2"] },
      { benefit: "Speaking opportunity", values: ["5-minute address", "Panel", null, null] },
      { benefit: "Email feature", values: ["2 dedicated", "1 dedicated", "Logo in 1", "Logo in 1"] },
    ],
  },
  {
    group: "PR & content",
    rows: [
      { benefit: "Media interview", values: ["Guaranteed", "Available", null, null] },
      { benefit: "Post-summit report", values: ["Cover page", "Inside page", "Inside page", "Listed"] },
      { benefit: "Photos and video", values: ["Full coverage", "Coverage", "Coverage", null] },
    ],
  },
];

export const sponsorNotes = {
  included: "Every package includes logo recognition, media coverage and post-event content assets.",
  exclusivity: "Diamond includes category exclusivity, for example Official Telecoms Partner.",
  allocation: "Slots are limited and allocated on a first-commitment basis.",
};

export const partnershipSteps: { title: string; detail: string }[] = [
  { title: "Choose your track and tier", detail: "Send an enquiry with your preferred package." },
  { title: "Strategy call", detail: "A 15-minute call to plan your participation and activation." },
  { title: "Contract and invoice", detail: "Your slot is secured with a 50% deposit." },
];
