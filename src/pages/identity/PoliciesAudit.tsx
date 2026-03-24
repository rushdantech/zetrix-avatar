import { useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockStudioEntities } from "@/data/studio/mock-avatars";
import { mockDelegations } from "@/data/identity/mock-delegations";

export default function PoliciesAudit() {
  const [confirmText, setConfirmText] = useState("");
  const agents = mockStudioEntities.filter((e) => e.type === "enterprise" && e.zid_credentialed);
  return (
    <div className="space-y-4 pb-20 lg:pb-0">
      <h1 className="text-2xl font-bold">Policies & Audit</h1>
      <Tabs defaultValue="policies">
        <TabsList><TabsTrigger value="policies">Policies</TabsTrigger><TabsTrigger value="audit">Audit</TabsTrigger></TabsList>
        <TabsContent value="policies">
          <div className="space-y-3">
            {agents.map((a) => (
              <div key={a.id} className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm font-semibold">{a.name}</p>
                <p className="text-xs text-muted-foreground">Scope policies and thresholds.</p>
                <button onClick={() => toast.success("Policy saved")} className="mt-3 rounded-lg bg-secondary px-3 py-1.5 text-xs">Save Changes</button>
              </div>
            ))}
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
              <p className="text-sm font-semibold text-destructive">Emergency kill switch</p>
              <p className="text-xs text-muted-foreground">Type REVOKE ALL to enable action.</p>
              <input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} className="mt-2 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm" />
              <button disabled={confirmText !== "REVOKE ALL"} onClick={() => toast.error("All agent credentials revoked (mock).")} className="mt-2 rounded-lg bg-destructive px-3 py-2 text-xs text-destructive-foreground disabled:opacity-50">Revoke All Agent Credentials</button>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="audit">
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border text-left text-xs text-muted-foreground"><th className="p-3">Date</th><th className="p-3">Agent</th><th className="p-3">Action</th><th className="p-3">Status</th><th className="p-3">TX Hash</th></tr></thead>
              <tbody>
                {mockDelegations.map((d) => (
                  <tr key={d.id} className="border-b border-border last:border-0">
                    <td className="p-3 text-xs">{new Date(d.requestedAt).toLocaleDateString()}</td>
                    <td className="p-3">{d.agentName}</td>
                    <td className="p-3">{d.action}</td>
                    <td className="p-3">{d.status}</td>
                    <td className="p-3 text-xs">{d.txHash?.slice(0, 12)}...</td>
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
