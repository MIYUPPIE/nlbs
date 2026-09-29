"use client";

import { useEffect, useState } from "react";
import { event } from "@/data/event";
import {
  getCountdown,
  pad2,
  startOfDayInZone,
  zonedTimeToUtc,
  type Countdown as CountdownValue,
} from "@/lib/countdown";
import { cn } from "@/lib/utils";

const TARGET_MS = zonedTimeToUtc(event.date.iso, event.date.startTime, event.date.timeZone);
/** "Happening today" until local midnight after the event. */
const END_MS = startOfDayInZone(event.date.iso, event.date.timeZone) + 86_400_000;

const units: { key: keyof Omit<CountdownValue, "status">; label: string }[] = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Minutes" },
  { key: "seconds", label: "Seconds" },
];

/**
 * Live countdown to the 9:00 AM WAT start on the event day (Africa/Lagos).
 * Renders placeholders on the server and first client paint to avoid a
 * hydration mismatch, then ticks every second.
 */
export function Countdown({ className }: { className?: string }) {
  const [value, setValue] = useState<CountdownValue | null>(null);

  useEffect(() => {
    const update = () => setValue(getCountdown(Date.now(), TARGET_MS, END_MS));
    const first = requestAnimationFrame(update);
    const id = window.setInterval(update, 1000);
    return () => {
      cancelAnimationFrame(first);
      window.clearInterval(id);
    };
  }, []);

  if (value && value.status !== "upcoming") {
    return (
      <div className={cn("rounded-2xl border border-white/10 bg-white/[0.04] p-6", className)}>
        <p className="text-sm font-semibold tracking-[0.2em] text-gold uppercase">
          {value.status === "live" ? "Happening today" : "The 2026 summit has taken place"}
        </p>
        <p className="mt-2 text-white/80">
          {event.date.display} · {event.venue.display}
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        role="timer"
        aria-live="off"
        aria-label={
          value
            ? `${value.days} days, ${value.hours} hours, ${value.minutes} minutes until the summit`
            : "Countdown to the summit"
        }
        className="grid grid-cols-4 overflow-hidden rounded-2xl border border-white/10 bg-navy-950/60 backdrop-blur-md"
      >
        {units.map((u, i) => (
          <div
            key={u.key}
            className={cn(
              "flex flex-col items-center justify-center px-2 py-4 sm:px-4 sm:py-5",
              i > 0 && "border-l border-white/10",
            )}
          >
            <span
              aria-hidden="true"
              className="font-display text-3xl leading-none text-white tabular-nums sm:text-4xl lg:text-[2.75rem]"
            >
              {value ? pad2(value[u.key]) : "--"}
            </span>
            <span
              aria-hidden="true"
              className="mt-2 text-[0.6rem] font-semibold tracking-[0.2em] text-gold uppercase sm:text-[0.65rem]"
            >
              {u.label}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-mist">
        Counting down to {event.date.display}, {event.date.startDisplay} (Lagos).
      </p>
    </div>
  );
}
