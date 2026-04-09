import { ShieldOff } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  size?: "default" | "compact";
};

/**
 * eKYC not completed — top-right ribbon, muted styling (pairs with VerifiedRibbon).
 */
export function UnverifiedRibbon({ className, size = "default" }: Props) {
  const isCompact = size === "compact";
  return (
    <div
      className={cn("pointer-events-none absolute right-0 top-0 z-10", className)}
      role="img"
      aria-label="MyDigital ID not verified"
    >
      <div
        className={cn(
          "flex items-center gap-1 rounded-bl-2xl border-b border-l border-border/80 bg-muted font-semibold uppercase tracking-wide text-muted-foreground shadow-sm",
          isCompact ? "gap-0.5 px-2 py-1 pl-2.5 text-[9px]" : "gap-1 px-2.5 py-1.5 pl-3 text-[10px]",
        )}
      >
        <ShieldOff className={cn("shrink-0 opacity-80", isCompact ? "h-3 w-3" : "h-3.5 w-3.5")} aria-hidden />
        <span>Unverified</span>
      </div>
    </div>
  );
}
