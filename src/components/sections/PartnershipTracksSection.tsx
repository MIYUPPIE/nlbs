import { totalSlots, tracks, type Track } from "@/data/partnership";
import { MovingBorderFrame } from "@/components/aceternity/MovingBorder";
import { Container } from "@/components/ui/Container";
import { GoldButton } from "@/components/ui/GoldButton";
import { Icon } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { enquiryHref } from "@/lib/enquiry";

function TrackCard({ track }: { track: Track }) {
  return (
    <article aria-labelledby={`track-${track.id}`} className="flex h-full flex-col p-8 sm:p-10">
      <p className="text-xs font-semibold tracking-[0.22em] text-gold uppercase">{track.role}</p>
      <h3
        id={`track-${track.id}`}
        className="mt-4 font-display text-4xl leading-tight text-white sm:text-5xl"
      >
        {track.name}
      </h3>
      <p className="mt-4 leading-relaxed text-mist">{track.who}</p>
      <ul aria-label="Why they join" className="mt-6 flex flex-wrap gap-2">
        {track.motivation.map((m) => (
          <li
            key={m}
            className="rounded-full border border-gold/40 px-3 py-1 text-xs font-semibold tracking-[0.14em] text-gold uppercase"
          >
            {m}
          </li>
        ))}
      </ul>

      <div className="mt-8 border-t border-white/10 pt-8">
        <p className="flex items-baseline justify-between gap-4 text-sm text-mist">
          <span>{track.title} tiers</span>
          <span>
            <span className="font-display text-2xl text-white">{totalSlots(track)}</span> slots in total
          </span>
        </p>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {track.tiers.map((t) => (
            <li key={t.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="font-display text-4xl leading-none text-gold">{t.slots}</p>
              <p className="mt-2 text-sm font-semibold text-white">{t.name}</p>
              <p className="text-xs text-mist">{t.slots === 1 ? "slot" : "slots"}</p>
            </li>
          ))}
        </ul>
      </div>

      <ul className="mt-8 flex-1 space-y-5">
        {track.benefits.map((b) => (
          <li key={b.title} className="flex gap-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold">
              <Icon name={b.icon} className="size-5" />
            </span>
            <div>
              <p className="font-semibold text-white">{b.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-mist">{b.detail}</p>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-relaxed text-mist">
        <span className="font-semibold text-white">Engagement. </span>
        {track.engagement}
      </p>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-mist">Fee on request</p>
        <GoldButton
          href={enquiryHref(track.id)}
          variant={track.id === "stakeholder" ? "gold" : "outline-light"}
        >
          {track.cta}
        </GoldButton>
      </div>
    </article>
  );
}

export function PartnershipTracksSection() {
  return (
    <Section tone="deep" id="tracks" labelledBy="tracks-title">
      <div aria-hidden="true" className="bg-grid mask-fade-center absolute inset-0" />
      <Container className="relative">
        <SectionHeading
          id="tracks-title"
          tone="dark"
          eyebrow="Two ways to partner"
          title="Build the table, or put your brand on it."
          lead="Founding Stakeholders shape the policy and deal agenda. Official Sponsors reach the room. Different proposition, different benefits, limited slots on both."
        />
        <ul className="mt-14 grid gap-6 lg:grid-cols-2">
          {tracks.map((t) => (
            <li key={t.id} data-reveal>
              {t.id === "stakeholder" ? (
                <MovingBorderFrame innerClassName="bg-navy-900" radius="1.5rem" className="h-full">
                  <TrackCard track={t} />
                </MovingBorderFrame>
              ) : (
                <div className="h-full rounded-3xl border border-white/10 bg-white/[0.03]">
                  <TrackCard track={t} />
                </div>
              )}
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
