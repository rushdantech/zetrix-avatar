import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Size = "xs" | "sm" | "md" | "lg";

const sizeClass: Record<Size, string> = {
  xs: "gap-0.5 px-1.5 py-0.5 text-[9px]",
  sm: "gap-1 px-2 py-0.5 text-[10px]",
  md: "gap-1 px-2.5 py-1 text-xs",
  lg: "gap-1.5 px-3 py-1.5 text-sm",
};

const iconClass: Record<Size, string> = {
  xs: "h-2.5 w-2.5",
  sm: "h-3 w-3",
  md: "h-3.5 w-3.5",
  lg: "h-4 w-4",
};

/** Editorial / promotional Featured label — distinct from segment chips (Public, Company, …). */
export function MarketplaceFeaturedBadge({ size = "sm", className }: { size?: Size; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-semibold tracking-tight",
        "border-amber-500/45 bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-amber-500/12",
        "text-amber-950 shadow-sm dark:text-amber-100",
        sizeClass[size],
        className,
      )}
    >
      <Sparkles className={cn("shrink-0 text-amber-600 dark:text-amber-300", iconClass[size])} aria-hidden />
      Featured
    </span>
  );
}
