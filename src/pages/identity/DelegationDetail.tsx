import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { ExternalLink, Copy } from "lucide-react";
import { toast } from "sonner";
import { mockDelegations } from "@/data/identity/mock-delegations";
import { CredentialViewer } from "@/components/identity/CredentialViewer";
import { DIDDisplay } from "@/components/identity/DIDDisplay";
import { TrustChainDiagram } from "@/components/identity/TrustChainDiagram";
import { StatusBadge } from "@/components/identity/StatusBadge";
import { formatScopeLabel, formatSmartTimestamp } from "@/lib/identity/format";
import { Button } from "@/components/ui/button";
import { mockEnterpriseIdentity } from "@/data/identity/mock-enterprise";

const receiptVc = (item: (typeof mockDelegations)[0]) => ({
  "@context": ["https://www.w3.org/ns/credentials/v2"],
  type: ["VerifiableCredential", "ZIDDelegationReceipt"],
  id: `urn:zid:delegation-receipt:${item.receiptId ?? item.id}`,
  credentialSubject: {
    delegationId: item.id,
    action: item.action,
    actionType: item.actionType,
    agent: item.agentName,
    status: item.status,
  },
  proof: {
    type: "DataIntegrityProof",
    proofValue: "z3d8...mock",
  },
});

export default function DelegationDetail() {
  const { id } = useParams();
  const item = useMemo(() => mockDelegations.find((d) => d.id === id), [id]);
  if (!item) return <div className="text-sm text-muted-foreground">Delegation not found.</div>;

  const payloadHash = "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069";

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div>
        <h1 className="text-2xl font-bold">Delegation receipt</h1>
        <p className="text-sm text-muted-foreground">Full audit view for this delegation request.</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <h2 className="text-sm font-semibold">Request summary</h2>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge value={item.status} />
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium">
              {formatScopeLabel(item.actionType)}
            </span>
          </div>
          <p className="font-medium">{item.action}</p>
          <p className="text-muted-foreground">{item.justification}</p>
          <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
            <p title={item.requestedAt}>
              Requested: {formatSmartTimestamp(item.requestedAt)} ({new Date(item.requestedAt).toISOString()})
            </p>
            <p title={item.expiresAt}>
              Expires: {formatSmartTimestamp(item.expiresAt)}
            </p>
            {item.amount != null && (
              <p className="font-mono text-foreground sm:col-span-2">
                Amount: RM {item.amount.toLocaleString("en-MY", { minimumFractionDigits: 2 })}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <h2 className="text-sm font-semibold">Approval chain</h2>
        <ul className="mt-3 space-y-2 text-sm">
          <li className="flex justify-between gap-2 border-b border-border pb-2">
            <span className="text-muted-foreground">Policy matched</span>
            <span className="font-medium">Enterprise default — high-value payments</span>
          </li>
          <li className="flex justify-between gap-2 border-b border-border pb-2">
            <span className="text-muted-foreground">Approver</span>
            <span>{item.approvedBy ?? "—"}</span>
          </li>
          <li className="flex justify-between gap-2">
            <span className="text-muted-foreground">Decided at</span>
            <span title={item.decidedAt}>{item.decidedAt ? formatSmartTimestamp(item.decidedAt) : "—"}</span>
          </li>
          {item.rejectionReason && (
            <li className="rounded-lg bg-destructive/10 p-2 text-xs text-destructive">{item.rejectionReason}</li>
          )}
        </ul>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <h2 className="text-sm font-semibold">Signature details</h2>
        <p className="mt-2 font-mono text-xs break-all text-muted-foreground">Payload hash: {payloadHash}</p>
        <div className="mt-2">
          <p className="text-xs text-muted-foreground">Signer DID (enterprise)</p>
          <DIDDisplay did={mockEnterpriseIdentity.did} full />
        </div>
      </div>

      <TrustChainDiagram />

      <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <h2 className="text-sm font-semibold">On-chain anchor</h2>
        {item.txHash ? (
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <code className="rounded bg-secondary px-2 py-1 text-xs font-mono">{item.txHash.slice(0, 18)}…</code>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={async () => {
                  await navigator.clipboard.writeText(item.txHash!);
                  toast.info("Copied!");
                }}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Block: 4,821,903 · Network: Zetrix</p>
            <Button type="button" variant="outline" size="sm" className="gap-1" asChild>
              <a href="https://explorer.zetrix.com" target="_blank" rel="noreferrer">
                View on Explorer <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">No on-chain anchor for pending or expired items.</p>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <h2 className="mb-2 text-sm font-semibold">ZIDDelegationReceipt (JSON)</h2>
        <CredentialViewer data={receiptVc(item)} />
      </div>
    </div>
  );
}
