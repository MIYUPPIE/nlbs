import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * data: URI of a public/brand PNG for <img> inside next/og ImageResponse
 * (favicon, app icon, share image). Build-time only (Node fs + Buffer).
 */
export const brandDataUri = (file: "nlbs-icon-tile.png" | "nlbs-icon.png") =>
  `data:image/png;base64,${readFileSync(join(process.cwd(), "public", "brand", file)).toString("base64")}`;
