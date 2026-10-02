import Image from "next/image";
import { stats } from "@/data/event";
import { photo } from "@/data/photos";
import { Container } from "@/components/ui/Container";
import { StatCard } from "@/components/ui/StatCard";

/** Event snapshot band. Every figure is labelled Expected or Target. */
export function StatisticsSection() {
  return (
    <section
      aria-labelledby="snapshot-title"
      className="relative overflow-hidden border-y border-white/10 bg-navy-900 py-16 text-white sm:py-20"
    >
      <Image
        src={photo("lagos-skyline-marina").src}
        alt=""
        aria-hidden="true"
        fill
        sizes="100vw"
        className="object-cover object-bottom opacity-25"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-navy-900/90 via-navy-900/75 to-navy-900/95"
      />
      <Container size="wide" className="relative">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2 id="snapshot-title" className="text-xs font-semibold tracking-[0.24em] text-gold uppercase">
            The 2026 Summit at a glance
          </h2>
          <p className="max-w-md text-sm text-mist">
            Figures are expectations and targets for the 2026 edition, not results.
          </p>
        </div>
        <div className="mt-10 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.id} stat={stat} className="border-t border-white/10 pt-8" />
          ))}
        </div>
      </Container>
    </section>
  );
}
