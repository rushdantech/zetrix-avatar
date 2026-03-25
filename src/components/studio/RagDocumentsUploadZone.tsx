import { useRef } from "react";
import type { RagDocumentItem } from "@/types/studio";
import { FileText, Upload, X } from "lucide-react";

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const ACCEPT =
  ".pdf,.txt,.md,.doc,.docx,.html,.csv,.json,application/pdf,text/plain,text/markdown";

interface RagDocumentsUploadZoneProps {
  documents: RagDocumentItem[];
  onChange: (next: RagDocumentItem[]) => void;
  idPrefix?: string;
}

/** Shared UI for selecting RAG source files (metadata only). */
export function RagDocumentsUploadZone({ documents, onChange, idPrefix = "rag" }: RagDocumentsUploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    let next = [...documents];
    for (const file of Array.from(fileList)) {
      if (next.length >= 15) break;
      if (file.size > 25 * 1024 * 1024) continue;
      next.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        name: file.name,
        size: file.size,
        addedAt: new Date().toISOString(),
      });
    }
    onChange(next);
  };

  const removeAt = (index: number) => {
    onChange(documents.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        id={`${idPrefix}-file-input`}
        type="file"
        className="hidden"
        multiple
        accept={ACCEPT}
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-secondary/30 p-8 text-center text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
      >
        <Upload className="h-8 w-8 opacity-70" />
        <span className="font-medium text-foreground">Upload documents</span>
        <span className="text-xs">PDF, Word, TXT, Markdown, CSV, JSON — up to 15 files, 25MB each</span>
      </button>

      {documents.length > 0 ? (
        <ul className="space-y-2 rounded-lg border border-border bg-card p-3">
          {documents.map((doc, index) => (
            <li
              key={doc.id}
              className="flex items-center justify-between gap-2 rounded-md border border-border bg-secondary/40 px-3 py-2 text-sm"
            >
              <div className="flex min-w-0 items-center gap-2">
                <FileText className="h-4 w-4 shrink-0 text-primary" />
                <div className="min-w-0">
                  <p className="truncate font-medium">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(doc.size)}</p>
                </div>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                onClick={() => removeAt(index)}
                aria-label={`Remove ${doc.name}`}
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-xs text-muted-foreground">
          No documents yet — optional. You can skip and add files later from settings.
        </p>
      )}
    </div>
  );
}
