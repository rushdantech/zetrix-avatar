import type { AttachmentKind, JobAttachment } from "@/features/job-agent/types";

interface FileTypeSelectorProps {
  attachments: JobAttachment[];
  onKindChange: (id: string, kind: AttachmentKind) => void;
}

export function FileTypeSelector({ attachments, onKindChange }: FileTypeSelectorProps) {
  if (!attachments.length) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-2.5 space-y-2">
      <p className="text-xs text-muted-foreground">
        Is this a credential (certificate/transcript) or a resume?
      </p>
      <div className="space-y-2">
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className="flex items-center justify-between gap-2 rounded-md bg-secondary px-2.5 py-2"
          >
            <p className="text-xs truncate">{attachment.name}</p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onKindChange(attachment.id, "credential")}
                className={`rounded-md px-2 py-1 text-[11px] ${
                  attachment.kind === "credential"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground"
                }`}
              >
                Credential
              </button>
              <button
                onClick={() => onKindChange(attachment.id, "resume")}
                className={`rounded-md px-2 py-1 text-[11px] ${
                  attachment.kind === "resume"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground"
                }`}
              >
                Resume
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
