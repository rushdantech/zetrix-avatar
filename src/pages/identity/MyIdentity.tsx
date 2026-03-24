import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { DIDDisplay } from "@/components/identity/DIDDisplay";
import { StatusBadge } from "@/components/identity/StatusBadge";
import { CredentialViewer } from "@/components/identity/CredentialViewer";
import { mockEnterpriseIdentity } from "@/data/identity/mock-enterprise";
import { mockZidIdentityCredential } from "@/data/identity/mock-credentials";

export default function MyIdentity() {
  const [hasIdentity] = useState(true);
  const { data } = useQuery({
    queryKey: ["my-identity"],
    queryFn: () => new Promise((resolve) => setTimeout(() => resolve(mockEnterpriseIdentity), 350)),
  });
  if (!data) return <div className="text-sm text-muted-foreground">Loading identity...</div>;
  if (!hasIdentity) return <div className="rounded-xl border border-border bg-card p-6">Apply for Digital Identity wizard placeholder.</div>;
  return (
    <div className="space-y-4 pb-20 lg:pb-0">
      <h1 className="text-2xl font-bold">My Identity</h1>
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-lg font-semibold">{data.legalName}</p>
            <p className="text-xs text-muted-foreground">{data.identityType}</p>
          </div>
          <StatusBadge value="active" />
        </div>
        <div className="mt-3"><DIDDisplay did={data.did} full /></div>
        <div className="mt-3 text-xs text-muted-foreground">
          Verified: {new Date(data.verifiedAt).toLocaleString()} · Method: {data.verificationMethod}
        </div>
        <button className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline">
          View on Zetrix Explorer <ExternalLink className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="mb-2 text-sm font-medium">ZIDIdentity VC</p>
        <CredentialViewer data={mockZidIdentityCredential} />
      </div>
    </div>
  );
}
