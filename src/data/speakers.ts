/**
 * Speakers and guests of honour, as supplied by the convener (Nov 2026):
 * the event flyer (Chief Host, Keynotes, Special Guest of Honour, Patron),
 * named portrait files, and written profiles for Dr. Samson Ajayi and
 * Dr. Seye Olurotimi. Originals are in assets-src/speakers/.
 *
 * Only what those sources say is published. Where a source gives no role
 * (Dr. Olayemi Cardoso), `role` stays empty rather than guessed.
 *
 * To add a speaker: put the original in assets-src/speakers/, add a crop job
 * to scripts/optimize-people.mjs, run it, then add an entry here.
 * tests/speakers.test.ts checks every photo and every field.
 */
export type SpeakerCategory =
  | "Chief Host"
  | "Keynote"
  | "Special Guest of Honour"
  | "Special Invited Guest of Honour"
  | "Patron"
  | "Speaker";

export type Speaker = {
  id: string;
  /** Honorific shown above the name, e.g. "His Excellency". */
  honorific?: string;
  name: string;
  /** Role as the convener's materials state it. Empty when none was given. */
  role: string;
  organisation?: string;
  category: SpeakerCategory;
  /** 4:5 WebP under /public, built by scripts/optimize-people.mjs. */
  photo: { src: string; width: number; height: number };
  /** One string per paragraph, verbatim from the speaker's supplied profile. */
  bio?: string[];
  /** Short line under the name on the profile, from the supplied profile. */
  tagline?: string;
};

export const speakers: Speaker[] = [
  {
    id: "babajide-sanwo-olu",
    honorific: "His Excellency",
    name: "Babajide Sanwo-Olu",
    role: "Executive Governor of Lagos State",
    category: "Chief Host",
    photo: { src: "/speakers/babajide-sanwo-olu.webp", width: 512, height: 640 },
  },
  {
    id: "taiwo-oyedele",
    name: "Taiwo Oyedele",
    role: "Honourable Minister of Finance",
    category: "Keynote",
    photo: { src: "/speakers/taiwo-oyedele.webp", width: 640, height: 800 },
  },
  {
    id: "samson-ajayi",
    name: "Dr. Samson Ajayi",
    role: "Managing Director & Country Business Director",
    organisation: "Robert Bosch Nigeria",
    category: "Keynote",
    photo: { src: "/speakers/samson-ajayi.webp", width: 640, height: 800 },
    tagline: "Business Leader | Strategist | Researcher",
    bio: [
      "Dr. Samson Ajayi is a business leader, corporate strategist and practitioner-scholar with nearly two decades of international experience spanning multinational technology, industrial and consumer markets. He is the Managing Director and Country Business Director of Robert Bosch Nigeria and a Board Member of Robert Bosch Limited, where he provides executive leadership across corporate strategy, business growth, commercial performance, governance and organisational transformation.",
      "Since joining Bosch in 2015, he has held international and regional leadership positions in Germany and West Africa, driving commercial growth, market development, go-to-market strategies and business performance. His professional experience also spans banking, telecommunications and consumer markets.",
      "Beyond corporate leadership, Dr. Ajayi is a Faculty Member and Corporate Advisory Board Member at Rome Business School Nigeria, contributing to postgraduate management education and industry-academia collaboration.",
      "He holds a PhD in Management (Marketing), awarded with Distinction, from ISCTE Business School, Lisbon, Portugal, alongside MBA degrees in Marketing Management and Finance & Strategy. His research interests include technology adoption, consumer behaviour, consumer engagement and digital transformation, particularly in emerging markets. His published research received the Emerald Literati Outstanding Paper Award.",
      "His professional interests centre on helping organisations navigate complexity, unlock sustainable growth and translate innovation and technology into measurable business value.",
    ],
  },
  {
    id: "bosun-tijani",
    name: "Dr. Bosun Tijani",
    role: "Honourable Minister of Communications, Innovation and Digital Economy",
    category: "Special Guest of Honour",
    photo: { src: "/speakers/bosun-tijani.webp", width: 320, height: 400 },
  },
  {
    id: "jumoke-oduwole",
    name: "Dr. Jumoke Oduwole",
    role: "Honourable Minister of Industry, Trade and Investment",
    category: "Special Guest of Honour",
    photo: { src: "/speakers/jumoke-oduwole.webp", width: 420, height: 525 },
  },
  {
    id: "olayemi-cardoso",
    name: "Dr. Olayemi Cardoso",
    role: "",
    category: "Special Invited Guest of Honour",
    photo: { src: "/speakers/olayemi-cardoso.webp", width: 640, height: 800 },
  },
  {
    id: "seyi-tinubu",
    name: "Mr. Seyi Tinubu",
    role: "Patron, Nigeria 2.0 Talent Fund and City Boy Movement",
    category: "Patron",
    photo: { src: "/people/seyi-tinubu.webp", width: 520, height: 650 },
  },
  {
    id: "seye-olurotimi",
    name: "Dr. Seye Olurotimi",
    role: "Founder & Chief Executive Officer",
    organisation: "MSME Africa",
    category: "Speaker",
    photo: { src: "/speakers/seye-olurotimi.webp", width: 640, height: 800 },
    tagline: "Entrepreneurship Development Expert | Business Strategist | Enterprise Ecosystem Builder",
    bio: [
      "Dr. Seye Olurotimi is an Entrepreneurship Development Expert, business strategist, consultant, coach and thought leader with over 18 years of professional experience. He is the Founder and Chief Executive Officer of MSME Africa, an enterprise support platform committed to strengthening the growth, visibility and sustainability of businesses across Africa. He is also the Lead Consultant at CedarTribe Limited, a business advisory, training and consulting firm.",
      "He is the Chief Curator and Convener of the MSME Africa Community, a network of over 7,000 entrepreneurs, and leads initiatives including the MSME Africa Growth Factory, MSME Dialogue and The Business Growth Series. Through these platforms, he promotes enterprise development, innovation, access to opportunities and stronger connections across the entrepreneurship ecosystem.",
      "Dr. Olurotimi has served as a mentor, coach, faculty member, consultant and judge across numerous entrepreneurship and accelerator programmes. He is a conference and keynote speaker and a Business Management Coach at Rome Business School. He is a member of the Nigeria Economic Summit Group's MSME Community of Practice and holds a PhD in Strategic Management, with research focused on Enterprise Support Organisations and their contribution to MSME growth and sustainability.",
      "His work centres on strengthening businesses, developing entrepreneurial capacity and advancing inclusive economic growth across Africa.",
    ],
  },
];

/** Display groups, in flyer order. Every category appears exactly once. */
export const speakerGroups: { category: SpeakerCategory; heading: string }[] = [
  { category: "Chief Host", heading: "Chief Host" },
  { category: "Keynote", heading: "Keynote Speakers" },
  { category: "Special Guest of Honour", heading: "Special Guests of Honour" },
  { category: "Special Invited Guest of Honour", heading: "Special Invited Guest of Honour" },
  { category: "Patron", heading: "Patron" },
  { category: "Speaker", heading: "Speakers" },
];

export const speakersIn = (category: SpeakerCategory): Speaker[] =>
  speakers.filter((s) => s.category === category);

/** Full display name, with honorific when there is one. */
export const displayName = (s: Speaker): string => (s.honorific ? `${s.honorific} ${s.name}` : s.name);
