import { Link, useNavigate } from "react-router-dom";
import { studioEntityPath } from "@/lib/studio/studio-paths";
import { ScopeBadge } from "@/components/identity/ScopeBadge";
import { StatusBadge } from "@/components/identity/StatusBadge";
import type { StudioEntity } from "@/types/studio";
import type { AgentCredential } from "@/types/identity";

export type AgentCredentialTableRow = StudioEntity & { credential?: AgentCredential };

export function AgentCredentialTable({
  rows,
  onSuspendToggle,
  onRevoke,
  onReissueToken,
  onOpenWizard,
}: {
  rows: AgentCredentialTableRow[];
  onSuspendToggle: (agentId: string, currentlySuspended: boolean) => void;
  onRevoke: (agentId: string) => void;
  onReissueToken: (agentId: string) => void;
  onOpenWizard: (agentId: string) => void;
}) {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-foreground">
            <th className="p-3">Agent</th>
            <th className="p-3">Source</th>
            <th className="p-3">Credential</th>
            <th className="p-3">Binding</th>
            <th className="p-3">Scopes</th>
            <th className="p-3">Validity</th>
            <th className="p-3">Usage</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const c = r.credential;
            const more = (c?.scopes?.length ?? 0) > 2 ? (c!.scopes!.length - 2) : 0;
            return (
              <tr key={r.id} className="border-b border-border last:border-0">
                <td className="p-3">
                  <div className="font-medium">{r.name}</div>
                  <span
                    className={
                      r.type === "individual"
                        ? "mt-1 inline-block rounded-full bg-purple-500/15 px-2 py-0.5 text-[10px] font-medium text-purple-700 dark:text-purple-300"
                        : "mt-1 inline-block rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:text-blue-300"
                    }
                  >
                    {r.type === "individual" ? "Avatar" : "AI agent"}
                  </span>
                </td>
                <td className="p-3">
                  <Link className="text-primary hover:underline" to={studioEntityPath(r)}>
                    {r.type === "individual" ? "Avatar Studio" : "Agent Studio"}
                  </Link>
                </td>
                <td className="p-3">
                  <StatusBadge value={c?.status ?? "not_credentialed"} />
                </td>
                <td className="p-3">
                  <StatusBadge value={c?.bindingStatus ?? "na"} />
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {(c?.scopes ?? []).slice(0, 2).map((s) => (
                      <ScopeBadge key={s} scope={s} />
                    ))}
                    {more > 0 && (
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                        +{more} more
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-3 text-xs text-muted-foreground">
                  {c?.validFrom && c?.validTo ? (
                    <span>
                      {new Date(c.validFrom).toLocaleDateString()} – {new Date(c.validTo).toLocaleDateString()}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="p-3 text-xs">
                  {c ? (
                    <div className="space-y-1">
                      <span>
                        {c.usageUsed ?? 0} / {c.usageLimit ?? "∞"}
                      </span>
                      {c.usageLimit != null && (
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full bg-primary"
                            style={{
                              width: `${Math.min(100, ((c.usageUsed ?? 0) / c.usageLimit) * 100)}%`,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="p-3">
                  {c ? (
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        onClick={() => onSuspendToggle(r.id, c.status === "suspended")}
                        className="rounded bg-secondary px-2 py-1 text-xs"
                      >
                        {c.status === "suspended" ? "Reactivate" : "Suspend"}
                      </button>
                      <button type="button" onClick={() => onRevoke(r.id)} className="rounded bg-destructive/10 px-2 py-1 text-xs text-destructive">
                        Revoke
                      </button>
                      <button type="button" onClick={() => onReissueToken(r.id)} className="rounded bg-secondary px-2 py-1 text-xs">
                        Re-issue token
                      </button>
                      <button type="button" onClick={() => navigate(`/identity/agents/${r.id}`)} className="rounded bg-secondary px-2 py-1 text-xs">
                        View
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => onOpenWizard(r.id)} className="rounded bg-secondary px-2 py-1 text-xs">
                      Credential
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
