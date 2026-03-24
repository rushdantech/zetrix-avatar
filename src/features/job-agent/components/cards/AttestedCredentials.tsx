import { useState } from "react";
import type { AttestedCredentialsData } from "@/features/job-agent/types";

interface AttestedCredentialsProps {
  data: AttestedCredentialsData;
  onShowExisting: () => void;
  onEditCredential: (title: string, details: string) => void;
  onReplaceCredential: (title: string) => void;
}

export function AttestedCredentials({
  data,
  onShowExisting,
  onEditCredential,
  onReplaceCredential,
}: AttestedCredentialsProps) {
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [editingDetails, setEditingDetails] = useState("");

  return (
    <div className="w-full rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h4 className="font-semibold text-sm">🔗 Credentials Attested</h4>
        <button onClick={onShowExisting} className="rounded-md bg-secondary px-2.5 py-1 text-[11px] font-medium">
          View Existing
        </button>
      </div>
      <div className="space-y-2">
        {data.credentials.map((credential) => (
          <div key={credential.title} className="rounded-lg bg-secondary p-3">
            <p className="text-xs font-medium">✅ {credential.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{credential.details}</p>
            <a
              className="text-xs text-primary hover:underline mt-1 inline-block"
              href={credential.verification_url}
              target="_blank"
              rel="noreferrer"
            >
              Blockchain verified
            </a>
            {editingTitle === credential.title ? (
              <div className="mt-2 space-y-2">
                <textarea
                  value={editingDetails}
                  onChange={(e) => setEditingDetails(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const next = editingDetails.trim();
                      if (!next) return;
                      onEditCredential(credential.title, next);
                      setEditingTitle(null);
                      setEditingDetails("");
                    }}
                    className="rounded-md bg-primary px-2.5 py-1 text-[11px] text-primary-foreground"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingTitle(null);
                      setEditingDetails("");
                    }}
                    className="rounded-md bg-background px-2.5 py-1 text-[11px]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setEditingTitle(credential.title);
                    setEditingDetails(credential.details);
                  }}
                  className="rounded-md bg-background px-2.5 py-1 text-[11px] font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => onReplaceCredential(credential.title)}
                  className="rounded-md bg-background px-2.5 py-1 text-[11px] font-medium"
                >
                  Replace
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{data.note}</p>
    </div>
  );
}
