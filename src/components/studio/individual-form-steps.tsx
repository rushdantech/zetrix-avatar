import { useFormContext } from "react-hook-form";
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
import { X } from "lucide-react";

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
      <div
        className="cursor-pointer rounded-xl border-2 border-dashed border-border p-6 text-center text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
        onClick={() => {}}
      >
        Drop PDFs or documents here (mock upload)
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
        <span className="text-muted-foreground">Voice:</span> {v.voiceStyle}
      </p>
    </div>
  );
}
