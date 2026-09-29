import type { IconName } from "@/components/ui/Icon";

/**
 * Delegate-facing parts of the convener's "Participants Registration + Event
 * Entry Plan" (latest/35996679-eabc-4da2-8a58-5780a6100ae9.jpeg).
 *
 * Internal parts stay off the site: badge colours and access zones, staffing,
 * equipment, tools, and the data captured for sponsors.
 */

export const registrationModel = {
  heading: "Invitation-only. Every seat is allocated.",
  lead: "This is not open registration. Seats are capped at 800 and every request is vetted, so the room stays senior and the door stays calm.",
};

export type EntryRoute = {
  category: string;
  how: string;
  approval: string;
  icon: IconName;
  /** Where this category starts, when it is not the form on /register. */
  action?: { label: string; href: string };
};

export const entryRoutes: EntryRoute[] = [
  {
    category: "Stakeholders & Sponsors",
    how: "VIP passes come with your partnership agreement. Your organisation sends us your delegates' names and emails.",
    approval: "Approved automatically",
    icon: "handshake",
    action: { label: "Partnership options", href: "/partners" },
  },
  {
    category: "Government",
    how: "Your protocol office sends the delegation list and the summit team creates your profiles.",
    approval: "Approved automatically",
    icon: "landmark",
  },
  {
    category: "Corporate C-Suite",
    how: "Nominated by a partner, chamber of commerce or bank, then submit the form on this page.",
    approval: "Vetted within 24 hours",
    icon: "briefcase",
  },
  {
    category: "Investors, DFIs & Tech",
    how: "Apply with the form on this page and include your LinkedIn profile.",
    approval: "Vetted within 48 hours",
    icon: "trending",
  },
  {
    category: "Media",
    how: "Request accreditation and present your press ID.",
    approval: "Vetted by the communications team",
    icon: "mic",
    action: { label: "Media accreditation", href: "/contact?topic=media" },
  },
];

/** What approved delegates receive, counted back from the summit day. */
export const preEventTimeline: { when: string; what: string; channel: string }[] = [
  {
    when: "21 days before",
    what: "“Save your seat” email with your form link",
    channel: "Email and WhatsApp",
  },
  {
    when: "14 days before",
    what: "“You're approved”: your e-badge and the dress code",
    channel: "Email and WhatsApp",
  },
  { when: "7 days before", what: "Final details: parking, agenda and who you'll meet", channel: "Email" },
  { when: "2 days before", what: "Your QR code and the venue map", channel: "WhatsApp" },
  { when: "1 day before", what: "“See you tomorrow” reminder. ID required", channel: "SMS and WhatsApp" },
];

/**
 * On the day. No registration-open time is published: the plan's documents
 * disagree (7:30, 8:00, 8:30 AM), and the convener asked for it to be removed.
 */
export const arrival = {
  dressCode: "Business formal or national dress",
  steps: [
    "Show your QR code on your phone, or give your name, at a check-in lane.",
    "Your badge prints in seconds and an usher directs you to the hall.",
  ],
  bring: ["Your QR code (sent by WhatsApp two days before)", "A valid photo ID"],
  parking: "Use the Eko Hotel gate and show your confirmation message.",
  exhibitors: "Exhibitor and booth set-up staff use a separate lane with their own badges.",
  noOnSite: "There is no on-site registration. Only pre-approved delegates are admitted.",
};
