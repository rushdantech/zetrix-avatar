import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { DelegationApprovalDialog } from "@/components/identity/DelegationApprovalDialog";
import { StatusBadge } from "@/components/identity/StatusBadge";
import { formatScopeLabel, formatSmartTimestamp } from "@/lib/identity/format";
import { mockDelegations } from "@/data/identity/mock-delegations";
import type { DelegationStatus, DelegationRequest } from "@/types/identity";
import { cn } from "@/lib/utils";

export default function Delegations() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<DelegationStatus | "all">("pending");
  const [rowsState, setRowsState] = useState<DelegationRequest[]>([]);
  const [dialog, setDialog] = useState<{ mode: "approve" | "reject"; id: string } | null>(null);

  const { data = [] } = useQuery({
    queryKey: ["delegations"],
    queryFn: () => new Promise<typeof mockDelegations>((resolve) => setTimeout(() => resolve(mockDelegations), 450)),
  });

  const base = rowsState.length ? rowsState : data;
  const rows = useMemo(() => {
    const filtered = base.filter((d) => tab === "all" || d.status === tab);
    if (tab !== "pending") return filtered;
    const urgencyRank = { critical: 0, high: 1, normal: 2 } as const;
    return [...filtered].sort((a, b) => {
      const u = urgencyRank[a.urgency] - urgencyRank[b.urgency];
      if (u !== 0) return u;
      return new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime();
    });
  }, [base, tab]);

  const updateRow = (id: string, patch: Partial<DelegationRequest>) => {
    setRowsState((prev) => {
      const source = prev.length ? prev : data;
      return source.map((r) => (r.id === id ? { ...r, ...patch } : r));
    });
  };

  return (
    <div className="space-y-4 pb-20 lg:pb-0">
      <h1 className="text-2xl font-bold">Delegations</h1>
      <div className="flex flex-wrap gap-2">
        {(["pending", "approved", "rejected", "expired", "all"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "rounded-full px-3 py-1 text-xs capitalize",
              tab === t ? "gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {rows.map((d) => (
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
        ))}
      </div>

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
