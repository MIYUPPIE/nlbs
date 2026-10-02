import Image from "next/image";
import { CalendarDays, MapPin } from "lucide-react";
import { event } from "@/data/event";
import { photo } from "@/data/photos";
import { MovingBorderFrame } from "@/components/aceternity/MovingBorder";
import { Spotlight } from "@/components/aceternity/Spotlight";
import { Container } from "@/components/ui/Container";
import { GoldButton } from "@/components/ui/GoldButton";
import { PhotoCredit } from "@/components/ui/PhotoCredit";

const backdrop = photo("lagos-business-district");

export function CTASection({
  title = "Take your seat at the table.",
  lead = "Join leaders, investors, businesses, policymakers, innovators and talent at the Nigeria 2.0 Leadership Business Summit.",
}: {
  title?: string;
  lead?: string;
}) {
  return (
    <section aria-labelledby="cta-title" className="relative overflow-hidden bg-navy-950 py-20 sm:py-28">
      <Image
        src={backdrop.src}
        alt=""
        aria-hidden="true"
        fill
        sizes="100vw"
        className="object-cover opacity-30"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-navy-950/80 via-navy-950/60 to-navy-950/90"
      />
      <Spotlight className="-top-40 left-10 md:left-1/3" fill="#E5C45A" />
      <Container size="narrow" className="relative">
        <MovingBorderFrame innerClassName="bg-navy-900/90 backdrop-blur" radius="2rem">
          <div className="px-6 py-14 text-center sm:px-14 sm:py-20">
            <p className="text-xs font-semibold tracking-[0.24em] text-gold uppercase">{event.tagline}</p>
            <h2
              id="cta-title"
              className="mx-auto mt-5 max-w-2xl font-display text-4xl leading-tight text-balance text-white sm:text-6xl"
            >
              {title}
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-mist">{lead}</p>
            <ul className="mt-8 flex flex-col items-center justify-center gap-3 text-sm text-white sm:flex-row sm:gap-8">
              <li className="flex items-center gap-2">
                <CalendarDays aria-hidden="true" className="size-4 text-gold" />
                <time dateTime={event.date.iso}>{event.date.display}</time>
              </li>
              <li className="flex items-center gap-2">
                <MapPin aria-hidden="true" className="size-4 text-gold" />
                {event.venue.display}
              </li>
            </ul>
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <GoldButton href="/register" size="lg">
                Register for the Summit
              </GoldButton>
              <GoldButton href="/partners" variant="outline-light" size="lg" arrow={false}>
                Partner with us
              </GoldButton>
            </div>
          </div>
        </MovingBorderFrame>
      </Container>
      <PhotoCredit photo={backdrop} className="absolute right-4 bottom-3 text-mist/80 sm:right-6" />
    </section>
  );
}
