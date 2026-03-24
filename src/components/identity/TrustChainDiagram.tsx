import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const nodes = ["Agent", "Agent VC", "Enterprise DID", "ZID Authority", "Zetrix"] as const;

export function TrustChainDiagram({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border bg-secondary/40 p-4", className)}>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Trust chain</p>
      <div className="flex flex-wrap items-center gap-1 text-[11px] sm:text-xs">
        {nodes.map((label, i) => (
          <div key={label} className="flex items-center gap-1">
            <span className="rounded-md border border-border bg-card px-2 py-1 font-mono">{label}</span>
            {i < nodes.length - 1 && <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
          </div>
        ))}
      </div>
    </div>
  );
}
