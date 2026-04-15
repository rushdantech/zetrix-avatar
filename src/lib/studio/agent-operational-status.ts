import type { StudioEntityEnterprise } from "@/types/studio";

const STORAGE_KEY = "zetrix-avatar:agentOperationalStatus";

export type AgentOperationalKey = "creating" | "running" | "unavailable" | "degraded" | "stopped";

export const AGENT_OPERATIONAL_LABELS: Record<AgentOperationalKey, string> = {
  creating: "Creating",
  running: "Running",
  unavailable: "Unavailable",
  degraded: "Degraded",
  stopped: "Stopped",
};

export type AgentOperationalVariant = "success" | "warning" | "destructive" | "neutral" | "info";

const KEY_TO_VARIANT: Record<AgentOperationalKey, AgentOperationalVariant> = {
  creating: "warning",
  running: "success",
  unavailable: "destructive",
  degraded: "warning",
  stopped: "neutral",
};

export function operationalVariant(key: AgentOperationalKey): AgentOperationalVariant {
  return KEY_TO_VARIANT[key];
}

/** Baseline from listing data before any refresh override. */
export function defaultOperationalKey(entity: StudioEntityEnterprise): AgentOperationalKey {
  if (entity.status === "draft") return "creating";
  if (entity.status === "archived") return "stopped";
  return "running";
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (raw == null || raw === "") return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadOperationalOverrides(): Partial<Record<string, AgentOperationalKey>> {
  return safeParse<Partial<Record<string, AgentOperationalKey>>>(
    localStorage.getItem(STORAGE_KEY),
    {},
  );
}

export function persistOperationalOverrides(next: Partial<Record<string, AgentOperationalKey>>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

/**
 * Simulated health check after "Refresh Status": mostly Running for active agents,
 * occasional Unavailable/Degraded; draft/archived stay deterministic.
 */
export function computeRefreshedOperationalKey(entity: StudioEntityEnterprise): AgentOperationalKey {
  if (entity.status === "draft") return "creating";
  if (entity.status === "archived") return "stopped";
  const r = Math.random();
  if (r < 0.07) return "unavailable";
  if (r < 0.11) return "degraded";
  return "running";
}

export function resolveOperationalKey(
  entity: StudioEntityEnterprise,
  overrides: Partial<Record<string, AgentOperationalKey>>,
): AgentOperationalKey {
  return overrides[entity.id] ?? defaultOperationalKey(entity);
}
