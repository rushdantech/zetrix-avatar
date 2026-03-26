import type { LockedAgentTaskBrief } from "@/types/studio";

/** Pre-populated Agent Studio task chat for Job Application Agent (`job-agent`). */
export const JOB_AGENT_SETUP_AGENT_ID = "job-agent";

export type JobAgentSetupChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  timeLabel: string;
  lockable?: boolean;
  locked?: boolean;
  /** First plan: show Lock in as already used (greyed). */
  lockButtonDisabled?: boolean;
  /** Render with bold / lists / horizontal rules (not plain line breaks only). */
  richFormat?: boolean;
  /** Final deployment card: table + CTAs instead of plain text. */
  deployment?: boolean;
};

const USER_BRIEF = `Build me a Job Application Agent for Malaysian job seekers. Here's what it needs to do:

**Credential management:**
- Accept uploads of certificates, transcripts, and professional certifications
- Send them to Zetrix Attest for blockchain notarization and OCR extraction
- Present extracted data for user confirmation
- Store attested PDFs for attaching to future applications

**Resume handling:**
- Accept CV/resume uploads, parse into structured profile
- Cross-check education against attested credentials
- Let user review and correct extracted data

**Job search:**
- Search Malaysian portals: JobStreet, LinkedIn, Indeed MY, MauKerja, WOBB
- Use Tavily with site: filters
- Score each job against user profile (skills, experience, salary, location)
- Present top 3-5 ranked matches with match scores

**Application:**
- Generate tailored resumes using Claude Opus — never fabricate anything
- Generate cover letters mentioning blockchain-attested credentials
- User must review and approve both before sending
- Send via email: cover letter as body, resume PDF + attested credential PDFs as attachments
- If no application email found, provide portal URL for manual application

**Constraints:**
- All salaries in RM
- English by default
- Always confirm before sending any application
- Track all applications sent in the session`;

const PLAN_V1 = `**📋 Job Application Agent — Execution Plan**

I'll set up an agent with 5 capabilities executed in sequence:

---

**1. Credential Intake**
- Trigger: User attaches certificate / transcript files
- Action: Send to Zetrix Attest → OCR + blockchain notarization
- Output: Extracted data (institution, qualification, grade, dates) → user confirms
- Storage: Attested PDFs retained for application attachments

**2. Resume Parsing**
- Trigger: User attaches CV / resume
- Action: LLM extraction → structured profile (experience, education, skills)
- Validation: Cross-check education vs attested credentials, flag mismatches
- Output: Profile summary → user confirms

**3. Job Search & Matching**
- Trigger: User provides preferences or says "search"
- Portals: JobStreet, LinkedIn, Indeed MY, MauKerja, WOBB (via Tavily)
- Scoring: Skills match %, experience fit, salary alignment, location/work mode
- Output: Top 3-5 matches with scores, matched skills, gaps, action buttons

**4. Resume & Cover Letter Generation**
- Trigger: User selects a job to apply to
- Model: Claude Opus (frontier model — no fabrication)
- Resume: Rewrite summary, reorder experience, map skills to requirements
- Cover letter: 3-4 paragraphs, highlight top matches, mention Zetrix Attest credentials
- Gate: Both require explicit user approval before proceeding

**5. Application Submission**
- Method: Email (cover letter as body, resume PDF + attested PDFs attached)
- Subject: "Application for [Title] — [Name]"
- Confirmation: Recipient, attachments, timestamp, reference ID
- Fallback: If no email found → provide portal URL

---

**Tools required:**
- Tavily Search + Extract (job portal scanning)
- Zetrix Attest API (credential notarization)
- Email Service / SMTP (application delivery)
- PDF Generator (resume Markdown → PDF)

**Safety rules:**
- ✅ Confirm before sending any application
- 🚫 No resume fabrication
- 💰 All figures in RM
- 📋 Track all applications in session

**Welcome message for end users:**
"Hi! I'm your Job Application Agent. I can help you find and apply to jobs across Malaysian portals like JobStreet, LinkedIn, and Indeed.
📎 Attach your credentials for blockchain verification
📎 Attach your resume for profile parsing
💬 Or tell me what kind of role you're looking for"`;

const USER_ADJUSTMENT = `Looks good. Two changes:
1. Add preference gathering — ask users about target roles, salary, location, work mode conversationally before searching. Don't dump all questions at once.
2. For job results, also let users ask follow-up questions like "tell me more about the Grab role" or "show me only remote ones."`;

const PLAN_V2 = `**📋 Updated Plan — 2 changes applied:**

**3. Job Search & Matching** — updated
- **Added: Preference Gathering**
  - Conversational — 2-3 questions at a time, not a form dump
  - Categories: Target roles, industries, salary (RM), location, work mode, deal-breakers
  - Passive pickup: Incorporate casual mentions (e.g., "I hate commuting" → remote preference)
  - Present summary → confirm before searching
- **Added: Conversational Results**
  - Users can ask follow-ups: "tell me more about...", "show only remote", "any above RM18K?"
  - Agent filters and re-presents without re-searching

All other capabilities unchanged.`;

const USER_CONFIRM = "Perfect. Lock it in.";

const DEPLOYMENT_TITLE = `**✅ Job Application Agent — Deployed**

Your agent is live and ready for end users. Here's a summary:`;

export const JOB_AGENT_SETUP_MESSAGES: JobAgentSetupChatMessage[] = [
  {
    id: "ja-setup-u1",
    role: "user",
    content: USER_BRIEF,
    timestamp: "2026-03-26T11:56:00",
    timeLabel: "11:56 am",
    richFormat: true,
  },
  {
    id: "ja-setup-a1",
    role: "assistant",
    content: PLAN_V1,
    timestamp: "2026-03-26T11:56:00",
    timeLabel: "11:56 am",
    lockable: true,
    lockButtonDisabled: true,
    richFormat: true,
  },
  {
    id: "ja-setup-u2",
    role: "user",
    content: USER_ADJUSTMENT,
    timestamp: "2026-03-26T11:58:00",
    timeLabel: "11:58 am",
    richFormat: true,
  },
  {
    id: "ja-setup-a2",
    role: "assistant",
    content: PLAN_V2,
    timestamp: "2026-03-26T11:58:00",
    timeLabel: "11:58 am",
    lockable: true,
    richFormat: true,
  },
  {
    id: "ja-setup-u3",
    role: "user",
    content: USER_CONFIRM,
    timestamp: "2026-03-26T11:59:00",
    timeLabel: "11:59 am",
  },
  {
    id: "ja-setup-a3",
    role: "assistant",
    content: DEPLOYMENT_TITLE,
    timestamp: "2026-03-26T11:59:00",
    timeLabel: "11:59 am",
    deployment: true,
    richFormat: true,
  },
];

/** Simulates the first execution plan already locked from the brief. */
export const JOB_AGENT_SETUP_INITIAL_LOCKS: LockedAgentTaskBrief[] = [
  {
    id: "ja-setup-lock-1",
    agentId: JOB_AGENT_SETUP_AGENT_ID,
    title: "Build me a Job Application Agent for Malaysian job seekers. Here's what it nee…",
    summary: PLAN_V1,
    lockedAt: "2026-03-26T11:56:30.000Z",
  },
];
