import { cn } from "@/lib/utils";

export type TelecomBrand = "MTN" | "Telecel" | "AirtelTigo";

interface BrandLogoProps {
  brand: TelecomBrand;
  compact?: boolean;
  className?: string;
}

const brandStyles: Record<TelecomBrand, { wrapper: string; text: string; label: string; short?: string }> = {
  MTN: {
    wrapper: "bg-[#ffcc00] text-black border-[#111111]",
    text: "font-black tracking-[-0.06em]",
    label: "MTN",
  },
  Telecel: {
    wrapper: "bg-[#e60000] text-white border-[#b80000]",
    text: "font-extrabold tracking-[-0.04em]",
    label: "telecel",
  },
  AirtelTigo: {
    wrapper: "bg-gradient-to-r from-[#ed1c24] to-[#0072ce] text-white border-transparent",
    text: "font-black tracking-[-0.05em]",
    label: "AT",
    short: "AirtelTigo",
  },
};

export function BrandLogo({ brand, compact = false, className }: BrandLogoProps) {
  const config = brandStyles[brand];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center border shadow-sm",
        compact ? "h-8 min-w-14 rounded-xl px-2 text-[10px]" : "h-11 min-w-20 rounded-2xl px-3 text-sm",
        config.wrapper,
        className,
      )}
      aria-label={`${brand} logo`}
      title={brand}
    >
      <span className={config.text}>{config.label}</span>
    </span>
  );
}

export function TelecomProviderCard({
  brand,
  label,
  selected,
  onClick,
}: {
  brand: TelecomBrand;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-[92px] flex-1 flex-col items-center justify-center gap-3 rounded-2xl border bg-card px-3 py-4 text-center transition-smooth",
        selected ? "border-primary bg-primary/5 shadow-card" : "border-border hover:border-primary/40 hover:bg-muted/30",
      )}
      aria-label={`Select ${label}`}
    >
      <BrandLogo brand={brand} compact className="h-9 min-w-16" />
      <span className="text-xs font-bold text-foreground">{label}</span>
    </button>
  );
}
