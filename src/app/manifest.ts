// Rendered once at build time (static export).
export const dynamic = "force-static";

import type { MetadataRoute } from "next";
import { event } from "@/data/event";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${event.shortName} | ${event.name}`,
    short_name: event.shortName,
    description: event.description,
    start_url: "/",
    display: "browser",
    background_color: "#071A33",
    theme_color: "#071A33",
    icons: [
      { src: "/icon", sizes: "64x64", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
      { src: "/brand/nlbs-icon-tile.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
