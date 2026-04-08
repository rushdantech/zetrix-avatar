export type StudioEntityType = "individual" | "enterprise";

export type StudioEntityStatus = "draft" | "active" | "published" | "archived";

/** Client-side metadata for files selected for RAG indexing (no server upload in this client). */
export interface RagDocumentItem {
  id: string;
  name: string;
  size: number;
  addedAt: string;
}

export type CustomApiHttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface EnterpriseCustomApiIntegration {
  endpointUrl: string;
  httpMethod: CustomApiHttpMethod;
  /** User-editable integration handler (not executed in the browser). */
  integrationCode: string;
}

export interface EnterpriseAgentDraft {
  name: string;
  description: string;
  agentType:
    | "Internal Operations"
    | "Customer-Facing"
    | "Compliance & Reporting"
    | "Financial Processing"
    | "Custom";
  department?: string;
  capabilities: string[];
  /** Per-capability API key fields (client-side storage). */
  capabilityApiKeys: Record<string, string>;
  /** User requested provider access instead of pasting a key yet. */
  capabilityApiAccessRequested: Record<string, boolean>;
  customApiIntegration: EnterpriseCustomApiIntegration;
  operatingHours: "24/7" | "Business hours only" | "Custom schedule";
  maxConcurrentTasks: number;
  escalationEmail: string;
  setupIdentityNow: boolean;
  selectedScopes: string[];
  validityStart?: string;
  validityEnd?: string;
  /** Optional knowledge base files for task context (metadata only). */
  knowledgebaseDocuments: RagDocumentItem[];
}

/** Mirrors Create Avatar → Avatar (persona + creator setup + RAG). */
export interface IndividualAvatarSetupMock {
  bio: string;
  /** Avatar Setup preset label, if chosen. */
  avatarArchetype?: string;
  audience: string;
  styleTags: string[];
  tonePlayful: number;
  toneBold: number;
  toneWitty: number;
  photoCount: number;
  voiceCloningEnabled: boolean;
  questionnaireAnswers: Record<number, string | string[] | number>;
  ragDocuments: RagDocumentItem[];
  /** Set when user completes MyDigital ID eKYC during avatar creation (mock). */
  mydigitalEkycVerified?: boolean;
  /** Zetrix DID for this avatar (mock issuance after eKYC). */
  zetrixDid?: string;
  /** Mock MyKad VC bound to this avatar after eKYC (view-only in profile). */
  mykadVc?: Record<string, unknown>;
}

/** Mirrors Create Avatar → AI agent wizard fields. */
export interface EnterpriseAgentSetupMock {
  agentType: EnterpriseAgentDraft["agentType"];
  department: string;
  capabilities: string[];
  capabilityApiKeys?: Record<string, string>;
  capabilityApiAccessRequested?: Record<string, boolean>;
  customApiIntegration?: EnterpriseCustomApiIntegration;
  operatingHours: EnterpriseAgentDraft["operatingHours"];
  maxConcurrentTasks: number;
  escalationEmail: string;
  setupIdentityNow: boolean;
  selectedScopes: string[];
  validityStart: string;
  validityEnd: string;
  knowledgebaseDocuments: RagDocumentItem[];
}

interface StudioEntityBase {
  id: string;
  name: string;
  description: string;
  status: StudioEntityStatus;
  image: string | null;
  created_at: string;
  published_at: string | null;
  /** @deprecated Prefer marketplace_active_subscriptions for UI. */
  marketplace_downloads: number;
  /** Active marketplace subscriptions (users or orgs using this listing). */
  marketplace_active_subscriptions?: number;
  zid_credentialed: boolean;
  zid_status?: "active" | "suspended" | "revoked";
  zid_scopes?: string[];
}

export type StudioEntityIndividual = StudioEntityBase & {
  type: "individual";
  individualSetup: IndividualAvatarSetupMock;
};

export type StudioEntityEnterprise = StudioEntityBase & {
  type: "enterprise";
  enterpriseSetup: EnterpriseAgentSetupMock;
};

export type StudioEntity = StudioEntityIndividual | StudioEntityEnterprise;

/** Locked task brief from Agent Studio task chat (operator lock-in). */
export interface LockedAgentTaskBrief {
  id: string;
  agentId: string;
  title: string;
  summary: string;
  lockedAt: string;
}
