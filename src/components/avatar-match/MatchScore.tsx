import { cn } from "@/lib/utils";
import type { MatchQualityLabel } from "@/lib/avatar-match/mock-match-scoring";

type Props = {
  percent: number;
  label: MatchQualityLabel;
  className?: string;
  large?: boolean;
};

export function MatchScore({ percent, label, className, large }: Props) {
  return (
    <div className={cn("flex flex-col items-start gap-0.5", className)}>
      <span
        className={cn(
          "font-bold tabular-nums tracking-tight text-primary",
          large ? "text-3xl sm:text-4xl" : "text-2xl",
        )}
      >
        {percent}%
      </span>
      <MatchBadge label={label} />
    </div>
  );
}

export function MatchBadge({ label }: { label: MatchQualityLabel }) {
  const tone =
    label === "High Match"
      ? "bg-success/15 text-success border-success/30"
      : label === "Good Match"
        ? "bg-primary/10 text-primary border-primary/25"
        : "bg-muted text-muted-foreground border-border";

  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-colors",
        tone,
      )}
    >
      {label}
    </span>
  );
}
