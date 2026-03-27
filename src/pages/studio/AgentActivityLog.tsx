import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAgentActivityLines, outcomeLabel } from "@/data/studio/mock-agent-activity";
import { useMergedStudioEntities } from "@/hooks/useMergedStudioEntities";
import type { StudioEntityEnterprise } from "@/types/studio";
import { cn } from "@/lib/utils";

export default function AgentActivityLog() {
  const merged = useMergedStudioEntities();
  const enterpriseAgents = useMemo(
    () => merged.filter((e): e is StudioEntityEnterprise => e.type === "enterprise"),
    [merged],
  );

  const [activityAgentId, setActivityAgentId] = useState<string>("");

  useEffect(() => {
    if (enterpriseAgents.length === 0) return;
    setActivityAgentId((prev) =>
      prev && enterpriseAgents.some((e) => e.id === prev) ? prev : enterpriseAgents[0].id,
    );
  }, [enterpriseAgents]);

  const activityLines = useMemo(() => {
    if (!activityAgentId) return [];
    return getAgentActivityLines(activityAgentId);
  }, [activityAgentId]);

  const activityAgentName = enterpriseAgents.find((e) => e.id === activityAgentId)?.name ?? "Agent";

  if (enterpriseAgents.length === 0) {
    return (
      <div className="space-y-4 pb-20 lg:pb-0">
        <h1 className="text-2xl font-bold">Activity</h1>
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No agents yet. Create an agent under Agent Studio to see activity here.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div>
        <h1 className="text-2xl font-bold">Activity</h1>
        <p className="mt-1 text-sm text-muted-foreground">What it did and whether it worked</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full max-w-xs space-y-1.5">
          <Label htmlFor="activity-agent" className="text-xs">
            Agent
          </Label>
          <Select value={activityAgentId} onValueChange={setActivityAgentId}>
            <SelectTrigger id="activity-agent" className="bg-secondary">
              <SelectValue placeholder="Select agent" />
            </SelectTrigger>
            <SelectContent>
              {enterpriseAgents.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 shadow-card">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">{activityAgentName}</p>
        <ul className="space-y-3 text-sm">
          {activityLines.map((line) => (
            <li
              key={line.id}
              className="flex flex-col gap-1 border-b border-border/80 pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
            >
              <span className="font-mono text-xs text-muted-foreground tabular-nums">
                {format(new Date(line.at), "yyyy-MM-dd HH:mm")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-foreground">{line.detail}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Outcome:{" "}
                  <span
                    className={cn(
                      "font-medium",
                      line.outcome === "ok" && "text-success",
                      line.outcome === "pending" && "text-warning",
                      line.outcome === "failed" && "text-destructive",
                    )}
                  >
                    {outcomeLabel(line.outcome)}
                  </span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
