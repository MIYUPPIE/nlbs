// Rendered once at build time (static export).
export const dynamic = "force-static";

import { ImageResponse } from "next/og";
import { LOGO_GLYPH } from "@/lib/logo";
import { logoDataUri } from "@/lib/logo-image";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * Home-screen icon. iOS rounds the corners itself, so this is the mark's N
 * and point on full-bleed navy (no tile, no hairline to get clipped).
 */
export default function AppleIcon() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", background: "#071A33" }}>
      <img src={logoDataUri(LOGO_GLYPH, "1.25 -0.75 64 64")} width={180} height={180} alt="" />
    </div>,
    size,
  );
}
