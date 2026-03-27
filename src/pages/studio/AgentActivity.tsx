import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { DelegationApprovalDialog } from "@/components/identity/DelegationApprovalDialog";
import { StatusBadge } from "@/components/identity/StatusBadge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatScopeLabel, formatSmartTimestamp } from "@/lib/identity/format";
import { mockDelegations } from "@/data/identity/mock-delegations";
import { getAgentActivityLines, outcomeLabel } from "@/data/studio/mock-agent-activity";
import { useMergedStudioEntities } from "@/hooks/useMergedStudioEntities";
import type { DelegationStatus, DelegationRequest } from "@/types/identity";
import type { StudioEntityEnterprise } from "@/types/studio";
import { cn } from "@/lib/utils";

type MainTab = "activity" | "delegation";

export default function AgentActivity() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const merged = useMergedStudioEntities();
  const enterpriseAgents = useMemo(
    () => merged.filter((e): e is StudioEntityEnterprise => e.type === "enterprise"),
    [merged],
  );

  const mainTab: MainTab = searchParams.get("tab") === "delegation" ? "delegation" : "activity";

  const setMainTab = (v: MainTab) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (v === "delegation") next.set("tab", "delegation");
        else next.delete("tab");
        return next;
      },
      { replace: true },
    );
  };

  const [activityAgentId, setActivityAgentId] = useState<string>("");
  const [delegationAgentId, setDelegationAgentId] = useState<string>("");
  const [delegationTab, setDelegationTab] = useState<DelegationStatus | "all">("pending");
  const [rowsState, setRowsState] = useState<DelegationRequest[]>([]);
  const [dialog, setDialog] = useState<{ mode: "approve" | "reject"; id: string } | null>(null);

  useEffect(() => {
    if (enterpriseAgents.length === 0) return;
    setActivityAgentId((prev) =>
      prev && enterpriseAgents.some((e) => e.id === prev) ? prev : enterpriseAgents[0].id,
    );
    setDelegationAgentId((prev) =>
      prev && enterpriseAgents.some((e) => e.id === prev) ? prev : enterpriseAgents[0].id,
    );
  }, [enterpriseAgents]);

  const { data = [] } = useQuery({
    queryKey: ["delegations"],
    queryFn: () => new Promise<typeof mockDelegations>((resolve) => setTimeout(() => resolve(mockDelegations), 450)),
  });

  const baseDelegations = rowsState.length ? rowsState : data;

  const activityLines = useMemo(() => {
    if (!activityAgentId) return [];
    return getAgentActivityLines(activityAgentId);
  }, [activityAgentId]);

  const delegationRows = useMemo(() => {
    const forAgent = baseDelegations.filter((d) => d.agentId === delegationAgentId);
    const filtered = forAgent.filter((d) => delegationTab === "all" || d.status === delegationTab);
    if (delegationTab !== "pending") return filtered;
    const urgencyRank = { critical: 0, high: 1, normal: 2 } as const;
    return [...filtered].sort((a, b) => {
      const u = urgencyRank[a.urgency] - urgencyRank[b.urgency];
      if (u !== 0) return u;
      return new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime();
    });
  }, [baseDelegations, delegationAgentId, delegationTab]);

  const updateRow = (id: string, patch: Partial<DelegationRequest>) => {
    setRowsState((prev) => {
      const source = prev.length ? prev : data;
      return source.map((r) => (r.id === id ? { ...r, ...patch } : r));
    });
  };

  const activityAgentName = enterpriseAgents.find((e) => e.id === activityAgentId)?.name ?? "Agent";
  const delegationAgentName = enterpriseAgents.find((e) => e.id === delegationAgentId)?.name ?? "Agent";

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
        <p className="mt-1 text-sm text-muted-foreground">
          Operational logs and delegation requests — switch tabs to view each view for your agents.
        </p>
      </div>

      <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as MainTab)} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2 sm:inline-flex sm:w-auto">
          <TabsTrigger value="activity" className="sm:min-w-[8rem]">
            Activity
          </TabsTrigger>
          <TabsTrigger value="delegation" className="sm:min-w-[8rem]">
            Delegation activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="mt-0 space-y-4 focus-visible:outline-none">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">What it did and whether it worked</h2>
            </div>
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
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {activityAgentName}
            </p>
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
        </TabsContent>

        <TabsContent value="delegation" className="mt-0 space-y-4 focus-visible:outline-none">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Delegation requests by agent</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Same statuses as Digital Assets → Delegations: pending, approved, rejected, expired, and all.
              </p>
            </div>
            <div className="w-full max-w-xs space-y-1.5">
              <Label htmlFor="delegation-agent" className="text-xs">
                Agent
              </Label>
              <Select value={delegationAgentId} onValueChange={setDelegationAgentId}>
                <SelectTrigger id="delegation-agent" className="bg-secondary">
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

          <p className="text-xs font-medium text-muted-foreground">{delegationAgentName}</p>

          <div className="flex flex-wrap gap-2">
            {(["pending", "approved", "rejected", "expired", "all"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setDelegationTab(t)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs capitalize",
                  delegationTab === t ? "gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground",
                )}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {delegationRows.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No delegation activity for this agent in this filter.
              </div>
            ) : (
              delegationRows.map((d) => (
                <div
                  key={d.id}
                  className={cn(
                    "relative rounded-xl border bg-card p-4 pl-5 shadow-card",
                    d.status === "pending" && d.urgency === "critical" && "border-destructive/60 animate-pulse-glow",
                    d.status === "pending" && d.urgency === "high" && "border-warning/50",
                    d.status === "pending" && d.urgency === "normal" && "border-border",
                    d.status !== "pending" && "border-border",
                  )}
                >
                  {d.status === "pending" && (
                    <span
                      className={cn(
                        "absolute left-2 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full",
                        d.urgency === "critical" && "animate-pulse bg-destructive",
                        d.urgency === "high" && "bg-warning",
                        d.urgency === "normal" && "bg-muted-foreground",
                      )}
                    />
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{d.agentName}</p>
                    <StatusBadge value={d.status} />
                  </div>
                  <p className="mt-1 text-sm">{d.action}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{d.justification}</p>
                  {d.amount != null && (
                    <p className="mt-2 font-mono text-sm font-semibold text-foreground">
                      RM {d.amount.toLocaleString("en-MY", { minimumFractionDigits: 2 })}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground" title={d.requestedAt}>
                    {formatScopeLabel(d.actionType)} · {formatSmartTimestamp(d.requestedAt)}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {d.status === "pending" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setDialog({ mode: "approve", id: d.id })}
                          className="rounded bg-success/10 px-3 py-1 text-xs font-medium text-success"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => setDialog({ mode: "reject", id: d.id })}
                          className="rounded border border-destructive/40 px-3 py-1 text-xs font-medium text-destructive"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => navigate(`/identity/delegations/${d.id}`)}
                        className="rounded bg-secondary px-3 py-1 text-xs"
                      >
                        View receipt
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      <DelegationApprovalDialog
        open={dialog != null}
        mode={dialog?.mode ?? null}
        onOpenChange={(o) => {
          if (!o) setDialog(null);
        }}
        onApprove={() => {
          if (!dialog || dialog.mode !== "approve") return;
          updateRow(dialog.id, {
            status: "approved",
            decidedAt: new Date().toISOString(),
            approvedBy: "Admin",
            receiptId: `rec_${dialog.id}`,
            txHash: `0x${Math.random().toString(16).slice(2, 42)}`,
          });
          toast.success("Delegation approved. Token issued.");
          setDialog(null);
        }}
        onReject={(reason) => {
          if (!dialog || dialog.mode !== "reject") return;
          updateRow(dialog.id, {
            status: "rejected",
            decidedAt: new Date().toISOString(),
            rejectionReason: reason.trim() || "Rejected by approver.",
          });
          toast.error("Delegation rejected.");
          setDialog(null);
        }}
      />
    </div>
  );
}
