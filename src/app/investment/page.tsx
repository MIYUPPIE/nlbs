import { PageHero } from "@/components/layout/PageHero";
import { CTASection } from "@/components/sections/CTASection";
import { DealMakingSection } from "@/components/sections/DealMakingSection";
import { InvestmentSection } from "@/components/sections/InvestmentSection";
import { StartupPitchSection } from "@/components/sections/StartupPitchSection";
import { Container } from "@/components/ui/Container";
import { GoldButton } from "@/components/ui/GoldButton";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Investment",
  description:
    "Structured connections between Nigerian businesses, startups, DFIs, venture capital, institutional and diaspora investors, government and strategic partners. Target: $50M+ in investment commitments.",
  path: "/investment",
});

const paths = [
  {
    title: "For businesses and startups",
    body: "Meet capital providers whose mandates fit your stage and sector through qualified, pre-arranged meetings.",
    href: "/register?type=Business",
    cta: "Register as a business",
  },
  {
    title: "For investors and DFIs",
    body: "Access a curated pipeline of Nigerian businesses and startups, and the leaders shaping the operating environment.",
    href: "/register?type=Investor",
    cta: "Register as an investor",
  },
  {
    title: "For strategic partners",
    body: "Support structured deal-making and align your organisation with the summit's capital agenda.",
    href: "/contact?topic=investment",
    cta: "Discuss partnership",
  },
];

export default function InvestmentPage() {
  return (
    <>
      <PageHero
        eyebrow="Capital"
        title="Capital That Moves Ideas Forward"
        lead="Nigeria 2.0 is designed to connect high-growth businesses and startups with the capital and partners that can help them scale."
      />
      <InvestmentSection cta={false} />
      <Section tone="white" labelledBy="paths-title">
        <Container>
          <SectionHeading
            id="paths-title"
            eyebrow="Explore Investment Opportunities"
            title="Find your route into the room"
          />
          <ul role="list" className="mt-12 grid gap-5 md:grid-cols-3">
            {paths.map((p) => (
              <li
                key={p.title}
                data-reveal
                className="flex flex-col rounded-3xl border border-line bg-ivory p-8"
              >
                <h3 className="font-display text-2xl text-navy-950">{p.title}</h3>
                <p className="mt-3 flex-1 leading-relaxed text-muted">{p.body}</p>
                <GoldButton href={p.href} className="mt-8 self-start">
                  {p.cta}
                </GoldButton>
              </li>
            ))}
          </ul>
        </Container>
      </Section>
      <DealMakingSection />
      <StartupPitchSection />
      <CTASection />
    </>
  );
}
