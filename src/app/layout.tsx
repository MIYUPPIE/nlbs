import type { Metadata, Viewport } from "next";
import { Geist, Instrument_Serif } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RevealObserver } from "@/components/motion/RevealObserver";
import { event } from "@/data/event";
import { siteTitle, siteUrl } from "@/lib/site";
import "./globals.css";

const sans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const display = Instrument_Serif({
  variable: "--font-display-serif",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: "%s | Nigeria 2.0 Summit 2026",
  },
  description: event.description,
  applicationName: "Nigeria 2.0",
  keywords: [
    "Nigeria 2.0",
    "Nigerian Leadership Business Summit",
    "NLBS 2026",
    "Lagos business summit",
    "Nigeria investment",
    "Nigeria talent",
    "Nigeria technology",
    "Eko Convention Centre",
  ],
  authors: [{ name: event.convener }],
  creator: event.convener,
  publisher: event.convener,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "/",
    siteName: "Nigeria 2.0",
    title: siteTitle,
    description: event.description,
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: event.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#071A33",
  colorScheme: "light",
};

/**
 * Enables scroll-reveal styles only when JS runs. If the app has not booted
 * within 2.5s (bundle error, slow network), the class is removed so content
 * is never left hidden.
 */
const revealBootstrap = `(function(){var d=document.documentElement;d.classList.add('js');setTimeout(function(){if(!d.classList.contains('reveal-ready'))d.classList.remove('js')},2500)})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-NG" className={`${sans.variable} ${display.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: revealBootstrap }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <Header />
        <main id="main" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </main>
        <Footer />
        <RevealObserver />
      </body>
    </html>
  );
}
