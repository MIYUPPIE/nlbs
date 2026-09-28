import type { IconName } from "@/components/ui/Icon";

/**
 * Programme formats confirmed in the brief. No session times, speakers or
 * running order have been confirmed, so `time` stays null and the UI prints
 * "Time to be announced".
 */
export type ProgrammeItem = {
  id: string;
  title: string;
  summary: string;
  detail: string;
  icon: IconName;
  audience: string;
  time: string | null;
  access: "plenary" | "selected";
};

export const programmeHeading = "One Summit. Multiple Pathways to Action.";

export const programme: ProgrammeItem[] = [
  {
    id: "keynotes",
    title: "Presidential Keynotes",
    summary: "High-level perspectives on Nigeria's economic future.",
    detail:
      "Opening perspectives that frame the summit's agenda on capital, talent and technology, and set the tone for the conversations that follow.",
    icon: "mic",
    audience: "All delegates",
    time: null,
    access: "plenary",
  },
  {
    id: "panels",
    title: "Leadership Panels",
    summary: "Two high-level conversations focused on capital, talent and technology.",
    detail:
      "Leaders from government, business, investment and the wider ecosystem examine what it takes to move from policy intent to practical outcomes.",
    icon: "users",
    audience: "All delegates",
    time: null,
    access: "plenary",
  },
  {
    id: "fireside",
    title: "Strategic Fireside Chat",
    summary: "An intimate conversation with a leading business or policy figure.",
    detail:
      "A focused, candid exchange on leadership decisions and the choices shaping Nigeria's next phase of growth.",
    icon: "flame",
    audience: "All delegates",
    time: null,
    access: "plenary",
  },
  {
    id: "pitch",
    title: "Startup Pitch Arena",
    summary: "Selected startups present scalable solutions to investors and ecosystem leaders.",
    detail:
      "Founders pitch on the summit stage. The format is built to connect investable ideas with capital, partners and scale.",
    icon: "rocket",
    audience: "Selected startups, investors and ecosystem leaders",
    time: null,
    access: "plenary",
  },
  {
    id: "exhibition",
    title: "Innovation Exhibition",
    summary: "Technology companies, startups and institutions showcase products, platforms and solutions.",
    detail:
      "A curated exhibition floor where delegates can see technology in practice and meet the teams building it.",
    icon: "layout",
    audience: "All delegates",
    time: null,
    access: "plenary",
  },
  {
    id: "dinner",
    title: "Deal Networking Dinner",
    summary: "Closed-door networking for selected investors, business leaders, partners and stakeholders.",
    detail:
      "An invitation-only evening designed for focused relationship building between investors, business leaders and partners.",
    icon: "handshake",
    audience: "By invitation",
    time: null,
    access: "selected",
  },
];
