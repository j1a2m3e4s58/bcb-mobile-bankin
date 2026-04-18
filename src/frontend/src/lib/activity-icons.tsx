import type { ActivityIcon } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowDownLeft,
  Banknote,
  Briefcase,
  Building2,
  Clock3,
  Droplets,
  FileText,
  Gift,
  Globe,
  Landmark,
  Lock,
  ShieldAlert,
  Smartphone,
  Sparkles,
  Tv,
  Wallet,
  Zap,
  Phone,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP = {
  briefcase: Briefcase,
  bolt: Zap,
  smartphone: Smartphone,
  phone: Phone,
  "arrow-down-left": ArrowDownLeft,
  tv: Tv,
  droplets: Droplets,
  "building-bank": Building2,
  wallet: Wallet,
  globe: Globe,
  landmark: Landmark,
  lock: Lock,
  gift: Gift,
  "file-text": FileText,
  sparkles: Sparkles,
  clock: Clock3,
  "shield-alert": ShieldAlert,
  "triangle-alert": AlertTriangle,
} satisfies Record<ActivityIcon, LucideIcon>;

export function ActivityIconGlyph({
  icon,
  className,
}: {
  icon: ActivityIcon;
  className?: string;
}) {
  const Icon = ICON_MAP[icon] ?? Banknote;
  return <Icon className={cn("w-5 h-5", className)} />;
}
