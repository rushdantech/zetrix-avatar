import type { StudioEntityEnterprise } from "@/types/studio";
import type { AvatarClawPersonalityId, AvatarClawSkillPackId } from "@/lib/studio/avatarclaw-guided-draft";

const STORAGE_KEY = "zetrix-avatar:zetrixclawAgent";

/** Stable id for the single user AvatarClaw (merged into agent lists and routes). */
export const AVATARCLAW_USER_AGENT_ID = "zetrixclaw-user-agent";

export type AvatarClawStoredAgent = {
  name: string;
  createdAt: string;
  personalityId: AvatarClawPersonalityId | null;
  skillPackIds: AvatarClawSkillPackId[];
  /** Optional custom description shown on profile; defaults to built-in copy when absent. */
  description?: string;
};

export function loadAvatarClawAgentInstance(): AvatarClawStoredAgent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as AvatarClawStoredAgent;
    if (typeof p.name !== "string" || typeof p.createdAt !== "string") return null;
    return {
      name: p.name.trim() || "MyClaw",
      createdAt: p.createdAt,
      personalityId:
        p.personalityId === null || p.personalityId === "friendly" || p.personalityId === "humorous" || p.personalityId === "professional"
          ? p.personalityId
          : null,
      skillPackIds: Array.isArray(p.skillPackIds) ? p.skillPackIds : [],
      description: typeof p.description === "string" ? p.description : undefined,
    };
  } catch {
    return null;
  }
}

export function saveAvatarClawAgentInstance(data: AvatarClawStoredAgent) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

export function clearAvatarClawAgentInstance() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** Default profile description when none is stored. */
export const AVATARCLAW_DEFAULT_DESCRIPTION =
  "Preconfigured OpenClaw-based general agent with long-term memory, workspace access, and execution feedback.";

const AVATARCLAW_DESCRIPTION = AVATARCLAW_DEFAULT_DESCRIPTION;

/** Default display name for a new or restored AvatarClaw instance. */
export const AVATARCLAW_DEFAULT_AGENT_NAME = "MyClaw";

/** Values used when restoring defaults (prototype). */
export function getDefaultRestoredAvatarClawAgent(createdAt: string): AvatarClawStoredAgent {
  return {
    name: AVATARCLAW_DEFAULT_AGENT_NAME,
    createdAt,
    personalityId: "friendly",
    skillPackIds: ["creative-marketing"],
    description: undefined,
  };
}

export function buildAvatarClawEnterpriseEntity(stored: AvatarClawStoredAgent): StudioEntityEnterprise {
  const now = stored.createdAt || new Date().toISOString();
  const desc = stored.description?.trim();
  return {
    id: AVATARCLAW_USER_AGENT_ID,
    type: "enterprise",
    name: stored.name,
    description: desc && desc.length > 0 ? desc : AVATARCLAW_DESCRIPTION,
    status: "active",
    image: null,
    created_at: now,
    published_at: null,
    marketplace_downloads: 0,
    marketplace_active_subscriptions: 0,
    zid_credentialed: false,
    enterpriseSetup: {
      agentType: "Custom",
      department: "General",
      capabilities: ["custom-api"],
      operatingHours: "24/7",
      maxConcurrentTasks: 8,
      escalationEmail: "",
      setupIdentityNow: false,
      selectedScopes: [],
      validityStart: new Date().toISOString().slice(0, 10),
      validityEnd: "2027-12-31",
      knowledgebaseDocuments: [],
    },
  };
}
