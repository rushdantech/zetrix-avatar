import { useRef } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KNOWLEDGE_DOMAINS, PERSONALITY_TRAITS, INDIVIDUAL_LANGUAGES } from "@/lib/studio/constants";
import type { IndividualAvatarDraft } from "@/types/studio";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FileText, Upload, X } from "lucide-react";

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function IndividualStepPersona() {
  const { control, watch, setValue } = useFormContext<IndividualAvatarDraft>();
  const traits = watch("personalityTraits");
  const langs = watch("languages");

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Avatar name</FormLabel>
            <FormControl>
              <Input placeholder="e.g. Maya" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="tagline"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tagline</FormLabel>
            <FormControl>
              <Input placeholder="Short hook (max 120 chars)" maxLength={120} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="fullDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Full description (optional)</FormLabel>
            <FormControl>
              <Textarea rows={3} placeholder="Longer bio..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div>
        <FormLabel>Personality traits</FormLabel>
        <div className="mt-2 flex flex-wrap gap-2">
          {PERSONALITY_TRAITS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() =>
                setValue(
                  "personalityTraits",
                  traits.includes(t) ? traits.filter((x) => x !== t) : [...traits, t],
                  { shouldValidate: true },
                )
              }
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-all",
                traits.includes(t)
                  ? "gradient-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground",
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <FormField
          control={control}
          name="personalityTraits"
          render={() => <FormMessage />}
        />
      </div>
      <FormField
        control={control}
        name="communicationStyle"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Communication style</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Casual">Casual</SelectItem>
                <SelectItem value="Semi-formal">Semi-formal</SelectItem>
                <SelectItem value="Formal">Formal</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <div>
        <FormLabel>Languages</FormLabel>
        <div className="mt-2 flex flex-wrap gap-2">
          {INDIVIDUAL_LANGUAGES.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() =>
                setValue(
                  "languages",
                  langs.includes(lang) ? langs.filter((x) => x !== lang) : [...langs, lang],
                  { shouldValidate: true },
                )
              }
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-all",
                langs.includes(lang)
                  ? "gradient-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground",
              )}
            >
              {lang}
            </button>
          ))}
        </div>
        <FormField control={control} name="languages" render={() => <FormMessage />} />
      </div>
    </div>
  );
}

export function IndividualStepKnowledge() {
  const { control, watch, setValue } = useFormContext<IndividualAvatarDraft>();
  const domains = watch("knowledgeDomains");
  const starters = watch("conversationStarters");

  const addStarter = () => {
    if (starters.length >= 5) return;
    setValue("conversationStarters", [...starters, ""], { shouldValidate: true });
  };

  return (
    <div className="space-y-4">
      <div>
        <FormLabel>Knowledge domains</FormLabel>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {KNOWLEDGE_DOMAINS.map((k) => (
            <label key={k} className="flex cursor-pointer items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={domains.includes(k)}
                onChange={() =>
                  setValue(
                    "knowledgeDomains",
                    domains.includes(k) ? domains.filter((x) => x !== k) : [...domains, k],
                    { shouldValidate: true },
                  )
                }
                className="accent-primary"
              />
              {k}
            </label>
          ))}
        </div>
        <FormField control={control} name="knowledgeDomains" render={() => <FormMessage />} />
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between">
          <FormLabel>Conversation starters (max 5)</FormLabel>
          <Button type="button" variant="secondary" size="sm" onClick={addStarter} disabled={starters.length >= 5}>
            Add prompt
          </Button>
        </div>
        <div className="space-y-2">
          {starters.map((_, i) => (
            <FormField
              key={i}
              control={control}
              name={`conversationStarters.${i}` as const}
              render={({ field }) => (
                <FormItem>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder={`Example prompt ${i + 1}`} {...field} />
                    </FormControl>
                    <button
                      type="button"
                      className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-destructive"
                      onClick={() =>
                        setValue(
                          "conversationStarters",
                          starters.filter((_, j) => j !== i),
                          { shouldValidate: true },
                        )
                      }
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>
        <FormField control={control} name="conversationStarters" render={() => <FormMessage />} />
      </div>
    </div>
  );
}

export function IndividualStepRagDocuments() {
  const { control, getValues, watch } = useFormContext<IndividualAvatarDraft>();
  const { append, remove } = useFieldArray({ control, name: "ragDocuments" });
  const ragDocs = watch("ragDocuments") ?? [];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const accept = ".pdf,.txt,.md,.doc,.docx,.html,.csv,.json,application/pdf,text/plain,text/markdown";

  const addFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    let count = getValues("ragDocuments").length;
    for (const file of Array.from(fileList)) {
      if (count >= 15) break;
      if (file.size > 25 * 1024 * 1024) continue;
      append({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        name: file.name,
        size: file.size,
        addedAt: new Date().toISOString(),
      });
      count += 1;
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium">Knowledge base for RAG</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Upload documents to chunk, embed, and retrieve during chat. Optional — you can add files later from avatar
          settings. Prototype only: files are not sent to a server.
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple
        accept={accept}
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
        <span className="text-xs">PDF, Word, TXT, Markdown, CSV, JSON — up to 15 files, 25MB each (demo limits)</span>
      </button>

      {ragDocs.length > 0 ? (
        <ul className="space-y-2 rounded-lg border border-border bg-card p-3">
          {ragDocs.map((doc, index) => (
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
                onClick={() => remove(index)}
                aria-label={`Remove ${doc.name}`}
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-xs text-muted-foreground">No documents yet — your avatar can still use domains and starters from the previous step.</p>
      )}

      <FormField control={control} name="ragDocuments" render={() => <FormMessage />} />
    </div>
  );
}

export function IndividualStepAppearance() {
  const { control } = useFormContext<IndividualAvatarDraft>();

  return (
    <div className="space-y-4">
      <div
        className="cursor-pointer rounded-xl border-2 border-dashed border-border p-8 text-center text-sm text-muted-foreground"
        onClick={() => {}}
      >
        Avatar image — drag & drop or choose preset (mock)
      </div>
      <FormField
        control={control}
        name="themeColor"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Theme accent (chat bubbles)</FormLabel>
            <FormControl>
              <Input type="color" className="h-12 w-full max-w-[200px] cursor-pointer p-1" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="voiceStyle"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Voice style (visual)</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Warm">Warm</SelectItem>
                <SelectItem value="Energetic">Energetic</SelectItem>
                <SelectItem value="Calm">Calm</SelectItem>
                <SelectItem value="Authoritative">Authoritative</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export function IndividualStepReview() {
  const { watch } = useFormContext<IndividualAvatarDraft>();
  const v = watch();
  return (
    <div className="rounded-lg border border-border bg-secondary/40 p-4 text-sm">
      <p className="font-semibold">{v.name || "—"}</p>
      <p className="text-muted-foreground">{v.tagline}</p>
      <p className="mt-2 text-xs">
        <span className="text-muted-foreground">Traits:</span> {v.personalityTraits.join(", ") || "—"}
      </p>
      <p className="text-xs">
        <span className="text-muted-foreground">Languages:</span> {v.languages.join(", ") || "—"}
      </p>
      <p className="text-xs">
        <span className="text-muted-foreground">Domains:</span> {v.knowledgeDomains.join(", ") || "—"}
      </p>
      <p className="text-xs">
        <span className="text-muted-foreground">RAG documents:</span>{" "}
        {v.ragDocuments?.length
          ? `${v.ragDocuments.length} file(s) — ${v.ragDocuments.map((d) => d.name).join(", ")}`
          : "None"}
      </p>
      <p className="text-xs">
        <span className="text-muted-foreground">Voice:</span> {v.voiceStyle}
      </p>
    </div>
  );
}
