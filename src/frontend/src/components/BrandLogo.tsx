import { cn } from "@/lib/utils";

export type TelecomBrand = "MTN" | "Telecel" | "AirtelTigo";

interface BrandLogoProps {
  brand: TelecomBrand;
  compact?: boolean;
  className?: string;
}

const brandStyles: Record<TelecomBrand, { wrapper: string; text: string; label: string }> = {
  MTN: {
    wrapper: "bg-[#ffcc00] text-black border-[#111111]/15",
    text: "font-black tracking-[-0.06em]",
    label: "MTN",
  },
  Telecel: {
    wrapper: "bg-[#e60000] text-white border-[#b80000]",
    text: "font-extrabold tracking-[-0.04em]",
    label: "telecel",
  },
  AirtelTigo: {
    wrapper: "bg-white text-[#ed1c24] border-[#0066b3]",
    text: "font-black tracking-[-0.05em]",
    label: "AirtelTigo",
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
