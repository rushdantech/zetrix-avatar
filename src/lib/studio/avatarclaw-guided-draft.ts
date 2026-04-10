const AVATARCLAW_GUIDED_STORAGE_KEY = "zetrix-zetrixclaw-guided-setup";

export type AvatarClawPersonalityId = "friendly" | "humorous" | "professional";

export type AvatarClawSkillPackId = "creative-marketing" | "identity-trust" | "global-trade";

export const AVATARCLAW_PERSONALITY_LABELS: Record<AvatarClawPersonalityId, string> = {
  friendly: "Friendly",
  humorous: "Humorous",
  professional: "Professional",
};

export const AVATARCLAW_SKILL_PACK_TITLES: Record<AvatarClawSkillPackId, string> = {
  "creative-marketing": "Creative Marketing",
  "identity-trust": "Identity & Trust",
  "global-trade": "Global Trade & Compliance",
};

export type AvatarClawGuidedDraft = {
  currentStep: number;
  agentName?: string;
  personalityId?: AvatarClawPersonalityId | null;
  skillPackIds?: AvatarClawSkillPackId[];
  updatedAt: number;
};

const SKILL_PACK_IDS = new Set<AvatarClawSkillPackId>(["creative-marketing", "identity-trust", "global-trade"]);

function parseSkillPackIds(value: unknown): AvatarClawSkillPackId[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const next = value.filter((x): x is AvatarClawSkillPackId => typeof x === "string" && SKILL_PACK_IDS.has(x as AvatarClawSkillPackId));
  return next;
}

export function loadAvatarClawGuidedDraft(): AvatarClawGuidedDraft | null {
  try {
    const raw = sessionStorage.getItem(AVATARCLAW_GUIDED_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AvatarClawGuidedDraft;
    if (typeof parsed.currentStep !== "number" || parsed.currentStep < 1 || parsed.currentStep > 5) {
      return null;
    }
    const personalityId =
      parsed.personalityId === null
        ? null
        : parsed.personalityId === "friendly" || parsed.personalityId === "humorous" || parsed.personalityId === "professional"
          ? parsed.personalityId
          : undefined;
    return {
      currentStep: parsed.currentStep,
      agentName: typeof parsed.agentName === "string" ? parsed.agentName : undefined,
      personalityId,
      skillPackIds: parseSkillPackIds(parsed.skillPackIds),
      updatedAt: typeof parsed.updatedAt === "number" ? parsed.updatedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

export function saveAvatarClawGuidedDraft(
  partial: Partial<Omit<AvatarClawGuidedDraft, "updatedAt">> & { currentStep?: number },
) {
  const prev = loadAvatarClawGuidedDraft();
  const next: AvatarClawGuidedDraft = {
    currentStep: partial.currentStep ?? prev?.currentStep ?? 1,
    agentName: partial.agentName !== undefined ? partial.agentName : prev?.agentName,
    personalityId: partial.personalityId !== undefined ? partial.personalityId : prev?.personalityId,
    skillPackIds: partial.skillPackIds !== undefined ? partial.skillPackIds : prev?.skillPackIds,
    updatedAt: Date.now(),
  };
  try {
    sessionStorage.setItem(AVATARCLAW_GUIDED_STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function clearAvatarClawGuidedDraft() {
  try {
    sessionStorage.removeItem(AVATARCLAW_GUIDED_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
