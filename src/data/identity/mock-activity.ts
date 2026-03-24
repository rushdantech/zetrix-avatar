import type { ActivityEvent } from "@/types/identity";

export const mockIdentityActivity: ActivityEvent[] = [
  {
    id: "act_1",
    timestamp: "2026-03-24T07:25:00Z",
    agentName: "Tax Filing Agent",
    eventType: "Delegation requested",
    status: "pending",
    description: "Requested approval for Q1 tax filing submission.",
  },
  {
    id: "act_2",
    timestamp: "2026-03-24T06:55:00Z",
    agentName: "Payment Processor",
    eventType: "Delegation requested",
    status: "pending",
    description: "Requested payment authorization for RM 12,500.",
  },
  {
    id: "act_3",
    timestamp: "2026-03-23T14:12:00Z",
    agentName: "Compliance Reporter",
    eventType: "Credential presented",
    status: "success",
    description: "Presented VC for BNM compliance submission.",
  },
  {
    id: "act_4",
    timestamp: "2026-03-22T09:43:00Z",
    agentName: "Tax Filing Agent",
    eventType: "Document signed",
    status: "success",
    description: "Signed CP204 declaration package.",
  },
];
