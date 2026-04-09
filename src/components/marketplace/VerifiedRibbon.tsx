import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  /** Slightly smaller for dense layouts (e.g. match card hero). */
  size?: "default" | "compact";
};

/**
 * Prominent eKYC badge: top-right corner, gradient + star (ribbon-style).
 */
export function VerifiedRibbon({ className, size = "default" }: Props) {
  const isCompact = size === "compact";
  return (
    <div
      className={cn("pointer-events-none absolute right-0 top-0 z-10", className)}
      role="img"
      aria-label="MyDigital ID verified"
    >
      <div
        className={cn(
          "flex items-center gap-1 rounded-bl-2xl border-b border-l border-white/30 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 font-bold uppercase tracking-wide text-white shadow-[0_4px_16px_rgba(5,150,105,0.55)]",
          isCompact ? "gap-0.5 px-2 py-1 pl-2.5 text-[9px]" : "gap-1 px-2.5 py-1.5 pl-3 text-[10px]",
        )}
      >
        <Star
          className={cn(
            "shrink-0 fill-amber-300 text-amber-100 drop-shadow-sm",
            isCompact ? "h-3 w-3" : "h-3.5 w-3.5",
          )}
          aria-hidden
        />
        <span>Verified</span>
      </div>
    </div>
  );
}
