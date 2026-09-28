import type { IconName } from "@/components/ui/Icon";

export type AudienceGroup = {
  label: string;
  description: string;
  icon: IconName;
};

export const audience: AudienceGroup[] = [
  { label: "Government", description: "Ministers, Governors and policymakers", icon: "landmark" },
  { label: "Business", description: "CEOs, investors, MSMEs and manufacturers", icon: "briefcase" },
  {
    label: "Development",
    description: "Development finance institutions and development partners",
    icon: "globe",
  },
  {
    label: "Investors",
    description: "VCs, institutional investors, diaspora investors and strategic capital",
    icon: "trending",
  },
  {
    label: "Talent",
    description: "Young professionals, women in technology, creatives and emerging talent",
    icon: "sparkles",
  },
  {
    label: "Technology",
    description: "Founders, technology companies, innovators and ecosystem builders",
    icon: "cpu",
  },
];
