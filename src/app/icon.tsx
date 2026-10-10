// Rendered once at build time (static export).
export const dynamic = "force-static";

import { ImageResponse } from "next/og";
import { brandDataUri } from "@/lib/logo-image";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Favicon: the NLBS rising bars on navy (public/brand/nlbs-icon-tile.png). */
export default function Icon() {
  return new ImageResponse(
    <img
      src={brandDataUri("nlbs-icon-tile.png")}
      width={64}
      height={64}
      alt=""
      style={{ borderRadius: 14 }}
    />,
    size,
  );
}
