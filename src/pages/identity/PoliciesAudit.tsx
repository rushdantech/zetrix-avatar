import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mockStudioEntities } from "@/data/studio/mock-avatars";
import { mockDelegations } from "@/data/identity/mock-delegations";
import { PolicyEditor, type ScopePolicyRow } from "@/components/identity/PolicyEditor";
import { StatusBadge } from "@/components/identity/StatusBadge";
import { Copy } from "lucide-react";
import { ZID_ACTION_SCOPES } from "@/lib/identity/constants";

function rowsForAgent(scopes: string[] | undefined): ScopePolicyRow[] {
  const list = scopes?.length ? scopes : [...ZID_ACTION_SCOPES];
  return list.map((scopeKey) => ({
    scopeKey,
    autoApprove: scopeKey === "submit-government-form",
    paymentThresholdRm: scopeKey.includes("payment") ? "50000" : "",
    counterpartyWhitelist: "",
  }));
}

export default function PoliciesAudit() {
  const [confirmText, setConfirmText] = useState("");
  const [defaultPolicy, setDefaultPolicy] = useState<"require" | "auto">("require");
  const [auditFrom, setAuditFrom] = useState("");
  const [auditTo, setAuditTo] = useState("");
  const [notif, setNotif] = useState({ push: true, email: true, sms: false });

  const agents = useMemo(
    () => mockStudioEntities.filter((e) => e.type === "enterprise" && e.zid_credentialed),
    [],
  );

  const filteredAudit = useMemo(() => {
    return mockDelegations.filter((d) => {
      const t = new Date(d.requestedAt).getTime();
      if (auditFrom && t < new Date(auditFrom).getTime()) return false;
      if (auditTo && t > new Date(auditTo).getTime() + 86400000) return false;
      return true;
    });
  }, [auditFrom, auditTo]);

  return (
    <div className="space-y-4 pb-20 lg:pb-0">
      <h1 className="text-2xl font-bold">Policies &amp; Audit</h1>
      <Tabs defaultValue="policies">
        <TabsList>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
        </TabsList>
        <TabsContent value="policies" className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4 shadow-card">
            <p className="text-sm font-semibold">Global controls</p>
            <div className="mt-3 space-y-3">
              <div>
                <Label className="text-xs">Default policy for new agents</Label>
                <div className="mt-2 flex flex-wrap gap-3 text-sm">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="defpol"
                      checked={defaultPolicy === "require"}
                      onChange={() => setDefaultPolicy("require")}
                      className="accent-primary"
                    />
                    Require approval for all
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="defpol"
                      checked={defaultPolicy === "auto"}
                      onChange={() => setDefaultPolicy("auto")}
                      className="accent-primary"
                    />
                    Auto-approve within limits
                  </label>
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Notifications by urgency</p>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 text-xs">
                    <Switch checked={notif.push} onCheckedChange={(v) => setNotif((n) => ({ ...n, push: v }))} />
                    Push
                  </label>
                  <label className="flex items-center gap-2 text-xs">
                    <Switch checked={notif.email} onCheckedChange={(v) => setNotif((n) => ({ ...n, email: v }))} />
                    Email
                  </label>
                  <label className="flex items-center gap-2 text-xs">
                    <Switch checked={notif.sms} onCheckedChange={(v) => setNotif((n) => ({ ...n, sms: v }))} />
                    SMS
                  </label>
                </div>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => toast.success("Global preferences saved.")}
              >
                Save global preferences
              </Button>
            </div>
          </div>

          {agents.map((a) => (
            <PolicyEditor
              key={a.id}
              agentName={a.name}
              agentStatus={a.zid_status ?? "active"}
              initialRows={rowsForAgent(a.zid_scopes)}
              onSave={() => {}}
            />
          ))}

          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            <p className="text-sm font-semibold text-destructive">Emergency kill switch</p>
            <p className="text-xs text-muted-foreground">Type REVOKE ALL to enable the confirm button.</p>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="mt-2 max-w-md"
              placeholder="REVOKE ALL"
            />
            <Button
              type="button"
              disabled={confirmText !== "REVOKE ALL"}
              variant="destructive"
              className="mt-3"
              onClick={() => toast.error("All agent credentials revoked.")}
            >
              Revoke All Agent Credentials
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="audit" className="space-y-4">
          <div className="flex flex-wrap items-end gap-2">
            <div>
              <Label className="text-xs">From</Label>
              <Input type="date" className="mt-1" value={auditFrom} onChange={(e) => setAuditFrom(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">To</Label>
              <Input type="date" className="mt-1" value={auditTo} onChange={(e) => setAuditTo(e.target.value)} />
            </div>
            <Button
              type="button"
              variant="outline"
              className="mb-0.5"
              onClick={() =>
                toast.success(`Exported ${filteredAudit.length} records to CSV.`, { duration: 4000 })
              }
            >
              Export CSV
            </Button>
          </div>
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="p-3">Date</th>
                  <th className="p-3">Agent</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Receipt</th>
                  <th className="p-3">Zetrix TX</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {filteredAudit.map((d) => (
                  <tr key={d.id} className="border-b border-border last:border-0">
                    <td className="p-3 text-xs">{new Date(d.requestedAt).toLocaleString()}</td>
                    <td className="p-3">{d.agentName}</td>
                    <td className="p-3 max-w-[200px] truncate" title={d.action}>
                      {d.action}
                    </td>
                    <td className="p-3">
                      <StatusBadge value={d.status} />
                    </td>
                    <td className="p-3 font-mono text-xs">{d.receiptId ?? "—"}</td>
                    <td className="p-3">
                      {d.txHash ? (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 font-mono text-xs text-primary hover:underline"
                          onClick={async () => {
                            await navigator.clipboard.writeText(d.txHash!);
                            toast.info("Copied!");
                          }}
                        >
                          {d.txHash.slice(0, 10)}…
                          <Copy className="h-3 w-3" />
                        </button>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="p-3">
                      <Link to={`/identity/delegations/${d.id}`} className="text-xs text-primary hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
