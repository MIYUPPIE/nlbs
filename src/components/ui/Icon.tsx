import {
  Bot,
  Brain,
  Briefcase,
  Building2,
  Compass,
  Cpu,
  Flame,
  Globe,
  GraduationCap,
  Handshake,
  Landmark,
  Layers,
  LayoutGrid,
  Leaf,
  Mic,
  Monitor,
  Palette,
  Rocket,
  Server,
  Sparkles,
  Sprout,
  TrendingUp,
  Users,
  Wallet,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";

/**
 * Data files reference icons by name so they stay serialisable and can be
 * passed into client components.
 */
const icons = {
  bot: Bot,
  brain: Brain,
  briefcase: Briefcase,
  building: Building2,
  compass: Compass,
  cpu: Cpu,
  flame: Flame,
  globe: Globe,
  graduation: GraduationCap,
  handshake: Handshake,
  landmark: Landmark,
  layers: Layers,
  layout: LayoutGrid,
  leaf: Leaf,
  mic: Mic,
  monitor: Monitor,
  palette: Palette,
  rocket: Rocket,
  server: Server,
  sparkles: Sparkles,
  sprout: Sprout,
  trending: TrendingUp,
  users: Users,
  wallet: Wallet,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof icons;

export function Icon({ name, ...props }: { name: IconName } & LucideProps) {
  const Component = icons[name];
  return <Component aria-hidden="true" strokeWidth={1.5} {...props} />;
}
