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
  const personalIdentity = {
    fullName: "Rushdan Ahmad",
    did: "did:zetrix:person:rushdan-ahmad:9a8b7c6d5e4f3210abcd1234",
    verifiedAt: "2026-01-12T09:00:00Z",
    verificationMethod: "Government API",
    credential: {
      "@context": ["https://www.w3.org/ns/credentials/v2"],
      type: ["VerifiableCredential", "ZIDIdentityCredential"],
      issuer: "did:zetrix:authority:malaysia-zid",
      credentialSubject: {
        id: "did:zetrix:person:rushdan-ahmad:9a8b7c6d5e4f3210abcd1234",
        fullName: "Rushdan Ahmad",
        primaryDocument: "MyKad",
        secondaryDocument: "Passport",
      },
      issuanceDate: "2026-01-12T09:00:00Z",
      expirationDate: "2027-01-12T09:00:00Z",
    },
  };
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
            <p className="text-lg font-semibold">Personal Identity</p>
            <p className="text-xs text-muted-foreground">{personalIdentity.fullName}</p>
          </div>
          <StatusBadge value="active" />
        </div>
        <div className="mt-3"><DIDDisplay did={personalIdentity.did} full /></div>
        <div className="mt-3 text-xs text-muted-foreground">
          Verified: {new Date(personalIdentity.verifiedAt).toLocaleString()} · Method: {personalIdentity.verificationMethod}
        </div>
        <button className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline">
          View on Zetrix Explorer <ExternalLink className="h-3.5 w-3.5" />
        </button>
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium">Identity VC</p>
          <CredentialViewer data={personalIdentity.credential} />
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-lg font-semibold">Enterprise Identity</p>
            <p className="text-xs text-muted-foreground">{data.legalName}</p>
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
        <p className="mb-2 text-sm font-medium">Identity VC</p>
        <CredentialViewer data={mockZidIdentityCredential} />
      </div>
    </div>
  );
}
