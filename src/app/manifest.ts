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
    icons: [{ src: "/icon", sizes: "64x64", type: "image/png" }],
  };
}
