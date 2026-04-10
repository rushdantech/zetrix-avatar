/**
 * AvatarClaw runtime chat: multi-session mock state (localStorage + seed).
 */

export type MsgIntro = { id: string; kind: "intro"; text: string };
export type MsgUserTask = {
  id: string;
  kind: "user_task";
  goal: string;
  constraints: string;
  deadline: string;
  notes: string;
};
export type MsgAgentPlan = {
  id: string;
  kind: "agent_plan";
  brief: string;
  plan: string;
  status: string;
  skills: string;
  readiness: string;
  nextSteps: string;
};

export type ZcChatMessage = MsgIntro | MsgUserTask | MsgAgentPlan;

export type ZcRuntimeSession = {
  id: string;
  title: string;
  updatedAt: string;
  messages: ZcChatMessage[];
};

const STORAGE_SESSIONS = "zetrix-avatar:zetrixclawRuntimeSessions";
const STORAGE_ACTIVE = "zetrix-avatar:zetrixclawActiveSessionId";

export const ZC_INTRO_TEMPLATE =
  "You're connected to MyClaw. Describe tasks, constraints, and deadlines. I'll reply with a structured brief. When it looks right, tap Lock In to commit it for execution.";

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function formatSessionListTime(iso: string): string {
  try {
    const d = new Date(iso);
    const datePart = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    const timePart = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    return `${datePart} · ${timePart}`;
  } catch {
    return "";
  }
}

/** Short title from first user message (auto-naming). */
export function deriveTitleFromGoal(goal: string): string {
  const t = goal.trim().replace(/\s+/g, " ");
  if (!t) return "New conversation";
  const words = t.split(" ").slice(0, 6);
  let s = words.join(" ");
  if (s.length > 48) s = `${s.slice(0, 45).trim()}…`;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function previewFromMessages(messages: ZcChatMessage[]): string {
  const firstUser = messages.find((m): m is MsgUserTask => m.kind === "user_task");
  if (firstUser) {
    const g = firstUser.goal.trim();
    return g.length > 72 ? `${g.slice(0, 69)}…` : g;
  }
  const intro = messages.find((m): m is MsgIntro => m.kind === "intro");
  if (intro) {
    const t = intro.text.replace(/\bMyClaw\b/g, "Agent").trim();
    return t.length > 72 ? `${t.slice(0, 69)}…` : t;
  }
  return "";
}

export function createIntroMessage(introText: string): MsgIntro {
  return { id: `intro-${uid()}`, kind: "intro", text: introText };
}

function seedSessions(introText: string): { sessions: ZcRuntimeSession[]; activeId: string } {
  const s1: ZcRuntimeSession = {
    id: "session-seed-malaysia",
    title: "Malaysia regulation brief",
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    messages: [
      createIntroMessage(introText),
      {
        id: "u1",
        kind: "user_task",
        goal: "Summarize Malaysia cross-border data rules for our launch",
        constraints: "None",
        deadline: "Apr 10",
        notes: "Workspace-linked task from chat runtime",
      },
      {
        id: "a1",
        kind: "agent_plan",
        brief: "Objective: Malaysia cross-border data compliance summary for product launch.",
        plan: "• Map PDPA / sector notices\n• Pull prompts/compliance skill\n• Draft checklist for legal review",
        status: "Plan drafted — awaiting Lock In",
        skills: "compliance-scan, workspace-read",
        readiness:
          "Structured plan generated. I can align with memory/ and skills/ before you lock execution.",
        nextSteps: "Confirm with Lock In or add jurisdiction constraints.",
      },
    ],
  };
  const s2: ZcRuntimeSession = {
    id: "session-seed-workflow",
    title: "Workflow redesign",
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
    messages: [
      createIntroMessage(introText),
      {
        id: "u2",
        kind: "user_task",
        goal: "Redesign onboarding workflow for enterprise trials",
        constraints: "Sales-led",
        deadline: "Next sprint",
        notes: "Follow-up from chat runtime",
      },
      {
        id: "a2",
        kind: "agent_plan",
        brief: "Objective: Enterprise onboarding workflow redesign.",
        plan: "• Audit current steps\n• Propose staged gates\n• Match skills for automation",
        status: "Ready for confirmation",
        skills: "task-planning, workspace-read",
        readiness: "Plan ready; workspace files can be referenced on lock.",
        nextSteps: "Lock In to commit or revise scope.",
      },
    ],
  };
  return { sessions: [s1, s2], activeId: s1.id };
}

export function loadPersistedRuntimeSessions(introText: string): {
  sessions: ZcRuntimeSession[];
  activeId: string;
} {
  try {
    const raw = localStorage.getItem(STORAGE_SESSIONS);
    const activeStored = localStorage.getItem(STORAGE_ACTIVE);
    if (!raw) return seedSessions(introText);
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) return seedSessions(introText);
    const sessions = parsed as ZcRuntimeSession[];
    const activeId =
      activeStored && sessions.some((s) => s.id === activeStored) ? activeStored : sessions[0].id;
    return { sessions, activeId };
  } catch {
    return seedSessions(introText);
  }
}

export function persistRuntimeSessions(sessions: ZcRuntimeSession[], activeId: string) {
  try {
    localStorage.setItem(STORAGE_SESSIONS, JSON.stringify(sessions));
    localStorage.setItem(STORAGE_ACTIVE, activeId);
  } catch {
    /* ignore */
  }
}
