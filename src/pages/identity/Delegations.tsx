import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { StatusBadge } from "@/components/identity/StatusBadge";
import { formatScopeLabel, formatSmartTimestamp } from "@/lib/identity/format";
import { mockDelegations } from "@/data/identity/mock-delegations";
import type { DelegationStatus, DelegationRequest } from "@/types/identity";

export default function Delegations() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<DelegationStatus | "all">("pending");
  const [rowsState, setRowsState] = useState<DelegationRequest[]>([]);
  const [approveId, setApproveId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const { data = [] } = useQuery({
    queryKey: ["delegations"],
    queryFn: () => new Promise<typeof mockDelegations>((resolve) => setTimeout(() => resolve(mockDelegations), 450)),
  });
  const rowsSource = rowsState.length ? rowsState : data;
  const rows = useMemo(() => rowsSource.filter((d) => tab === "all" || d.status === tab), [rowsSource, tab]);
  return (
    <div className="space-y-4 pb-20 lg:pb-0">
      <h1 className="text-2xl font-bold">Delegations</h1>
      <div className="flex flex-wrap gap-2">
        {(["pending", "approved", "rejected", "expired", "all"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-full px-3 py-1 text-xs capitalize ${tab === t ? "gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{t}</button>
        ))}
      </div>
      <div className="space-y-3">
        {rows.map((d) => (
          <div key={d.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold">{d.agentName}</p>
              <StatusBadge value={d.status} />
            </div>
            <p className="mt-1 text-sm">{d.action}</p>
            <p className="mt-1 text-xs text-muted-foreground">{d.justification}</p>
            <p className="mt-1 text-xs text-muted-foreground">{formatScopeLabel(d.actionType)} · {formatSmartTimestamp(d.requestedAt)}</p>
            <div className="mt-3 flex gap-2">
              {d.status === "pending" ? (
                <>
                  <button onClick={() => setApproveId(d.id)} className="rounded bg-success/10 px-3 py-1 text-xs text-success">Approve</button>
                  <button onClick={() => setRejectId(d.id)} className="rounded bg-destructive/10 px-3 py-1 text-xs text-destructive">Reject</button>
                </>
              ) : (
                <button onClick={() => navigate(`/identity/delegations/${d.id}`)} className="rounded bg-secondary px-3 py-1 text-xs">View receipt</button>
              )}
            </div>
          </div>
        ))}
      </div>
      <AlertDialog open={!!approveId} onOpenChange={(o) => !o && setApproveId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve delegation?</AlertDialogTitle>
            <AlertDialogDescription>This will issue an approval token and move the request to Approved.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (!approveId) return;
              setRowsState((rowsState.length ? rowsState : data).map((r) => r.id === approveId ? { ...r, status: "approved", decidedAt: new Date().toISOString(), approvedBy: "Admin" } : r));
              toast.success("Delegation approved. Token issued.");
              setApproveId(null);
            }}>Approve</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={!!rejectId} onOpenChange={(o) => !o && setRejectId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject delegation?</AlertDialogTitle>
            <AlertDialogDescription>This action will move the request to Rejected.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => {
              if (!rejectId) return;
              setRowsState((rowsState.length ? rowsState : data).map((r) => r.id === rejectId ? { ...r, status: "rejected", decidedAt: new Date().toISOString(), rejectionReason: "Rejected by approver." } : r));
              toast.error("Delegation rejected.");
              setRejectId(null);
            }}>Reject</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
