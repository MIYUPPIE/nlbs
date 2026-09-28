/**
 * Abstract "economic network": three levers (Capital, Talent, Technology)
 * joined through a central 2.0 node.
 *
 * Motion (pure CSS, no JS):
 *  - the triangle orbits the core once every 60s, starting after the hero
 *    spotlight has settled (1.2s delay)
 *  - each lever label counter-rotates on the same timing so text stays upright
 *  - the dot field drifts the other way at half speed for depth
 *  - hover pauses; prefers-reduced-motion freezes it (global rule)
 */

const CX = 200;
const CY = 210;
const R = 152; // circumradius: an equilateral triangle centred on the core

const levers = [
  { label: "Capital", angle: -90 },
  { label: "Technology", angle: 30 },
  { label: "Talent", angle: 150 },
].map((l) => {
  const rad = (l.angle * Math.PI) / 180;
  return { ...l, x: +(CX + Math.cos(rad) * R).toFixed(2), y: +(CY + Math.sin(rad) * R).toFixed(2) };
});

// Deterministic minor nodes on two rings.
const minor = Array.from({ length: 14 }, (_, i) => {
  const ring = i % 2 === 0 ? 150 : 108;
  const angle = (i / 14) * Math.PI * 2 + (i % 3) * 0.21;
  return {
    x: +(CX + Math.cos(angle) * ring).toFixed(2),
    y: +(CY + Math.sin(angle) * ring * 0.92).toFixed(2),
    r: i % 4 === 0 ? 2.4 : 1.6,
  };
});

/** Pill width sized to the uppercase label (11px, 1.8px tracking). */
const pillWidth = (label: string) => Math.round(label.length * 9.4 + 22);

/** Rotate about an absolute point in the SVG's coordinate space. */
const about = (x: number, y: number) =>
  ({ transformBox: "view-box", transformOrigin: `${x}px ${y}px` }) as const;

const paused = "group-hover/net:[animation-play-state:paused]";

export function NetworkGraphic({ className }: { className?: string }) {
  return (
    <svg
      viewBox="-40 0 480 420"
      overflow="visible"
      className={`group/net ${className ?? ""}`}
      role="img"
      aria-label="Capital, Talent and Technology connected through Nigeria 2.0"
    >
      <defs>
        <radialGradient id="ng-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E5C45A" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#E5C45A" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ng-line" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.25" />
        </linearGradient>
      </defs>

      {[160, 118, 76].map((r) => (
        <ellipse
          key={r}
          cx={CX}
          cy={CY}
          rx={r}
          ry={r * 0.92}
          fill="none"
          stroke="#A8B3C7"
          strokeOpacity={r === 160 ? 0.14 : 0.1}
          strokeDasharray={r === 118 ? "2 6" : undefined}
        />
      ))}

      {/* Dot field: slow counter-drift */}
      <g className={`animate-drift ${paused}`} style={about(CX, CY)}>
        {minor.map((n, i) => (
          <g key={i}>
            <line x1={CX} y1={CY} x2={n.x} y2={n.y} stroke="#A8B3C7" strokeOpacity="0.07" />
            <circle cx={n.x} cy={n.y} r={n.r} fill="#A8B3C7" fillOpacity="0.55" />
          </g>
        ))}
      </g>

      {/* Triangle: orbits the core */}
      <g className={`animate-orbit ${paused}`} style={about(CX, CY)}>
        <polygon
          points={levers.map((l) => `${l.x},${l.y}`).join(" ")}
          fill="none"
          stroke="url(#ng-line)"
          strokeWidth="1"
        />
        {levers.map((l) => (
          <line key={l.label} x1={CX} y1={CY} x2={l.x} y2={l.y} stroke="#D4AF37" strokeOpacity="0.5" />
        ))}

        {levers.map((l) => (
          // Counter-rotates about its own node on identical timing, so the label stays upright.
          <g key={l.label} className={`animate-orbit-counter ${paused}`} style={about(l.x, l.y)}>
            <circle cx={l.x} cy={l.y} r="12" fill="#071A33" stroke="#D4AF37" strokeWidth="1.25" />
            <circle cx={l.x} cy={l.y} r="4" fill="#D4AF37" />
            {/* Label pill below the node; reads cleanly at any rotation angle */}
            <rect
              x={l.x - pillWidth(l.label) / 2}
              y={l.y + 18}
              width={pillWidth(l.label)}
              height="22"
              rx="11"
              fill="#071A33"
              stroke="#D4AF37"
              strokeOpacity="0.35"
            />
            <text
              x={l.x}
              y={l.y + 33.5}
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="11"
              fontWeight="600"
              letterSpacing="1.8"
              fontFamily="var(--font-geist-sans), system-ui, sans-serif"
            >
              {l.label.toUpperCase()}
            </text>
          </g>
        ))}
      </g>

      {/* Core stays still, drawn above the rotating spokes */}
      <circle cx={CX} cy={CY} r="70" fill="url(#ng-core)" />
      <circle cx={CX} cy={CY} r="34" fill="#071A33" stroke="#D4AF37" strokeWidth="1.25" />
      <text
        x={CX}
        y={CY + 8}
        textAnchor="middle"
        fill="#E5C45A"
        fontSize="22"
        fontFamily="var(--font-display-serif), Georgia, serif"
      >
        2.0
      </text>
    </svg>
  );
}
