import type { ApplicationConfirmData } from "@/features/job-agent/types";

interface ApplicationConfirmProps {
  data: ApplicationConfirmData;
  onConfirmSubmit: () => void;
  onCancelSubmit: () => void;
}

export function ApplicationConfirm({
  data,
  onConfirmSubmit,
  onCancelSubmit,
}: ApplicationConfirmProps) {
  return (
    <div className="w-full rounded-xl border border-border bg-card p-4 space-y-3">
      <h4 className="font-semibold text-sm">🛡️ {data.title}</h4>
      <p className="text-xs text-muted-foreground">{data.summary}</p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onConfirmSubmit}
          className="rounded-md gradient-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
        >
          Confirm Submit
        </button>
        <button
          onClick={onCancelSubmit}
          className="rounded-md bg-secondary px-3 py-1.5 text-xs font-medium"
        >
          Not Yet
        </button>
      </div>
    </div>
  );
}
