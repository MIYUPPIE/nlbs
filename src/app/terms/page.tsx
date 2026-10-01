import { LegalDocument } from "@/components/legal/LegalDocument";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Terms of Use",
  description:
    "Terms for using the Nigeria 2.0 website, registering for the summit and applying to the Talent Fund.",
  path: "/terms",
});

export default function TermsPage() {
  return <LegalDocument doc="terms" />;
}
