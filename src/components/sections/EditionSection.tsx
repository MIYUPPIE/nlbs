import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { event } from "@/data/event";
import { illustration } from "@/data/illustrations";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function EditionSection() {
  return (
    <Section tone="white" id="2025" labelledBy="edition-title">
      <Container>
        <SectionHeading
          id="edition-title"
          eyebrow="Our Journey"
          title="Building on 2025"
          lead={
            <>
              The 2026 summit builds on the {event.previousEdition.year} edition, themed{" "}
              <strong className="font-semibold text-navy-950">{event.previousEdition.theme}</strong>. This
              year, the emphasis shifts toward practical connections between capital, talent and technology.
            </>
          }
        />

        <div className="mt-14 grid items-stretch gap-4 md:grid-cols-[1fr_auto_1fr]">
          <article data-reveal className="rounded-3xl border border-line bg-ivory p-8 sm:p-10">
            <p className="font-display text-6xl text-muted">{event.previousEdition.year}</p>
            <p className="mt-6 text-xs font-semibold tracking-[0.2em] text-gold-ink uppercase">Theme</p>
            <h3 className="mt-2 font-display text-3xl text-navy-950">{event.previousEdition.theme}</h3>
            <p className="mt-6 rounded-xl border border-dashed border-line bg-white px-4 py-3 text-sm text-muted">
              Highlights, speakers and outcomes from the {event.previousEdition.year} edition will be
              published here once verified.
            </p>
          </article>

          <div aria-hidden="true" className="flex items-center justify-center py-2 md:py-0">
            <span className="flex size-12 items-center justify-center rounded-full border border-gold/50 bg-white text-gold-ink">
              <ArrowRight className="size-5 rotate-90 md:rotate-0" />
            </span>
          </div>

          <article
            data-reveal
            className="relative overflow-hidden rounded-3xl bg-navy-950 p-8 text-white sm:p-10"
          >
            <Image
              src={illustration("edition").src}
              alt=""
              aria-hidden="true"
              data-ai-generated="true"
              fill
              sizes="(min-width: 768px) 45vw, 100vw"
              className="object-cover opacity-60"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/70 to-navy-950/30"
            />
            <p className="relative font-display text-6xl text-gold">2026</p>
            <p className="relative mt-6 text-xs font-semibold tracking-[0.2em] text-gold uppercase">Theme</p>
            <h3 className="relative mt-2 font-display text-3xl">{event.themeShort}</h3>
            <p className="relative mt-6 text-sm text-mist">From dialogue to deals.</p>
          </article>
        </div>
      </Container>
    </Section>
  );
}
