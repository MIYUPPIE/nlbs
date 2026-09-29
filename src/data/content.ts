import type { IconName } from "@/components/ui/Icon";

export type Pillar = {
  id: "capital" | "talent" | "technology";
  label: string;
  title: string;
  intro: string;
  body: string;
  icon: IconName;
  href: "/investment" | "/talent" | "/technology";
};

export const pillars: Pillar[] = [
  {
    id: "capital",
    label: "Capital",
    title: "Unlocking Investment",
    intro: "Mobilising investment for high-growth businesses and productive sectors.",
    body: "Connect high-growth businesses and startups with DFIs, institutional investors, venture capital, sovereign and diaspora capital.",
    icon: "landmark",
    href: "/investment",
  },
  {
    id: "talent",
    label: "Talent",
    title: "Building Human Capital",
    intro: "Building pathways for skills, employment and participation in the future economy.",
    body: "Create sustainable pathways for skills development, employment, youth participation and women's inclusion in the future of work.",
    icon: "users",
    href: "/talent",
  },
  {
    id: "technology",
    label: "Technology",
    title: "Accelerating Adoption",
    intro:
      "Accelerating practical technology adoption across businesses, industries and public institutions.",
    body: "Showcase how AI, FinTech, AgriTech and enterprise technology can improve productivity and strengthen institutions.",
    icon: "cpu",
    href: "/technology",
  },
];

export const introduction = {
  heading: "From Dialogue to Deals",
  paragraphs: [
    "Nigeria stands at a defining moment. With ongoing macro-economic reforms, a population more than 70% under 35 and accelerating digital adoption across key sectors, the opportunity to strengthen the country's global competitiveness is significant.",
    "But structural challenges remain.",
    "Capital access, skills development, infrastructure, technology adoption and policy clarity require coordinated action across government, business, investors, development institutions and the wider ecosystem.",
  ],
  leversLead: "Nigeria 2.0 moves the conversation forward by focusing on three critical levers:",
};

/** Concept note, 1.2 Core Strategic Objectives. */
export const objectives: { title: string; detail: string; icon: IconName }[] = [
  {
    title: "Attract Investment",
    detail:
      "Connect high-growth local businesses and startups with DFIs, global VCs and sovereign and diaspora capital.",
    icon: "trending",
  },
  {
    title: "Build Talent",
    detail:
      "Create sustainable pathways for skills development, job creation and youth and women's inclusion in the future of work.",
    icon: "users",
  },
  {
    title: "Drive Technology Adoption",
    detail:
      "Show how AI, enterprise FinTech and AgriTech can improve sector productivity and public governance.",
    icon: "cpu",
  },
  {
    title: "Foster Partnership",
    detail:
      "Build a premium platform for public, private and diaspora collaboration on national development.",
    icon: "handshake",
  },
];

/**
 * Concept note, 1.4 Expected Outcomes. All are targets; `statId` links an
 * outcome to its figure in event.ts so the numbers cannot drift apart.
 */
export const expectedOutcomes: { title: string; statId?: string }[] = [
  { title: "Signed MOUs and investment commitments", statId: "investment" },
  { title: "Launch of the Nigeria 2.0 Talent Fund for young Nigerians", statId: "talent" },
  { title: "Structured B2B and B2G deal meetings", statId: "meetings" },
  { title: "A Policy Action Brief submitted to Federal and State Executives" },
];

/** "What to expect" from the event flyer. */
export const whatToExpect: { title: string; detail: string }[] = [
  { title: "Presidential Roundtable", detail: "Direct dialogue with policy makers" },
  { title: "Capital Rooms", detail: "B2B and B2G meetings with investors and DFIs" },
  { title: "Talent Showcase", detail: "Launch of the Nigeria 2.0 Talent Fund" },
  { title: "Tech Exhibition", detail: "50 startups pitching solutions" },
  { title: "High-Level Panels", detail: "Practical deals, not just talk" },
  { title: "Networking Dinner", detail: "With speakers and stakeholders" },
];

export const investment = {
  heading: "Capital That Moves Ideas Forward",
  lead: "The summit is designed to create structured connections between the people who build businesses and the people who fund them.",
  groups: {
    enterprise: { label: "Enterprise", items: ["Local businesses", "Startups"] },
    enablers: { label: "Enablers", items: ["Government", "Strategic partners"] },
    capital: {
      label: "Capital",
      items: [
        "Development finance institutions",
        "Venture capital",
        "Institutional investors",
        "Diaspora investors",
      ],
    },
  },
};

export const talent = {
  heading: "Invest in People",
  fundName: "Nigeria 2.0 Talent Fund",
  lead: "A dedicated initiative to prepare young Nigerians to participate in, and shape, the future economy.",
  focus: [
    { label: "Digital skills", icon: "monitor" },
    { label: "Technology", icon: "cpu" },
    { label: "Entrepreneurship", icon: "rocket" },
    { label: "Employability", icon: "briefcase" },
    { label: "Future of work", icon: "compass" },
    { label: "Youth participation", icon: "users" },
    { label: "Women's inclusion", icon: "sparkles" },
  ] satisfies { label: string; icon: IconName }[],
};

export type TechArea = {
  title: string;
  description: string;
  icon: IconName;
};

export const technologyAreas: TechArea[] = [
  {
    title: "Artificial Intelligence",
    description: "Practical AI adoption across enterprises and institutions.",
    icon: "brain",
  },
  {
    title: "FinTech",
    description: "Expanding financial infrastructure and business productivity.",
    icon: "wallet",
  },
  {
    title: "AgriTech",
    description: "Improving agricultural productivity, access and value chains.",
    icon: "sprout",
  },
  {
    title: "Enterprise Technology",
    description: "Digital transformation for businesses and institutions.",
    icon: "building",
  },
  {
    title: "Public Technology",
    description: "Technology-enabled public service delivery and governance.",
    icon: "landmark",
  },
];

export const exhibitionCategories: { label: string; icon: IconName }[] = [
  { label: "AI", icon: "brain" },
  { label: "FinTech", icon: "wallet" },
  { label: "AgriTech", icon: "sprout" },
  { label: "Robotics", icon: "bot" },
  { label: "Digital Infrastructure", icon: "server" },
  { label: "Enterprise Software", icon: "layers" },
  { label: "Climate Technology", icon: "leaf" },
  { label: "Creative Technology", icon: "palette" },
  { label: "Education Technology", icon: "graduation" },
];

export type DealPhase = "Before the summit" | "At the summit" | "After the summit";

/** The structured networking journey. Describes the process, not outcomes. */
export const dealFlow: { step: string; detail: string; phase: DealPhase; icon: IconName }[] = [
  {
    step: "Business",
    detail: "Organisations register their interest and objectives.",
    phase: "Before the summit",
    icon: "briefcase",
  },
  {
    step: "Qualification",
    detail: "Needs, readiness and fit are reviewed.",
    phase: "Before the summit",
    icon: "compass",
  },
  {
    step: "Matchmaking",
    detail: "Participants are paired against shared priorities.",
    phase: "Before the summit",
    icon: "users",
  },
  {
    step: "Meeting",
    detail: "Structured B2B and B2G sessions take place at the summit.",
    phase: "At the summit",
    icon: "handshake",
  },
  {
    step: "Partnership",
    detail: "Aligned parties continue the conversation.",
    phase: "After the summit",
    icon: "layers",
  },
  {
    step: "Potential Deal",
    detail: "Where there is fit, conversations can progress toward agreements.",
    phase: "After the summit",
    icon: "trending",
  },
];

/** Consecutive steps grouped by phase, with their index range. */
export const dealPhases = dealFlow.reduce<{ phase: DealPhase; start: number; count: number }[]>(
  (acc, s, i) => {
    const last = acc[acc.length - 1];
    if (last && last.phase === s.phase) last.count += 1;
    else acc.push({ phase: s.phase, start: i, count: 1 });
    return acc;
  },
  [],
);

export const pitchArena = {
  heading: "The Startup Pitch Arena",
  subheading: "Ideas seeking capital. Solutions seeking scale.",
  lead: "Selected startups will present their businesses to investors, business leaders and ecosystem partners. The summit aims to showcase innovation from 50 startups.",
  format: [
    {
      title: "Selection",
      detail:
        "Startups are selected ahead of the summit. Criteria will be published with the application details.",
    },
    {
      title: "Pitch",
      detail:
        "Selected founders present on the summit stage to an audience of investors and ecosystem leaders.",
    },
    {
      title: "Engagement",
      detail: "Investors and partners connect with founders during the summit's structured networking.",
    },
  ],
  datesStatus: "Application details coming soon",
};
