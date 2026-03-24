import { useState } from "react";
import type { CoverLetterPreviewData } from "@/features/job-agent/types";

interface CoverLetterPreviewProps {
  data: CoverLetterPreviewData;
  onApprove: () => void;
  onRequestChanges: (text: string) => void;
}

export function CoverLetterPreview({ data, onApprove, onRequestChanges }: CoverLetterPreviewProps) {
  const [editing, setEditing] = useState(false);
  const [changeText, setChangeText] = useState("");

  return (
    <div className="w-full rounded-xl border border-border bg-card p-4 space-y-3">
      <h4 className="font-semibold text-sm">✉️ {data.title}</h4>
      <pre className="max-h-72 overflow-auto rounded-lg bg-secondary p-3 text-xs whitespace-pre-wrap font-sans">
        {data.content_markdown}
      </pre>
      {editing && (
        <div className="space-y-2">
          <textarea
            value={changeText}
            onChange={(e) => setChangeText(e.target.value)}
            placeholder="Tell the agent what to change..."
            rows={3}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
          <button
            onClick={() => {
              const trimmed = changeText.trim();
              if (!trimmed) return;
              onRequestChanges(trimmed);
              setChangeText("");
              setEditing(false);
            }}
            className="rounded-md bg-secondary px-3 py-1.5 text-xs font-medium"
          >
            Send changes
          </button>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <button onClick={onApprove} className="rounded-md gradient-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
          Approve
        </button>
        <button onClick={() => setEditing((v) => !v)} className="rounded-md bg-secondary px-3 py-1.5 text-xs font-medium">
          Request Changes
        </button>
      </div>
    </div>
  );
}
