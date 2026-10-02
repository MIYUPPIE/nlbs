import Image from "next/image";
import { CalendarDays, MapPin } from "lucide-react";
import { event } from "@/data/event";
import { photo } from "@/data/photos";
import { Spotlight } from "@/components/aceternity/Spotlight";
import { BackgroundBeams } from "@/components/aceternity/BackgroundBeams";
import { Container } from "@/components/ui/Container";
import { GoldButton } from "@/components/ui/GoldButton";
import { Countdown } from "@/components/hero/Countdown";
import { NetworkGraphic } from "@/components/hero/NetworkGraphic";
import { PhotoCredit } from "@/components/ui/PhotoCredit";

const backdrop = photo("lagos-victoria-island-aerial");

export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-navy-950 pt-28 pb-16 text-white lg:pt-32 lg:pb-24"
    >
      {/* Real photo of Victoria Island, kept behind a navy wash so text holds AA contrast. */}
      <Image
        src={backdrop.src}
        alt=""
        aria-hidden="true"
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover object-center opacity-70"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-navy-950/80 lg:bg-gradient-to-r lg:from-navy-950 lg:from-35% lg:via-navy-950/70 lg:to-navy-950/10"
      />
      <div aria-hidden="true" className="bg-grid mask-fade-b absolute inset-0 -z-10" />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-navy-900/70 to-transparent"
      />
      <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" fill="#E5C45A" />
      <BackgroundBeams className="-z-10 opacity-70" />

      <Container size="wide" className="relative">
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <p className="inline-flex items-center gap-2.5 rounded-full border border-gold/30 bg-gold/[0.07] px-3.5 py-1.5 text-[0.7rem] font-semibold tracking-[0.22em] text-gold uppercase">
              <span aria-hidden="true" className="size-1.5 animate-pulse-dot rounded-full bg-gold" />
              {event.edition}
            </p>

            <p className="mt-8 text-xs font-semibold tracking-[0.24em] text-mist uppercase sm:text-sm">
              {event.name}
            </p>

            <h1
              id="hero-title"
              className="mt-4 font-display text-[4.5rem] leading-[0.9] tracking-tight sm:text-8xl lg:text-[8.5rem]"
            >
              Nigeria <span className="text-gold">2.0</span>
            </h1>

            <p className="mt-6 max-w-2xl text-2xl leading-snug font-medium tracking-tight text-balance text-white sm:text-3xl">
              {event.themeShort}
            </p>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-pretty text-mist sm:text-lg">
              {event.heroSupport}
            </p>

            <ul className="mt-9 flex flex-col gap-4 text-sm sm:flex-row sm:gap-8">
              <li className="flex items-center gap-3">
                <CalendarDays aria-hidden="true" className="size-5 shrink-0 text-gold" />
                <time dateTime={event.date.iso} className="font-medium text-white">
                  {event.date.display} · {event.date.startDisplay}
                </time>
              </li>
              <li className="flex items-center gap-3">
                <MapPin aria-hidden="true" className="size-5 shrink-0 text-gold" />
                <span className="font-medium text-white">{event.venue.display}</span>
              </li>
            </ul>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <GoldButton href="/register" size="lg">
                Register for the Summit
              </GoldButton>
              <GoldButton href="/programme" variant="outline-light" size="lg" arrow={false}>
                Explore the Programme
              </GoldButton>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <NetworkGraphic className="mx-auto block w-full max-w-[19rem] sm:max-w-[22rem] lg:max-w-[26rem]" />
              <Countdown className="-mt-2 sm:-mt-4" />
            </div>
          </div>
        </div>
      </Container>
      <PhotoCredit photo={backdrop} className="absolute right-4 bottom-3 text-mist/80 sm:right-6" />
    </section>
  );
}
