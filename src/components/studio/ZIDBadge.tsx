import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function ZIDBadge({ credentialed }: { credentialed: boolean }) {
  if (credentialed) {
    return (
      <Badge className="border-0 bg-success/10 text-success">
        <ShieldCheck className="mr-1 h-3 w-3" /> ZID Verified
      </Badge>
    );
  }
  return <Badge className="border-0 bg-muted text-muted-foreground">No identity</Badge>;
}
