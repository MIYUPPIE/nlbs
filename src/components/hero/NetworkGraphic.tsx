/**
 * Abstract "economic network": three levers (Capital, Talent, Technology)
 * joined through a central 2.0 node, with orbiting rings and minor nodes.
 * Pure SVG, server-rendered, no animation dependency.
 */

const levers = [
  { label: "Capital", x: 200, y: 58 },
  { label: "Talent", x: 64, y: 290 },
  { label: "Technology", x: 336, y: 290 },
];

// Deterministic minor nodes on two rings.
const minor = Array.from({ length: 14 }, (_, i) => {
  const ring = i % 2 === 0 ? 150 : 108;
  const angle = (i / 14) * Math.PI * 2 + (i % 3) * 0.21;
  return {
    x: 200 + Math.cos(angle) * ring,
    y: 210 + Math.sin(angle) * ring * 0.92,
    r: i % 4 === 0 ? 2.4 : 1.6,
  };
});

export function NetworkGraphic({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
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
          cx="200"
          cy="210"
          rx={r}
          ry={r * 0.92}
          fill="none"
          stroke="#A8B3C7"
          strokeOpacity={r === 160 ? 0.14 : 0.1}
          strokeDasharray={r === 118 ? "2 6" : undefined}
        />
      ))}

      {minor.map((n, i) => (
        <g key={i}>
          <line x1="200" y1="210" x2={n.x} y2={n.y} stroke="#A8B3C7" strokeOpacity="0.07" />
          <circle cx={n.x} cy={n.y} r={n.r} fill="#A8B3C7" fillOpacity="0.55" />
        </g>
      ))}

      <polygon
        points={levers.map((l) => `${l.x},${l.y}`).join(" ")}
        fill="none"
        stroke="url(#ng-line)"
        strokeWidth="1"
      />
      {levers.map((l) => (
        <line key={l.label} x1="200" y1="210" x2={l.x} y2={l.y} stroke="#D4AF37" strokeOpacity="0.5" />
      ))}

      <circle cx="200" cy="210" r="70" fill="url(#ng-core)" />
      <circle cx="200" cy="210" r="34" fill="#071A33" stroke="#D4AF37" strokeWidth="1.25" />
      <text
        x="200"
        y="218"
        textAnchor="middle"
        fill="#E5C45A"
        fontSize="22"
        fontFamily="var(--font-display-serif), Georgia, serif"
      >
        2.0
      </text>

      {levers.map((l) => (
        <g key={l.label}>
          <circle cx={l.x} cy={l.y} r="12" fill="#071A33" stroke="#D4AF37" strokeWidth="1.25" />
          <circle cx={l.x} cy={l.y} r="4" fill="#D4AF37" />
          <text
            x={l.x}
            y={l.y < 200 ? l.y - 22 : l.y + 32}
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="11"
            fontWeight="600"
            letterSpacing="2.4"
            fontFamily="var(--font-geist-sans), system-ui, sans-serif"
          >
            {l.label.toUpperCase()}
          </text>
        </g>
      ))}
    </svg>
  );
}
