"use client";

import { memo, useSyncExternalStore } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Aceternity UI Background Beams (https://ui.aceternity.com/components/background-beams),
 * adapted for the summit:
 *  - navy/gold palette instead of cyan/violet
 *  - 18 beams instead of 50 (lighter paint, calmer)
 *  - deterministic timings (the original used Math.random during render,
 *    which produces server/client hydration mismatches)
 *  - static beams when the user prefers reduced motion
 *  - not mounted below `minWidth` so phones skip the animation cost
 */

const BEAM_COUNT = 18;

const beamPath = (i: number) => {
  const o = i * 21;
  return `M${-380 + o} ${-189 - o}C${-380 + o} ${-189 - o} ${-312 + o} ${216 - o} ${152 + o} ${343 - o}C${616 + o} ${470 - o} ${684 + o} ${875 - o} ${684 + o} ${875 - o}`;
};

/** Stable pseudo-random in [0, 1) derived from the index. */
const seeded = (i: number, salt: number) => {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

const paths = Array.from({ length: BEAM_COUNT }, (_, i) => beamPath(i));

const subscribeResize = (cb: () => void) => {
  window.addEventListener("resize", cb);
  return () => window.removeEventListener("resize", cb);
};

export const BackgroundBeams = memo(function BackgroundBeams({
  className,
  minWidth = 768,
}: {
  className?: string;
  minWidth?: number;
}) {
  const reduce = useReducedMotion();
  const wide = useSyncExternalStore(
    subscribeResize,
    () => window.innerWidth >= minWidth,
    () => false,
  );
  if (!wide) return null;

  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0", className)}>
      <svg
        className="absolute inset-0 h-full w-full"
        width="100%"
        height="100%"
        viewBox="0 0 696 316"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={paths.join("")} stroke="url(#beams-base)" strokeOpacity="0.07" strokeWidth="0.5" />
        {paths.map((d, i) => (
          <path
            key={i}
            d={d}
            stroke={reduce ? "url(#beams-base)" : `url(#beam-${i})`}
            strokeOpacity={reduce ? 0.08 : 0.5}
            strokeWidth="0.5"
          />
        ))}
        <defs>
          {!reduce &&
            paths.map((_, i) => (
              <motion.linearGradient
                id={`beam-${i}`}
                key={i}
                initial={{ x1: "0%", x2: "0%", y1: "0%", y2: "0%" }}
                animate={{
                  x1: ["0%", "100%"],
                  x2: ["0%", "95%"],
                  y1: ["0%", "100%"],
                  y2: ["0%", `${93 + seeded(i, 1) * 8}%`],
                }}
                transition={{
                  duration: seeded(i, 2) * 10 + 12,
                  ease: "easeInOut",
                  repeat: Infinity,
                  delay: seeded(i, 3) * 10,
                }}
              >
                <stop stopColor="#D4AF37" stopOpacity="0" />
                <stop stopColor="#E5C45A" />
                <stop offset="32.5%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#123B67" stopOpacity="0" />
              </motion.linearGradient>
            ))}
          <radialGradient
            id="beams-base"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(352 34) rotate(90) scale(555 1560.62)"
          >
            <stop offset="0.0666667" stopColor="#A8B3C7" />
            <stop offset="0.243243" stopColor="#A8B3C7" />
            <stop offset="0.43594" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
});
