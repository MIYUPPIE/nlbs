import { Info } from "lucide-react";
import { dealFlow, dealPhases } from "@/data/content";
import { formatStat, statById } from "@/data/event";
import { illustration } from "@/data/illustrations";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionImage } from "@/components/ui/SectionImage";
import { TargetBadge } from "@/components/ui/TargetBadge";
import { cn } from "@/lib/utils";

const LAST = dealFlow.length - 1;
const num = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Gold progress line. Fully drawn by default (no JS, print); when JS is on it
 * starts collapsed and draws in once its `group/pipe` parent is revealed.
 */
const progress = (axis: "x" | "y") =>
  cn(
    "absolute from-gold-ink via-gold to-gold transition-transform duration-[1400ms] ease-out",
    axis === "x"
      ? "inset-x-0 top-0 h-px origin-left bg-gradient-to-r [.js_&]:scale-x-0 group-data-[visible]/pipe:scale-x-100"
      : "inset-y-0 left-0 w-px origin-top bg-gradient-to-b [.js_&]:scale-y-0 group-data-[visible]/pipe:scale-y-100",
  );

function Node({ i, size = "lg" }: { i: number; size?: "md" | "lg" }) {
  const last = i === LAST;
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative z-10 flex shrink-0 items-center justify-center rounded-full border font-display leading-none tabular-nums transition-colors duration-300",
        size === "lg" ? "size-14 text-xl" : "size-11 text-lg",
        last
          ? "border-gold bg-gold text-navy-950 shadow-[0_0_0_6px_rgba(212,175,55,0.15)]"
          : "border-gold/50 bg-ivory text-gold-ink group-hover/step:border-gold group-hover/step:bg-navy-950 group-hover/step:text-gold",
      )}
    >
      {num(i)}
    </span>
  );
}

function MeetingsPanel({ className }: { className?: string }) {
  const meetings = statById("meetings");
  return (
    <div
      data-reveal
      className={cn("relative overflow-hidden rounded-3xl bg-navy-950 p-7 text-white sm:p-8", className)}
    >
      <div aria-hidden="true" className="bg-grid mask-fade-b absolute inset-0" />
      <div
        aria-hidden="true"
        className="absolute -top-16 -right-16 size-48 rounded-full bg-gold/15 blur-3xl"
      />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between md:flex-col md:items-start lg:flex-row lg:items-end">
        <div>
          <TargetBadge kind={meetings.kind} />
          <p className="mt-4 font-display text-6xl leading-none text-gold sm:text-7xl">
            {formatStat(meetings)}
          </p>
        </div>
        <div className="sm:max-w-[15rem] sm:text-right md:max-w-none md:text-left lg:max-w-[14rem] lg:text-right">
          <p className="font-semibold text-white">{meetings.label}</p>
          <p className="mt-1 text-sm leading-relaxed text-mist">
            Business-to-business and business-to-government sessions.
          </p>
        </div>
      </div>
    </div>
  );
}

/** Desktop: horizontal pipeline with phase brackets above the nodes. */
function HorizontalPipeline() {
  return (
    <div data-reveal className="group/pipe">
      <div aria-hidden="true" className="grid grid-cols-6 gap-6">
        {dealPhases.map((p) => (
          <div key={p.phase} style={{ gridColumn: `span ${p.count} / span ${p.count}` }}>
            <p className="text-[0.65rem] font-semibold tracking-[0.2em] text-gold-ink uppercase">{p.phase}</p>
            <div className="mt-3 h-2 rounded-t-md border-x border-t border-gold-ink/30" />
          </div>
        ))}
      </div>

      <ol aria-label="Deal-making process" className="relative mt-6 grid grid-cols-6 gap-6">
        {/* Rail through the node centres */}
        <span
          aria-hidden="true"
          className="absolute top-7 left-7 h-px bg-line"
          // Ends at the centre of the last node: one column width minus half a node from the right.
          style={{ right: "calc((100% - 7.5rem) / 6 - 1.75rem)" }}
        >
          <span className={progress("x")} />
        </span>
        {dealFlow.map((s, i) => (
          <li key={s.step} className="group/step relative flex flex-col">
            <Node i={i} />
            <div
              className={cn(
                "mt-6 flex-1 rounded-2xl border p-5 transition-[border-color,background-color,transform] duration-300 group-hover/step:-translate-y-0.5",
                i === LAST
                  ? "border-gold/60 bg-white shadow-[0_24px_50px_-30px_rgba(122,94,16,0.55)]"
                  : "border-line bg-white/70 group-hover/step:border-gold/50 group-hover/step:bg-white",
              )}
            >
              <Icon name={s.icon} className="size-5 text-gold-ink" />
              <h3 className="mt-3 font-semibold text-navy-950">
                <span className="sr-only">
                  Step {i + 1}, {s.phase.toLowerCase()}:{" "}
                </span>
                {s.step}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Mobile and tablet: vertical timeline, phase label at the start of each phase. */
function VerticalPipeline({ className }: { className?: string }) {
  return (
    <ol aria-label="Deal-making process" data-reveal className={cn("group/pipe relative", className)}>
      {/* Rail through the node centres */}
      <span aria-hidden="true" className="absolute top-6 bottom-6 left-[1.375rem] w-px bg-line">
        <span className={progress("y")} />
      </span>
      {dealFlow.map((s, i) => {
        const startsPhase = i === 0 || dealFlow[i - 1].phase !== s.phase;
        const last = i === LAST;
        return (
          <li key={s.step} className="group/step relative">
            {startsPhase && (
              <p
                aria-hidden="true"
                className={cn(
                  "mb-4 ml-16 text-[0.65rem] font-semibold tracking-[0.2em] text-gold-ink uppercase",
                  i > 0 && "mt-8",
                )}
              >
                {s.phase}
              </p>
            )}
            <div className={cn("grid grid-cols-[auto_1fr] items-start gap-x-5", !last && "pb-4")}>
              <Node i={i} size="md" />
              <div
                className={cn(
                  "rounded-2xl border px-5 py-4",
                  last
                    ? "border-gold/60 bg-white shadow-[0_20px_40px_-28px_rgba(122,94,16,0.55)]"
                    : "border-line bg-white/70",
                )}
              >
                <h3 className="flex items-center gap-2.5 font-semibold text-navy-950">
                  <Icon name={s.icon} className="size-4 text-gold-ink" />
                  <span className="sr-only">
                    Step {i + 1}, {s.phase.toLowerCase()}:{" "}
                  </span>
                  {s.step}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.detail}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function DealMakingSection() {
  return (
    <Section tone="light" id="deal-making" labelledBy="deals-title">
      <div aria-hidden="true" className="bg-grid-light mask-fade-center absolute inset-0 opacity-50" />
      <Container className="relative">
        <div className="grid gap-12 md:grid-cols-12 md:gap-10 lg:gap-y-16">
          {/* Intro: full row on desktop, sticky left column on tablet */}
          <div className="md:col-span-5 lg:col-span-12">
            <div className="md:sticky md:top-28 lg:static lg:grid lg:grid-cols-12 lg:items-end lg:gap-16">
              <SectionHeading
                id="deals-title"
                eyebrow="Structured Deal-Making"
                title="From Conversations to Connections"
                lead="Networking at Nigeria 2.0 is structured, not left to chance. Participants are qualified and matched so that meetings happen between people with a genuine reason to talk."
                className="lg:col-span-7"
              />
              <MeetingsPanel className="mt-10 lg:col-span-5 lg:mt-0" />
            </div>
          </div>

          <SectionImage
            image={illustration("deal-making")}
            className="aspect-[16/9] md:col-span-12 lg:aspect-[21/9]"
          />

          <VerticalPipeline className="md:col-span-7 lg:hidden" />
          <div className="hidden lg:col-span-12 lg:block">
            <HorizontalPipeline />
          </div>
        </div>

        <p className="mt-12 flex max-w-3xl items-start gap-3 text-sm leading-relaxed text-muted lg:mt-14">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-gold-ink" />
          Meetings create the conditions for partnerships and potential deals. No outcome is guaranteed, and
          no deals are reported until they are confirmed by the parties involved.
        </p>
      </Container>
    </Section>
  );
}
