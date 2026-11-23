import type { NextConfig } from "next";

/**
 * Static export for cPanel: `npm run build` writes plain files to out/, which
 * scripts/build-cpanel.sh zips for public_html. Forms post from the browser to
 * the central backend (src/lib/central.ts). Redirects and response headers
 * live in public/.htaccess, since a static export cannot set them.
 */
const nextConfig: NextConfig = {
  output: "export",
  // /register/ -> out/register/index.html, which Apache serves directly.
  trailingSlash: true,
  images: {
    // No image server on shared hosting; images are already sized in public/.
    unoptimized: true,
  },
  poweredByHeader: false,
  // Fixes "now" for the build so server HTML and client hydration agree on
  // whether registration is open (src/lib/registration-window.ts).
  // Set once on process.env so every build worker inherits the same value.
  env: {
    NEXT_PUBLIC_BUILD_TIME: (process.env.NEXT_PUBLIC_BUILD_TIME ??= String(Date.now())),
  },
};

export default nextConfig;
