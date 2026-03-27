export type ActivityOutcome = "ok" | "pending" | "failed";

export interface AgentActivityLine {
  id: string;
  at: string;
  detail: string;
  outcome: ActivityOutcome;
}

const defaultLines: Omit<AgentActivityLine, "id">[] = [
  {
    at: "2026-03-27T09:14:00",
    detail: "Parsed incoming task brief; status OK",
    outcome: "ok",
  },
  {
    at: "2026-03-27T09:16:00",
    detail: "Validated inputs against policy pack v2; passed",
    outcome: "ok",
  },
  {
    at: "2026-03-27T09:22:00",
    detail: "Submitted draft to review queue; awaiting human gate",
    outcome: "pending",
  },
];

/** Per-agent overrides; unknown agents get `defaultLines` with generated ids. */
const byAgentId: Record<string, Omit<AgentActivityLine, "id">[]> = {
  "job-agent": [
    {
      at: "2026-03-27T08:55:00",
      detail: "Ingested CV and preference brief from user upload; checksum OK",
      outcome: "ok",
    },
    {
      at: "2026-03-27T09:02:00",
      detail: "Queried job boards (mock); ranked 12 openings by fit score",
      outcome: "ok",
    },
    ...defaultLines.slice(1),
  ],
  agent_01: [
    {
      at: "2026-03-27T07:30:00",
      detail: "Pulled GL balances for Q1; reconciled to LHDN schema",
      outcome: "ok",
    },
    ...defaultLines,
  ],
  agent_02: [
    {
      at: "2026-03-27T08:40:00",
      detail: "Verified invoice INV-8891 against PO and vendor master",
      outcome: "ok",
    },
    ...defaultLines,
  ],
  agent_03: [
    {
      at: "2026-03-27T06:15:00",
      detail: "Generated BNM quarterly draft; policy lint passed",
      outcome: "ok",
    },
    ...defaultLines,
  ],
};

export function getAgentActivityLines(agentId: string): AgentActivityLine[] {
  const rows = byAgentId[agentId] ?? defaultLines;
  return rows.map((r, i) => ({
    id: `${agentId}-act-${i}`,
    ...r,
  }));
}

export function outcomeLabel(outcome: ActivityOutcome): string {
  if (outcome === "ok") return "OK";
  if (outcome === "pending") return "Pending";
  return "Failed";
}
