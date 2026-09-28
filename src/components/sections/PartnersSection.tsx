import Image from "next/image";
import { partnerCategories, partnershipBenefits } from "@/data/partners";
import { MovingBorderFrame } from "@/components/aceternity/MovingBorder";
import { Container } from "@/components/ui/Container";
import { GoldButton } from "@/components/ui/GoldButton";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function PartnersSection({ compact = false }: { compact?: boolean }) {
  const categories = compact ? partnerCategories.slice(0, 3) : partnerCategories;
  return (
    <Section tone="light" id="partners" labelledBy="partners-title">
      <Container>
        <SectionHeading
          id="partners-title"
          eyebrow="Partner Ecosystem"
          title="Partners in Nigeria's Next Phase"
          lead="Partners will be announced as agreements are confirmed."
        />

        <div className="mt-12 space-y-10 lg:mt-16">
          {categories.map((cat) => (
            <div key={cat.id} data-reveal className="grid gap-5 border-t border-line pt-8 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <h3 className="font-semibold text-navy-950">{cat.label}</h3>
                <p className="mt-1 text-sm text-muted">{cat.description}</p>
              </div>
              <ul role="list" className="grid grid-cols-3 gap-2 sm:gap-3 lg:col-span-8">
                {cat.partners.length > 0
                  ? cat.partners.map((p) => (
                      <li
                        key={p.name}
                        className="relative flex h-20 items-center justify-center rounded-xl border border-line bg-white p-4 sm:h-24"
                      >
                        <Image src={p.logo} alt={p.name} fill sizes="200px" className="object-contain p-5" />
                      </li>
                    ))
                  : Array.from({ length: cat.slots }, (_, i) => (
                      <li
                        key={i}
                        className="flex h-20 items-center justify-center rounded-xl border border-dashed border-navy-950/15 bg-white/60 px-2 text-center text-[0.7rem] leading-snug font-medium tracking-wide text-muted sm:h-24 sm:text-xs"
                      >
                        Partner to be announced
                      </li>
                    ))}
              </ul>
            </div>
          ))}
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
              All partner categories
            </GoldButton>
          </div>
        )}
      </Container>
    </Section>
  );
}
