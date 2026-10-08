// Rendered once at build time (static export).
export const dynamic = "force-static";

import { ImageResponse } from "next/og";
import { logoDataUri } from "@/lib/logo-image";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Favicon: the Nigeria 2.0 mark (src/lib/logo.ts). */
export default function Icon() {
  return new ImageResponse(<img src={logoDataUri()} width={64} height={64} alt="" />, size);
}
