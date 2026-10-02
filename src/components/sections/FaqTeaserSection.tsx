import { Plus } from "lucide-react";
import { faqByNumber, featuredFaqNumbers, faqItems } from "@/data/faq";
import { illustration } from "@/data/illustrations";
import { faqAnchor } from "@/lib/faq";
import { FaqAnswer } from "@/components/faq/FaqAnswer";
import { Container } from "@/components/ui/Container";
import { GoldButton } from "@/components/ui/GoldButton";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionImage } from "@/components/ui/SectionImage";

/** Homepage FAQ preview: a handful of questions, native accordion, link to all. */
export function FaqTeaserSection() {
  const items = featuredFaqNumbers.map(faqByNumber);
  return (
    <Section tone="white" id="faq" labelledBy="faq-teaser-title">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <SectionHeading
                id="faq-teaser-title"
                eyebrow="FAQ"
                title="Questions, answered."
                lead={`The most asked, below. ${faqItems.length} answers in full on the FAQ page.`}
              />
              <GoldButton href="/faq" variant="outline-dark" className="mt-8">
                View all {faqItems.length} questions
              </GoldButton>
              <SectionImage
                image={illustration("faq")}
                className="mt-10 hidden aspect-[4/3] lg:block"
                sizes="30vw"
              />
            </div>
          </div>
          <ul className="space-y-3 lg:col-span-8">
            {items.map((it) => (
              <li key={it.number} data-reveal>
                <details className="group rounded-2xl border border-line bg-ivory/60 transition-colors open:border-gold/60 open:bg-white hover:border-gold/40">
                  <summary className="flex cursor-pointer list-none items-start gap-4 p-5 sm:p-6 [&::-webkit-details-marker]:hidden">
                    <span className="min-w-0 flex-1 font-semibold [overflow-wrap:anywhere] text-navy-950 sm:text-lg">
                      {it.question}
                    </span>
                    <span
                      aria-hidden="true"
                      className="flex size-7 shrink-0 items-center justify-center rounded-full border border-line text-navy-950 transition-[transform,background-color] duration-300 group-open:rotate-45 group-open:border-navy-950 group-open:bg-navy-950 group-open:text-gold"
                    >
                      <Plus className="size-4" />
                    </span>
                  </summary>
                  <div className="px-5 pb-6 sm:px-6">
                    <p className="leading-relaxed [overflow-wrap:anywhere] text-ink/80">
                      <FaqAnswer text={it.answer} />
                    </p>
                    <a
                      href={`/faq#${faqAnchor(it.number)}`}
                      className="mt-3 inline-block text-xs font-semibold text-muted hover:text-navy-950"
                    >
                      Question {it.number} of {faqItems.length}
                    </a>
                  </div>
                </details>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  );
}
