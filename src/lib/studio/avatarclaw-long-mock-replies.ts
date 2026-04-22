import type { MsgAgentPlan } from "@/lib/studio/avatarclaw-runtime-sessions";

/** Dev-only: `/long`, `/long2`, `/long3` — distinct shapes so overflow QA covers different sections. */
export type LongMockVariant = 1 | 2 | 3;

/** Extra copy when `/long` variants are used so the response panel overflows for QA. */
export function buildLongMockAgentPlanFields(
  userGoal: string,
  skillsLine: string,
  variant: LongMockVariant = 1,
): Omit<MsgAgentPlan, "id" | "kind"> {
  const filler = (title: string, n: number) =>
    `${title}\n${Array.from({ length: n }, (_, i) => `${i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit — ${userGoal.slice(0, 40)}… (line ${i + 1})`).join("\n")}`;

  const shapes: Record<
    LongMockVariant,
    { brief: number; plan: number; readiness: number; next: number; label: string }
  > = {
    1: { brief: 18, plan: 22, readiness: 14, next: 12, label: "variant-1" },
    2: { brief: 26, plan: 16, readiness: 20, next: 18, label: "variant-2" },
    3: { brief: 14, plan: 32, readiness: 11, next: 24, label: "variant-3" },
  };
  const s = shapes[variant];

  return {
    brief: filler(`Brief (mock · long · ${s.label})`, s.brief),
    plan: filler(`Plan (mock · long · ${s.label})`, s.plan),
    status: `Ready for confirmation (long mock ${variant})`,
    skills: skillsLine,
    readiness: filler(`Readiness (mock · long · ${s.label})`, s.readiness),
    nextSteps: filler(`Next steps (mock · long · ${s.label})`, s.next),
  };
}
