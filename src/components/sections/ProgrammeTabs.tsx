"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ChevronDown, Clock, Users } from "lucide-react";
import type { ProgrammeItem } from "@/data/programme";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

/**
 * Desktop: WAI-ARIA vertical tabs (arrow keys, Home/End) with a gliding
 * indicator. Mobile: native <details> accordion, so it works without JS.
 */
export function ProgrammeTabs({ items }: { items: ProgrammeItem[] }) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const reduce = useReducedMotion();
  const current = items[active];

  const focusTab = (i: number) => {
    const next = (i + items.length) % items.length;
    setActive(next);
    tabs.current[next]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    const keys: Record<string, () => void> = {
      ArrowDown: () => focusTab(i + 1),
      ArrowRight: () => focusTab(i + 1),
      ArrowUp: () => focusTab(i - 1),
      ArrowLeft: () => focusTab(i - 1),
      Home: () => focusTab(0),
      End: () => focusTab(items.length - 1),
    };
    const fn = keys[e.key];
    if (fn) {
      e.preventDefault();
      fn();
    }
  };

  return (
    <>
      {/* Mobile accordion */}
      <div className="space-y-3 lg:hidden">
        {items.map((item, i) => (
          <details
            key={item.id}
            open={i === 0}
            className="group rounded-2xl border border-line bg-white open:border-gold/60"
          >
            <summary className="flex cursor-pointer list-none items-center gap-4 p-5 [&::-webkit-details-marker]:hidden">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-navy-950 text-gold">
                <Icon name={item.icon} className="size-5" />
              </span>
              <span className="flex-1 font-semibold text-navy-950">{item.title}</span>
              <ChevronDown
                aria-hidden="true"
                className="size-5 text-muted transition-transform group-open:rotate-180"
              />
            </summary>
            <div className="px-5 pb-6">
              <p className="font-medium text-navy-900">{item.summary}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.detail}</p>
              <p className="mt-4 flex items-center gap-2 text-xs text-muted">
                <Clock aria-hidden="true" className="size-3.5 text-gold-ink" />
                {item.time ?? "Time to be announced"}
                <span aria-hidden="true">·</span>
                {item.audience}
              </p>
            </div>
          </details>
        ))}
      </div>

      {/* Desktop tabs */}
      <div className="hidden gap-10 lg:grid lg:grid-cols-12">
        <div
          role="tablist"
          aria-orientation="vertical"
          aria-label="Programme formats"
          className="flex flex-col gap-1 lg:col-span-5"
        >
          {items.map((item, i) => {
            const selected = i === active;
            return (
              <button
                key={item.id}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                role="tab"
                id={`programme-tab-${item.id}`}
                aria-selected={selected}
                aria-controls={`programme-panel-${item.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(i)}
                onKeyDown={(e) => onKeyDown(e, i)}
                className={cn(
                  "relative flex items-center gap-5 rounded-2xl px-5 py-4 text-left transition-colors",
                  selected ? "text-navy-950" : "text-muted hover:text-navy-950",
                )}
              >
                {selected && (
                  <motion.span
                    aria-hidden="true"
                    layoutId={reduce ? undefined : "programme-active"}
                    className="absolute inset-0 rounded-2xl border border-gold/50 bg-white shadow-[0_18px_40px_-28px_rgba(7,26,51,0.5)]"
                    transition={{ type: "spring", stiffness: 380, damping: 34 }}
                  />
                )}
                <span className="relative font-display text-xl text-gold-ink tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="relative text-lg font-semibold">{item.title}</span>
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id={`programme-panel-${current.id}`}
          aria-labelledby={`programme-tab-${current.id}`}
          tabIndex={0}
          className="relative overflow-hidden rounded-3xl bg-navy-950 p-10 text-white lg:col-span-7 xl:p-12"
        >
          <div aria-hidden="true" className="bg-grid mask-fade-b absolute inset-0" />
          <motion.div
            key={current.id}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="relative flex h-full flex-col"
          >
            <span className="flex size-14 items-center justify-center rounded-2xl border border-gold/40 text-gold">
              <Icon name={current.icon} className="size-6" />
            </span>
            <p className="mt-8 text-xs font-semibold tracking-[0.22em] text-gold uppercase">
              Format {String(active + 1).padStart(2, "0")}
              {current.access === "selected" && " · By invitation"}
            </p>
            <h3 className="mt-3 font-display text-4xl leading-tight">{current.title}</h3>
            <p className="mt-5 text-lg text-white/90">{current.summary}</p>
            <p className="mt-4 leading-relaxed text-mist">{current.detail}</p>
            <dl className="mt-auto grid gap-4 border-t border-white/10 pt-6 text-sm sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <dt>
                  <Clock aria-hidden="true" className="size-4 text-gold" />
                  <span className="sr-only">Time</span>
                </dt>
                <dd className="text-mist">{current.time ?? "Time to be announced"}</dd>
              </div>
              <div className="flex items-center gap-3">
                <dt>
                  <Users aria-hidden="true" className="size-4 text-gold" />
                  <span className="sr-only">Audience</span>
                </dt>
                <dd className="text-mist">{current.audience}</dd>
              </div>
            </dl>
          </motion.div>
        </div>
      </div>
    </>
  );
}
