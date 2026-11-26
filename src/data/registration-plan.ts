import type { IconName } from "@/components/ui/Icon";

/**
 * Delegate-facing parts of the convener's "Participants Registration + Event
 * Entry Plan" (latest/35996679-eabc-4da2-8a58-5780a6100ae9.jpeg). The QR code
 * goes by email, not WhatsApp as the plan drew it (convener, 29 Sep 2026).
 *
 * Internal parts stay off the site: badge colours and access zones, staffing,
 * equipment, tools, and the data captured for sponsors.
 */

export const registrationModel = {
  heading: "Choose your class. Pay to confirm your seat.",
  lead: "Delegate seats come in classes, each with a limited number of seats. A seat is confirmed only when it is paid, and your seat number and entry QR code arrive by email straight away.",
};

/**
 * Delegate classes (convener, 26 Nov 2026, "Nigeria 2.0 Delegate Tier
 * Distribution"). Price in naira; capacity = seats in the class. `open`: sold
 * on this site. Basic Entry Level is subsidised for youths and full. VVIP
 * guests are invited by the convener and are not sold here. The central
 * backend charges the same prices and stops selling a class when it is full
 * (config central.nlbs_registration.tiers; tests/registration-classes.test.ts
 * compares them).
 */
export type DelegateClass = {
  key: "vip" | "executive" | "business" | "standard" | "basic";
  label: string;
  price: number;
  priceDisplay: string;
  capacity: number;
  open: boolean;
};

export const delegateClasses: DelegateClass[] = [
  { key: "vip", label: "VIP", price: 250_000, priceDisplay: "₦250,000", capacity: 62, open: true },
  {
    key: "executive",
    label: "Executive Class",
    price: 200_000,
    priceDisplay: "₦200,000",
    capacity: 196,
    open: true,
  },
  {
    key: "business",
    label: "Business Class",
    price: 150_000,
    priceDisplay: "₦150,000",
    capacity: 351,
    open: true,
  },
  { key: "standard", label: "Standard", price: 100_000, priceDisplay: "₦100,000", capacity: 108, open: true },
  {
    key: "basic",
    label: "Basic Entry Level",
    price: 20_000,
    priceDisplay: "₦20,000",
    capacity: 252,
    open: false,
  },
];

export const openClassKeys = ["vip", "executive", "business", "standard"] as const;

export const classPayment = {
  provider: "Paystack",
  secure: "Payment is taken securely by Paystack. We never see or store your card or bank details.",
  confirmed:
    "Your seat is confirmed the moment you pay: your class, seat number and entry QR code arrive by email.",
  refunds: "Seats are not refundable, but you can transfer yours to a colleague before the summit.",
  basicFull: "Basic Entry Level (subsidised for youths) is full.",
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
    how: "Register with the form on this page and choose your class. Tell us if a partner, chamber of commerce or bank nominated you.",
    approval: "Confirmed when paid",
    icon: "briefcase",
  },
  {
    category: "Investors, DFIs & Tech",
    how: "Register with the form on this page and choose your class.",
    approval: "Confirmed when paid",
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

/** What confirmed delegates receive, counted back from the summit day. */
export const preEventTimeline: { when: string; what: string; channel: string }[] = [
  {
    when: "When you pay",
    what: "Your class, seat number and entry QR code",
    channel: "Email",
  },
  { when: "7 days before", what: "Final details: parking, agenda and who you'll meet", channel: "Email" },
  { when: "2 days before", what: "The venue map and your QR code again", channel: "Email" },
  { when: "1 day before", what: "“See you tomorrow” reminder. ID required", channel: "SMS" },
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
  bring: ["Your QR code (in your payment confirmation email)", "A valid photo ID"],
  parking: "Use the Eko Hotel gate and show your confirmation message.",
  exhibitors: "Exhibitor and booth set-up staff use a separate lane with their own badges.",
  noOnSite: "There is no on-site registration or payment. Only delegates with a paid seat are admitted.",
};
