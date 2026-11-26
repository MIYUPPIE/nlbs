import { LegalDocument } from "@/components/legal/LegalDocument";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Terms of Sale and Use",
  description:
    "Terms for buying a Nigeria 2.0 seat (no refunds, transferable to a colleague), using the website and applying to the Talent Fund.",
  path: "/terms",
});

export default function TermsPage() {
  return <LegalDocument doc="terms" />;
}
