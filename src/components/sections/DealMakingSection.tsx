import { ArrowDown, ArrowRight } from "lucide-react";
import { dealFlow } from "@/data/content";
import { formatStat, statById } from "@/data/event";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TargetBadge } from "@/components/ui/TargetBadge";

export function DealMakingSection() {
  const meetings = statById("meetings");
  return (
    <Section tone="light" id="deal-making" labelledBy="deals-title">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <SectionHeading
              id="deals-title"
              eyebrow="Structured Deal-Making"
              title="From Conversations to Connections"
              lead="Networking at Nigeria 2.0 is structured, not left to chance. Participants are qualified and matched so that meetings happen between people with a genuine reason to talk."
            />
          </div>
          <div data-reveal className="rounded-3xl border border-line bg-white p-7 lg:col-span-4">
            <TargetBadge kind={meetings.kind} tone="light" />
            <p className="mt-4 font-display text-6xl leading-none text-navy-950">{formatStat(meetings)}</p>
            <p className="mt-3 font-semibold text-navy-950">{meetings.label}</p>
          </div>
        </div>

        <ol aria-label="Deal-making process" className="mt-14 grid gap-3 lg:mt-16 lg:grid-cols-6 lg:gap-0">
          {dealFlow.map((s, i) => {
            const last = i === dealFlow.length - 1;
            return (
              <li key={s.step} data-reveal className="relative flex flex-col items-center lg:items-stretch">
                <div
                  className={
                    last
                      ? "w-full flex-1 rounded-2xl border border-gold bg-navy-950 p-5 text-white lg:mr-0"
                      : "w-full flex-1 rounded-2xl border border-line bg-white p-5 lg:mr-4"
                  }
                >
                  <p
                    className={
                      last ? "text-xs font-semibold text-gold" : "text-xs font-semibold text-gold-ink"
                    }
                  >
                    Step {i + 1}
                  </p>
                  <h3 className={last ? "mt-2 font-semibold text-white" : "mt-2 font-semibold text-navy-950"}>
                    {s.step}
                  </h3>
                  <p
                    className={
                      last
                        ? "mt-2 text-sm leading-relaxed text-mist"
                        : "mt-2 text-sm leading-relaxed text-muted"
                    }
                  >
                    {s.detail}
                  </p>
                </div>
                {!last && (
                  <>
                    <ArrowDown aria-hidden="true" className="my-1 size-5 text-gold-ink lg:hidden" />
                    <ArrowRight
                      aria-hidden="true"
                      className="absolute top-1/2 -right-0.5 hidden size-4 -translate-y-1/2 text-gold-ink lg:block"
                    />
                  </>
                )}
              </li>
            );
          })}
        </ol>
        <p className="mt-8 text-sm text-muted">
          Meetings create the conditions for partnerships and potential deals. No outcome is guaranteed, and
          no deals are reported until they are confirmed by the parties involved.
        </p>
      </Container>
    </Section>
  );
}
