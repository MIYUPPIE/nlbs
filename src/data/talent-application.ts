import type { IconName } from "@/components/ui/Icon";

/**
 * Applicant-facing Talent Fund details. Sources: youth application form PDF
 * (tracks, requirements, deadline) and FAQ Q16-Q22, Q31. The form's internal
 * scoring and review workflow is deliberately not published. "From April
 * 2026" in the form contradicts the October deadline and is omitted.
 */
export const talentApplication = {
  heading: "Apply to the Nigeria 2.0 Talent Fund",
  lead: "We are selecting 10,000 young Nigerians for skills, jobs and capital. The application takes about 4 minutes and no payment is required.",
  portal: "http://nlbs.com.ng/talentnigeria20",
  portalOpens: "1 October 2026",
  deadline: "30 October 2026",
  deadlineIso: "2026-10-30",
  eligibility: [
    "Nigerians aged 18 to 35, from all 36 states and the FCT",
    "Commit 5 hours per week for 12 weeks",
    "Training is free for beneficiaries",
  ],
  allocation: [
    { value: 5000, label: "Skilled", detail: "12 weeks of intensive training" },
    { value: 3000, label: "Placed", detail: "6-month paid internships or jobs with partner companies" },
    { value: 2000, label: "Funded", detail: "N250k to N2M enterprise grants with mentorship" },
  ],
  inclusion: ["40% women", "10% persons with disabilities", "60% under 30"],
  hubs: ["Lagos", "Abuja", "Kano", "Port Harcourt", "Enugu", "Ibadan"],
  tracks: [
    {
      name: "Skills",
      icon: "graduation",
      summary: "12-week free training in AI, Data, Cloud or FinTech.",
      forWho: "Beginners and learners building a foundation.",
      prepare:
        "Your chosen skill: AI, Data Analytics, Software Development, Digital Marketing, UI/UX, Cybersecurity or AgriTech.",
    },
    {
      name: "Jobs",
      icon: "briefcase",
      summary: "Internship or job placement with partner companies.",
      forWho: "Applicants who already have a skill, projects or clients.",
      prepare: "Your CV (PDF) and a LinkedIn or portfolio link.",
    },
    {
      name: "Capital",
      icon: "wallet",
      summary: "N250K to N2M for your business, with mentorship.",
      forWho: "Founders with a CAC-registered business or a clear idea.",
      prepare: "Your business name, CAC status and monthly revenue.",
    },
  ] satisfies { name: string; icon: IconName; summary: string; forWho: string; prepare: string }[],
  checklist: [
    "A 1-minute video: your name, where you are from, and why you should be picked",
    "One sentence on the problem you want to solve in Nigeria (150 characters)",
    "Why a CEO should hire or fund you, in 30 words",
    "Your WhatsApp number, email and state of residence",
  ],
};
