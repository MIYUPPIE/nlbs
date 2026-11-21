/**
 * Copy for the Nigeria 2.0 seamless Instagram carousel (7 slides).
 *
 * Every fact (names, roles, dates, figures, venue, handle) is read from
 * src/data so the carousel can never drift from the website. Only the
 * connective lines (hooks, headings) are written here, and they make no
 * factual claims. Figures keep their "Expected" / "Target" labels: the
 * content rule says targets stay targets.
 */
import { contact, event, formatStat, statById } from "@/data/event";
import { pillars, whatToExpect } from "@/data/content";
import { partners } from "@/data/partners";
import { displayName, speakers, type Speaker } from "@/data/speakers";
import { leadership } from "@/data/vision";
import { registrationClosure } from "@/lib/registration-window";

const speaker = (id: string): Speaker => {
  const s = speakers.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown speaker: ${id}`);
  return s;
};

export type Person = { name: string; role: string; label: string; photo: string };

const person = (id: string, label: string, role?: string): Person => {
  const s = speaker(id);
  return {
    name: displayName(s),
    role: role ?? (s.organisation ? `${s.role}, ${s.organisation}` : s.role),
    label,
    photo: s.photo.src,
  };
};

const convener = leadership.find((l) => l.role === "Convener");
if (!convener) throw new Error("Convener missing from src/data/vision.ts");

const stat = (id: string) => {
  const s = statById(id);
  return { value: formatStat(s), label: s.label, kind: s.kind };
};

/** "www.nlbs.com.ng" from the production site URL. */
export const SITE_DISPLAY = "www.nlbs.com.ng";

export const carousel = {
  cover: {
    kicker: event.name,
    wordmark: { lead: "Nigeria", accent: "2.0" },
    hook: "The agenda for Nigeria’s next decade is set on Monday.",
    date: event.date.display,
    time: event.date.startDisplay,
    venue: event.venue.display,
    swipe: "Swipe →",
  },
  why: {
    kicker: "Why this summit",
    heading: "From dialogue to deals",
    body: "More than 70% of Nigerians are under 35. Reforms are under way and digital adoption is accelerating. What it takes now is coordinated action on three levers.",
    points: pillars.map((p) => ({ label: p.label, title: p.title, detail: p.intro })),
  },
  numbers: {
    kicker: "The goals in the room",
    heading: "What we’re working toward",
    body: "These are the summit’s goals, not results yet.",
    stats: ["delegates", "investment", "talent", "meetings"].map(stat),
  },
  voices: {
    kicker: "Who you’ll hear from",
    heading: "Leaders in the room",
    chiefHost: {
      ...person("babajide-sanwo-olu", "Chief Host", speaker("babajide-sanwo-olu").role),
      honorific: speaker("babajide-sanwo-olu").honorific ?? "",
      name: speaker("babajide-sanwo-olu").name,
    },
    keynotes: [
      person("taiwo-oyedele", "Keynote", "Minister of Finance and Coordinating Minister of the Economy"),
      person("samson-ajayi", "Keynote"),
    ],
  },
  guests: {
    kicker: "Guests of honour",
    heading: "Policy, capital and enterprise",
    people: [
      person(
        "bosun-tijani",
        "Special Guest of Honour",
        "Minister of Communications, Innovation and Digital Economy",
      ),
      person("jumoke-oduwole", "Special Guest of Honour", "Minister of Industry, Trade and Investment"),
      person("olayemi-cardoso", "Special Invited Guest of Honour"),
      person("seyi-tinubu", "Patron", "Patron, Nigeria 2.0 Talent Fund"),
      person("seye-olurotimi", "Speaker"),
    ],
  },
  day: {
    kicker: event.date.display,
    heading: "What to expect on the day",
    items: whatToExpect.map((w) => ({ title: w.title, detail: w.detail })),
  },
  cta: {
    closing: event.tagline,
    body: `Registration closed on ${registrationClosure.closed}. Registered delegates: your QR code and the venue map come by email.`,
    follow: contact.socialHandle ?? "",
    site: SITE_DISPLAY,
    convener: {
      name: convener.name,
      credentials: convener.credentials,
      title: `${convener.role}, ${event.convener}`,
      photo: convener.photo.src,
    },
    partnersLabel: "In partnership with",
    partners: partners.map((p) => ({ name: p.name, logo: p.logo })),
    save: "Save",
    share: "Share",
    shareIcon: "send" as "send" | "repost",
  },
};

export type Carousel = typeof carousel;

/**
 * The same copy adapted for X (Twitter) video: no "Swipe" (the camera moves
 * by itself) and X's own verbs, Bookmark and Repost.
 */
export const forX = (c: Carousel = carousel): Carousel => ({
  ...c,
  cover: { ...c.cover, swipe: "" },
  cta: { ...c.cta, save: "Bookmark", share: "Repost", shareIcon: "repost" },
});

/** Every visible string, for content checks. */
export const allCopy = (c: Carousel = carousel): string[] => {
  const out: string[] = [];
  const walk = (v: unknown) => {
    if (typeof v === "string") out.push(v);
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") Object.values(v).forEach(walk);
  };
  walk(c);
  return out;
};
