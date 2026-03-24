import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { mockStudioEntities } from "@/data/studio/mock-avatars";
import { mockAgentCredentials } from "@/data/identity/mock-agents";
import { StatusBadge } from "@/components/identity/StatusBadge";
import { ScopeBadge } from "@/components/identity/ScopeBadge";
import { DIDDisplay } from "@/components/identity/DIDDisplay";

export default function AgentCredentialDetail() {
  const { agentId } = useParams();
  const entity = useMemo(() => mockStudioEntities.find((e) => e.id === agentId), [agentId]);
  const credential = useMemo(() => mockAgentCredentials.find((c) => c.agentId === agentId), [agentId]);

  if (!entity) return <div className="text-sm text-muted-foreground">Agent not found.</div>;

  return (
    <div className="space-y-4 pb-20 lg:pb-0">
      <div className="rounded-xl border border-border bg-card p-5">
        <h1 className="text-2xl font-bold">{entity.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{entity.description}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <StatusBadge value={credential?.status ?? "not_credentialed"} />
          <StatusBadge value={credential?.bindingStatus ?? "na"} />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm font-medium">Agent DID</p>
        <div className="mt-2">
          <DIDDisplay did={`did:zetrix:agent:${entity.id}`} full />
        </div>
        <p className="mt-4 text-sm font-medium">Scopes</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {(credential?.scopes || []).map((scope) => (
            <ScopeBadge key={scope} scope={scope} />
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span>Validity: {credential?.validFrom ? new Date(credential.validFrom).toLocaleDateString() : "—"} - {credential?.validTo ? new Date(credential.validTo).toLocaleDateString() : "—"}</span>
          <span>Usage: {credential?.usageUsed ?? 0} / {credential?.usageLimit ?? "∞"}</span>
        </div>
        <Link to={`/studio/avatars/${entity.id}`} className="mt-4 inline-block text-sm text-primary hover:underline">
          View in Avatar Studio
        </Link>
      </div>
    </div>
  );
}
