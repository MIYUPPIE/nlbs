/**
 * Talent Fund university nominations (/talentnigeria20/universities, unlisted).
 * Source: the convener's university concept note (Oct 2026): the invited
 * universities ("Nile / Baze" share slot 20, so both are listed), what a
 * university is asked to do, and the timeline. What students get is the
 * published Talent Fund offer (src/data/talent-application.ts).
 *
 * Deliberately NOT published from the concept note (convener decision
 * pending, 10 Oct 2026): named funders, banks, development institutions or
 * auditors, government seats, plaques and media numbers. None is confirmed;
 * tests/content-integrity.test.ts keeps those names out of src/.
 *
 * Being on this list means "invited", never "partner". A university shows as
 * confirmed only when the central backend says so (staff checked its signed
 * confirmation), and every count on the pages comes from the backend.
 *
 * The slug list is mirrored in central-backend App\Talent\Universities:
 * change both together (tests/universities.test.ts pins it).
 */

export type University = { slug: string; name: string; short: string; state: string };

export const universities: readonly University[] = [
  { slug: "unilag", name: "University of Lagos", short: "UNILAG", state: "Lagos" },
  { slug: "ui", name: "University of Ibadan", short: "UI", state: "Oyo" },
  { slug: "covenant", name: "Covenant University", short: "Covenant", state: "Ogun" },
  { slug: "oau", name: "Obafemi Awolowo University", short: "OAU", state: "Osun" },
  { slug: "abu", name: "Ahmadu Bello University, Zaria", short: "ABU Zaria", state: "Kaduna" },
  { slug: "unn", name: "University of Nigeria, Nsukka", short: "UNN", state: "Enugu" },
  { slug: "unilorin", name: "University of Ilorin", short: "UNILORIN", state: "Kwara" },
  { slug: "futa", name: "Federal University of Technology, Akure", short: "FUTA", state: "Ondo" },
  { slug: "uniben", name: "University of Benin", short: "UNIBEN", state: "Edo" },
  { slug: "uniport", name: "University of Port Harcourt", short: "UNIPORT", state: "Rivers" },
  { slug: "lasu", name: "Lagos State University", short: "LASU", state: "Lagos" },
  { slug: "pau", name: "Pan-Atlantic University", short: "Pan-Atlantic", state: "Lagos" },
  { slug: "babcock", name: "Babcock University", short: "Babcock", state: "Ogun" },
  { slug: "unijos", name: "University of Jos", short: "UNIJOS", state: "Plateau" },
  { slug: "futminna", name: "Federal University of Technology, Minna", short: "FUTMINNA", state: "Niger" },
  { slug: "buk", name: "Bayero University Kano", short: "BUK", state: "Kano" },
  { slug: "landmark", name: "Landmark University", short: "Landmark", state: "Kwara" },
  { slug: "unical", name: "University of Calabar", short: "UNICAL", state: "Cross River" },
  { slug: "funaab", name: "Federal University of Agriculture, Abeokuta", short: "FUNAAB", state: "Ogun" },
  { slug: "nile", name: "Nile University of Nigeria", short: "Nile", state: "FCT (Abuja)" },
  { slug: "baze", name: "Baze University", short: "Baze", state: "FCT (Abuja)" },
];

/** Talent applicants from a university not on the list choose this and type its name. */
export const UNIVERSITY_OTHER = "other";

export const universityBySlug = (slug: string): University | undefined =>
  universities.find((u) => u.slug === slug);

export const universityProgramme = {
  base: "/talentnigeria20/universities",
  /** What the convener asks of each university (concept note, "University commitment"). */
  asks: [
    {
      title: "Name a focal person",
      detail: "Someone in Career Services who shares the link and is our contact.",
    },
    {
      title: "Confirm on your letterhead",
      detail: "A short signed letter confirming that your university is taking part.",
    },
    {
      title: "Encourage your best students to apply",
      detail:
        "Final-year students and 2023 to 2026 graduates, with at least half of your nominees women. Each student applies and consents for themselves.",
    },
  ],
  timeline: [
    { label: "Confirm participation", value: "By 15 October 2026" },
    { label: "Student applications close", value: "10 November 2026 (extended)" },
    { label: "Screening", value: "November 2026" },
    { label: "Training starts", value: "January 2027" },
  ],
  /** Shown instead of a number while the backend is unreachable: never a made-up count. */
  countUnavailable: "Live numbers are unavailable right now.",
} as const;

/** The link a university shares with its students. */
export const studentLink = (siteUrl: string, slug: string) =>
  `${siteUrl}/talentnigeria20/?university=${slug}`;
