import type { LucideIcon } from "lucide-react";
import { Bot, Building2, Cpu } from "lucide-react";

export type DemoActor = "user" | "job_v2" | "myeg" | "system";

export interface DemoTimelineEntry {
  id: string;
  actor: DemoActor;
  /** Short heading for the bubble */
  headline: string;
  /** Body copy */
  detail: string;
  icon: LucideIcon;
}

export const POST_APPLY_TIMELINE: DemoTimelineEntry[] = [
  {
    id: "cv-submit",
    actor: "job_v2",
    headline: "CV & application package sent",
    detail:
      "Generated CV from your structured profile and submitted the application packet to MYEG’s recruiter endpoint.",
    icon: Bot,
  },
  {
    id: "myeg-1",
    actor: "myeg",
    headline: "Screening request",
    detail: "Application received. Please summarize the applicant’s relevant experience.",
    icon: Building2,
  },
  {
    id: "ja-1",
    actor: "job_v2",
    headline: "Response on your behalf",
    detail:
      "The applicant brings five years in product marketing with two years leading cross-functional launches in gov-tech adjacent sectors, including stakeholder reporting and vendor coordination.",
    icon: Bot,
  },
  {
    id: "myeg-2",
    actor: "myeg",
    headline: "Follow-up question",
    detail: "Why is the applicant interested in MYEG?",
    icon: Building2,
  },
  {
    id: "ja-2",
    actor: "job_v2",
    headline: "Response on your behalf",
    detail:
      "They are motivated by MYEG’s digital services footprint and want to contribute to citizen-facing platforms that blend compliance, UX, and secure identity workflows.",
    icon: Bot,
  },
  {
    id: "myeg-3",
    actor: "myeg",
    headline: "Credential proof requested",
    detail: "Provide verifiable proof of identity and degree.",
    icon: Building2,
  },
  {
    id: "ja-3",
    actor: "job_v2",
    headline: "Proof references supplied",
    detail:
      "Attached verifiable credential references: VC-ID-MY-2026-4412 (MyKad-derived identity VC) and VC-DEG-UM-2019-8831 (BSc Computer Science, University of Malaya).",
    icon: Bot,
  },
  {
    id: "sys-verify",
    actor: "system",
    headline: "Credential verification",
    detail: "Verifying blockchain-backed credentials against issuer registries and document hashes…",
    icon: Cpu,
  },
  {
    id: "sys-result",
    actor: "system",
    headline: "Verification result",
    detail: "Identity verified · Degree verified · Integrity check: no tampering detected.",
    icon: Cpu,
  },
  {
    id: "myeg-final",
    actor: "myeg",
    headline: "Final outcome",
    detail: "Screening complete. Proceed to next stage.",
    icon: Building2,
  },
];

export function jobV2Status(visibleCount: number, profileReady: boolean, submitted: boolean): string {
  if (!profileReady) return "Collecting documents";
  if (!submitted) return "Ready to apply";
  if (visibleCount <= 1) return "Submitted";
  if (visibleCount <= 6) return "Screening";
  if (visibleCount <= 8) return "Verifying credentials";
  return "Completed";
}

export function myegStatus(visibleCount: number, submitted: boolean): string {
  if (!submitted) return "Idle";
  if (visibleCount <= 1) return "Reviewing";
  if (visibleCount <= 6) return "Questioning";
  if (visibleCount <= 8) return "Verifying";
  return "Completed";
}
