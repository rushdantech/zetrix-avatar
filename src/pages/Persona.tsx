import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { Save, Edit2, X, Loader2, Trash2, Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { questionnaireQuestions } from "@/lib/mock-data";
import { QuestionnaireFields, formatQuestionnaireAnswer, type QuestionnaireAnswers } from "@/components/studio/QuestionnaireFields";
import { RagDocumentsUploadZone } from "@/components/studio/RagDocumentsUploadZone";

export default function Persona() {
  const navigate = useNavigate();
  const app = useApp();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(app.persona);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);

  const [qaEditing, setQaEditing] = useState(false);
  const [qaLocal, setQaLocal] = useState<QuestionnaireAnswers>({});

  useEffect(() => {
    if (!app.onboardingComplete) navigate("/studio/avatars/create", { replace: true });
  }, [app.onboardingComplete, navigate]);

  useEffect(() => {
    if (!editing) setForm(app.persona);
  }, [app.persona, editing]);

  const save = () => {
    app.updatePersona(form);
    setEditing(false);
    toast.success("Avatar updated!");
  };

  const handleDeletePersona = () => {
    if (!window.confirm("Delete your avatar? You can create a new one from the sidebar. This cannot be undone.")) return;
    app.deletePersona();
    toast.success("Avatar deleted. Use Create Avatar in the sidebar to set up a new one.");
    navigate("/dashboard");
  };

  const allTags = ["fashion", "tech", "travel", "memes", "fitness", "food", "photography", "AI", "lifestyle", "music", "art", "gaming"];

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-20 lg:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Avatar Studio</h1>
          <p className="text-muted-foreground text-sm">
            Your active dashboard persona for Marketplace Chat and Content Studio. Create additional avatars anytime from{" "}
            <button type="button" onClick={() => navigate("/studio/avatars/create")} className="text-primary underline hover:no-underline">
              Create Avatar
            </button>
            ; they appear in My Avatars.
          </p>
        </div>
        {!editing ? (
          <div className="flex items-center gap-2">
            <button onClick={() => setEditing(true)} className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80">
              <Edit2 className="h-4 w-4" /> Edit
            </button>
            <button onClick={handleDeletePersona} className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/20">
              <Trash2 className="h-4 w-4" /> Delete Avatar
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => { setForm(app.persona); setEditing(false); }} className="flex items-center gap-1 rounded-lg bg-secondary px-3 py-2 text-sm hover:bg-secondary/80">
              <X className="h-4 w-4" /> Cancel
            </button>
            <button onClick={save} className="flex items-center gap-1 rounded-lg gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground">
              <Save className="h-4 w-4" /> Save
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary text-lg font-bold text-primary-foreground">
              {form.name.charAt(0)}
            </div>
            <div>
              {editing ? (
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="bg-secondary border border-border rounded-md px-2 py-1 text-sm font-semibold focus:outline-none focus:border-primary" />
              ) : (
                <h3 className="font-semibold">{form.name}</h3>
              )}
              <p className="text-xs text-muted-foreground">AI Avatar</p>
            </div>
          </div>
          {editing ? (
            <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
          ) : (
            <p className="text-sm text-muted-foreground">{form.bio}</p>
          )}
          <div className="mt-3">
            <p className="mb-1 text-xs text-muted-foreground">Audience</p>
            {editing ? (
              <input
                value={form.audience}
                onChange={(e) => setForm((f) => ({ ...f, audience: e.target.value }))}
                className="w-full rounded-md border border-border bg-secondary px-2 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Who you create for"
              />
            ) : (
              <p className="text-sm text-muted-foreground">{form.audience.trim() ? form.audience : "—"}</p>
            )}
          </div>
        </div>

        {/* Identity Model Status */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h3 className="font-semibold mb-3">Identity Model</h3>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Training Progress</span>
            <span className="font-medium text-primary">{form.modelStatus}%</span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div className="h-full rounded-full gradient-primary transition-all" style={{ width: `${form.modelStatus}%` }} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {app.creatorSetup.photoCount > 0
              ? `Training reflects ${app.creatorSetup.photoCount} photo${app.creatorSetup.photoCount === 1 ? "" : "s"} from Create Avatar.`
              : "Add photos in Create Avatar to tie model training to your uploads."}
          </p>
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-success/10 p-2 text-xs text-success">
            <Loader2 className="h-3 w-3 animate-spin-slow" />
            Model training in progress...
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-card space-y-6">
        <div>
          <h3 className="mb-1 font-semibold">Create Avatar setup</h3>
          <p className="text-sm text-muted-foreground">
            What you submitted in Create Avatar → Avatar. Edit the questionnaire, voice cloning, and RAG files here.
          </p>
          <p className="mt-3 border-l-2 border-primary/30 pl-3 text-xs text-muted-foreground">
            DPO (preference tuning) is configured per avatar: open{" "}
            <button type="button" onClick={() => navigate("/studio/avatars")} className="text-primary underline hover:no-underline">
              My Avatars
            </button>
            , choose an avatar, then use the <span className="font-medium text-foreground">DPO</span> tab.
          </p>
        </div>

        <div className="rounded-lg bg-secondary/50 p-4">
          <p className="mb-1 text-xs text-muted-foreground">Training photos (from wizard)</p>
          <p className="text-sm font-medium">
            {app.creatorSetup.photoCount > 0
              ? `${app.creatorSetup.photoCount} photo${app.creatorSetup.photoCount === 1 ? "" : "s"}`
              : "None recorded yet."}
          </p>
        </div>

        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-sm font-medium">Personality questionnaire</h4>
            {!qaEditing ? (
              <button
                type="button"
                onClick={() => {
                  setQaLocal({ ...app.creatorSetup.questionnaireAnswers });
                  setQaEditing(true);
                }}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <Edit2 className="h-3 w-3" /> Edit answers
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setQaEditing(false);
                    setQaLocal({ ...app.creatorSetup.questionnaireAnswers });
                  }}
                  className="rounded-md border border-border px-2 py-1 text-xs hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    app.updateCreatorSetup({ questionnaireAnswers: qaLocal });
                    setQaEditing(false);
                    toast.success("Questionnaire updated");
                  }}
                  className="rounded-md gradient-primary px-2 py-1 text-xs font-medium text-primary-foreground"
                >
                  Save
                </button>
              </div>
            )}
          </div>
          {!qaEditing ? (
            <ul className="max-h-64 space-y-2 overflow-y-auto pr-1 text-sm">
              {questionnaireQuestions.map((q) => (
                <li key={q.id} className="rounded-lg bg-secondary p-3">
                  <p className="mb-0.5 text-xs text-muted-foreground">
                    {q.id}. {q.question}
                  </p>
                  <p className="font-medium">{formatQuestionnaireAnswer(q, app.creatorSetup.questionnaireAnswers[q.id])}</p>
                </li>
              ))}
            </ul>
          ) : (
            <QuestionnaireFields answers={qaLocal} setAnswers={setQaLocal} scrollClassName="max-h-80" />
          )}
        </div>

        <div className="flex items-center justify-between rounded-xl bg-secondary p-4">
          <div className="flex items-center gap-2">
            {app.creatorSetup.voiceCloningEnabled ? (
              <Mic className="h-4 w-4 text-primary" />
            ) : (
              <MicOff className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-sm font-medium">Voice cloning</span>
          </div>
          <button
            type="button"
            onClick={() => {
              const next = !app.creatorSetup.voiceCloningEnabled;
              app.updateCreatorSetup({ voiceCloningEnabled: next });
              toast.success(next ? "Voice cloning enabled" : "Voice cloning disabled");
            }}
            className={cn(
              "relative h-6 w-11 rounded-full transition-all",
              app.creatorSetup.voiceCloningEnabled ? "bg-primary" : "bg-border",
            )}
            aria-pressed={app.creatorSetup.voiceCloningEnabled}
          >
            <span
              className={cn(
                "absolute top-0.5 h-5 w-5 rounded-full bg-foreground transition-all",
                app.creatorSetup.voiceCloningEnabled ? "left-5" : "left-0.5",
              )}
            />
          </button>
        </div>

        <div>
          <h4 className="mb-2 text-sm font-medium">Knowledge base (RAG)</h4>
          <p className="mb-3 text-xs text-muted-foreground">
            Add or remove documents for chat context (metadata only; files stay in the browser).
          </p>
          <RagDocumentsUploadZone documents={app.ragDocuments} onChange={app.setRagDocuments} idPrefix="persona-rag" />
        </div>
      </div>

      {/* Tone Sliders */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <h3 className="font-semibold mb-4">Tone Settings</h3>
        <div className="space-y-3">
          {[
            { key: "tonePlayful" as const, left: "Serious", right: "Playful" },
            { key: "toneBold" as const, left: "Subtle", right: "Bold" },
            { key: "toneWitty" as const, left: "Informative", right: "Witty" },
          ].map(t => (
            <div key={t.key} className="flex items-center gap-3">
              <span className="w-24 text-xs text-muted-foreground text-right">{t.left}</span>
              <input type="range" min={0} max={100} value={form[t.key]} disabled={!editing}
                onChange={e => setForm(f => ({ ...f, [t.key]: Number(e.target.value) }))}
                className="flex-1 accent-primary" style={{ accentColor: "hsl(352, 72%, 42%)" }} />
              <span className="w-24 text-xs text-muted-foreground">{t.right}</span>
              <span className="w-8 text-xs font-medium text-primary">{form[t.key]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Style Tags + Schedule */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h3 className="font-semibold mb-3">Style Tags</h3>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <button key={tag} disabled={!editing}
                onClick={() => editing && setForm(f => ({
                  ...f, styleTags: f.styleTags.includes(tag) ? f.styleTags.filter(t => t !== tag) : [...f.styleTags, tag],
                }))}
                className={cn("rounded-full px-3 py-1 text-xs font-medium transition-all",
                  form.styleTags.includes(tag)
                    ? "gradient-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground",
                  editing && "cursor-pointer hover:opacity-80"
                )}>
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h3 className="font-semibold mb-3">Schedule</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Preferred Times</p>
              <div className="flex flex-wrap gap-2">
                {form.preferredTimes.map(t => (
                  <span key={t} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prompt Templates */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <h3 className="font-semibold mb-3">Prompt Templates</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {form.promptTemplates.map(tmpl => (
            <div key={tmpl.id} className="rounded-lg bg-secondary p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{tmpl.name}</span>
                <button onClick={() => setEditingTemplate(editingTemplate === tmpl.id ? null : tmpl.id)}
                  className="text-xs text-primary hover:underline">
                  {editingTemplate === tmpl.id ? "Close" : "Edit"}
                </button>
              </div>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">{tmpl.category}</span>
              {editingTemplate === tmpl.id && (
                <div className="mt-2 animate-fade-in">
                  <textarea defaultValue={tmpl.template} rows={3}
                    className="w-full bg-background border border-border rounded-md px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-primary" />
                  <button onClick={() => { setEditingTemplate(null); toast.success("Template saved"); }}
                    className="mt-2 rounded-md gradient-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    Save Template
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
