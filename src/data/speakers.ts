/**
 * Speakers and guests of honour, as supplied by the convener (Nov 2026):
 * the event flyer (Chief Host, Keynotes, Special Guest of Honour, Patron),
 * named portrait files, and written profiles for Dr. Samson Ajayi and
 * Dr. Seye Olurotimi. Originals are in assets-src/speakers/.
 *
 * Profiles for the other six were researched online (19 Nov 2026) from
 * official government pages, Wikipedia and reputable Nigerian press. Each
 * lists its `sources`, shown in the profile modal. Supplied profiles have no
 * `sources` and are labelled as supplied by the speaker. Roles were checked
 * against current sources: Taiwo Oyedele has been Minister of Finance and
 * Coordinating Minister of the Economy since 21 April 2026; Dr. Olayemi
 * Cardoso is Governor of the Central Bank of Nigeria.
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
  /** Current role, from the convener's materials, checked against `sources`. */
  role: string;
  organisation?: string;
  category: SpeakerCategory;
  /** 4:5 WebP under /public, built by scripts/optimize-people.mjs. */
  photo: { src: string; width: number; height: number };
  /** One string per paragraph: verbatim if supplied, else written from `sources`. */
  bio?: string[];
  /** Short line under the name on the profile. */
  tagline?: string;
  /** Where a researched profile came from. Absent: supplied by the speaker. */
  sources?: { title: string; url: string }[];
};

export const speakers: Speaker[] = [
  {
    id: "babajide-sanwo-olu",
    honorific: "His Excellency",
    name: "Babajide Sanwo-Olu",
    role: "Executive Governor of Lagos State",
    organisation: "Lagos State Government",
    category: "Chief Host",
    photo: { src: "/speakers/babajide-sanwo-olu.webp", width: 512, height: 640 },
    tagline: "Governor of Lagos State | Former Banker",
    bio: [
      "Babajide Sanwo-Olu is the Governor of Lagos State. He took office on 29 May 2019 and was re-elected in 2023 for a second term. His administration's work has included mass transit, with the Blue and Red rail lines now in operation, as well as road infrastructure, power sector reform and digital governance.",
      "He began his career in banking. He was Treasurer at Lead Merchant Bank from 1994 to 1997, then Head of Foreign Money Market at United Bank for Africa, and later Deputy General Manager and Divisional Head at First Inland Bank.",
      "In the Lagos State public service he was appointed Special Adviser on Corporate Matters to the Deputy Governor in 2003. He then served as acting Commissioner for Economic Planning and Budget, Commissioner for Commerce and Industry, and Commissioner for Establishments, Training and Pensions. In 2016 he became Managing Director and Chief Executive of the Lagos State Development and Property Corporation. He was also the pioneer board chairman of the Lagos Security Trust Fund.",
      "He holds a BSc in Surveying and an MBA from the University of Lagos, and is an alumnus of the John F. Kennedy School of Government at Harvard, London Business School and Lagos Business School. He is an associate member of the Chartered Institute of Personnel Management and a fellow of the Nigeria Institute of Training and Development.",
    ],
    sources: [
      {
        title: "Babajide Sanwo-Olu (Wikipedia)",
        url: "https://en.wikipedia.org/wiki/Babajide_Sanwo-Olu",
      },
    ],
  },
  {
    id: "taiwo-oyedele",
    name: "Taiwo Oyedele",
    role: "Honourable Minister of Finance and Coordinating Minister of the Economy",
    category: "Keynote",
    photo: { src: "/speakers/taiwo-oyedele.webp", width: 640, height: 800 },
    tagline: "Chartered Accountant | Fiscal and Tax Policy Specialist",
    bio: [
      "Taiwo Oyedele is Nigeria's Minister of Finance and Coordinating Minister of the Economy, a post he has held since 21 April 2026. He was previously Minister of State for Finance, sworn in on 16 March 2026.",
      "From July 2023 he chaired the Presidential Committee on Fiscal Policy and Tax Reforms. The committee's proposals formed the basis of four tax reform bills passed by the Senate in May 2025, including the framework for the Nigeria Tax Act 2025.",
      "Before entering government he spent 22 years at PwC, which he joined in 2001, and rose to Fiscal Policy Partner and Africa Tax Leader. He has served as vice chairman of the National Tax Policy Committee, chairman of the Taxation and Fiscal Policy Faculty Board of the Institute of Chartered Accountants of Nigeria (ICAN), and dean of the Faculty of Direct Taxation of the Chartered Institute of Taxation of Nigeria (CITN). He is a professor at Babcock University and a visiting scholar at Lagos Business School, and founded the Impact Africa Foundation.",
      "He holds a Higher National Diploma in Accountancy and Finance from Yaba College of Technology and a BSc in Applied Accounting from Oxford Brookes University, and has completed executive education at the London School of Economics, Yale University and Harvard Kennedy School. He is a fellow of ICAN, CITN and ACCA.",
    ],
    sources: [
      {
        title:
          "Oyedele assumes office as Finance Minister and Coordinating Minister of the Economy (Federal Ministry of Information, 24 April 2026)",
        url: "https://fmino.gov.ng/oyedele-assumes-office-as-finance-minister-and-coordinating-minister-of-the-economy-commits-to-sustaining-reform-momentum/",
      },
      {
        title: "Taiwo Oyedele (Wikipedia)",
        url: "https://en.wikipedia.org/wiki/Taiwo_Oyedele",
      },
    ],
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
    tagline: "Technology Entrepreneur | Co-founder, CcHUB",
    bio: [
      "Dr. Bosun Tijani is Nigeria's Minister of Communications, Innovation and Digital Economy, a post he has held since 21 August 2023. The ministry covers telecommunications, digital infrastructure, innovation and the digital economy. In late 2023 it launched the 3 Million Technical Talent (3MTT) programme to train Nigerians in technical skills such as software engineering and data science. In 2026 he chaired the session of the Council of the International Telecommunication Union (ITU).",
      "Before taking office he co-founded Co-creation Hub (CcHUB) and served as its Chief Executive. In 2019 CcHUB acquired iHub in Kenya and opened the CcHUB Design Lab in Kigali, Rwanda.",
      "His earlier career included a fellowship at the International Trade Centre in Geneva, work at Hewlett Packard on learning and telecentre deployments, and a role from 2007 as European Innovation Manager at Pera Innovation Network.",
      "He holds a Bachelor's degree in Economics from the University of Jos, an MSc in Information Systems and Management from Warwick Business School, and a PhD from the University of Leicester, where his research covered innovation ecosystems in developing countries. He completed the Innovation for Economic Development executive programme at Harvard Kennedy School and was a 2014 Draper Hills Fellow at Stanford University.",
    ],
    sources: [
      {
        title: "Bosun Tijani (Wikipedia)",
        url: "https://en.wikipedia.org/wiki/Bosun_Tijani",
      },
      {
        title: "Chair of the Council, 2026 session (ITU)",
        url: "https://council.itu.int/2026/en/about/council-chair/",
      },
    ],
  },
  {
    id: "jumoke-oduwole",
    name: "Dr. Jumoke Oduwole",
    role: "Honourable Minister of Industry, Trade and Investment",
    category: "Special Guest of Honour",
    photo: { src: "/speakers/jumoke-oduwole.webp", width: 420, height: 525 },
    tagline: "Trade Lawyer | Business Environment Reform",
    bio: [
      "Dr. Jumoke Oduwole is Nigeria's Minister of Industry, Trade and Investment, a post she has held since 4 November 2024. In October 2026 the ministry launched a set of trade intelligence tools to give businesses, in particular micro, small and medium-sized enterprises, information on export markets, tariffs, standards and buyers.",
      "She has worked on trade and business environment policy in the Presidency since 2015. She was Senior Special Assistant to the President on Industry, Trade and Investment from November 2015 to May 2019, and Special Adviser to the President on Ease of Doing Business from August 2019 to May 2023. Before her ministerial appointment she was Senior Special Assistant to the President on the Presidential Enabling Business Environment Council (PEBEC).",
      "She was called to the Nigerian Bar in 1999 and worked as an investment banker with FCMB Capital Markets from 2000 to 2003. She has lectured at the University of Lagos since 2004, held the Prince Claus Chair from 2013 to 2015, and was appointed a Senior Fellow at Harvard Kennedy School in 2023.",
      "She holds an LLB from the University of Lagos, an LLM in commercial law from the University of Cambridge, a master's in international legal studies from Stanford University, and a doctorate in international trade and development from Stanford Law School.",
    ],
    sources: [
      {
        title:
          "Jumoke Oduwole assumes office as Minister of Industry, Trade and Investment (Federal Ministry of Information, 4 November 2024)",
        url: "https://fmino.gov.ng/jumoke-oduwole-assumes-office-as-minister-of-industry-trade-and-investment-pledges-strategic-repositioning/",
      },
      {
        title: "FG unveils trade intelligence tools (Federal Ministry of Information, 22 October 2026)",
        url: "https://fmino.gov.ng/fg-unveils-trade-intelligence-tools-to-open-global-markets-drive-investment-and-power-1tn-economy-ambition/",
      },
      {
        title: "Jumoke Oduwole (Wikipedia)",
        url: "https://en.wikipedia.org/wiki/Jumoke_Oduwole",
      },
    ],
  },
  {
    id: "olayemi-cardoso",
    name: "Dr. Olayemi Cardoso",
    role: "Governor",
    organisation: "Central Bank of Nigeria",
    category: "Special Invited Guest of Honour",
    photo: { src: "/speakers/olayemi-cardoso.webp", width: 640, height: 800 },
    tagline: "Central Banker | Former Lagos State Commissioner",
    bio: [
      "Dr. Olayemi Cardoso is Governor of the Central Bank of Nigeria. He took office in September 2023 and chairs the bank's Monetary Policy Committee. During his tenure the bank has reformed the foreign exchange market, cleared verified foreign exchange obligations, and in March 2024 launched a recapitalisation exercise that set new minimum capital requirements for commercial, national and regional banks.",
      "He spent most of his early career in banking. He worked with Citibank in Abidjan and with Chase Merchant Bank, and in 1984 rejoined Citibank as a founding member of Nigeria International Bank, where he set up the bank's first branch outside Lagos, in Kano, in 1988. In 1990 he co-founded Citizens Bank, where he served as an Executive Director for eight years.",
      "In 1999 he was appointed a Lagos State Commissioner and set up the Ministry of Economic Planning and Budget. He later became Chairman of the Board of Citibank Nigeria and chaired the board of EFInA. He was also the founder and co-chair of the Ehingbeti Summit, a Lagos State economic forum.",
      "He holds a BSc in Managerial and Administrative Studies from Aston University and a Master's in Public Administration from Harvard Kennedy School.",
    ],
    sources: [
      {
        title: "Olayemi Cardoso (Wikipedia)",
        url: "https://en.wikipedia.org/wiki/Olayemi_Cardoso",
      },
      {
        title: "Olayemi Cardoso: long road from monetary crisis to stability (ThisDay, 3 October 2026)",
        url: "https://www.thisdaylive.com/2026/10/03/olayemi-cardoso-long-road-from-monetary-crisis-to-stability/",
      },
    ],
  },
  {
    id: "seyi-tinubu",
    name: "Mr. Seyi Tinubu",
    role: "Patron, Nigeria 2.0 Talent Fund and City Boy Movement",
    category: "Patron",
    photo: { src: "/people/seyi-tinubu.webp", width: 520, height: 650 },
    tagline: "Out-of-Home Advertising Executive",
    bio: [
      "Seyi Tinubu is Patron of the Nigeria 2.0 Talent Fund. He is Chief Executive of Loatsad Promomedia Limited, an out-of-home advertising company whose clients include Nigerian and multinational companies. In 2016 he led the merger that formed Loatsad Promomedia, which added digital advertising to the company's outdoor services.",
      "In November 2019 Loatsad Promomedia acquired a majority stake in E-Motion Advertising, an out-of-home advertising firm founded in 2005 that provides billboard, transit and street furniture advertising.",
      "He is also Patron of the City Boy Movement, a nationwide youth movement. Its reported activities include mobilising volunteers, encouraging young people to take part in governance, medical outreaches and campus visits.",
    ],
    sources: [
      {
        title:
          "Grassroots mobilisation key to sustaining reforms, youth engagement, speakers tell City Boy Movement (State House, 14 July 2026)",
        url: "https://statehouse.gov.ng/grassroots-mobilisation-key-to-sustaining-reforms-youth-engagement-speakers-tell-city-boy-movement/",
      },
      {
        title:
          "Seyi Tinubu acquires Sim Shagaya's advertising company, E-Motion (Nairametrics, 18 November 2019)",
        url: "https://nairametrics.com/2019/11/18/seyi-tinubu-acquires-sim-shagayas-advertising-company-e-motion/",
      },
    ],
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

/** Every speaker and guest of honour, in flyer order (Chief Host first). */
export const orderedSpeakers = (): Speaker[] => speakerGroups.flatMap((g) => speakersIn(g.category));

/** Full display name, with honorific when there is one. */
export const displayName = (s: Speaker): string => (s.honorific ? `${s.honorific} ${s.name}` : s.name);
