// Rendered once at build time (static export).
export const dynamic = "force-static";

import { ImageResponse } from "next/og";
import { event } from "@/data/event";
import { brandDataUri } from "@/lib/logo-image";

export const alt =
  "Nigeria 2.0: Nigerian Leadership Business Summit 2026, 23 November 2026, Eko Convention Centre, Lagos";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "linear-gradient(135deg, #071A33 0%, #0B2545 60%, #123B67 100%)",
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <img src={brandDataUri("nlbs-icon.png")} width={84} height={84} alt="" />
        <div style={{ fontSize: 22, letterSpacing: 6, color: "#D4AF37", textTransform: "uppercase" }}>
          {event.name}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", fontSize: 150, fontWeight: 700, lineHeight: 1, letterSpacing: -4 }}>
          Nigeria&nbsp;<span style={{ color: "#D4AF37" }}>2.0</span>
        </div>
        <div style={{ fontSize: 40, marginTop: 24, maxWidth: 950, lineHeight: 1.2, color: "#E8ECF3" }}>
          {event.themeShort}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: "#A8B3C7" }}>
        <span>{event.date.display}</span>
        <span>{event.venue.display}</span>
      </div>
    </div>,
    size,
  );
}
