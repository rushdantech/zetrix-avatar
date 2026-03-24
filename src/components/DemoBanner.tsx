import { Info } from "lucide-react";

export default function DemoBanner() {
  return (
    <div className="flex items-center justify-center gap-2 gradient-primary px-4 py-1.5 text-xs font-medium text-primary-foreground">
      <Info className="h-3.5 w-3.5" />
      <span>Demo Mode — This is a mock UI prototype. No real data is being processed.</span>
    </div>
  );
}
