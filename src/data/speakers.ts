/**
 * Speakers. No speaker has been confirmed.
 *
 * To publish a speaker, replace a placeholder entry with real details and set
 * `confirmed: true`. Put the headshot in /public/speakers/ and reference it
 * as `photo: "/speakers/<file>.jpg"`. Confirmed speakers render with name,
 * role, organisation and links. Placeholders render as "Speaker to be
 * announced" so nothing unverified reaches the page.
 */
export type SpeakerCategory = "Keynote" | "Panel" | "Fireside Chat" | "Pitch Arena Judge" | "Moderator";

export type Speaker = {
  id: string;
  confirmed: boolean;
  name: string;
  role: string;
  organisation: string;
  category: SpeakerCategory;
  photo: string | null;
  bio?: string;
  links?: { label: "LinkedIn" | "X" | "Website"; href: string }[];
};

const placeholder = (id: string, category: SpeakerCategory): Speaker => ({
  id,
  confirmed: false,
  name: "Speaker Name",
  role: "Chief Executive Officer",
  organisation: "Organisation",
  category,
  photo: null,
});

export const speakers: Speaker[] = [
  placeholder("tba-1", "Keynote"),
  placeholder("tba-2", "Panel"),
  placeholder("tba-3", "Panel"),
  placeholder("tba-4", "Fireside Chat"),
  placeholder("tba-5", "Panel"),
  placeholder("tba-6", "Panel"),
  placeholder("tba-7", "Pitch Arena Judge"),
  placeholder("tba-8", "Moderator"),
];

export const confirmedSpeakers = speakers.filter((s) => s.confirmed);
