import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { QuestionnaireFields, type QuestionnaireAnswers } from "@/components/studio/QuestionnaireFields";
import { QUESTIONNAIRE_OPTIONAL_SKIP_HINT } from "@/lib/studio/avatar-questionnaire";
import { RagDocumentsUploadZone } from "@/components/studio/RagDocumentsUploadZone";
import { IndividualAvatarIdentityPanel } from "@/components/studio/IndividualAvatarIdentityPanel";
import { AvatarSetupForm } from "@/components/studio/AvatarSetupForm";
import { presetForArchetype } from "@/lib/studio/avatar-archetypes";
import { avatarHandleError, normalizeAvatarHandle } from "@/lib/studio/avatar-handle";
import type { IndividualAvatarSetupMock, RagDocumentItem, StudioEntityIndividual } from "@/types/studio";

export const INDIVIDUAL_SETUP_TABS = [
  "Welcome",
  "Photos",
  "Avatar",
  "Identity",
  "Questionnaire",
  "Personal Knowledge Model",
  "Voice",
  "Marketplace",
] as const;

function activeMarketplaceSubscriptions(entity: StudioEntityIndividual): number {
  return entity.marketplace_active_subscriptions ?? entity.marketplace_downloads;
}

export type IndividualSetupTab = (typeof INDIVIDUAL_SETUP_TABS)[number];

export const MAX_INDIVIDUAL_TRAINING_PHOTOS = 10;

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
    avatarArchetype: string;
  };
  answers: QuestionnaireAnswers;
  ragDocuments: RagDocumentItem[];
  voiceEnabled: boolean;
} {
  const s = entity.individualSetup;
  const n = Math.min(MAX_INDIVIDUAL_TRAINING_PHOTOS, Math.max(0, s.photoCount));
  return {
    photos: Array.from({ length: n }, (_, i) => `photo-${i}`),
    personaForm: {
      name: entity.name,
      handle: normalizeAvatarHandle(entity.handle ?? entity.name),
      bio: s.bio,
      tonePlayful: s.tonePlayful,
      toneBold: s.toneBold,
      toneWitty: s.toneWitty,
      styleTags: [...s.styleTags],
      audience: s.audience,
      avatarArchetype: s.avatarArchetype ?? "",
    },
    answers: { ...s.questionnaireAnswers },
    ragDocuments: s.ragDocuments.map((d) => ({ ...d })),
    voiceEnabled: s.voiceCloningEnabled,
  };
}

export function useIndividualAvatarDraft(entity: StudioEntityIndividual) {
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

  const addMockPhoto = useCallback(() => {
    setPhotos((p) => {
      if (p.length >= MAX_INDIVIDUAL_TRAINING_PHOTOS) {
        toast.error(`Maximum ${MAX_INDIVIDUAL_TRAINING_PHOTOS} photos.`);
        return p;
      }
      toast.success("Photo added");
      return [...p, `photo-${Date.now()}`];
    });
  }, []);

  const buildNextEntity = useCallback((): StudioEntityIndividual => {
    const prev = entity.individualSetup;
    const ekycBundle = prev.mydigitalEkycVerified && prev.zetrixDid;
    const setup: IndividualAvatarSetupMock = {
      bio: personaForm.bio,
      ...(personaForm.avatarArchetype.trim() ? { avatarArchetype: personaForm.avatarArchetype.trim() } : {}),
      audience: personaForm.audience,
      styleTags: [...personaForm.styleTags],
      tonePlayful: personaForm.tonePlayful,
      toneBold: personaForm.toneBold,
      toneWitty: personaForm.toneWitty,
      photoCount: photos.length,
      voiceCloningEnabled: voiceEnabled,
      questionnaireAnswers: { ...answers },
      ragDocuments: ragDocuments.map((d) => ({ ...d })),
      ...(prev.mockEkycVerification ? { mockEkycVerification: { ...prev.mockEkycVerification } } : {}),
      ...(ekycBundle
        ? {
            mydigitalEkycVerified: true,
            zetrixDid: prev.zetrixDid,
            mykadVc: prev.mykadVc ? ({ ...prev.mykadVc } as Record<string, unknown>) : undefined,
          }
        : {}),
    };
    const name = personaForm.name.trim() || entity.name;
    const nextHandle = normalizeAvatarHandle(personaForm.handle);
    return {
      ...entity,
      name,
      handle: nextHandle,
      description: (personaForm.bio || name).slice(0, 220),
      individualSetup: setup,
    };
  }, [answers, entity, personaForm, photos.length, ragDocuments, voiceEnabled]);

  return {
    photos,
    setPhotos,
    personaForm,
    setPersonaForm,
    answers,
    setAnswers,
    ragDocuments,
    setRagDocuments,
    voiceEnabled,
    setVoiceEnabled,
    addMockPhoto,
    buildNextEntity,
  };
}

export type IndividualAvatarDraft = ReturnType<typeof useIndividualAvatarDraft>;

export function IndividualAvatarSetupStepContent({
  tab,
  entity,
  draft,
  onPersistIndividualEkyc,
}: {
  tab: IndividualSetupTab;
  entity: StudioEntityIndividual;
  draft: IndividualAvatarDraft;
  onPersistIndividualEkyc?: (next: StudioEntityIndividual) => void;
}) {
  const {
    photos,
    setPhotos,
    personaForm,
    setPersonaForm,
    answers,
    setAnswers,
    ragDocuments,
    setRagDocuments,
    voiceEnabled,
    setVoiceEnabled,
    addMockPhoto,
  } = draft;

  switch (tab) {
    case "Welcome":
      return (
        <div className="rounded-xl border border-border bg-card p-6 text-sm shadow-card">
          <div className="rounded-lg bg-secondary/40 p-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary">
              <Sparkles className="h-7 w-7 text-primary-foreground" />
            </div>
            <p className="mx-auto max-w-lg text-muted-foreground">
              Use the tabs above to edit this avatar the same way as Create Avatar → Avatar. Changes apply when you click{" "}
              <span className="font-medium text-foreground">Save changes</span>. Catalog entries save on first save; your own
              avatars update in place.
            </p>
            <div className="mx-auto mt-6 grid max-w-lg grid-cols-1 gap-2 text-left sm:grid-cols-3">
              {[
                { icon: Camera, label: "Photos" },
                { icon: UserCheck, label: "Avatar" },
                { icon: MessageCircle, label: "Identity, questionnaire & Personal Knowledge Model" },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-2 rounded-lg border border-border bg-card p-3 text-xs">
                  <f.icon className="h-4 w-4 text-primary" />
                  {f.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case "Photos":
      return (
        <div className="rounded-xl border border-border bg-card p-4 text-sm shadow-card">
          <h3 className="mb-1 text-lg font-bold">Photos</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Training photo count (placeholder tiles). Same behavior as the create wizard.
          </p>
          <div
            role="button"
            tabIndex={0}
            onClick={addMockPhoto}
            onKeyDown={(e) => e.key === "Enter" && addMockPhoto()}
            className="cursor-pointer rounded-xl border-2 border-dashed border-border p-8 text-center transition-all hover:border-primary/50 hover:bg-primary/5"
          >
            <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">Add training photo</p>
            <p className="mt-1 text-xs text-muted-foreground">
              JPG, PNG up to 10MB · Max {MAX_INDIVIDUAL_TRAINING_PHOTOS} photos
            </p>
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
            {photos.length}/{MAX_INDIVIDUAL_TRAINING_PHOTOS} photos · Count is stored on this avatar listing.
          </p>
        </div>
      );

    case "Avatar":
      return (
        <div className="rounded-xl border border-border bg-card p-4 text-sm shadow-card">
          <AvatarSetupForm
            values={{
              name: personaForm.name,
              handle: personaForm.handle,
              bio: personaForm.bio,
              avatarArchetype: personaForm.avatarArchetype ?? "",
            }}
            onFieldChange={(key, value) =>
              setPersonaForm((f) => ({
                ...f,
                [key]: key === "handle" ? normalizeAvatarHandle(String(value)) : value,
              }))
            }
            onSelectArchetype={(label) => {
              const p = presetForArchetype(label);
              setPersonaForm((f) => ({
                ...f,
                avatarArchetype: label,
                tonePlayful: p.tonePlayful,
                toneBold: p.toneBold,
                toneWitty: p.toneWitty,
                styleTags: [...p.styleTags],
                audience: p.audience,
              }));
            }}
          />
          {avatarHandleError(personaForm.handle) ? (
            <p className="mt-2 text-xs text-destructive">{avatarHandleError(personaForm.handle)}</p>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">Public chat URL: /{normalizeAvatarHandle(personaForm.handle)}</p>
          )}
        </div>
      );

    case "Identity":
      return <IndividualAvatarIdentityPanel entity={entity} onEkycPersist={onPersistIndividualEkyc} />;

    case "Questionnaire":
      return (
        <div className="rounded-xl border border-border bg-card p-4 text-sm shadow-card">
          <h3 className="mb-1 text-lg font-bold">Tell us about yourself</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Answer the questions below so your avatar can reflect who you are. Take your time, there are no right or wrong
            answers. {QUESTIONNAIRE_OPTIONAL_SKIP_HINT}
          </p>
          <QuestionnaireFields answers={answers} setAnswers={setAnswers} scrollClassName="max-h-[min(24rem,50vh)]" />
        </div>
      );

    case "Personal Knowledge Model":
      return (
        <div className="rounded-xl border border-border bg-card p-4 text-sm shadow-card">
          <h3 className="mb-1 text-lg font-bold">Personal Knowledge Model</h3>
          <p className="mb-4 text-sm text-muted-foreground">Metadata-only upload, same as create flow.</p>
          <RagDocumentsUploadZone documents={ragDocuments} onChange={setRagDocuments} idPrefix={`edit-rag-${entity.id}`} />
        </div>
      );

    case "Voice":
      return (
        <div className="rounded-xl border border-border bg-card p-4 text-sm shadow-card">
          <h3 className="mb-1 text-lg font-bold">Voice</h3>
          <p className="mb-4 text-sm text-muted-foreground">Optional voice cloning for Marketplace Chat.</p>
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
        </div>
      );

    case "Marketplace": {
      const n = activeMarketplaceSubscriptions(entity);
      return (
        <div className="space-y-4 rounded-xl border border-border bg-card p-4 text-sm shadow-card">
          <div>
            <h3 className="font-medium text-foreground">Marketplace listing</h3>
            <p className="mt-2 text-muted-foreground">
              Avatars are not downloaded as files. You publish a listing so other users can{" "}
              <span className="font-medium text-foreground">subscribe</span> and use this persona in Marketplace chat and
              related experiences.
            </p>
          </div>
          <div className="rounded-lg bg-secondary/50 p-3">
            <p className="text-xs text-muted-foreground">Active subscribers</p>
            <p className="mt-0.5 text-2xl font-semibold text-foreground">{n}</p>
            <p className="mt-1 text-xs text-muted-foreground">Counts seats with access to this avatar through the marketplace.</p>
          </div>
          <Link to="/marketplace" className="inline-flex text-sm font-medium text-primary hover:underline">
            Open Marketplace →
          </Link>
        </div>
      );
    }

    default:
      return null;
  }
}
