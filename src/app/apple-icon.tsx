// Rendered once at build time (static export).
export const dynamic = "force-static";

import { ImageResponse } from "next/og";
import { brandDataUri } from "@/lib/logo-image";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon: the bars on full-bleed navy (iOS rounds the corners itself). */
export default function AppleIcon() {
  return new ImageResponse(
    <img src={brandDataUri("nlbs-icon-tile.png")} width={180} height={180} alt="" />,
    size,
  );
}
