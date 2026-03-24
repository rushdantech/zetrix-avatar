import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { questionnaireQuestions } from "@/lib/mock-data";
import {
  ChevronRight, ChevronLeft, Upload, Mic, MicOff, Check,
  Sparkles, Camera, Send,
  Shield, UserCheck, X, Image as ImageIcon,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const steps = ["Welcome", "Photos", "Avatar", "Questionnaire", "Voice", "Consent", "Review"];
const maxPhotos = 10;

export default function Onboarding() {
  const navigate = useNavigate();
  const location = useLocation();
  const resumeCreateIndividual = Boolean(
    (location.state as { resumeCreateIndividual?: boolean } | null)?.resumeCreateIndividual,
  );
  const app = useApp();
  const [step, setStep] = useState(0);
  const [photos, setPhotos] = useState<string[]>([]);
  const [personaForm, setPersonaForm] = useState({
    name: app.persona.name,
    bio: app.persona.bio,
    tonePlayful: app.persona.tonePlayful,
    toneBold: app.persona.toneBold,
    toneWitty: app.persona.toneWitty,
    styleTags: app.persona.styleTags,
    audience: app.persona.audience,
  });
  const [answers, setAnswers] = useState<Record<number, string | string[] | number>>({});
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [voiceConsent, setVoiceConsent] = useState(false);
  const [consent, setConsent] = useState({ likeness: false, posting: false, terms: false, signature: "" });

  const next = () => { if (step < steps.length - 1) setStep(step + 1); };
  const prev = () => { if (step > 0) setStep(step - 1); };

  const currentStepName = steps[step];

  const handleFinish = () => {
    app.updatePersona(personaForm);
    app.setConsent({
      likenessConsent: consent.likeness,
      automatedPostingConsent: consent.posting,
      platformTerms: consent.terms,
      signatureName: consent.signature,
      timestamp: new Date().toISOString(),
    });
    app.setOnboardingComplete(true);
    app.generateContentPlan();
    toast.success("🎉 Creator onboarding complete! Continue in Avatar Studio to finish your individual avatar.");
    if (resumeCreateIndividual) {
      navigate("/studio/avatars/create", { state: { preselectIndividual: true }, replace: true });
    } else {
      navigate("/dashboard");
    }
  };

  const addMockPhoto = () => {
    if (photos.length < maxPhotos) {
      setPhotos([...photos, `photo-${photos.length + 1}`]);
      toast.success("Photo uploaded successfully");
    } else {
      toast.error(`Maximum ${maxPhotos} photos allowed.`);
    }
  };

  const allStyleTags = ["fashion", "tech", "travel", "memes", "fitness", "food", "photography", "AI", "lifestyle", "music", "art", "gaming"];

  const toggleTag = (tag: string) => {
    setPersonaForm(f => ({
      ...f,
      styleTags: f.styleTags.includes(tag)
        ? f.styleTags.filter(t => t !== tag)
        : [...f.styleTags, tag],
    }));
  };

  return (
    <div className="mx-auto max-w-3xl pb-20 lg:pb-0">
      {/* Progress */}
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-xl font-bold">Set up your avatar</h1>
          <span className="text-sm text-muted-foreground">Step {step + 1} of {steps.length}</span>
        </div>
        <div className="flex gap-1">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-all",
                i <= step ? "gradient-primary" : "bg-secondary"
              )}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between">
          {steps.map((s, i) => (
            <span key={s} className={cn("text-[10px] hidden sm:block", i <= step ? "text-primary" : "text-muted-foreground")}>
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="animate-fade-in rounded-xl border border-border bg-card p-6 shadow-card">
        {/* Welcome */}
        {currentStepName === "Welcome" && (
          <div className="text-center py-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary animate-pulse-glow">
              <Sparkles className="h-8 w-8 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Create your avatar</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              One avatar powers everything: chat in the Marketplace and generate content in Content Studio for social media. Upload photos, define your style, and add voice (optional).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto text-left">
              {[
                { icon: Camera, label: "Upload your photos" },
                { icon: UserCheck, label: "Define your avatar" },
                { icon: MessageCircle, label: "Marketplace Chat & Content Studio" },
              ].map(f => (
                <div key={f.label} className="flex items-center gap-2 rounded-lg bg-secondary p-3 text-sm">
                  <f.icon className="h-4 w-4 text-primary" />
                  <span>{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Photos */}
        {currentStepName === "Photos" && (
          <div>
            <h2 className="text-xl font-bold mb-1">Upload Photos</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Upload 5–10 high-quality photos of yourself. They train your avatar for Marketplace Chat and Content Studio.
            </p>
            <div
              onClick={addMockPhoto}
              className="cursor-pointer rounded-xl border-2 border-dashed border-border p-8 text-center transition-all hover:border-primary/50 hover:bg-primary/5"
            >
              <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">Drop photos here or click to upload</p>
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 10MB · Min 512×512px · Max {maxPhotos} photos</p>
            </div>
            {photos.length > 0 && (
              <div className="mt-4 grid grid-cols-5 gap-2">
                {photos.map((p, i) => (
                  <div key={i} className="relative aspect-square rounded-lg bg-secondary flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    <button onClick={(e) => { e.stopPropagation(); setPhotos(photos.filter((_, j) => j !== i)); }}
                      className="absolute -right-1 -top-1 rounded-full bg-destructive p-0.5 text-destructive-foreground">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              💡 Tip: Use diverse lighting, angles, and outfits for best results. ({photos.length}/{maxPhotos})
            </p>
          </div>
        )}

        {/* Avatar */}
        {currentStepName === "Avatar" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-1">Avatar Setup</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Avatar Name</label>
                <input value={personaForm.name} onChange={e => setPersonaForm(f => ({ ...f, name: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="text-sm font-medium">Bio</label>
                <textarea value={personaForm.bio} onChange={e => setPersonaForm(f => ({ ...f, bio: e.target.value }))}
                  rows={2} className="mt-1 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Tone</label>
                {[
                  { key: "tonePlayful" as const, left: "Serious", right: "Playful" },
                  { key: "toneBold" as const, left: "Subtle", right: "Bold" },
                  { key: "toneWitty" as const, left: "Informative", right: "Witty" },
                ].map(t => (
                  <div key={t.key} className="mb-2 flex items-center gap-3">
                    <span className="w-20 text-xs text-muted-foreground text-right">{t.left}</span>
                    <input type="range" min={0} max={100} value={personaForm[t.key]}
                      onChange={e => setPersonaForm(f => ({ ...f, [t.key]: Number(e.target.value) }))}
                      className="flex-1 accent-primary" style={{ accentColor: "hsl(352, 72%, 42%)" }} />
                    <span className="w-20 text-xs text-muted-foreground">{t.right}</span>
                  </div>
                ))}
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Style Tags</label>
                <div className="flex flex-wrap gap-2">
                  {allStyleTags.map(tag => (
                    <button key={tag} onClick={() => toggleTag(tag)}
                      className={cn("rounded-full px-3 py-1 text-xs font-medium transition-all",
                        personaForm.styleTags.includes(tag)
                          ? "gradient-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground hover:text-foreground"
                      )}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Audience</label>
                <input value={personaForm.audience} onChange={e => setPersonaForm(f => ({ ...f, audience: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
            </div>
          </div>
        )}

        {/* Questionnaire */}
        {currentStepName === "Questionnaire" && (
          <div>
            <h2 className="text-xl font-bold mb-1">Avatar Personality Questionnaire</h2>
            <p className="text-sm text-muted-foreground mb-4">Image + Caption Optimization — help us craft your perfect avatar.</p>
            <div className="space-y-5 max-h-[28rem] overflow-y-auto pr-2">
              {questionnaireQuestions.map(q => (
                <div key={q.id} className="rounded-lg bg-secondary p-4">
                  <p className="text-sm font-medium mb-1">{q.id}. {q.question}</p>
                  {q.type === "multi" && <p className="text-xs text-muted-foreground mb-2">Select up to {q.maxSelect}</p>}

                  {q.type === "single" && q.options && (
                    <div className="space-y-1.5 mt-2">
                      {q.options.map(opt => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm">
                          <input type="radio" name={`q-${q.id}`} checked={answers[q.id] === opt}
                            onChange={() => setAnswers(a => ({ ...a, [q.id]: opt }))}
                            className="accent-primary" style={{ accentColor: "hsl(352, 72%, 42%)" }} />
                          {opt}
                        </label>
                      ))}
                    </div>
                  )}

                  {q.type === "multi" && q.options && (
                    <div className="space-y-1.5 mt-2">
                      {q.options.map(opt => {
                        const selected = (answers[q.id] as string[] || []);
                        const isChecked = selected.includes(opt);
                        const atMax = selected.length >= (q.maxSelect || 99) && !isChecked;
                        return (
                          <label key={opt} className={cn("flex items-center gap-2 cursor-pointer text-sm", atMax && "opacity-40 cursor-not-allowed")}>
                            <input type="checkbox" checked={isChecked} disabled={atMax}
                              onChange={() => {
                                setAnswers(a => {
                                  const prev = (a[q.id] as string[] || []);
                                  const next = isChecked ? prev.filter(v => v !== opt) : [...prev, opt];
                                  return { ...a, [q.id]: next };
                                });
                              }}
                              className="accent-primary" style={{ accentColor: "hsl(352, 72%, 42%)" }} />
                            {opt}
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {q.type === "scale" && (
                    <div className="mt-3">
                      <input type="range" min={q.scaleRange?.[0] || 1} max={q.scaleRange?.[1] || 5} step={1}
                        value={(answers[q.id] as number) || q.scaleRange?.[0] || 1}
                        onChange={e => setAnswers(a => ({ ...a, [q.id]: Number(e.target.value) }))}
                        className="w-full accent-primary" style={{ accentColor: "hsl(352, 72%, 42%)" }} />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{q.scaleMin}</span>
                        <span className="font-medium text-foreground">{(answers[q.id] as number) || q.scaleRange?.[0] || 1}</span>
                        <span>{q.scaleMax}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Voice (Online Avatar only) */}
        {currentStepName === "Voice" && (
          <div>
            <h2 className="text-xl font-bold mb-1">Voice Samples</h2>
            <p className="text-sm text-muted-foreground mb-4">Optional: provide voice samples to enable voice cloning for Marketplace Chat.</p>
            <div className="rounded-xl border-2 border-dashed border-border p-8 text-center cursor-pointer hover:border-primary/50 mb-4"
              onClick={() => toast.info("Mock: Audio file uploaded")}>
              <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">Upload audio files</p>
              <p className="text-xs text-muted-foreground mt-1">MP3, WAV, M4A up to 50MB</p>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border p-4 mb-4">
              <button className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20 transition-all">
                <Mic className="h-5 w-5 text-primary" />
              </button>
              <div>
                <p className="text-sm font-medium">Record a sample</p>
                <p className="text-xs text-muted-foreground">Press to start recording (mock)</p>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-secondary p-4">
              <div className="flex items-center gap-2">
                {voiceEnabled ? <Mic className="h-4 w-4 text-primary" /> : <MicOff className="h-4 w-4 text-muted-foreground" />}
                <span className="text-sm font-medium">Enable voice cloning</span>
              </div>
              <button
                onClick={() => {
                  if (!voiceConsent && !voiceEnabled) {
                    setVoiceConsent(true);
                    setVoiceEnabled(true);
                  } else {
                    setVoiceEnabled(!voiceEnabled);
                  }
                }}
                className={cn("h-6 w-11 rounded-full transition-all relative",
                  voiceEnabled ? "bg-primary" : "bg-border")}
              >
                <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-foreground transition-all",
                  voiceEnabled ? "left-5" : "left-0.5")} />
              </button>
            </div>
            {!voiceConsent && <p className="mt-2 text-xs text-muted-foreground">⚠ Voice cloning requires consent checkbox in the next step.</p>}
          </div>
        )}

        {/* Consent */}
        {currentStepName === "Consent" && (
          <div>
            <h2 className="text-xl font-bold mb-1">Consent & Agreements</h2>
            <p className="text-sm text-muted-foreground mb-4">Please review and agree to the following before proceeding.</p>
            <div className="space-y-3 mb-4">
              {[
                { key: "likeness" as const, icon: UserCheck, label: "Likeness Consent", desc: "I consent to the use of my likeness for AI-generated content." },
                { key: "posting" as const, icon: Send, label: "Automated Posting", desc: "I authorize automated posting to connected social accounts (e.g. Instagram) when I use Content Studio." },
                { key: "terms" as const, icon: Shield, label: "Platform Terms", desc: "I agree to the Zetrix Avatar Terms of Service and Privacy Policy." },
              ].map(c => (
                <label key={c.key} className="flex cursor-pointer items-start gap-3 rounded-xl bg-secondary p-4 transition-all hover:bg-secondary/80">
                  <input type="checkbox" checked={consent[c.key]}
                    onChange={() => setConsent(co => ({ ...co, [c.key]: !co[c.key] }))}
                    className="mt-1 accent-primary" style={{ accentColor: "hsl(352, 72%, 42%)" }} />
                  <div>
                    <div className="flex items-center gap-2">
                      <c.icon className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">{c.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{c.desc}</p>
                  </div>
                </label>
              ))}
            </div>
            <div>
              <label className="text-sm font-medium">Digital Signature</label>
              <input value={consent.signature} onChange={e => setConsent(c => ({ ...c, signature: e.target.value }))}
                placeholder="Type your full name"
                className="mt-1 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              {consent.signature && <p className="mt-1 text-xs text-muted-foreground">Signed on {new Date().toLocaleDateString()}</p>}
            </div>
          </div>
        )}

        {/* Review */}
        {currentStepName === "Review" && (
          <div>
            <h2 className="text-xl font-bold mb-1">Review & Finish</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Your avatar will be used for Marketplace Chat and for generating content in Content Studio.
            </p>
            <div className="space-y-3">
              <div className="rounded-lg bg-secondary p-3">
                <p className="text-xs text-muted-foreground mb-1">Avatar</p>
                <p className="text-sm font-medium">{personaForm.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{personaForm.bio}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {personaForm.styleTags.map(t => (
                    <span key={t} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{t}</span>
                  ))}
                </div>
              </div>
              <div className="rounded-lg bg-secondary p-3">
                <p className="text-xs text-muted-foreground mb-1">Consent</p>
                <div className="flex items-center gap-2">
                  {consent.likeness && consent.terms ? (
                    <><Check className="h-4 w-4 text-success" /><span className="text-sm">All consents granted</span></>
                  ) : (
                    <span className="text-sm text-warning">⚠ Some consents missing</span>
                  )}
                </div>
                {consent.signature && <p className="text-xs text-muted-foreground mt-1">Signed by: {consent.signature}</p>}
              </div>
              <div className="rounded-lg bg-secondary p-3">
                <p className="text-xs text-muted-foreground mb-1">Voice (optional)</p>
                <div className="flex items-center gap-2">
                  {voiceEnabled ? (
                    <><Check className="h-4 w-4 text-success" /><span className="text-sm">Enabled</span></>
                  ) : (
                    <span className="text-sm text-muted-foreground">Not enabled</span>
                  )}
                </div>
              </div>
              <div className="rounded-lg bg-secondary p-3">
                <p className="text-xs text-muted-foreground mb-1">Photos</p>
                <span className="text-sm">{photos.length} photos uploaded</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="mt-6 flex items-center justify-between">
        <button onClick={prev} disabled={step === 0}
          className={cn("flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium transition-all",
            step === 0 ? "cursor-not-allowed text-muted-foreground" : "bg-secondary text-foreground hover:bg-secondary/80")}>
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        {step === steps.length - 1 ? (
          <button onClick={handleFinish}
            className="flex items-center gap-2 rounded-lg gradient-primary px-6 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:opacity-90">
            <Sparkles className="h-4 w-4" />
            Finish setup
          </button>
        ) : (
          <button onClick={next}
            className="flex items-center gap-1 rounded-lg gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:opacity-90">
            Save & Continue <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function CheckCircle({ className }: { className?: string }) {
  return <Check className={className} />;
}
