import { useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ScopeBadge } from "@/components/identity/ScopeBadge";
import { StatusBadge } from "@/components/identity/StatusBadge";
import { BootstrapTokenModal } from "@/components/identity/BootstrapTokenModal";
import { mockStudioEntities } from "@/data/studio/mock-avatars";
import { mockAgentCredentials } from "@/data/identity/mock-agents";
import type { AgentCredential } from "@/types/identity";

export default function AgentCredentials() {
  const navigate = useNavigate();
  const { agentId } = useParams();
  const [params] = useSearchParams();
  const [copied, setCopied] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [selected, setSelected] = useState(agentId || params.get("preselect") || "");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null);
  const [localCredentials, setLocalCredentials] = useState<AgentCredential[]>(mockAgentCredentials);
  const { data } = useQuery({
    queryKey: ["identity-agents"],
    queryFn: () => new Promise((resolve) => setTimeout(() => resolve({
      entities: mockStudioEntities.filter((e) => e.type === "enterprise"),
      credentials: mockAgentCredentials,
    }), 400)),
  });
  const rows = useMemo(() => {
    if (!data) return [];
    let out = data.entities.map((e) => ({
      ...e,
      credential: localCredentials.find((c) => c.agentId === e.id),
    }));
    if (search.trim()) out = out.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));
    if (filter === "credentialed") out = out.filter((r) => !!r.credential);
    if (filter === "not_credentialed") out = out.filter((r) => !r.credential);
    if (filter === "suspended") out = out.filter((r) => r.credential?.status === "suspended");
    if (filter === "revoked") out = out.filter((r) => r.credential?.status === "revoked");
    return out;
  }, [data, filter, search, localCredentials]);
  return (
    <div className="space-y-4 pb-20 lg:pb-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Agent Credentials</h1>
        <button onClick={() => selected && setShowToken(true)} className="rounded-lg gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground">Credential an Agent</button>
      </div>
      <div className="flex flex-wrap gap-2">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by agent name" className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm" />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm">
          <option value="all">All</option>
          <option value="credentialed">Credentialed</option>
          <option value="not_credentialed">Not credentialed</option>
          <option value="suspended">Suspended</option>
          <option value="revoked">Revoked</option>
        </select>
      </div>
      <select value={selected} onChange={(e) => setSelected(e.target.value)} className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm">
        <option value="">Select agent</option>
        {rows.filter((r) => !r.credential).map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
      </select>
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-left text-xs text-muted-foreground"><th className="p-3">Agent</th><th className="p-3">Source</th><th className="p-3">Credential</th><th className="p-3">Binding</th><th className="p-3">Scopes</th><th className="p-3">Actions</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0">
                <td className="p-3">{r.name}</td>
                <td className="p-3"><Link className="text-primary hover:underline" to={`/studio/avatars/${r.id}`}>Avatar Studio</Link></td>
                <td className="p-3"><StatusBadge value={r.credential?.status ?? "not_credentialed"} /></td>
                <td className="p-3"><StatusBadge value={r.credential?.bindingStatus ?? "na"} /></td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">{(r.credential?.scopes || []).slice(0, 2).map((s) => <ScopeBadge key={s} scope={s} />)}</div>
                </td>
                <td className="p-3">
                  {r.credential ? (
                    <div className="flex gap-1">
                      <button onClick={() => {
                        setLocalCredentials((prev) => prev.map((c) => c.agentId === r.id ? { ...c, status: c.status === "suspended" ? "active" : "suspended" } : c));
                        toast.success(r.credential?.status === "suspended" ? "Credential reactivated." : "Credential suspended.");
                      }} className="rounded bg-secondary px-2 py-1 text-xs">{r.credential?.status === "suspended" ? "Reactivate" : "Suspend"}</button>
                      <button onClick={() => setConfirmRevoke(r.id)} className="rounded bg-destructive/10 px-2 py-1 text-xs text-destructive">Revoke</button>
                      <button onClick={() => { setSelected(r.id); setShowToken(true); }} className="rounded bg-secondary px-2 py-1 text-xs">Re-issue token</button>
                      <button onClick={() => navigate(`/identity/agents/${r.id}`)} className="rounded bg-secondary px-2 py-1 text-xs">View</button>
                    </div>
                  ) : (
                    <button onClick={() => navigate(`/identity/agents/credential/${r.id}`)} className="rounded bg-secondary px-2 py-1 text-xs">Credential</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <BootstrapTokenModal
        open={showToken}
        token="zid_bootstrap_37752112dc174d63a3b495"
        copied={copied}
        onCopiedChange={setCopied}
        onClose={() => {
          setShowToken(false);
          if (selected && !localCredentials.find((c) => c.agentId === selected)) {
            setLocalCredentials((prev) => [...prev, {
              agentId: selected,
              status: "active",
              bindingStatus: "awaiting_binding",
              scopes: ["sign-document", "submit-government-form"],
              validFrom: new Date().toISOString(),
              validTo: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180).toISOString(),
              usageUsed: 0,
              usageLimit: 100,
            }]);
          }
          toast.success("Credential issued.");
          navigate("/identity/agents");
        }}
      />
      <AlertDialog open={!!confirmRevoke} onOpenChange={(o) => !o && setConfirmRevoke(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke credential?</AlertDialogTitle>
            <AlertDialogDescription>This immediately disables sensitive operations for this agent.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (!confirmRevoke) return;
                setLocalCredentials((prev) => prev.map((c) => c.agentId === confirmRevoke ? { ...c, status: "revoked", bindingStatus: "unbound" } : c));
                toast.error("Credential revoked.");
                setConfirmRevoke(null);
              }}
            >
              Revoke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
