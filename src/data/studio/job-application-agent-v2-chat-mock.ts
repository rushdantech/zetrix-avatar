/** Pre-populated task chat for Job Application Agent v2 — MYEG screening demo (canned). */
export const JOB_APPLICATION_AGENT_V2_ID = "job-application-agent-v2";

export type JobAppV2Lane = "myeg" | "system";

export type JobAppV2ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  timeLabel: string;
  richFormat: boolean;
  /** Assistant-only: MYEG or system lane (omit for Job Application Agent v2). */
  lane?: JobAppV2Lane;
};

const T0 = "2026-04-10T02:10:00.000Z";

function msg(
  id: string,
  role: "user" | "assistant",
  content: string,
  timeLabel: string,
  lane?: JobAppV2Lane,
): JobAppV2ChatMessage {
  return {
    id,
    role,
    content,
    timestamp: T0,
    timeLabel,
    richFormat: true,
    ...(lane && role === "assistant" ? { lane } : {}),
  };
}

/** Deterministic canned thread: uploads → profile → apply → MYEG ↔ agent ↔ verification → outcome. */
export const JOB_APP_V2_CHAT_MESSAGES: JobAppV2ChatMessage[] = [
  msg(
    "u-docs",
    "user",
    "Attached: experience summary (PDF), national ID scan, and BSc degree certificate. Please structure these for applications.",
    "02:10",
  ),
  msg(
    "a-profile",
    "assistant",
    "**Profile structured**\n\nNormalized fields from your uploads and bound verifiable credential references (mock). Credentials prepared for screening.\n\nWhen you're ready, send **apply myeg** to run the demo application to MYEG's recruiter agent.",
    "02:10",
  ),
  msg("u-apply", "user", "apply myeg", "02:11"),
  msg(
    "a-cv",
    "assistant",
    "**CV & application package sent**\n\nGenerated CV from your structured profile and submitted the application packet to MYEG's recruiter endpoint.",
    "02:11",
  ),
  msg(
    "myeg-1",
    "assistant",
    "**Screening request**\n\nApplication received. Please summarize the applicant's relevant experience.",
    "02:11",
    "myeg",
  ),
  msg(
    "ja-1",
    "assistant",
    "**Response on your behalf**\n\nThe applicant brings five years in product marketing with two years leading cross-functional launches in gov-tech adjacent sectors, including stakeholder reporting and vendor coordination.",
    "02:12",
  ),
  msg(
    "myeg-2",
    "assistant",
    "**Follow-up question**\n\nWhy is the applicant interested in MYEG?",
    "02:12",
    "myeg",
  ),
  msg(
    "ja-2",
    "assistant",
    "**Response on your behalf**\n\nThey are motivated by MYEG's digital services footprint and want to contribute to citizen-facing platforms that blend compliance, UX, and secure identity workflows.",
    "02:13",
  ),
  msg(
    "myeg-3",
    "assistant",
    "**Credential proof requested**\n\nProvide verifiable proof of identity and degree.",
    "02:13",
    "myeg",
  ),
  msg(
    "ja-3",
    "assistant",
    "**Proof references supplied**\n\nAttached verifiable credential references: VC-ID-MY-2026-4412 (MyKad-derived identity VC) and VC-DEG-UM-2019-8831 (BSc Computer Science, University of Malaya).",
    "02:14",
  ),
  msg(
    "sys-1",
    "assistant",
    "**Credential verification**\n\nVerifying blockchain-backed credentials against issuer registries and document hashes…",
    "02:14",
    "system",
  ),
  msg(
    "sys-2",
    "assistant",
    "**Verification result**\n\nIdentity verified · Degree verified · Integrity check: no tampering detected.",
    "02:15",
    "system",
  ),
  msg(
    "myeg-final",
    "assistant",
    "**Final outcome**\n\nScreening complete. Proceed to next stage.",
    "02:15",
    "myeg",
  ),
];
