"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

/**
 * Aceternity UI Card Hover Effect (https://ui.aceternity.com/components/card-hover-effect),
 * adapted: a shared highlight glides between cards on pointer hover.
 * Cards are plain list items (not links) because they describe groups, so
 * the highlight is decorative and adds no keyboard stops.
 */
export type HoverItem = { title: string; description: string; icon: IconName };

export function HoverEffect({ items, className }: { items: HoverItem[]; className?: string }) {
  const [active, setActive] = useState<number | null>(null);

  return (
    <ul
      role="list"
      className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3", className)}
      onMouseLeave={() => setActive(null)}
    >
      {items.map((item, idx) => (
        <li key={item.title} className="relative block h-full p-1.5" onMouseEnter={() => setActive(idx)}>
          <AnimatePresence>
            {active === idx && (
              <motion.span
                aria-hidden="true"
                layoutId="audience-hover"
                className="absolute inset-0 block rounded-[1.25rem] bg-gold/15"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.15 } }}
                exit={{ opacity: 0, transition: { duration: 0.15, delay: 0.15 } }}
              />
            )}
          </AnimatePresence>
          <div className="relative z-10 flex h-full flex-col rounded-2xl border border-white/10 bg-navy-950/80 p-7 backdrop-blur-sm">
            <span className="flex size-11 items-center justify-center rounded-full border border-gold/30 text-gold">
              <Icon name={item.icon} className="size-5" />
            </span>
            <h3 className="mt-6 text-sm font-semibold tracking-[0.2em] text-gold uppercase">{item.title}</h3>
            <p className="mt-3 text-base leading-relaxed text-white/85">{item.description}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
