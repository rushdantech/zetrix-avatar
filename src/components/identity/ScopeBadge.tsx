import { Badge } from "@/components/ui/badge";
import { formatScopeLabel } from "@/lib/identity/format";

export function ScopeBadge({ scope }: { scope: string }) {
  return <Badge variant="secondary" className="text-[11px]">{formatScopeLabel(scope)}</Badge>;
}
