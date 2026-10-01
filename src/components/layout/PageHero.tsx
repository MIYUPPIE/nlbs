import { CalendarDays, MapPin } from "lucide-react";
import { event } from "@/data/event";
import { Spotlight } from "@/components/aceternity/Spotlight";
import { Container } from "@/components/ui/Container";

/** Inner-page hero. Same authority surface as the homepage, compact height. */
export function PageHero({
  eyebrow,
  title,
  lead,
  children,
  showEvent = true,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  children?: React.ReactNode;
  /** The summit date and venue strip. Off for legal pages. */
  showEvent?: boolean;
}) {
  return (
    <section
      aria-labelledby="page-title"
      className="relative isolate overflow-hidden bg-navy-950 pt-36 pb-20 text-white sm:pt-40 sm:pb-24 lg:pt-44 lg:pb-28"
    >
      <div aria-hidden="true" className="bg-grid mask-fade-b absolute inset-0 -z-10" />
      <Spotlight className="-top-40 left-0 md:-top-24 md:left-72" fill="#E5C45A" />
      <Container className="relative">
        <p className="inline-flex items-center gap-3 text-xs font-semibold tracking-[0.24em] text-gold uppercase">
          <span aria-hidden="true" className="h-px w-8 bg-gold" />
          {eyebrow}
        </p>
        <h1
          id="page-title"
          className="mt-6 max-w-4xl font-display text-5xl leading-[1.02] tracking-tight text-balance sm:text-6xl lg:text-7xl"
        >
          {title}
        </h1>
        {lead && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-pretty text-mist">{lead}</p>}
        {children}
        {showEvent && (
          <ul className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-white/85 sm:flex-row sm:gap-8">
            <li className="flex items-center gap-2">
              <CalendarDays aria-hidden="true" className="size-4 text-gold" />
              <time dateTime={event.date.iso}>{event.date.display}</time>
            </li>
            <li className="flex items-center gap-2">
              <MapPin aria-hidden="true" className="size-4 text-gold" />
              {event.venue.display}
            </li>
          </ul>
        )}
      </Container>
    </section>
  );
}
