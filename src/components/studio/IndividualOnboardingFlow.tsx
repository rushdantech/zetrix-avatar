/**
 * The only individual / personal avatar flow in the app.
 * Surfaced as Create Avatar → Avatar. The legacy /onboarding URL redirects to Create Avatar.
 * There is no separate second wizard for the same purpose.
 */
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { QuestionnaireFields } from "@/components/studio/QuestionnaireFields";
import {
  ChevronRight,
  ChevronLeft,
  Upload,
  Mic,
  MicOff,
  Check,
  Sparkles,
  Camera,
  Send,
  Shield,
  UserCheck,
  X,
  Image as ImageIcon,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { RagDocumentsUploadZone } from "@/components/studio/RagDocumentsUploadZone";
import { MyDigitalEkycSection } from "@/components/studio/MyDigitalEkycSection";
import { AvatarSetupForm } from "@/components/studio/AvatarSetupForm";
import { buildIndividualStudioEntity } from "@/lib/studio/build-user-studio-entity";
import { presetForArchetype } from "@/lib/studio/avatar-archetypes";
import type { RagDocumentItem } from "@/types/studio";

const steps = [
  "Welcome",
  "Photos",
  "Avatar",
  "Questionnaire",
  "Documents (RAG)",
  "Voice",
  "MyDigital ID (eKYC)",
  "Consent",
  "Review",
];
const maxPhotos = 10;

export function IndividualOnboardingFlow({
  onComplete,
  onBackToTypeSelect,
  onChooseEnterprise,
}: {
  onComplete: () => void;
  onBackToTypeSelect: () => void;
  onChooseEnterprise: () => void;
}) {
  const app = useApp();
  const [step, setStep] = useState(0);
  const [photos, setPhotos] = useState<string[]>([]);
  const [ragDocuments, setRagDocuments] = useState<RagDocumentItem[]>(() => app.ragDocuments);
  const [personaForm, setPersonaForm] = useState({
    name: app.persona.name,
    bio: app.persona.bio,
    avatarArchetype: app.persona.avatarArchetype ?? "",
    tonePlayful: app.persona.tonePlayful,
    toneBold: app.persona.toneBold,
    toneWitty: app.persona.toneWitty,
    styleTags: app.persona.styleTags,
    audience: app.persona.audience,
  });
  const [answers, setAnswers] = useState<Record<number, string | string[] | number>>({});
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [voiceConsent, setVoiceConsent] = useState(false);
  const [mydigitalEkycCompleted, setMydigitalEkycCompleted] = useState(false);
  const [consent, setConsent] = useState({ likeness: false, posting: false, terms: false, signature: "" });

  const next = () => {
    if (step < steps.length - 1) setStep(step + 1);
  };
  const prev = () => {
    if (step > 0) setStep(step - 1);
  };

  const currentStepName = steps[step];

  const handleFinish = () => {
    const modelStatus = Math.min(100, Math.max(12, photos.length * 9));
    app.updatePersona({ ...personaForm, modelStatus });
    app.updateCreatorSetup({
      photoCount: photos.length,
      questionnaireAnswers: answers,
      voiceCloningEnabled: voiceEnabled,
    });
    app.setConsent({
      likenessConsent: consent.likeness,
      automatedPostingConsent: consent.posting,
      platformTerms: consent.terms,
      signatureName: consent.signature,
      timestamp: new Date().toISOString(),
    });
    app.setRagDocuments(ragDocuments);
    app.addUserStudioEntity(
      buildIndividualStudioEntity({
        personaForm,
        photosCount: photos.length,
        questionnaireAnswers: answers,
        voiceCloningEnabled: voiceEnabled,
        ragDocuments,
        mydigitalEkycCompleted,
      }),
    );
    app.setOnboardingComplete(true);
    app.generateContentPlan();
    toast.success("Avatar created. It appears in My Avatars; your dashboard persona is updated.");
    onComplete();
  };

  const addMockPhoto = () => {
    if (photos.length < maxPhotos) {
      setPhotos([...photos, `photo-${photos.length + 1}`]);
      toast.success("Photo uploaded successfully");
    } else {
      toast.error(`Maximum ${maxPhotos} photos allowed.`);
    }
  };

  return (
    <div className="mx-auto max-w-3xl pb-20 lg:pb-0">
      <div className="mb-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold">Set up your avatar</h2>
            <p className="text-sm text-muted-foreground">
              Create Avatar · Avatar · Step {step + 1} of {steps.length}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBackToTypeSelect}
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Back to My Avatars
            </button>
          </div>
        </div>
        <div className="flex gap-1">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn("h-1.5 flex-1 rounded-full transition-all", i <= step ? "gradient-primary" : "bg-secondary")}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between overflow-x-auto">
          {steps.map((s, i) => (
            <span
              key={s}
              className={cn(
                "whitespace-nowrap px-0.5 text-[10px] sm:block",
                i <= step ? "text-primary" : "text-muted-foreground",
              )}
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="animate-fade-in rounded-xl border border-border bg-card p-6 shadow-card">
        {currentStepName === "Welcome" && (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary animate-pulse-glow">
              <Sparkles className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="mb-2 text-2xl font-bold">Create your avatar</h3>
            <p className="mx-auto mb-6 max-w-md text-muted-foreground">
              This flow becomes your active dashboard persona and a new entry in My Avatars. Upload photos, define your style,
              add RAG documents, and voice (optional).
            </p>
            <p className="mb-6 text-center text-sm">
              <button
                type="button"
                onClick={onChooseEnterprise}
                className="text-primary underline-offset-4 hover:underline"
              >
                Creating an AI agent instead? Switch to AI agent →
              </button>
            </p>
            <div className="mx-auto grid max-w-lg grid-cols-1 gap-3 text-left sm:grid-cols-3">
              {[
                { icon: Camera, label: "Upload your photos" },
                { icon: UserCheck, label: "Define your avatar" },
                { icon: MessageCircle, label: "Marketplace & Content Studio" },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-2 rounded-lg bg-secondary p-3 text-sm">
                  <f.icon className="h-4 w-4 text-primary" />
                  <span>{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStepName === "Photos" && (
          <div>
            <h3 className="mb-1 text-xl font-bold">Upload Photos</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Upload 5–10 high-quality photos of yourself. They train your avatar for Marketplace Chat and Content Studio.
            </p>
            <div
              onClick={addMockPhoto}
              className="cursor-pointer rounded-xl border-2 border-dashed border-border p-8 text-center transition-all hover:border-primary/50 hover:bg-primary/5"
            >
              <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">Drop photos here or click to upload</p>
              <p className="mt-1 text-xs text-muted-foreground">
                JPG, PNG up to 10MB · Min 512×512px · Max {maxPhotos} photos
              </p>
            </div>
            {photos.length > 0 && (
              <div className="mt-4 grid grid-cols-5 gap-2">
                {photos.map((p, i) => (
                  <div key={`${p}-${i}`} className="relative flex aspect-square items-center justify-center rounded-lg bg-secondary">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    <button
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
              Tip: Use diverse lighting, angles, and outfits for best results. ({photos.length}/{maxPhotos})
            </p>
          </div>
        )}

        {currentStepName === "Avatar" && (
          <AvatarSetupForm
            values={{
              name: personaForm.name,
              bio: personaForm.bio,
              avatarArchetype: personaForm.avatarArchetype ?? "",
            }}
            onFieldChange={(key, value) => setPersonaForm((f) => ({ ...f, [key]: value }))}
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
        )}

        {currentStepName === "Questionnaire" && (
          <div>
            <h3 className="mb-1 text-xl font-bold">Tell us about yourself</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Answer the questions below so your avatar can reflect who you are. Take your time, there are no right or wrong
              answers.
            </p>
            <QuestionnaireFields answers={answers} setAnswers={setAnswers} />
          </div>
        )}

        {currentStepName === "Documents (RAG)" && (
          <div>
            <h3 className="mb-1 text-xl font-bold">Knowledge base (RAG)</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Upload documents your avatar can search during chat (metadata only; files stay in the browser).
            </p>
            <RagDocumentsUploadZone documents={ragDocuments} onChange={setRagDocuments} idPrefix="create-individual-rag" />
          </div>
        )}

        {currentStepName === "Voice" && (
          <div>
            <h3 className="mb-1 text-xl font-bold">Voice samples</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Optional: voice samples for cloning in Marketplace Chat.
            </p>
            <div
              className="mb-4 cursor-pointer rounded-xl border-2 border-dashed border-border p-8 text-center hover:border-primary/50"
              onClick={() => toast.info("Mock: Audio file uploaded")}
            >
              <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">Upload audio files</p>
              <p className="mt-1 text-xs text-muted-foreground">MP3, WAV, M4A up to 50MB</p>
            </div>
            <div className="mb-4 flex items-center gap-3 rounded-xl border border-border p-4">
              <button
                type="button"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition-all hover:bg-primary/20"
              >
                <Mic className="h-5 w-5 text-primary" />
              </button>
              <div>
                <p className="text-sm font-medium">Record a sample</p>
                <p className="text-xs text-muted-foreground">Press to start recording</p>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-secondary p-4">
              <div className="flex items-center gap-2">
                {voiceEnabled ? (
                  <Mic className="h-4 w-4 text-primary" />
                ) : (
                  <MicOff className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm font-medium">Enable voice cloning</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!voiceConsent && !voiceEnabled) {
                    setVoiceConsent(true);
                    setVoiceEnabled(true);
                  } else {
                    setVoiceEnabled(!voiceEnabled);
                  }
                }}
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
            {!voiceConsent && (
              <p className="mt-2 text-xs text-muted-foreground">Voice cloning requires consent in the next step.</p>
            )}
          </div>
        )}

        {currentStepName === "MyDigital ID (eKYC)" && (
          <MyDigitalEkycSection completed={mydigitalEkycCompleted} onCompletedChange={setMydigitalEkycCompleted} />
        )}

        {currentStepName === "Consent" && (
          <div>
            <h3 className="mb-1 text-xl font-bold">Consent & agreements</h3>
            <p className="mb-4 text-sm text-muted-foreground">Review and agree before creating your avatar.</p>
            <div className="mb-4 space-y-3">
              {[
                {
                  key: "likeness" as const,
                  icon: UserCheck,
                  label: "Likeness Consent",
                  desc: "I consent to the use of my likeness for AI-generated content.",
                },
                {
                  key: "posting" as const,
                  icon: Send,
                  label: "Automated Posting",
                  desc: "I authorize automated posting to connected social accounts when I use Content Studio.",
                },
                {
                  key: "terms" as const,
                  icon: Shield,
                  label: "Platform Terms",
                  desc: "I agree to the Zetrix Avatar Terms of Service and Privacy Policy.",
                },
              ].map((c) => (
                <label
                  key={c.key}
                  className="flex cursor-pointer items-start gap-3 rounded-xl bg-secondary p-4 transition-all hover:bg-secondary/80"
                >
                  <input
                    type="checkbox"
                    checked={consent[c.key]}
                    onChange={() => setConsent((co) => ({ ...co, [c.key]: !co[c.key] }))}
                    className="mt-1 accent-primary"
                    style={{ accentColor: "hsl(352, 72%, 42%)" }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <c.icon className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">{c.label}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{c.desc}</p>
                  </div>
                </label>
              ))}
            </div>
            <div>
              <label className="text-sm font-medium">Digital signature</label>
              <input
                value={consent.signature}
                onChange={(e) => setConsent((c) => ({ ...c, signature: e.target.value }))}
                placeholder="Type your full name"
                className="mt-1 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {consent.signature && (
                <p className="mt-1 text-xs text-muted-foreground">Signed on {new Date().toLocaleDateString()}</p>
              )}
            </div>
          </div>
        )}

        {currentStepName === "Review" && (
          <div>
            <h3 className="mb-1 text-xl font-bold">Review & create</h3>
            <p className="mb-4 text-sm text-muted-foreground">Confirm details, then create your avatar.</p>
            <div className="space-y-3">
              <div className="rounded-lg bg-secondary p-3">
                <p className="mb-1 text-xs text-muted-foreground">Avatar</p>
                {personaForm.avatarArchetype ? (
                  <p className="text-sm font-medium text-foreground">{personaForm.avatarArchetype}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">No preset selected</p>
                )}
                <p className="mt-1 text-sm font-medium">{personaForm.name || "—"}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{personaForm.bio || "—"}</p>
                {personaForm.styleTags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {personaForm.styleTags.map((t) => (
                      <span key={t} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="rounded-lg bg-secondary p-3">
                <p className="mb-1 text-xs text-muted-foreground">Consent</p>
                <div className="flex items-center gap-2">
                  {consent.likeness && consent.terms ? (
                    <>
                      <Check className="h-4 w-4 text-success" />
                      <span className="text-sm">All consents granted</span>
                    </>
                  ) : (
                    <span className="text-sm text-warning">Some consents missing</span>
                  )}
                </div>
                {consent.signature && (
                  <p className="mt-1 text-xs text-muted-foreground">Signed by: {consent.signature}</p>
                )}
              </div>
              <div className="rounded-lg bg-secondary p-3">
                <p className="mb-1 text-xs text-muted-foreground">Voice (optional)</p>
                <div className="flex items-center gap-2">
                  {voiceEnabled ? (
                    <>
                      <Check className="h-4 w-4 text-success" />
                      <span className="text-sm">Enabled</span>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">Not enabled</span>
                  )}
                </div>
              </div>
              <div className="rounded-lg bg-secondary p-3">
                <p className="mb-1 text-xs text-muted-foreground">MyDigital ID (eKYC)</p>
                <div className="flex items-center gap-2">
                  {mydigitalEkycCompleted ? (
                    <>
                      <Check className="h-4 w-4 text-success" />
                      <span className="text-sm">Completed — Zetrix DID and MyKad VC will be stored (mock)</span>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">Skipped</span>
                  )}
                </div>
              </div>
              <div className="rounded-lg bg-secondary p-3">
                <p className="mb-1 text-xs text-muted-foreground">Photos</p>
                <span className="text-sm">{photos.length} photos uploaded</span>
              </div>
              <div className="rounded-lg bg-secondary p-3">
                <p className="mb-1 text-xs text-muted-foreground">RAG documents</p>
                <span className="text-sm">
                  {ragDocuments.length === 0
                    ? "None — optional"
                    : `${ragDocuments.length} file(s): ${ragDocuments.map((d) => d.name).join(", ")}`}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={prev}
          disabled={step === 0}
          className={cn(
            "flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium transition-all",
            step === 0 ? "cursor-not-allowed text-muted-foreground" : "bg-secondary text-foreground hover:bg-secondary/80",
          )}
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        {step === steps.length - 1 ? (
          <button
            type="button"
            onClick={handleFinish}
            className="flex items-center gap-2 rounded-lg gradient-primary px-6 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:opacity-90"
          >
            <Sparkles className="h-4 w-4" />
            Create avatar
          </button>
        ) : (
          <button
            type="button"
            onClick={next}
            className="flex items-center gap-1 rounded-lg gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:opacity-90"
          >
            Continue <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
