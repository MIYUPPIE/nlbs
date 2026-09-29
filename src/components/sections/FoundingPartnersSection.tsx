import { foundingPartners } from "@/data/vision";
import { MovingBorderFrame } from "@/components/aceternity/MovingBorder";
import { Container } from "@/components/ui/Container";
import { GoldButton } from "@/components/ui/GoldButton";
import { Section } from "@/components/ui/Section";
import { cn } from "@/lib/utils";

export function FoundingPartnersSection() {
  return (
    <Section tone="deep" labelledBy="founding-title">
      <div aria-hidden="true" className="bg-grid mask-fade-center absolute inset-0" />
      <Container className="relative">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="lg:col-span-6" data-reveal>
            <p className="text-xs font-semibold tracking-[0.24em] text-gold uppercase">Maiden edition</p>
            <h2 id="founding-title" className="mt-5 font-display text-5xl leading-[1.02] sm:text-6xl">
              {foundingPartners.heading}
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-mist">{foundingPartners.lead}</p>
            <blockquote className="mt-8 border-l-2 border-gold pl-5 font-display text-2xl leading-snug text-white">
              {foundingPartners.statement}
            </blockquote>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <GoldButton href="/contact?topic=partnership" size="lg">
                Become a Founding Partner
              </GoldButton>
              <GoldButton
                href="/faq#partnership-and-sponsorship"
                variant="outline-light"
                size="lg"
                arrow={false}
              >
                Partnership FAQs
              </GoldButton>
            </div>
          </div>
          <ul className="grid gap-5 sm:grid-cols-2 lg:col-span-6">
            {foundingPartners.tiers.map((t, i) => {
              const card = (
                <div className="flex h-full flex-col p-8">
                  <p
                    className={cn(
                      "text-xs font-semibold tracking-[0.2em] uppercase",
                      i === 0 ? "text-gold" : "text-mist",
                    )}
                  >
                    {t.name}
                  </p>
                  <p className="mt-6 font-display text-8xl leading-none text-gold">{t.slots}</p>
                  <p className="mt-3 text-white">slots nationally</p>
                </div>
              );
              return (
                <li key={t.name} data-reveal>
                  {i === 0 ? (
                    <MovingBorderFrame innerClassName="bg-navy-900" radius="1.5rem" className="h-full">
                      {card}
                    </MovingBorderFrame>
                  ) : (
                    <div className="h-full rounded-3xl border border-white/10 bg-white/[0.03]">{card}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </Container>
    </Section>
  );
}
