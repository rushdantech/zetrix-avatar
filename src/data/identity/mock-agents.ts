import type { AgentCredential } from "@/types/identity";

export const mockAgentCredentials: AgentCredential[] = [
  {
    agentId: "agent_01",
    status: "active",
    bindingStatus: "bound",
    scopes: ["submit-government-form", "sign-document"],
    validFrom: "2026-03-01T00:00:00Z",
    validTo: "2026-12-31T23:59:59Z",
    usageUsed: 23,
    usageLimit: 100,
  },
  {
    agentId: "agent_02",
    status: "active",
    bindingStatus: "bound",
    scopes: ["authorize-payment", "authorize-transaction"],
    validFrom: "2026-02-15T00:00:00Z",
    validTo: "2026-12-31T23:59:59Z",
    usageUsed: 87,
    usageLimit: null,
  },
  {
    agentId: "agent_03",
    status: "active",
    bindingStatus: "awaiting_binding",
    scopes: ["sign-document", "submit-government-form"],
    validFrom: "2026-02-01T00:00:00Z",
    validTo: "2026-10-31T23:59:59Z",
    usageUsed: 12,
    usageLimit: 100,
  },
];
