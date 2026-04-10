/**
 * Job Application Agent v2 — multi-recruiter A2A demo.
 * User attaches (simulated) + sends trigger text; scripted assistant rows play back with delays from the UI.
 */
export const JOB_APPLICATION_AGENT_V2_ID = "job-application-agent-v2";

/** Exact text the user must send (after simulated attach) to start the automated sequence. */
export const JOB_APP_V2_TRIGGER_TEXT =
  "Attached is my CV and certificates. Apply suitable jobs for me with cover letter and customized CV.";

export function isJobAppV2TriggerMessage(text: string): boolean {
  const a = text.trim().replace(/\s+/g, " ");
  const b = JOB_APP_V2_TRIGGER_TEXT.trim().replace(/\s+/g, " ");
  return a === b;
}

/** Pause (ms) after the user sends the trigger, before the first agent line appears. */
export const JOB_APP_V2_FIRST_RESPONSE_DELAY_MS = 1_650;

/**
 * Delay before each scripted row appears (after the previous row). Tuned for demo pacing:
 * system / verification feels slower; recruiter slightly faster; Job Application Agent in between.
 */
export function getJobAppV2StepDelayMs(entry: JobAppV2ChatMessage, stepIndex: number): number {
  const j = (stepIndex % 11) * 41;
  if (entry.lane === "system") {
    if (entry.eventType === "verification_event") return 2_050 + (j % 450);
    if (entry.eventType === "system_event") return 1_750 + (j % 380);
    return 1_400 + (j % 320);
  }
  if (entry.lane === "myeg" || entry.lane === "sime_darby" || entry.lane === "maybank") {
    return 1_180 + (j % 360);
  }
  return 1_380 + (j % 420);
}

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

/** Opening assistant message only — shown until the user attaches (simulated) and sends the trigger. */
export const JOB_APP_V2_WELCOME_MESSAGE: JobAppV2ChatMessage = msg(
  "ja-welcome",
  "assistant",
  `**Job Application Agent v2 — interactive demo**

**1.** Tap **Attach** once to simulate uploading your **CV**, **degree certificate**, and **professional certificate**.

**2.** Send this request **exactly** (copy/paste is fine):

**${JOB_APP_V2_TRIGGER_TEXT}**

After you send it, the multi-recruiter flow will run step by step with realistic pacing.`,
  "—",
);

/** Full story including the user line (reference / docs). Automated playback uses assistant rows only. */
export const JOB_APP_V2_CHAT_MESSAGES: JobAppV2ChatMessage[] = [
  msg(
    "u0",
    "user",
    JOB_APP_V2_TRIGGER_TEXT,
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

/** Rows played in order after the user sends the trigger (excludes the user message). */
export const JOB_APP_V2_SCRIPT_MESSAGES: JobAppV2ChatMessage[] = JOB_APP_V2_CHAT_MESSAGES.filter(
  (m) => m.role === "assistant",
);
