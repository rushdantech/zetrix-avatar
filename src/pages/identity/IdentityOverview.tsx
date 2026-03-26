import { useQuery } from "@tanstack/react-query";
import { IdentityStatusCard } from "@/components/identity/IdentityStatusCard";
import { ActivityFeed } from "@/components/identity/ActivityFeed";
import { DIDDisplay } from "@/components/identity/DIDDisplay";
import { mockEnterpriseIdentity } from "@/data/identity/mock-enterprise";
import { mockIdentityActivity } from "@/data/identity/mock-activity";
import { mockAgentCredentials } from "@/data/identity/mock-agents";
import { mockDelegations } from "@/data/identity/mock-delegations";

export default function IdentityOverview() {
  const { data } = useQuery({
    queryKey: ["identity-overview"],
    queryFn: () => new Promise((resolve) => setTimeout(() => resolve({
      enterprise: mockEnterpriseIdentity,
      activity: mockIdentityActivity,
      credentials: mockAgentCredentials,
      delegations: mockDelegations,
    }), 400)),
  });
  if (!data) return <div className="text-sm text-muted-foreground">Loading identity overview...</div>;
  const pending = data.delegations.filter((d) => d.status === "pending").length;
  return (
    <div className="space-y-4 pb-20 lg:pb-0">
      <div>
        <h1 className="text-2xl font-bold">Digital Assets</h1>
        <p className="text-sm text-muted-foreground">Identity health and credential activity.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <IdentityStatusCard title="Identity status" value="Verified" sub={data.enterprise.legalName} />
        <IdentityStatusCard title="Credentialed agents" value={`${data.credentials.length}`} sub="1 pending · 0 revoked" />
        <IdentityStatusCard title="Pending delegations" value={`${pending}`} sub="1 critical · 2 normal" />
        <IdentityStatusCard title="Monthly operations" value="183 ops" sub="142 presentations · 18 signatures" />
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="mb-2 text-sm font-medium">Enterprise DID</p>
        <DIDDisplay did={data.enterprise.did} />
      </div>
      <div>
        <h2 className="mb-2 text-lg font-semibold">Recent activity</h2>
        <ActivityFeed events={data.activity} />
      </div>
    </div>
  );
}
