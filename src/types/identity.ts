export type CredentialStatus =
  | "not_credentialed"
  | "active"
  | "suspended"
  | "revoked";

export type BindingStatus = "bound" | "awaiting_binding" | "unbound" | "na";

export type DelegationStatus = "pending" | "approved" | "rejected" | "expired";

export type DelegationUrgency = "critical" | "high" | "normal";

export interface EnterpriseIdentity {
  legalName: string;
  did: string;
  status: "active" | "verification_in_progress";
  identityType: "MyKad" | "Passport" | "SSM Certificate" | "Business Registration";
  verifiedAt: string;
  verificationMethod: string;
  expiryDate: string;
}

export interface AgentCredential {
  agentId: string;
  status: CredentialStatus;
  bindingStatus: BindingStatus;
  scopes: string[];
  validFrom?: string;
  validTo?: string;
  usageUsed?: number;
  usageLimit?: number | null;
}

export interface DelegationRequest {
  id: string;
  agentId: string;
  agentName: string;
  action: string;
  actionType: string;
  justification: string;
  amount?: number;
  urgency: DelegationUrgency;
  requestedAt: string;
  expiresAt: string;
  status: DelegationStatus;
  decidedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  receiptId?: string;
  txHash?: string;
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  agentName: string;
  eventType: string;
  status: "success" | "pending" | "failed";
  description: string;
}
