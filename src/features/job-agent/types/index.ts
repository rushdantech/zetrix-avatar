export type StructuredBlockType =
  | "job_card"
  | "resume_preview"
  | "cover_letter_preview"
  | "application_confirm"
  | "application_sent"
  | "profile_summary"
  | "preferences_summary"
  | "attested_credentials";

export interface JobCardData {
  match_score: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  matched_skills: string[];
  gaps?: string[];
  listing_url?: string;
}

export interface ResumePreviewData {
  title: string;
  content_markdown: string;
}

export interface CoverLetterPreviewData {
  title: string;
  content_markdown: string;
}

export interface ApplicationSentData {
  to: string;
  subject: string;
  attachments: Array<{ name: string; attested?: boolean }>;
  sent_at: string;
  reference_id: string;
}

export interface ApplicationConfirmData {
  title: string;
  summary: string;
}

export interface ProfileSummaryData {
  name: string;
  role: string;
  company: string;
  years_experience: string;
  skills: string[];
  education: string;
}

export interface PreferencesSummaryData {
  roles: string[];
  industry: string;
  location: string;
  min_salary: string;
  work_mode: string;
}

export interface AttestedCredentialsData {
  credentials: Array<{
    title: string;
    details: string;
    verification_url: string;
  }>;
  note: string;
}

export type StructuredBlockData =
  | JobCardData
  | ResumePreviewData
  | CoverLetterPreviewData
  | ApplicationConfirmData
  | ApplicationSentData
  | ProfileSummaryData
  | PreferencesSummaryData
  | AttestedCredentialsData;

export type ParsedSegment =
  | { kind: "text"; text: string }
  | { kind: "structured"; blockType: StructuredBlockType; data: StructuredBlockData; raw: string };

export type AttachmentKind = "credential" | "resume";

export interface JobAttachment {
  id: string;
  name: string;
  kind: AttachmentKind;
  file: File;
}
