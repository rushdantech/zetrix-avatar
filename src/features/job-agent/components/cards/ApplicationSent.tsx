import type { ApplicationSentData } from "@/features/job-agent/types";

interface ApplicationSentProps {
  data: ApplicationSentData;
  onApplyToAnother: () => void;
}

export function ApplicationSent({ data, onApplyToAnother }: ApplicationSentProps) {
  return (
    <div className="w-full rounded-xl border border-success/30 bg-success/10 p-4 space-y-3">
      <h4 className="font-semibold text-sm text-success">✅ Application Sent</h4>
      <div className="text-xs space-y-1">
        <p><span className="text-muted-foreground">To:</span> {data.to}</p>
        <p><span className="text-muted-foreground">Subject:</span> {data.subject}</p>
        <p><span className="text-muted-foreground">Sent:</span> {data.sent_at}</p>
        <p><span className="text-muted-foreground">Ref:</span> {data.reference_id}</p>
      </div>
      <div className="space-y-1">
        {data.attachments.map((attachment) => (
          <p key={attachment.name} className="text-xs">
            📎 {attachment.name} {attachment.attested ? "🔗" : ""}
          </p>
        ))}
      </div>
      <button onClick={onApplyToAnother} className="rounded-md bg-background px-3 py-1.5 text-xs font-medium">
        Apply to Another
      </button>
    </div>
  );
}
