import { CalendarClock } from "lucide-react";
import { pitchArena } from "@/data/content";
import { Spotlight } from "@/components/aceternity/Spotlight";
import { Container } from "@/components/ui/Container";
import { GoldButton } from "@/components/ui/GoldButton";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function StartupPitchSection({ cta = true }: { cta?: boolean }) {
  return (
    <Section tone="deep" id="startup-pitch" labelledBy="pitch-title">
      <Spotlight className="-top-60 left-1/4 opacity-60" fill="#E5C45A" />
      <Container className="relative">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeading
              id="pitch-title"
              tone="dark"
              eyebrow="Startup Pitch Arena"
              title={pitchArena.heading}
              lead={
                <>
                  <span className="block font-display text-2xl text-gold-bright">
                    {pitchArena.subheading}
                  </span>
                  <span className="mt-4 block">{pitchArena.lead}</span>
                </>
              }
            />
            {cta && (
              <div className="mt-10 flex flex-col gap-3 sm:flex-row" data-reveal>
                <GoldButton href="/contact?topic=pitch">Register startup interest</GoldButton>
                <GoldButton href="/register?type=Investor" variant="outline-light">
                  Attend as an investor
                </GoldButton>
              </div>
            )}
          </div>

          <div className="lg:col-span-7" data-reveal>
            {/* The stage: a spotlight card with the pitch format */}
            <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-navy-900 to-navy-950 p-8 transition-colors duration-500 hover:border-gold/40 sm:p-10">
              <div
                aria-hidden="true"
                className="absolute -top-24 left-1/2 h-48 w-[70%] -translate-x-1/2 rounded-full bg-gold/10 blur-3xl"
              />
              <p className="relative text-xs font-semibold tracking-[0.22em] text-gold uppercase">
                Pitch format
              </p>
              <ol className="relative mt-8 grid gap-8 sm:grid-cols-3 sm:gap-6">
                {pitchArena.format.map((step, i) => (
                  <li key={step.title} className="border-t border-gold/30 pt-5">
                    <span className="font-display text-3xl text-gold">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="mt-3 text-lg font-semibold text-white">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-mist">{step.detail}</p>
                  </li>
                ))}
              </ol>
              <div className="relative mt-10 flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <CalendarClock aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-gold" />
                <div>
                  <p className="text-sm font-semibold text-white">Important dates</p>
                  <p className="mt-1 text-sm text-mist">
                    {pitchArena.datesStatus}. Selection criteria, deadlines and the application form will be
                    published here.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
