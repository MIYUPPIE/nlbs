/**
 * Partner ecosystem.
 *
 * "In Partnership With" lists the five organisations on the convener's event
 * flyer (Nov 2026, assets-src/partners/flyer-nov-2026.jpeg). The flyer names
 * no category for them, so they are not sorted into the categories below.
 * Their logos are cut from the flyer by scripts/optimize-people.mjs; replace
 * them with the partners' own logo files when supplied.
 *
 * To publish a partner, add `{ name, logo: "/partners/<file>", href? }`
 * to a category's `partners` array. Empty categories render neutral
 * placeholder slots labelled "Partner to be announced".
 */
export type Partner = {
  name: string;
  logo: string;
  href?: string;
};

export type PartnerCategory = {
  id: string;
  label: string;
  description: string;
  partners: Partner[];
  /** Placeholder slots to render while `partners` is empty. */
  slots: number;
};

export const partnerCategories: PartnerCategory[] = [
  {
    id: "summit",
    label: "In Partnership With",
    description: "Organisations partnering with HBC Business Help to deliver Nigeria 2.0.",
    partners: [
      { name: "Keystone Bank", logo: "/partners/keystone-bank.png" },
      { name: "Dmax Media", logo: "/partners/dmax-media.png" },
      { name: "allevents.ng", logo: "/partners/allevents-ng.png" },
      { name: "TA Media Communications", logo: "/partners/ta-media.png" },
      { name: "Praxis Medical Nigeria", logo: "/partners/praxis-medical.png" },
    ],
    slots: 0,
  },
  {
    id: "strategic",
    label: "Strategic Partners",
    description: "Organisations shaping the summit's agenda and outcomes.",
    partners: [],
    slots: 3,
  },
  {
    id: "government",
    label: "Government Partners",
    description: "Public institutions engaged in the summit's policy conversations.",
    partners: [],
    slots: 3,
  },
  {
    id: "development",
    label: "Development Partners",
    description: "Development finance institutions and development organisations.",
    partners: [],
    slots: 3,
  },
  {
    id: "investment",
    label: "Investment Partners",
    description: "Capital providers supporting structured investment connections.",
    partners: [],
    slots: 3,
  },
  {
    id: "technology",
    label: "Technology Partners",
    description: "Technology companies powering the summit experience and exhibition.",
    partners: [],
    slots: 3,
  },
  {
    id: "media",
    label: "Media Partners",
    description: "Media organisations extending the summit's conversations.",
    partners: [],
    slots: 3,
  },
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
