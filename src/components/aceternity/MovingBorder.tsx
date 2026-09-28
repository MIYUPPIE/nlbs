"use client";

import { useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Aceternity UI Moving Border (https://ui.aceternity.com/components/moving-border),
 * adapted as a frame for any content (cards, CTA panels) rather than a button.
 * A gold glow travels the perimeter. Under reduced motion the frame renders
 * a static gold hairline instead.
 */
export function MovingBorderFrame({
  children,
  className,
  innerClassName,
  radius = "1.5rem",
  duration = 9000,
}: {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  radius?: string;
  duration?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <div
      className={cn("relative overflow-hidden p-px", reduce && "bg-gold/40", className)}
      style={{ borderRadius: radius }}
    >
      {!reduce && (
        <div aria-hidden="true" className="absolute inset-0" style={{ borderRadius: radius }}>
          <MovingBorder duration={duration} rx="24" ry="24">
            <div className="h-40 w-40 bg-[radial-gradient(#E5C45A_35%,transparent_65%)] opacity-90" />
          </MovingBorder>
        </div>
      )}
      <div
        className={cn("relative h-full w-full", innerClassName)}
        style={{ borderRadius: `calc(${radius} - 1px)` }}
      >
        {children}
      </div>
    </div>
  );
}

function MovingBorder({
  children,
  duration,
  rx,
  ry,
}: {
  children: React.ReactNode;
  duration: number;
  rx?: string;
  ry?: string;
}) {
  const pathRef = useRef<SVGRectElement>(null);
  const progress = useMotionValue(0);

  useAnimationFrame((time) => {
    const length = pathRef.current?.getTotalLength();
    if (length) progress.set((time * (length / duration)) % length);
  });

  const x = useTransform(progress, (v) => pathRef.current?.getPointAtLength(v).x ?? 0);
  const y = useTransform(progress, (v) => pathRef.current?.getPointAtLength(v).y ?? 0);
  const transform = useMotionTemplate`translateX(${x}px) translateY(${y}px) translateX(-50%) translateY(-50%)`;

  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="absolute h-full w-full"
        width="100%"
        height="100%"
      >
        <rect fill="none" width="100%" height="100%" rx={rx} ry={ry} ref={pathRef} />
      </svg>
      <motion.div style={{ position: "absolute", top: 0, left: 0, display: "inline-block", transform }}>
        {children}
      </motion.div>
    </>
  );
}
