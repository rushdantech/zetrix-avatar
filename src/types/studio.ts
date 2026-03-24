export type StudioEntityType = "individual" | "enterprise";

export type StudioEntityStatus = "draft" | "active" | "published" | "archived";

export interface StudioEntity {
  id: string;
  name: string;
  type: StudioEntityType;
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

export interface IndividualAvatarDraft {
  name: string;
  tagline: string;
  fullDescription?: string;
  personalityTraits: string[];
  communicationStyle: "Casual" | "Semi-formal" | "Formal";
  languages: string[];
  knowledgeDomains: string[];
  conversationStarters: string[];
  themeColor: string;
  voiceStyle: "Warm" | "Energetic" | "Calm" | "Authoritative";
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
