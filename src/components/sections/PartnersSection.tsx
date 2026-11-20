import Image from "next/image";
import { PARTNER_LOGO_SIZE, partners, partnershipBenefits } from "@/data/partners";
import { MovingBorderFrame } from "@/components/aceternity/MovingBorder";
import { Container } from "@/components/ui/Container";
import { GoldButton } from "@/components/ui/GoldButton";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function PartnersSection({ compact = false }: { compact?: boolean }) {
  return (
    <Section tone="light" id="partners" labelledBy="partners-title">
      <Container>
        <SectionHeading
          id="partners-title"
          eyebrow="Partner Ecosystem"
          title="Partners in Nigeria's Next Phase"
          lead="Nigeria 2.0 is delivered in partnership with the organisations below."
        />

        <div data-reveal className="mt-12 border-t border-line pt-8 lg:mt-16">
          <h3 className="text-xs font-semibold tracking-[0.22em] text-muted uppercase">
            In partnership with
          </h3>
          <ul role="list" className="mt-6 flex flex-wrap justify-center gap-3 sm:gap-4">
            {partners.map((p) => (
              <li
                key={p.name}
                className="w-[calc(50%-0.375rem)] overflow-hidden rounded-xl border border-line bg-white shadow-sm sm:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-4rem)/5)]"
              >
                <Image
                  src={p.logo}
                  alt={p.name}
                  width={PARTNER_LOGO_SIZE.width}
                  height={PARTNER_LOGO_SIZE.height}
                  sizes="(min-width: 1024px) 220px, (min-width: 640px) 33vw, 50vw"
                  className="block aspect-[2/1] h-auto w-full"
                />
              </li>
            ))}
          </ul>
        </div>

        <div data-reveal className="mt-16 lg:mt-20">
          <MovingBorderFrame innerClassName="bg-navy-950 text-white" radius="1.75rem">
            <div className="relative grid gap-10 overflow-hidden p-8 sm:p-12 lg:grid-cols-12 lg:items-center">
              <div aria-hidden="true" className="bg-grid mask-fade-b absolute inset-0" />
              <div className="relative lg:col-span-5">
                <p className="text-xs font-semibold tracking-[0.22em] text-gold uppercase">Partnership</p>
                <h3 className="mt-3 font-display text-4xl leading-tight">Partner with Nigeria 2.0</h3>
                <p className="mt-4 text-mist">
                  Join the organisations helping to unlock capital, talent and technology for a resilient
                  economy.
                </p>
                <GoldButton href="/contact?topic=partnership" size="lg" className="mt-8">
                  Become a partner
                </GoldButton>
              </div>
              <ul role="list" className="relative grid gap-4 sm:grid-cols-2 lg:col-span-7">
                {partnershipBenefits.map((b) => (
                  <li key={b.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                    <p className="font-semibold text-white">{b.title}</p>
                    <p className="mt-1.5 text-sm text-mist">{b.detail}</p>
                  </li>
                ))}
              </ul>
            </div>
          </MovingBorderFrame>
        </div>
        {compact && (
          <div className="mt-10">
            <GoldButton href="/partners" variant="outline-dark">
              Partnership tracks and tiers
            </GoldButton>
          </div>
        )}
      </Container>
    </Section>
  );
}
