"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ArrowRight, Pause, Play } from "lucide-react";
import type { Speaker } from "@/data/speakers";
import { usePrefersReducedMotion } from "@/components/hooks/usePrefersReducedMotion";
import { LOGO } from "@/lib/logo";
import { openSpeakerProfile, profileHref } from "@/components/speakers/profile-link";
import { activeIndex, badge, ringRotation, slotPosition, stepToward } from "@/lib/orbit";
import { cn } from "@/lib/utils";

/** Seconds each speaker holds the bottom of the ring while autoplaying. */
const HOLD_MS = 5000;
/** Ring radius and avatar size, as % of the square stage. */
const RADIUS = 41;
const AVATAR = 17;
const ACTIVE_SCALE = 1.55;

/**
 * Speaker orbit: portraits on a ring around the NLBS mark. The active speaker
 * turns to the bottom, enlarged with a numbered badge, and their name, role
 * and organisation show underneath.
 *
 * - Autoplays every 5s. Stops for good on the pause button (WCAG 2.2.2), and
 *   waits while hovered, focused, off-screen or in a hidden tab. Under
 *   prefers-reduced-motion it starts paused and turns instantly (globals.css).
 * - The dots are the keyboard control (one tab stop, arrow keys, Home/End).
 *   Portraits are click targets too, but kept out of the tab order so the
 *   rotating ring is not eight extra stops.
 * - The caption is announced only once the visitor has taken control, so
 *   autoplay never talks over a screen reader.
 * - Server-rendered on the first speaker, so it reads correctly without JS.
 */
export function SpeakerOrbit({ speakers, compact = false }: { speakers: Speaker[]; compact?: boolean }) {
  const n = speakers.length;
  // Unique SVG gradient ids: the homepage renders two orbits.
  const uid = useId().replace(/:/g, "");
  const ring = `orbit-ring-${uid}`;
  const glow = `orbit-glow-${uid}`;
  const core = `orbit-core-${uid}`;
  const [step, setStep] = useState(0);
  // The visitor's play/pause choice; until they choose, reduced motion means paused.
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  const reduced = usePrefersReducedMotion();
  const paused = userPaused ?? reduced;
  const [held, setHeld] = useState(false); // hover or focus inside
  const [visible, setVisible] = useState(false);
  const [interacted, setInteracted] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const dots = useRef<(HTMLButtonElement | null)[]>([]);

  const active = activeIndex(step, n);
  const current = speakers[active];
  const rotation = ringRotation(step, n);

  const select = useCallback(
    (i: number, focusDot = false) => {
      setInteracted(true);
      setStep((s) => stepToward(s, i, n));
      if (focusDot) dots.current[i]?.focus();
    },
    [n],
  );

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // One timer per step: any change (autoplay or the visitor) restarts the hold.
  useEffect(() => {
    if (paused || held || !visible || n < 2) return;
    const t = window.setTimeout(() => {
      if (document.visibilityState === "visible") setStep((s) => s + 1);
    }, HOLD_MS);
    return () => window.clearTimeout(t);
  }, [step, paused, held, visible, n]);

  const onDotKey = (e: React.KeyboardEvent, i: number) => {
    const map: Record<string, number> = {
      ArrowRight: i + 1,
      ArrowDown: i + 1,
      ArrowLeft: i - 1,
      ArrowUp: i - 1,
      Home: 0,
      End: n - 1,
    };
    if (!(e.key in map)) return;
    e.preventDefault();
    select((map[e.key] + n) % n, true);
  };

  return (
    <div
      ref={root}
      data-speaker-orbit
      data-active={current.id}
      className={cn("mx-auto w-full", compact ? "max-w-[26rem]" : "max-w-[34rem]")}
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHeld(false);
      }}
    >
      {/* Stage */}
      <div className="relative aspect-square w-full">
        {/* Rings: gradient outer ring (Nigeria green to gold to logo blue), faint inner rings. */}
        <svg aria-hidden="true" viewBox="0 0 100 100" className="absolute inset-0 size-full overflow-visible">
          <defs>
            <linearGradient id={ring} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1F9D55" />
              <stop offset="45%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#2F7DD1" />
            </linearGradient>
            <radialGradient id={glow} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#E5C45A" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#E5C45A" stopOpacity="0" />
            </radialGradient>
            <radialGradient id={core} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#123B67" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#071A33" stopOpacity="1" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r={RADIUS + 6} fill="#0B2545" fillOpacity="0.35" />
          <circle cx="50" cy="50" r={RADIUS} fill="none" stroke={`url(#${ring})`} strokeWidth="0.45" />
          <circle
            cx="50"
            cy="50"
            r={RADIUS - 11}
            fill="none"
            stroke="#A8B3C7"
            strokeOpacity="0.12"
            strokeWidth="0.25"
          />
          <circle
            cx="50"
            cy="50"
            r={RADIUS - 21}
            fill="none"
            stroke="#A8B3C7"
            strokeOpacity="0.1"
            strokeWidth="0.25"
            strokeDasharray="0.8 1.6"
          />
          {/* Glow under the bottom slot, where the active speaker always sits. */}
          <circle cx="50" cy={50 + RADIUS} r="17" fill={`url(#${glow})`} />
          <circle
            cx="50"
            cy="50"
            r="12.5"
            fill={`url(#${core})`}
            stroke="#D4AF37"
            strokeOpacity="0.25"
            strokeWidth="0.3"
          />
        </svg>

        {/* Centre mark */}
        <div className="absolute top-1/2 left-1/2 w-[15%] -translate-x-1/2 -translate-y-1/2">
          <Image src={LOGO.icon} alt="" width={512} height={512} className="h-auto w-full" />
        </div>

        {/* Rotating ring of portraits */}
        <div
          className="absolute inset-0 transition-transform duration-[900ms] ease-[cubic-bezier(0.65,0,0.35,1)]"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {speakers.map((s, i) => {
            const pos = slotPosition(i, n, RADIUS);
            const isActive = i === active;
            return (
              <div
                key={s.id}
                className="absolute aspect-square -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${pos.left}%`,
                  top: `${pos.top}%`,
                  width: `${AVATAR}%`,
                  zIndex: isActive ? 2 : 1,
                }}
              >
                {/* Counter-rotate so faces stay upright; scale the active one. */}
                <div
                  className="size-full transition-transform duration-[900ms] ease-[cubic-bezier(0.65,0,0.35,1)]"
                  style={{ transform: `rotate(${-rotation}deg) scale(${isActive ? ACTIVE_SCALE : 1})` }}
                >
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-hidden="true"
                    onClick={() => (isActive ? openSpeakerProfile(s.id) : select(i))}
                    className={cn(
                      "relative block size-full cursor-pointer overflow-hidden rounded-full border-2 bg-navy-900 transition-[border-color,box-shadow,filter] duration-500",
                      isActive
                        ? "border-gold shadow-[0_0_0_3px_rgba(7,26,51,0.9),0_12px_40px_-6px_rgba(212,175,55,0.65)]"
                        : "border-white/80 shadow-[0_0_0_3px_rgba(7,26,51,0.9)] brightness-90 hover:border-gold hover:brightness-100",
                    )}
                  >
                    <Image
                      src={s.photo.src}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 140px, 25vw"
                      className="object-cover object-[50%_18%]"
                    />
                  </button>
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute -right-[6%] -bottom-[4%] flex aspect-square w-[34%] items-center justify-center rounded-full border-2 border-navy-950 bg-gold text-[clamp(0.5rem,1.6vw,0.72rem)] font-bold text-navy-950"
                    >
                      {badge(i)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Caption */}
      <div
        aria-live={interacted ? "polite" : "off"}
        aria-atomic="true"
        className="mt-[9%] flex min-h-[12.5rem] flex-col items-center text-center"
      >
        <p className="text-[0.65rem] font-semibold tracking-[0.2em] text-gold uppercase sm:text-xs">
          {current.category}
        </p>
        <p
          className={cn(
            "mt-2 font-display leading-tight text-white",
            compact ? "text-2xl sm:text-3xl" : "text-3xl sm:text-4xl",
          )}
        >
          {current.honorific && (
            <span className="mb-1 block font-sans text-sm tracking-wide text-mist">{current.honorific} </span>
          )}
          {current.name}
        </p>
        {current.role && (
          <p className="mt-2 max-w-md text-sm font-semibold text-gold sm:text-base">{current.role}</p>
        )}
        {current.organisation && <p className="mt-1 text-sm text-mist">{current.organisation}</p>}
        {current.bio && (
          <a
            href={profileHref(current.id)}
            data-profile-id={current.id}
            aria-label={`View profile: ${current.name}`}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-gold/40 px-4 py-1.5 text-sm font-semibold text-gold-bright transition-colors hover:border-gold hover:bg-gold hover:text-navy-950"
          >
            View profile
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </a>
        )}
      </div>

      {/* Controls */}
      <div className="mt-4 flex items-center justify-center gap-4">
        <div role="group" aria-label="Choose a speaker" className="flex items-center gap-1">
          {speakers.map((s, i) => (
            <button
              key={s.id}
              ref={(el) => {
                dots.current[i] = el;
              }}
              type="button"
              aria-label={`${badge(i)}: ${s.name}`}
              aria-current={i === active ? "true" : undefined}
              tabIndex={i === active ? 0 : -1}
              onClick={() => select(i)}
              onKeyDown={(e) => onDotKey(e, i)}
              className="group flex h-6 items-center px-1"
            >
              <span
                className={cn(
                  "block h-1.5 rounded-full transition-[width,background-color] duration-300",
                  i === active ? "w-7 bg-gold" : "w-2.5 bg-white/25 group-hover:bg-white/50",
                )}
              />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            setInteracted(true);
            setUserPaused(!paused);
          }}
          aria-label={paused ? "Play speaker rotation" : "Pause speaker rotation"}
          className="flex size-8 items-center justify-center rounded-full border border-white/15 text-mist transition-colors hover:border-gold hover:text-gold"
        >
          {paused ? (
            <Play aria-hidden="true" className="size-3.5" />
          ) : (
            <Pause aria-hidden="true" className="size-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}
