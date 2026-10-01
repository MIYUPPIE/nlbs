import { LegalDocument } from "@/components/legal/LegalDocument";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "How HBC Business Help, convener of the Nigeria 2.0 summit, collects, uses and protects personal data under the Nigeria Data Protection Act 2023, and how to use your rights.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return <LegalDocument doc="privacy" />;
}
