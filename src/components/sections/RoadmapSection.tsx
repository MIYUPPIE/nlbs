import { CircleCheck } from "lucide-react";
import { photo } from "@/data/photos";
import { bigIdea, roadmap } from "@/data/vision";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionImage } from "@/components/ui/SectionImage";
import { cn } from "@/lib/utils";

/** The 10-year roadmap (2026-2036) in three phases. Phase 1 is current. */
export function RoadmapSection({ compact = false }: { compact?: boolean }) {
  return (
    <Section tone="light" id="roadmap" labelledBy="roadmap-title">
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            id="roadmap-title"
            eyebrow="The 10-Year Roadmap"
            title="2026 to 2036: from summit to institution."
            lead="A decade-long compact in three phases. Each builds the foundation for the next."
          />
          <p className="font-display text-2xl text-gold-ink lg:max-w-xs lg:text-right" data-reveal>
            {bigIdea.closing}
          </p>
        </div>

        <SectionImage
          image={photo("lagos-road-victoria-island")}
          className="mt-12 aspect-[16/9] lg:mt-16 lg:aspect-[21/9]"
          position="center 60%"
        />
        <ol className="group/pipe relative mt-12 grid gap-6 lg:grid-cols-3" data-reveal>
          {/* Rail joining the phase markers (desktop) */}
          <span
            aria-hidden="true"
            className="absolute top-6 right-[16.66%] left-[16.66%] hidden h-px bg-line lg:block"
          >
            <span className="absolute inset-0 origin-left bg-gradient-to-r from-gold via-gold to-gold-ink/40 transition-transform duration-[1400ms] ease-out group-data-[visible]/pipe:scale-x-100 [.js_&]:scale-x-0" />
          </span>
          {roadmap.map((phase) => {
            const current = phase.number === 1;
            return (
              <li key={phase.number} className="relative flex flex-col">
                <div className="flex items-center gap-4 lg:flex-col lg:gap-3">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full border font-display text-xl",
                      current
                        ? "border-gold bg-gold text-navy-950 shadow-[0_0_0_6px_rgba(212,175,55,0.15)]"
                        : "border-gold/50 bg-ivory text-gold-ink",
                    )}
                  >
                    {phase.number}
                  </span>
                  <p className="text-sm font-semibold tracking-[0.16em] text-navy-950 uppercase lg:text-center">
                    {phase.years}
                    {current && (
                      <span className="ml-2 rounded-full bg-navy-950 px-2 py-0.5 text-[0.6rem] tracking-[0.14em] text-gold">
                        Now
                      </span>
                    )}
                  </p>
                </div>
                <article
                  className={cn(
                    "mt-5 flex-1 rounded-3xl border p-7 sm:p-8",
                    current ? "border-gold/60 bg-navy-950 text-white" : "border-line bg-white",
                  )}
                >
                  <p
                    className={cn(
                      "text-xs font-semibold tracking-[0.2em] uppercase",
                      current ? "text-gold" : "text-gold-ink",
                    )}
                  >
                    Phase {phase.number} · {phase.theme}
                  </p>
                  <h3 className={cn("mt-2 font-display text-4xl", current ? "text-white" : "text-navy-950")}>
                    {phase.name}
                  </h3>
                  <ul className="mt-6 space-y-3">
                    {(compact ? phase.milestones.slice(0, 2) : phase.milestones).map((m) => (
                      <li
                        key={m}
                        className={cn(
                          "flex gap-3 text-sm leading-relaxed",
                          current ? "text-mist" : "text-muted",
                        )}
                      >
                        <CircleCheck
                          aria-hidden="true"
                          className={cn("mt-0.5 size-4 shrink-0", current ? "text-gold" : "text-gold-ink")}
                        />
                        {m}
                      </li>
                    ))}
                  </ul>
                </article>
              </li>
            );
          })}
        </ol>
        <p className="mt-8 text-sm text-muted">
          Roadmap figures are long-term targets set by the convener, not results.
        </p>
      </Container>
    </Section>
  );
}
