import { CalendarCheck } from "lucide-react";
import { shortlistPath } from "@/data/navigation";
import { shortlist, shortlistMeta, shortlistTracks, trackSummary } from "@/data/talent-shortlist";
import { ShortlistFinder } from "@/components/talent/ShortlistFinder";
import { Container } from "@/components/ui/Container";
import { GoldButton } from "@/components/ui/GoldButton";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

const fmt = (n: number) => n.toLocaleString("en-US");

/**
 * Homepage: the Talent Fund final shortlist, straight after the hero, with
 * the same finder as /talentnigeria20/shortlist (search, confirm talent
 * option and state, then the WhatsApp group). The full list by state stays
 * on the shortlist page. The hero's main button scrolls here (#shortlist).
 */
export function ShortlistSection() {
  const states = new Set(shortlist.map((e) => e.state)).size;
  return (
    <Section tone="light" id="shortlist" labelledBy="shortlist-title" className="scroll-mt-20">
      <Container size="wide">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="min-w-0 lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <SectionHeading
                id="shortlist-title"
                eyebrow="Talent Fund 2026 · Final shortlist"
                title={
                  <>
                    {fmt(shortlist.length)} young Nigerians made the{" "}
                    <span className="text-gold-ink">shortlist</span>
                  </>
                }
                lead={`Shortlisted from ${states - 1} states and the FCT for Skills, Jobs and Capital. Find your name, confirm your talent option and state, then join the WhatsApp group for further instructions.`}
              />
              <ul className="mt-8 grid grid-cols-3 gap-3" data-testid="home-shortlist-tracks">
                {shortlistTracks.map((t) => (
                  <li key={t} className="rounded-2xl border border-line bg-white p-4 sm:p-5">
                    <p className="font-display text-3xl leading-none text-navy-950 sm:text-4xl">
                      {fmt(shortlist.filter((e) => e.track === t).length)}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-navy-950">{t}</p>
                    <p className="mt-0.5 hidden text-xs text-muted sm:block">{trackSummary[t]}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-5 flex items-center gap-2 text-sm text-muted">
                <CalendarCheck aria-hidden="true" className="size-4 text-gold-ink" />
                <span>
                  Final list published{" "}
                  <time dateTime={shortlistMeta.publishedIso}>{shortlistMeta.published}</time>
                </span>
              </p>
              <GoldButton href={`${shortlistPath}/#full-list`} variant="outline-dark" className="mt-8">
                Browse the full list by state
              </GoldButton>
            </div>
          </div>
          <div className="min-w-0 lg:col-span-7">
            <ShortlistFinder />
          </div>
        </div>
      </Container>
    </Section>
  );
}
