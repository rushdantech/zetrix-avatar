import type { MsgAgentPlan } from "@/lib/studio/avatarclaw-runtime-sessions";

export type LongMockVariant = 1 | 2 | 3;

/** Dev-only oversized agent_plan fields for overflow QA (no thread shape change). */
export function buildLongMockAgentPlanFields(
  userGoal: string,
  skillsLine: string,
  variant: LongMockVariant = 1,
): Omit<MsgAgentPlan, "id" | "kind"> {
  const filler = (title: string, n: number) =>
    `${title}\n${Array.from({ length: n }, (_, i) => `${i + 1}. Lorem ipsum dolor sit amet — ${userGoal.slice(0, 48)}… (${i + 1})`).join("\n")}`;

  const shapes: Record<LongMockVariant, { brief: number; plan: number; readiness: number; next: number; tag: string }> = {
    1: { brief: 18, plan: 22, readiness: 14, next: 12, tag: "v1" },
    2: { brief: 26, plan: 16, readiness: 20, next: 18, tag: "v2" },
    3: { brief: 14, plan: 32, readiness: 11, next: 24, tag: "v3" },
  };
  const s = shapes[variant];

  return {
    brief: filler(`Brief (${s.tag})`, s.brief),
    plan: filler(`Plan (${s.tag})`, s.plan),
    status: `Ready for confirmation (long mock ${variant})`,
    skills: skillsLine,
    readiness: filler(`Readiness (${s.tag})`, s.readiness),
    nextSteps: filler(`Next steps (${s.tag})`, s.next),
  };
}
