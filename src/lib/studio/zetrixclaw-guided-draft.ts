const ZETRIXCLAW_GUIDED_STORAGE_KEY = "zetrix-zetrixclaw-guided-setup";

export type ZetrixClawPersonalityId = "friendly" | "humorous" | "professional";

export type ZetrixClawSkillPackId = "creative-marketing" | "identity-trust" | "global-trade";

export const ZETRIXCLAW_PERSONALITY_LABELS: Record<ZetrixClawPersonalityId, string> = {
  friendly: "Friendly",
  humorous: "Humorous",
  professional: "Professional",
};

export const ZETRIXCLAW_SKILL_PACK_TITLES: Record<ZetrixClawSkillPackId, string> = {
  "creative-marketing": "Creative Marketing",
  "identity-trust": "Identity & Trust",
  "global-trade": "Global Trade & Compliance",
};

export type ZetrixClawGuidedDraft = {
  currentStep: number;
  agentName?: string;
  personalityId?: ZetrixClawPersonalityId | null;
  skillPackIds?: ZetrixClawSkillPackId[];
  updatedAt: number;
};

const SKILL_PACK_IDS = new Set<ZetrixClawSkillPackId>(["creative-marketing", "identity-trust", "global-trade"]);

function parseSkillPackIds(value: unknown): ZetrixClawSkillPackId[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const next = value.filter((x): x is ZetrixClawSkillPackId => typeof x === "string" && SKILL_PACK_IDS.has(x as ZetrixClawSkillPackId));
  return next;
}

export function loadZetrixClawGuidedDraft(): ZetrixClawGuidedDraft | null {
  try {
    const raw = sessionStorage.getItem(ZETRIXCLAW_GUIDED_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ZetrixClawGuidedDraft;
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

export function saveZetrixClawGuidedDraft(
  partial: Partial<Omit<ZetrixClawGuidedDraft, "updatedAt">> & { currentStep?: number },
) {
  const prev = loadZetrixClawGuidedDraft();
  const next: ZetrixClawGuidedDraft = {
    currentStep: partial.currentStep ?? prev?.currentStep ?? 1,
    agentName: partial.agentName !== undefined ? partial.agentName : prev?.agentName,
    personalityId: partial.personalityId !== undefined ? partial.personalityId : prev?.personalityId,
    skillPackIds: partial.skillPackIds !== undefined ? partial.skillPackIds : prev?.skillPackIds,
    updatedAt: Date.now(),
  };
  try {
    sessionStorage.setItem(ZETRIXCLAW_GUIDED_STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function clearZetrixClawGuidedDraft() {
  try {
    sessionStorage.removeItem(ZETRIXCLAW_GUIDED_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
