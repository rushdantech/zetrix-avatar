import type {
  ApplicationConfirmData,
  ApplicationSentData,
  AttestedCredentialsData,
  CoverLetterPreviewData,
  JobCardData,
  ProfileSummaryData,
  PreferencesSummaryData,
  ResumePreviewData,
} from "@/features/job-agent/types";

export const mockJobCards: JobCardData[] = [
  {
    match_score: 94,
    title: "Senior Backend Engineer",
    company: "GrabPay",
    location: "KL (Hybrid)",
    salary: "RM16-22K",
    matched_skills: ["Java", "Microservices", "AWS"],
    gaps: [],
    listing_url: "https://example.com/jobs/grabpay-senior-backend",
  },
  {
    match_score: 87,
    title: "Lead Software Engineer",
    company: "Boost",
    location: "KL (On-site)",
    salary: "RM18-25K",
    matched_skills: ["Python", "AWS", "Fintech"],
    gaps: ["Team lead experience"],
    listing_url: "https://example.com/jobs/boost-lead-software",
  },
  {
    match_score: 78,
    title: "Backend Platform Engineer",
    company: "BigPay",
    location: "KL / Remote",
    salary: "RM14-20K",
    matched_skills: ["Kubernetes", "Distributed Systems"],
    gaps: ["Scala"],
    listing_url: "https://example.com/jobs/bigpay-platform",
  },
];

export const mockResumePreview: ResumePreviewData = {
  title: "Tailored Resume — GrabPay",
  content_markdown: `# Amir bin Hassan
## Professional Summary
Backend engineer with 5 years of experience designing scalable fintech systems in Malaysia.

## Experience
- Accenture Malaysia (Current) — Senior Software Engineer
- Led microservices migration and improved API reliability by 28%

## Skills
Java, Python, AWS, Kubernetes, Kafka, PostgreSQL

## Education
BSc Computer Science — Universiti Teknologi Malaysia (CGPA 3.45)`,
};

export const mockCoverLetterPreview: CoverLetterPreviewData = {
  title: "Cover Letter — GrabPay",
  content_markdown: `Dear GrabPay Hiring Team,

I am writing to express my interest in the Senior Backend Engineer role at GrabPay.
With 5 years of backend engineering experience in fintech and cloud-native platforms,
I have consistently delivered secure, scalable systems for high-growth products.

I would be excited to contribute this experience to GrabPay.

Sincerely,
Amir bin Hassan`,
};

export const mockApplicationSent: ApplicationSentData = {
  to: "careers@grab.com",
  subject: "Application for Senior Backend Engineer — Amir bin Hassan",
  attachments: [
    { name: "Amir_Hassan_Resume_GrabPay.pdf" },
    { name: "BSc_CS_UTM_Attested.pdf", attested: true },
    { name: "AWS_SA_Attested.pdf", attested: true },
  ],
  sent_at: "22 Mar 2026, 2:30 PM",
  reference_id: "msg-abc123",
};

export const mockApplicationConfirm: ApplicationConfirmData = {
  title: "Confirm Before Sending",
  summary:
    "Your tailored resume, cover letter, and attested credentials are ready. Do you want me to submit this application email now?",
};

export const mockProfileSummary: ProfileSummaryData = {
  name: "Amir bin Hassan",
  role: "Software Engineer",
  company: "Accenture Malaysia",
  years_experience: "5 years",
  skills: ["Java", "Python", "AWS", "K8s"],
  education: "BSc CS — UTM (3.45)",
};

export const mockPreferencesSummary: PreferencesSummaryData = {
  roles: ["Senior Backend Engineer"],
  industry: "Fintech",
  location: "KL or Remote",
  min_salary: "RM15,000",
  work_mode: "Hybrid or Remote",
};

export const mockAttestedCredentials: AttestedCredentialsData = {
  credentials: [
    {
      title: "BSc Computer Science — UTM",
      details: "CGPA 3.45, completed June 2022",
      verification_url: "https://verify.zetrix.com/doc/abc123",
    },
    {
      title: "AWS Solutions Architect Associate",
      details: "Valid until Jan 2027",
      verification_url: "https://verify.zetrix.com/doc/def456",
    },
  ],
  note: "These are now blockchain-verified via Zetrix Attest and ready to share with employers.",
};

export const mockStructuredJobSearchResponse = `Great options found in Malaysian fintech:

\`\`\`json:job_card
${JSON.stringify(mockJobCards[0], null, 2)}
\`\`\`

\`\`\`json:job_card
${JSON.stringify(mockJobCards[1], null, 2)}
\`\`\`

\`\`\`json:job_card
${JSON.stringify(mockJobCards[2], null, 2)}
\`\`\`

Would you like to apply to any of these?`;
