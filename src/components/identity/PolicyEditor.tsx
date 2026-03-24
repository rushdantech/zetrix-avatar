import { useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "./StatusBadge";
import { formatScopeLabel } from "@/lib/identity/format";
import { cn } from "@/lib/utils";

export interface ScopePolicyRow {
  scopeKey: string;
  autoApprove: boolean;
  paymentThresholdRm?: string;
  counterpartyWhitelist?: string;
}

export function PolicyEditor({
  agentName,
  agentStatus,
  initialRows,
  onSave,
}: {
  agentName: string;
  agentStatus: string;
  initialRows: ScopePolicyRow[];
  onSave: (rows: ScopePolicyRow[]) => void;
}) {
  const [rows, setRows] = useState<ScopePolicyRow[]>(initialRows);
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="rounded-xl border border-border bg-card shadow-card">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between gap-2 p-4 text-left"
      >
        <div>
          <p className="text-sm font-semibold">{agentName}</p>
          <StatusBadge value={agentStatus} />
        </div>
        <span className="text-xs text-muted-foreground">{expanded ? "Collapse" : "Expand"}</span>
      </button>
      {expanded && (
        <div className="space-y-4 border-t border-border px-4 pb-4 pt-3">
          {rows.map((row, idx) => (
            <div key={row.scopeKey} className="rounded-lg border border-border bg-secondary/40 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium">{formatScopeLabel(row.scopeKey)}</p>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-xs",
                      row.autoApprove ? "text-success" : "text-warning",
                    )}
                  >
                    {row.autoApprove ? "Auto-approve" : "Require approval"}
                  </span>
                  <Switch
                    checked={row.autoApprove}
                    onCheckedChange={(v) =>
                      setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, autoApprove: v } : r)))
                    }
                  />
                </div>
              </div>
              {row.autoApprove && (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs">Payment cap (RM)</Label>
                    <Input
                      className="mt-1"
                      value={row.paymentThresholdRm ?? ""}
                      placeholder="e.g. 50000"
                      onChange={(e) =>
                        setRows((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, paymentThresholdRm: e.target.value } : r)),
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Counterparty whitelist (comma-separated)</Label>
                    <Input
                      className="mt-1"
                      value={row.counterpartyWhitelist ?? ""}
                      placeholder="vendor-a.com, bank-xyz.my"
                      onChange={(e) =>
                        setRows((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, counterpartyWhitelist: e.target.value } : r)),
                        )
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              onSave(rows);
              toast.success("Policy saved for this agent.");
            }}
            className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}
