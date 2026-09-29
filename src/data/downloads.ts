/**
 * Public documents. Files are synced from ../latest by scripts/sync-downloads.sh.
 * Confidential or internal documents are never listed here.
 */
export type Download = {
  id: string;
  title: string;
  description: string;
  href: string;
  thumbnail: string;
  format: "PDF" | "JPG";
  size: string;
  pages?: number;
};

export const downloads: Download[] = [
  {
    id: "concept-note",
    title: "Concept Note",
    description:
      "Background, strategic objectives, target audience, expected outcomes and programme highlights.",
    href: "/downloads/nigeria-2-0-concept-note.pdf",
    thumbnail: "/downloads/nigeria-2-0-concept-note.webp",
    format: "PDF",
    size: "4 KB",
    pages: 1,
  },
  {
    id: "audience-profile",
    title: "Audience Profile",
    description: "Who will be in the room: delegate groups, seniority and why this audience matters.",
    href: "/downloads/nigeria-2-0-audience-profile.pdf",
    thumbnail: "/downloads/nigeria-2-0-audience-profile.webp",
    format: "PDF",
    size: "31 KB",
    pages: 1,
  },
  {
    id: "event-flyer",
    title: "Event Flyer",
    description: "The official Nigeria 2.0 summit flyer to share with your network.",
    href: "/downloads/nigeria-2-0-event-flyer.jpg",
    thumbnail: "/downloads/nigeria-2-0-event-flyer.webp",
    format: "JPG",
    size: "197 KB",
  },
];
