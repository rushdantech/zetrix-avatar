import type { EnterpriseIdentity } from "@/types/identity";

export const mockEnterpriseIdentity: EnterpriseIdentity = {
  legalName: "Acme Sdn Bhd",
  did: "did:zetrix:enterprise:acme-sdn-bhd:3fca97d1a4e5b88d121113f0",
  status: "active",
  identityType: "SSM Certificate",
  verifiedAt: "2026-01-12T09:00:00Z",
  verificationMethod: "Government API",
  expiryDate: "2027-01-12T09:00:00Z",
};
