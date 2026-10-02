export type NavLink = { label: string; href: string };

/** Desktop header links, in the order given by the brief. */
export const primaryNav: NavLink[] = [
  { label: "About", href: "/about" },
  { label: "Programme", href: "/programme" },
  { label: "Speakers", href: "/speakers" },
  { label: "Investment", href: "/investment" },
  { label: "Talent", href: "/talent" },
  { label: "Technology", href: "/technology" },
  { label: "Partners", href: "/partners" },
];

/** Mobile drawer adds the secondary pages. */
export const mobileNav: NavLink[] = [
  ...primaryNav,
  { label: "Startup Pitch Arena", href: "/startup-pitch" },
  { label: "Innovation Exhibition", href: "/exhibition" },
  { label: "Talent Fund Application", href: "/talentnigeria20" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export const footerNav: NavLink[] = [
  { label: "About", href: "/about" },
  { label: "Programme", href: "/programme" },
  { label: "Speakers", href: "/speakers" },
  { label: "Investment", href: "/investment" },
  { label: "Talent", href: "/talent" },
  { label: "Technology", href: "/technology" },
  { label: "Partners", href: "/partners" },
  { label: "Register", href: "/register" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export const footerSecondaryNav: NavLink[] = [
  { label: "Talent Fund Application", href: "/talentnigeria20" },
  { label: "Startup Pitch Arena", href: "/startup-pitch" },
  { label: "Innovation Exhibition", href: "/exhibition" },
];

/** Footer legal row. Paths come from the privacy policy contract (src/data/legal.json). */
export const legalNav: NavLink[] = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Cookie Policy", href: "/cookies" },
  { label: "Terms of Use", href: "/terms" },
  { label: "Privacy Request", href: "/privacy/request" },
  { label: "Photo Credits", href: "/credits" },
];

/** Every public route. Drives the sitemap and route tests. */
export const allRoutes = [
  "/",
  "/about",
  "/programme",
  "/speakers",
  "/investment",
  "/talent",
  "/technology",
  "/startup-pitch",
  "/exhibition",
  "/partners",
  "/register",
  "/contact",
  "/faq",
  "/talentnigeria20",
  "/privacy",
  "/privacy/request",
  "/cookies",
  "/terms",
  "/credits",
] as const;
