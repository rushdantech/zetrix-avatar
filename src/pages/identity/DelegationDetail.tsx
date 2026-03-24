import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { mockDelegations } from "@/data/identity/mock-delegations";
import { CredentialViewer } from "@/components/identity/CredentialViewer";
import { DIDDisplay } from "@/components/identity/DIDDisplay";

export default function DelegationDetail() {
  const { id } = useParams();
  const item = useMemo(() => mockDelegations.find((d) => d.id === id), [id]);
  if (!item) return <div className="text-sm text-muted-foreground">Delegation not found.</div>;
  return (
    <div className="space-y-4 pb-20 lg:pb-0">
      <h1 className="text-2xl font-bold">Delegation Receipt</h1>
      <div className="rounded-xl border border-border bg-card p-5 text-sm">
        <p className="font-medium">{item.action}</p>
        <p className="text-muted-foreground">{item.justification}</p>
        <p className="mt-2 text-xs text-muted-foreground">Agent: {item.agentName}</p>
        {item.txHash && <DIDDisplay did={item.txHash} full />}
      </div>
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="mb-2 text-sm font-medium">ZIDDelegationReceipt VC</p>
        <CredentialViewer data={item} />
      </div>
    </div>
  );
}
