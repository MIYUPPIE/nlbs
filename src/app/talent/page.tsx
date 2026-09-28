import { talent } from "@/data/content";
import { PageHero } from "@/components/layout/PageHero";
import { CTASection } from "@/components/sections/CTASection";
import { TalentSection } from "@/components/sections/TalentSection";
import { Container } from "@/components/ui/Container";
import { GoldButton } from "@/components/ui/GoldButton";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Talent & Skills Initiative",
  description:
    "The Nigeria 2.0 Talent Fund targets 10,000 young Nigerians, with a focus on digital skills, technology, entrepreneurship, employability and women's inclusion.",
  path: "/talent",
});

const ways = [
  {
    title: "Young professionals",
    body: "Register interest to hear when programme details, eligibility and application dates are published.",
    href: "/register?type=Student%20%2F%20Young%20Professional",
    cta: "Register interest",
  },
  {
    title: "Employers and partners",
    body: "Explore how your organisation can support skills, placement and entrepreneurship for young Nigerians.",
    href: "/contact?topic=talent",
    cta: "Support the Talent Fund",
  },
];

export default function TalentPage() {
  return (
    <>
      <PageHero
        eyebrow={talent.fundName}
        title="Invest in People"
        lead="Nigeria's youthful population is one of its greatest economic assets. The Talent Fund is the summit's commitment to turning that potential into participation."
      />
      <TalentSection cta={false} />
      <Section tone="white" labelledBy="talent-ways-title">
        <Container>
          <SectionHeading
            id="talent-ways-title"
            eyebrow="Get involved"
            title="Two ways to take part"
            lead="Eligibility, selection and programme dates will be published once confirmed."
          />
          <ul role="list" className="mt-12 grid gap-5 md:grid-cols-2">
            {ways.map((w) => (
              <li
                key={w.title}
                data-reveal
                className="flex flex-col rounded-3xl border border-line bg-ivory p-8 sm:p-10"
              >
                <h3 className="font-display text-3xl text-navy-950">{w.title}</h3>
                <p className="mt-3 flex-1 leading-relaxed text-muted">{w.body}</p>
                <GoldButton href={w.href} className="mt-8 self-start">
                  {w.cta}
                </GoldButton>
              </li>
            ))}
          </ul>
        </Container>
      </Section>
      <CTASection />
    </>
  );
}
