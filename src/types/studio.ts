export type StudioEntityType = "individual" | "enterprise";

export type StudioEntityStatus = "draft" | "active" | "published" | "archived";

/** Client-side metadata for files selected for RAG indexing (prototype; no real upload). */
export interface RagDocumentItem {
  id: string;
  name: string;
  size: number;
  addedAt: string;
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
  operatingHours: "24/7" | "Business hours only" | "Custom schedule";
  maxConcurrentTasks: number;
  escalationEmail: string;
  setupIdentityNow: boolean;
  selectedScopes: string[];
  validityStart?: string;
  validityEnd?: string;
}

/** Mirrors Create Avatar → Individual (persona + creator setup + RAG). */
export interface IndividualAvatarSetupMock {
  bio: string;
  audience: string;
  styleTags: string[];
  tonePlayful: number;
  toneBold: number;
  toneWitty: number;
  photoCount: number;
  voiceCloningEnabled: boolean;
  questionnaireAnswers: Record<number, string | string[] | number>;
  ragDocuments: RagDocumentItem[];
}

/** Mirrors Create Avatar → Enterprise wizard fields. */
export interface EnterpriseAgentSetupMock {
  agentType: EnterpriseAgentDraft["agentType"];
  department: string;
  capabilities: string[];
  operatingHours: EnterpriseAgentDraft["operatingHours"];
  maxConcurrentTasks: number;
  escalationEmail: string;
  setupIdentityNow: boolean;
  selectedScopes: string[];
  validityStart: string;
  validityEnd: string;
}

interface StudioEntityBase {
  id: string;
  name: string;
  description: string;
  status: StudioEntityStatus;
  image: string | null;
  created_at: string;
  published_at: string | null;
  marketplace_downloads: number;
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
