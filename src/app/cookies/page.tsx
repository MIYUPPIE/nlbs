import { LegalDocument } from "@/components/legal/LegalDocument";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Cookie Policy",
  description: "The Nigeria 2.0 website sets no tracking cookies. What it keeps in your browser, and why.",
  path: "/cookies",
});

export default function CookiesPage() {
  return <LegalDocument doc="cookies" />;
}
