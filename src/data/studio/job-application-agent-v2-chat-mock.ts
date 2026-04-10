/**
 * Pre-populated task chat for Job Application Agent v2 — multi-recruiter A2A demo (canned).
 * Actors: User, Job Application Agent, MYEG / Sime Darby / Maybank HR Recruiter Agents, System.
 */
export const JOB_APPLICATION_AGENT_V2_ID = "job-application-agent-v2";

export type JobAppV2Lane = "myeg" | "sime_darby" | "maybank" | "system";

export type JobAppV2EventType =
  | "user_input"
  | "agent_message"
  | "recruiter_message"
  | "system_event"
  | "verification_event"
  | "status_update";

export type JobAppV2ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  timeLabel: string;
  richFormat: boolean;
  /** Assistant-only: recruiter org lane or system (omit = Job Application Agent). */
  lane?: JobAppV2Lane;
  /** For traceability / demo scripts (optional, not all UIs surface this). */
  eventType?: JobAppV2EventType;
};

const T0 = "2026-04-10T10:00:00.000Z";

function msg(
  id: string,
  role: "user" | "assistant",
  content: string,
  timeLabel: string,
  opts?: { lane?: JobAppV2Lane; eventType?: JobAppV2EventType },
): JobAppV2ChatMessage {
  return {
    id,
    role,
    content,
    timestamp: T0,
    timeLabel,
    richFormat: true,
    ...(opts?.lane && role === "assistant" ? { lane: opts.lane } : {}),
    ...(opts?.eventType ? { eventType: opts.eventType } : {}),
  };
}

/** Deterministic chronological thread: upload → verify → match → tailor → submit ×3 → verify ×3 → Q&A ×3 → close ×3. */
export const JOB_APP_V2_CHAT_MESSAGES: JobAppV2ChatMessage[] = [
  msg(
    "u0",
    "user",
    "Attached is my CV and certificates. Apply suitable jobs for me with cover letter and customized CV.",
    "10:00",
    { eventType: "user_input" },
  ),

  msg(
    "ja-1",
    "assistant",
    "I've received the applicant's CV and certificates. I will now verify the uploaded credentials and prepare verifiable versions for submission.",
    "10:00",
    { eventType: "agent_message" },
  ),
  msg("sys-v1", "assistant", "**Verifying uploaded certificates…**", "10:01", {
    lane: "system",
    eventType: "system_event",
  }),
  msg("sys-v2", "assistant", "**Certificates verified successfully.**", "10:01", {
    lane: "system",
    eventType: "verification_event",
  }),
  msg(
    "sys-v3",
    "assistant",
    "**Generated verifiable credential package:**\n\n- Degree Certificate\n\n- Professional Certificate",
    "10:02",
    { lane: "system", eventType: "status_update" },
  ),

  msg(
    "ja-2",
    "assistant",
    "I am now matching the applicant's profile against available job opportunities.",
    "10:02",
    { eventType: "agent_message" },
  ),
  msg(
    "sys-search",
    "assistant",
    "**Searching roles** based on applicant profile, experience, and uploaded documents…",
    "10:03",
    { lane: "system", eventType: "system_event" },
  ),
  msg(
    "ja-3",
    "assistant",
    "**I found 3 suitable roles:**\n\n1. MYEG — Digital Identity Operations Executive\n\n2. Sime Darby — Business Process Analyst\n\n3. Maybank — Digital Operations Associate",
    "10:03",
    { eventType: "agent_message" },
  ),

  msg(
    "ja-4",
    "assistant",
    "I am generating tailored CVs and cover letters for each selected role.",
    "10:04",
    { eventType: "agent_message" },
  ),
  msg(
    "sys-prep",
    "assistant",
    "**Preparing customized application materials…**",
    "10:04",
    { lane: "system", eventType: "status_update" },
  ),
  msg(
    "ja-5",
    "assistant",
    "**Customized applications prepared:**\n\n- MYEG: tailored CV + cover letter\n\n- Sime Darby: tailored CV + cover letter\n\n- Maybank: tailored CV + cover letter",
    "10:05",
    { eventType: "agent_message" },
  ),

  msg(
    "ja-myeg-submit",
    "assistant",
    "**→ MYEG HR Recruiter Agent**\n\nSubmitting application for the role of **Digital Identity Operations Executive**. Attached are the tailored CV, cover letter, and verifiable credential references.",
    "10:05",
    { eventType: "agent_message" },
  ),
  msg(
    "ja-sime-submit",
    "assistant",
    "**→ Sime Darby HR Recruiter Agent**\n\nSubmitting application for the role of **Business Process Analyst**. Attached are the tailored CV, cover letter, and verifiable credential references.",
    "10:06",
    { eventType: "agent_message" },
  ),
  msg(
    "ja-may-submit",
    "assistant",
    "**→ Maybank HR Recruiter Agent**\n\nSubmitting application for the role of **Digital Operations Associate**. Attached are the tailored CV, cover letter, and verifiable credential references.",
    "10:06",
    { eventType: "agent_message" },
  ),
  msg(
    "sys-submitted",
    "assistant",
    "**Applications submitted** to 3 recruiter agents.",
    "10:07",
    { lane: "system", eventType: "status_update" },
  ),

  msg(
    "myeg-r1",
    "assistant",
    "Application received. Please provide verifiable proof of the applicant's academic and professional certificates for screening.",
    "10:07",
    { lane: "myeg", eventType: "recruiter_message" },
  ),
  msg(
    "sime-r1",
    "assistant",
    "Thank you for the submission. Before proceeding, please provide verifiable proof of the applicant's qualifications.",
    "10:08",
    { lane: "sime_darby", eventType: "recruiter_message" },
  ),
  msg(
    "may-r1",
    "assistant",
    "Application received. Please share verifiable certificate credentials for validation.",
    "10:08",
    { lane: "maybank", eventType: "recruiter_message" },
  ),

  msg(
    "ja-myeg-proof",
    "assistant",
    "**→ MYEG HR Recruiter Agent**\n\nProviding verifiable certificate references now.",
    "10:09",
    { eventType: "agent_message" },
  ),
  msg("sys-myeg-v1", "assistant", "**MYEG — credential verification in progress…**", "10:09", {
    lane: "system",
    eventType: "verification_event",
  }),
  msg(
    "sys-myeg-v2",
    "assistant",
    "**MYEG verification passed:**\n\n- Degree certificate verified\n\n- Professional certificate verified\n\n- No tampering detected",
    "10:10",
    { lane: "system", eventType: "verification_event" },
  ),

  msg(
    "ja-sime-proof",
    "assistant",
    "**→ Sime Darby HR Recruiter Agent**\n\nProviding verifiable certificate references now.",
    "10:10",
    { eventType: "agent_message" },
  ),
  msg("sys-sime-v1", "assistant", "**Sime Darby — credential verification in progress…**", "10:10", {
    lane: "system",
    eventType: "verification_event",
  }),
  msg(
    "sys-sime-v2",
    "assistant",
    "**Sime Darby verification passed:**\n\n- Degree certificate verified\n\n- Professional certificate verified\n\n- No tampering detected",
    "10:11",
    { lane: "system", eventType: "verification_event" },
  ),

  msg(
    "ja-may-proof",
    "assistant",
    "**→ Maybank HR Recruiter Agent**\n\nProviding verifiable certificate references now.",
    "10:11",
    { eventType: "agent_message" },
  ),
  msg("sys-may-v1", "assistant", "**Maybank — credential verification in progress…**", "10:11", {
    lane: "system",
    eventType: "verification_event",
  }),
  msg(
    "sys-may-v2",
    "assistant",
    "**Maybank verification passed:**\n\n- Degree certificate verified\n\n- Professional certificate verified\n\n- No tampering detected",
    "10:12",
    { lane: "system", eventType: "verification_event" },
  ),

  msg(
    "myeg-q",
    "assistant",
    "Please summarize the applicant's relevant experience for this role.",
    "10:12",
    { lane: "myeg", eventType: "recruiter_message" },
  ),
  msg(
    "sime-q",
    "assistant",
    "Why is the applicant interested in this opportunity?",
    "10:13",
    { lane: "sime_darby", eventType: "recruiter_message" },
  ),
  msg(
    "may-q",
    "assistant",
    "How does the applicant's background align with this role?",
    "10:13",
    { lane: "maybank", eventType: "recruiter_message" },
  ),

  msg(
    "ja-myeg-a",
    "assistant",
    "**→ MYEG HR Recruiter Agent**\n\nThe applicant has experience in digital operations, documentation workflows, and compliance coordination, with exposure to digital identity and verification processes that align strongly with this role.",
    "10:14",
    { eventType: "agent_message" },
  ),
  msg(
    "ja-sime-a",
    "assistant",
    "**→ Sime Darby HR Recruiter Agent**\n\nThe applicant is interested in this opportunity because it offers the chance to contribute to operational improvement, structured workflows, and cross-functional execution in a large enterprise environment.",
    "10:14",
    { eventType: "agent_message" },
  ),
  msg(
    "ja-may-a",
    "assistant",
    "**→ Maybank HR Recruiter Agent**\n\nThe applicant's background aligns with this role through hands-on experience in operations support, document handling, process coordination, and working within structured, compliance-sensitive environments.",
    "10:15",
    { eventType: "agent_message" },
  ),

  msg(
    "myeg-end",
    "assistant",
    "Thank you. The applicant has passed this screening stage. We will review the submission and get back to you shortly.",
    "10:15",
    { lane: "myeg", eventType: "recruiter_message" },
  ),
  msg(
    "sime-end",
    "assistant",
    "Thank you for the information. The application is under review and we will get back to you after the next screening step.",
    "10:16",
    { lane: "sime_darby", eventType: "recruiter_message" },
  ),
  msg(
    "may-end",
    "assistant",
    "Thank you. The applicant's profile has been recorded and we will get back to you with the next steps.",
    "10:16",
    { lane: "maybank", eventType: "recruiter_message" },
  ),
];
