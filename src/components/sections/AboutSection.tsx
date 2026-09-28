import { introduction, pillars } from "@/data/content";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function AboutSection() {
  return (
    <Section id="about" labelledBy="about-title">
      <div aria-hidden="true" className="bg-grid-light mask-fade-center absolute inset-0 opacity-60" />
      <Container className="relative">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeading id="about-title" eyebrow="About the Summit" title={introduction.heading} />
          </div>
          <div className="space-y-6 text-lg leading-relaxed text-ink/80 lg:col-span-7" data-reveal>
            {introduction.paragraphs.map((p, i) => (
              <p
                key={i}
                className={i === 1 ? "font-display text-2xl text-navy-950 sm:text-3xl" : "text-pretty"}
              >
                {p}
              </p>
            ))}
            <p className="font-medium text-navy-950">{introduction.leversLead}</p>
          </div>
        </div>

        <ol className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-3 lg:mt-20">
          {pillars.map((p, i) => (
            <li key={p.id} data-reveal className="bg-white p-8 sm:p-10">
              <p className="flex items-baseline gap-3">
                <span className="font-display text-2xl text-gold-ink">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-sm font-semibold tracking-[0.24em] text-navy-950 uppercase">
                  {p.label}
                </span>
              </p>
              <p className="mt-4 leading-relaxed text-muted">{p.intro}</p>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
