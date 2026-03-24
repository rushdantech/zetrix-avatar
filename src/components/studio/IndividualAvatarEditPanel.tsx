import { useEffect, useState } from "react";
import {
  Upload,
  Mic,
  MicOff,
  Sparkles,
  Camera,
  MessageCircle,
  UserCheck,
  X,
  Image as ImageIcon,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuestionnaireFields, type QuestionnaireAnswers } from "@/components/studio/QuestionnaireFields";
import { RagDocumentsUploadZone } from "@/components/studio/RagDocumentsUploadZone";
import type { IndividualAvatarSetupMock, RagDocumentItem, StudioEntityIndividual } from "@/types/studio";

const EDIT_STEPS = ["Welcome", "Photos", "Avatar", "Questionnaire", "Documents (RAG)", "Voice"] as const;
const MAX_PHOTOS = 10;

const STYLE_TAGS = [
  "fashion",
  "tech",
  "travel",
  "memes",
  "fitness",
  "food",
  "photography",
  "AI",
  "lifestyle",
  "music",
  "art",
  "gaming",
];

function setupFromEntity(entity: StudioEntityIndividual): {
  photos: string[];
  personaForm: {
    name: string;
    bio: string;
    tonePlayful: number;
    toneBold: number;
    toneWitty: number;
    styleTags: string[];
    audience: string;
  };
  answers: QuestionnaireAnswers;
  ragDocuments: RagDocumentItem[];
  voiceEnabled: boolean;
} {
  const s = entity.individualSetup;
  const n = Math.min(MAX_PHOTOS, Math.max(0, s.photoCount));
  return {
    photos: Array.from({ length: n }, (_, i) => `photo-${i}`),
    personaForm: {
      name: entity.name,
      bio: s.bio,
      tonePlayful: s.tonePlayful,
      toneBold: s.toneBold,
      toneWitty: s.toneWitty,
      styleTags: [...s.styleTags],
      audience: s.audience,
    },
    answers: { ...s.questionnaireAnswers },
    ragDocuments: s.ragDocuments.map((d) => ({ ...d })),
    voiceEnabled: s.voiceCloningEnabled,
  };
}

export function IndividualAvatarEditPanel({
  entity,
  onSave,
}: {
  entity: StudioEntityIndividual;
  onSave: (next: StudioEntityIndividual) => void;
}) {
  const [editStep, setEditStep] = useState<string>("Welcome");
  const [photos, setPhotos] = useState<string[]>([]);
  const [personaForm, setPersonaForm] = useState(setupFromEntity(entity).personaForm);
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({});
  const [ragDocuments, setRagDocuments] = useState<RagDocumentItem[]>([]);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  useEffect(() => {
    const init = setupFromEntity(entity);
    setPhotos(init.photos);
    setPersonaForm(init.personaForm);
    setAnswers(init.answers);
    setRagDocuments(init.ragDocuments);
    setVoiceEnabled(init.voiceEnabled);
  }, [entity]);

  const addMockPhoto = () => {
    if (photos.length < MAX_PHOTOS) {
      setPhotos((p) => [...p, `photo-${Date.now()}`]);
      toast.success("Photo added (demo)");
    } else {
      toast.error(`Maximum ${MAX_PHOTOS} photos.`);
    }
  };

  const toggleTag = (tag: string) => {
    setPersonaForm((f) => ({
      ...f,
      styleTags: f.styleTags.includes(tag) ? f.styleTags.filter((t) => t !== tag) : [...f.styleTags, tag],
    }));
  };

  const buildNextEntity = (): StudioEntityIndividual => {
    const setup: IndividualAvatarSetupMock = {
      bio: personaForm.bio,
      audience: personaForm.audience,
      styleTags: [...personaForm.styleTags],
      tonePlayful: personaForm.tonePlayful,
      toneBold: personaForm.toneBold,
      toneWitty: personaForm.toneWitty,
      photoCount: photos.length,
      voiceCloningEnabled: voiceEnabled,
      questionnaireAnswers: { ...answers },
      ragDocuments: ragDocuments.map((d) => ({ ...d })),
    };
    const name = personaForm.name.trim() || entity.name;
    return {
      ...entity,
      name,
      description: (personaForm.bio || name).slice(0, 220),
      individualSetup: setup,
    };
  };

  const handleSave = () => {
    onSave(buildNextEntity());
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-card">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">Edit setup</h2>
          <p className="text-xs text-muted-foreground">Same steps as Create Avatar → Individual (without consent review).</p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-2 rounded-lg gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          <Save className="h-4 w-4" />
          Save changes
        </button>
      </div>

      <Tabs value={editStep} onValueChange={setEditStep}>
        <TabsList className="mb-4 flex h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-0">
          {EDIT_STEPS.map((s) => (
            <TabsTrigger
              key={s}
              value={s}
              className="rounded-md border border-border bg-secondary/60 px-2 py-1.5 text-xs data-[state=active]:border-primary data-[state=active]:bg-primary/10"
            >
              {s}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="Welcome" className="mt-0">
          <div className="rounded-lg bg-secondary/40 p-6 text-center text-sm">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary">
              <Sparkles className="h-7 w-7 text-primary-foreground" />
            </div>
            <p className="mx-auto max-w-lg text-muted-foreground">
              Use the tabs above to adjust training photos, profile, questionnaire, RAG documents, and voice—matching the
              individual creation flow. Catalog avatars save a copy to your session when you first save; user-created avatars
              update in place.
            </p>
            <div className="mx-auto mt-6 grid max-w-lg grid-cols-1 gap-2 text-left sm:grid-cols-3">
              {[
                { icon: Camera, label: "Photos" },
                { icon: UserCheck, label: "Avatar profile" },
                { icon: MessageCircle, label: "Questionnaire & RAG" },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-2 rounded-lg border border-border bg-card p-3 text-xs">
                  <f.icon className="h-4 w-4 text-primary" />
                  {f.label}
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="Photos" className="mt-0">
          <h3 className="mb-1 text-lg font-bold">Photos</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Training photo count (demo: placeholder tiles). Same behavior as the create wizard.
          </p>
          <div
            role="button"
            tabIndex={0}
            onClick={addMockPhoto}
            onKeyDown={(e) => e.key === "Enter" && addMockPhoto()}
            className="cursor-pointer rounded-xl border-2 border-dashed border-border p-8 text-center transition-all hover:border-primary/50 hover:bg-primary/5"
          >
            <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">Add training photo (demo)</p>
            <p className="mt-1 text-xs text-muted-foreground">JPG, PNG up to 10MB · Max {MAX_PHOTOS} photos</p>
          </div>
          {photos.length > 0 && (
            <div className="mt-4 grid grid-cols-5 gap-2">
              {photos.map((p, i) => (
                <div key={`${p}-${i}`} className="relative flex aspect-square items-center justify-center rounded-lg bg-secondary">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPhotos(photos.filter((_, j) => j !== i));
                    }}
                    className="absolute -right-1 -top-1 rounded-full bg-destructive p-0.5 text-destructive-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            {photos.length}/{MAX_PHOTOS} photos · Count is stored on this avatar listing.
          </p>
        </TabsContent>

        <TabsContent value="Avatar" className="mt-0 space-y-4">
          <h3 className="mb-1 text-lg font-bold">Avatar profile</h3>
          <div>
            <label className="text-sm font-medium">Name</label>
            <input
              value={personaForm.name}
              onChange={(e) => setPersonaForm((f) => ({ ...f, name: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Bio</label>
            <textarea
              value={personaForm.bio}
              onChange={(e) => setPersonaForm((f) => ({ ...f, bio: e.target.value }))}
              rows={3}
              className="mt-1 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Tone</label>
            {(
              [
                { key: "tonePlayful" as const, left: "Serious", right: "Playful" },
                { key: "toneBold" as const, left: "Subtle", right: "Bold" },
                { key: "toneWitty" as const, left: "Informative", right: "Witty" },
              ] as const
            ).map((t) => (
              <div key={t.key} className="mb-2 flex items-center gap-3">
                <span className="w-20 text-right text-xs text-muted-foreground">{t.left}</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={personaForm[t.key]}
                  onChange={(e) => setPersonaForm((f) => ({ ...f, [t.key]: Number(e.target.value) }))}
                  className="flex-1 accent-primary"
                  style={{ accentColor: "hsl(352, 72%, 42%)" }}
                />
                <span className="w-20 text-xs text-muted-foreground">{t.right}</span>
              </div>
            ))}
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Style tags</label>
            <div className="flex flex-wrap gap-2">
              {STYLE_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-all",
                    personaForm.styleTags.includes(tag)
                      ? "gradient-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground",
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Audience</label>
            <input
              value={personaForm.audience}
              onChange={(e) => setPersonaForm((f) => ({ ...f, audience: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </TabsContent>

        <TabsContent value="Questionnaire" className="mt-0">
          <h3 className="mb-1 text-lg font-bold">Personality questionnaire</h3>
          <p className="mb-4 text-sm text-muted-foreground">Same questions as in the create flow.</p>
          <QuestionnaireFields answers={answers} setAnswers={setAnswers} scrollClassName="max-h-[min(24rem,50vh)]" />
        </TabsContent>

        <TabsContent value="Documents (RAG)" className="mt-0">
          <h3 className="mb-1 text-lg font-bold">Knowledge base (RAG)</h3>
          <p className="mb-4 text-sm text-muted-foreground">Metadata-only upload, same as create flow.</p>
          <RagDocumentsUploadZone documents={ragDocuments} onChange={setRagDocuments} idPrefix={`edit-rag-${entity.id}`} />
        </TabsContent>

        <TabsContent value="Voice" className="mt-0">
          <h3 className="mb-1 text-lg font-bold">Voice</h3>
          <p className="mb-4 text-sm text-muted-foreground">Optional voice cloning for Marketplace Chat (demo).</p>
          <div
            role="button"
            tabIndex={0}
            className="mb-4 cursor-pointer rounded-xl border-2 border-dashed border-border p-8 text-center hover:border-primary/50"
            onClick={() => toast.info("Mock: Audio file uploaded")}
            onKeyDown={(e) => e.key === "Enter" && toast.info("Mock: Audio file uploaded")}
          >
            <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">Upload audio files</p>
            <p className="mt-1 text-xs text-muted-foreground">MP3, WAV, M4A up to 50MB</p>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-secondary p-4">
            <div className="flex items-center gap-2">
              {voiceEnabled ? <Mic className="h-4 w-4 text-primary" /> : <MicOff className="h-4 w-4 text-muted-foreground" />}
              <span className="text-sm font-medium">Enable voice cloning</span>
            </div>
            <button
              type="button"
              onClick={() => setVoiceEnabled((v) => !v)}
              className={cn("relative h-6 w-11 rounded-full transition-all", voiceEnabled ? "bg-primary" : "bg-border")}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-5 w-5 rounded-full bg-foreground transition-all",
                  voiceEnabled ? "left-5" : "left-0.5",
                )}
              />
            </button>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end border-t border-border pt-4">
        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-2 rounded-lg gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          <Save className="h-4 w-4" />
          Save changes
        </button>
      </div>
    </div>
  );
}
