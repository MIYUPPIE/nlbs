// Rendered once at build time (static export).
export const dynamic = "force-static";

import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#071A33",
        borderRadius: 14,
        border: "3px solid #D4AF37",
        color: "#D4AF37",
        fontSize: 26,
        fontWeight: 700,
        letterSpacing: -1,
      }}
    >
      2.0
    </div>,
    size,
  );
}
