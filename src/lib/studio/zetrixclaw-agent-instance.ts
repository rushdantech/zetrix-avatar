import type { StudioEntityEnterprise } from "@/types/studio";
import type { ZetrixClawPersonalityId, ZetrixClawSkillPackId } from "@/lib/studio/zetrixclaw-guided-draft";

const STORAGE_KEY = "zetrix-avatar:zetrixclawAgent";

/** Stable id for the single user ZetrixClaw (merged into agent lists and routes). */
export const ZETRIXCLAW_USER_AGENT_ID = "zetrixclaw-user-agent";

export type ZetrixClawStoredAgent = {
  name: string;
  createdAt: string;
  personalityId: ZetrixClawPersonalityId | null;
  skillPackIds: ZetrixClawSkillPackId[];
  /** Optional custom description shown on profile; defaults to built-in copy when absent. */
  description?: string;
};

export function loadZetrixClawAgentInstance(): ZetrixClawStoredAgent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as ZetrixClawStoredAgent;
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

export function saveZetrixClawAgentInstance(data: ZetrixClawStoredAgent) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

export function clearZetrixClawAgentInstance() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** Default profile description when none is stored. */
export const ZETRIXCLAW_DEFAULT_DESCRIPTION =
  "Preconfigured OpenClaw-based general agent with long-term memory, workspace access, and execution feedback.";

const ZETRIXCLAW_DESCRIPTION = ZETRIXCLAW_DEFAULT_DESCRIPTION;

/** Default display name for a new or restored ZetrixClaw instance. */
export const ZETRIXCLAW_DEFAULT_AGENT_NAME = "MyClaw";

/** Values used when restoring defaults (prototype). */
export function getDefaultRestoredZetrixClawAgent(createdAt: string): ZetrixClawStoredAgent {
  return {
    name: ZETRIXCLAW_DEFAULT_AGENT_NAME,
    createdAt,
    personalityId: "friendly",
    skillPackIds: ["creative-marketing"],
    description: undefined,
  };
}

export function buildZetrixClawEnterpriseEntity(stored: ZetrixClawStoredAgent): StudioEntityEnterprise {
  const now = stored.createdAt || new Date().toISOString();
  const desc = stored.description?.trim();
  return {
    id: ZETRIXCLAW_USER_AGENT_ID,
    type: "enterprise",
    name: stored.name,
    description: desc && desc.length > 0 ? desc : ZETRIXCLAW_DESCRIPTION,
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
