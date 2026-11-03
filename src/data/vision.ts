import type { IconName } from "@/components/ui/Icon";

/**
 * Vision, roadmap and summit narrative. Source: latest/2.md (client-supplied
 * "About Nigeria Leadership Business Summit"). Items that contradict the
 * build brief are intentionally omitted: named keynote speakers (speakers are
 * "to be announced") and any claim that the President is confirmed.
 */

export const bigIdea = {
  lead: "The Nigeria Leadership Business Summit is not a conference. It is a decade-long private sector compact to build the Nigeria of our dreams.",
  question: "What will Nigeria look like in 2036?",
  context:
    "Conceived at a time when Nigeria stands at a critical crossroads of youth bulge, digital disruption and global capital realignment, Nigeria 2.0 is our collective answer to one question.",
  was: "Nigeria 1.0 was built on oil.",
  willBe: "Nigeria 2.0 will be built on Capital, Talent and Technology.",
  convening:
    "For 10 years, from 2026 to 2036, the summit will convene 800 decision makers annually: Chairmen, CEOs, Founders, DFIs, Diaspora Investors, Policy Makers and Young Innovators, to move from dialogue to deals.",
  closing: "Nigeria 2.0 is not about 2026. It is about 2036.",
};

export type RoadmapPhase = {
  number: 1 | 2 | 3;
  name: string;
  theme: string;
  years: string;
  milestones: string[];
};

export const roadmap: RoadmapPhase[] = [
  {
    number: 1,
    name: "Ignition",
    theme: "The Foundation",
    years: "2026 – 2028",
    milestones: [
      "Launch the Nigeria 2.0 Talent Fund: 10,000 youths trained, placed and funded across 6 hubs: Lagos, Abuja, Kano, Port Harcourt, Enugu and Ibadan",
      "Convene 800 CEOs to commit to Nigeria's $1 Trillion Economy Agenda",
      "Publish the first Nigeria 2.0 Policy Brief to the Presidency and Federal Executive Council",
      "Build the digital talent portal as Nigeria's largest private talent marketplace",
    ],
  },
  {
    number: 2,
    name: "Scale",
    theme: "The Ecosystem",
    years: "2029 – 2031",
    milestones: [
      "Scale the Talent Fund to 50,000 youths, with 60% in employment or running sustainable businesses",
      "Launch the Nigeria 2.0 Deal Room: N100 billion in SME and startup funding facilitated between partners",
      "Establish regional diaspora chapters in London, Houston, Toronto and Dubai",
      "Become the official private-sector delivery partner for the Federal Government's Youth & Industrialization Agenda",
    ],
  },
  {
    number: 3,
    name: "Dominance",
    theme: "The Legacy",
    years: "2032 – 2036",
    milestones: [
      "100,000 youths impacted. 10,000 businesses funded. 50,000 placed in high-value jobs",
      "Nigeria 2.0 alumni leading boardrooms, startups and government",
      "Publish Nigeria 2.0 @ 10, an impact report presented at the 10th Anniversary Presidential Dinner",
      "Transition from summit to institution: the Nigeria 2.0 Institute for Capital, Talent & Technology",
    ],
  },
];

export const whyNow = [
  {
    title: "A generation-defining population",
    body: "Nigeria will be the 3rd most populous country by 2050, with 70% under 30. This is either our biggest asset or our biggest crisis.",
    icon: "users",
  },
  {
    title: "Capital is looking for the next frontier",
    body: "Global capital is looking for the next growth frontier. Nigerian talent is already powering global tech.",
    icon: "globe",
  },
  {
    title: "Private-sector led, youth powered",
    body: "The $1 Trillion economy will not be achieved by government alone. It requires a private-sector led, youth-powered compact.",
    icon: "trending",
  },
] satisfies { title: string; body: string; icon: IconName }[];

export const differentiators = [
  {
    title: "Talent-First",
    body: "Every partner directly recruits from a pre-vetted pool. You don't just sponsor a stage, you own a workforce pipeline.",
    icon: "users",
  },
  {
    title: "Deal-Driven",
    body: "No long speeches. The Deal Room, CEO Roundtable and Policy Lab are designed to sign MOUs, not just take pictures.",
    icon: "handshake",
  },
  {
    title: "Youth Patronage",
    body: "Convened under the Youth Patronage of Mr. Seyi Tinubu, bridging enterprise and the Presidency so resolutions reach the highest decision table.",
    icon: "sparkles",
  },
  {
    title: "Measurable Impact",
    body: "Audited impact reports published annually: jobs, businesses funded and capital unlocked, not just attendees.",
    icon: "layers",
  },
] satisfies { title: string; body: string; icon: IconName }[];

/** Summit experience from 2.md, without named speakers. */
export const summitExperience = [
  {
    title: "Presidential Opening Address",
    body: "His Excellency, the President of the Federal Republic of Nigeria, has been invited to deliver the Presidential Opening Address.",
    icon: "landmark",
  },
  {
    title: "Platinum Keynotes",
    body: "15-minute power keynotes from Platinum Founding Stakeholders on building a $1 Trillion Nigeria.",
    icon: "mic",
  },
  {
    title: "CEO Roundtable",
    body: "A 50-person exclusive closed-door session with policy leaders and the Youth Patron.",
    icon: "briefcase",
  },
  {
    title: "Deal Room & Exhibition",
    body: "Curated companies showcasing jobs, products and partnerships.",
    icon: "layout",
  },
  {
    title: "Talent Pitch",
    body: "Top young Nigerians pitch to investors live.",
    icon: "rocket",
  },
  {
    title: "Policy Lab",
    body: "Drafting the Post-Summit Brief for submission to the Presidency.",
    icon: "compass",
  },
] satisfies { title: string; body: string; icon: IconName }[];

/** Portraits are pre-cropped 4:5 WebP in public/people/ (scripts/optimize-people.mjs). */
export const leadership = [
  {
    role: "Convener",
    name: "Dr. Wale Busari",
    credentials: "FCA, FIMC, CMC",
    photo: { src: "/people/wale-busari.webp", width: 640, height: 800 },
  },
  {
    role: "Youth Patron",
    name: "Mr. Seyi Tinubu",
    credentials: "",
    photo: { src: "/people/seyi-tinubu.webp", width: 520, height: 650 },
  },
];
