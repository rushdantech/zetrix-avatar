import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { STATUS_CLASSES } from "@/lib/identity/constants";

export function StatusBadge({ value }: { value: string }) {
  return (
    <Badge className={cn("border-0 capitalize", STATUS_CLASSES[value] || "bg-secondary text-secondary-foreground")}>
      {value.replaceAll("_", " ")}
    </Badge>
  );
}
