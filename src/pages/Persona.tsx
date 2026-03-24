import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { User, Save, Edit2, X, Loader2, Trash2, Bot, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

type DPOStep = "idle" | "generating" | "answering" | "complete";

interface DPOQuestion {
  id: string;
  text: string;
  answer?: string;
}

const MOCK_DPO_QUESTIONS: Omit<DPOQuestion, "answer">[] = [
  { id: "q1", text: "When someone disagrees with you in a comment, how do you prefer your avatar to respond? (e.g. stay neutral, lean into debate, deflect with humor)" },
  { id: "q2", text: "Describe the kind of humor your avatar should use. Give one example of a joke or tone you'd want vs. one you'd avoid." },
  { id: "q3", text: "What topics should your avatar never comment on or endorse, even if asked?" },
  { id: "q4", text: "How formal or casual should the voice be on a scale from 'professional only' to 'best friend slang'? Describe in one sentence." },
  { id: "q5", text: "If a brand wants your avatar to promote a product, what boundaries should it respect? (e.g. no paid health claims, no politics)" },
  { id: "q6", text: "Write a sample reply your avatar might send to a follower asking: 'How do you stay so consistent with content?'" },
];

export default function Persona() {
  const navigate = useNavigate();
  const app = useApp();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(app.persona);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);

  const [dpoStep, setDpoStep] = useState<DPOStep>("idle");
  const [dpoQuestions, setDpoQuestions] = useState<DPOQuestion[]>([]);
  const [dpoCurrentIndex, setDpoCurrentIndex] = useState(0);
  const [dpoAnswerInput, setDpoAnswerInput] = useState("");

  useEffect(() => {
    if (!app.onboardingComplete) navigate("/onboarding", { replace: true });
  }, [app.onboardingComplete, navigate]);

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

  const startDpoQuestionnaire = () => {
    setDpoStep("generating");
    setDpoAnswerInput("");
    setDpoCurrentIndex(0);
    setTimeout(() => {
      setDpoQuestions(MOCK_DPO_QUESTIONS.map(q => ({ ...q })));
      setDpoStep("answering");
      toast.success("Questionnaire ready. Answer each question to tune your model.");
    }, 1200);
  };

  const submitDpoAnswer = () => {
    const trimmed = dpoAnswerInput.trim();
    if (!trimmed) return;
    const next = [...dpoQuestions];
    next[dpoCurrentIndex] = { ...next[dpoCurrentIndex], answer: trimmed };
    setDpoQuestions(next);
    setDpoAnswerInput("");
    if (dpoCurrentIndex + 1 >= next.length) {
      setDpoStep("complete");
      toast.success("All answers saved. Responses will be used for model tuning.");
    } else {
      setDpoCurrentIndex(dpoCurrentIndex + 1);
    }
  };

  const resetDpo = () => {
    setDpoStep("idle");
    setDpoQuestions([]);
    setDpoCurrentIndex(0);
    setDpoAnswerInput("");
  };

  const allTags = ["fashion", "tech", "travel", "memes", "fitness", "food", "photography", "AI", "lifestyle", "music", "art", "gaming"];

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-20 lg:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Avatar Studio</h1>
          <p className="text-muted-foreground text-sm">One avatar for Marketplace Chat and Content Studio. View and edit your avatar's personality and content style.</p>
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
          <p className="mt-2 text-xs text-muted-foreground">Based on {form.modelStatus > 80 ? "12" : "5"} uploaded photos</p>
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-success/10 p-2 text-xs text-success">
            <Loader2 className="h-3 w-3 animate-spin-slow" />
            Model training in progress...
          </div>
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
                  <button onClick={() => { setEditingTemplate(null); toast.success("Template saved (mock)"); }}
                    className="mt-2 rounded-md gradient-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    Save Template
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Direct Policy Optimization (DPO) */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Direct Policy Optimization (DPO)</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          The chatbot generates a set of questionnaires based on your avatar. Your answers are used to tune the identity model so your avatar responds more consistently with your preferences.
        </p>

        {dpoStep === "idle" && (
          <button
            onClick={startDpoQuestionnaire}
            className="flex items-center gap-2 rounded-lg gradient-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <Bot className="h-4 w-4" /> Generate questionnaire
          </button>
        )}

        {dpoStep === "generating" && (
          <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-4 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            Generating questions based on your avatar…
          </div>
        )}

        {(dpoStep === "answering" || dpoStep === "complete") && dpoQuestions.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {dpoStep === "complete"
                  ? "All questions answered"
                  : `Question ${dpoCurrentIndex + 1} of ${dpoQuestions.length}`}
              </span>
              <button
                onClick={resetDpo}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Start over
              </button>
            </div>
            <div className="h-[280px] rounded-lg border border-border bg-muted/30 overflow-hidden flex flex-col">
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-3 pr-2">
                  {dpoQuestions.map((q, i) => (
                    <div key={q.id} className="space-y-2">
                      <div className={cn(
                        "max-w-[85%] rounded-xl px-4 py-2.5 text-sm",
                        "gradient-primary text-primary-foreground"
                      )}>
                        <div className="flex items-center gap-2 mb-1">
                          <Bot className="h-3.5 w-3.5 opacity-90" />
                          <span className="font-medium text-xs opacity-90">Question {i + 1}</span>
                        </div>
                        <p className="text-[13px]">{q.text}</p>
                      </div>
                      {q.answer != null && (
                        <div className="flex justify-end">
                          <div className="max-w-[85%] rounded-xl bg-secondary px-4 py-2.5 text-sm">
                            <div className="flex items-center gap-2 mb-1">
                              <User className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="font-medium text-xs text-muted-foreground">Your answer</span>
                            </div>
                            <p className="text-[13px]">{q.answer}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
              {dpoStep === "answering" && (
                <div className="p-3 border-t border-border bg-background/50">
                  <div className="flex gap-2">
                    <textarea
                      value={dpoAnswerInput}
                      onChange={e => setDpoAnswerInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitDpoAnswer(); } }}
                      placeholder="Type your answer…"
                      rows={2}
                      className="flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                      onClick={submitDpoAnswer}
                      disabled={!dpoAnswerInput.trim()}
                      className="flex items-center gap-1.5 self-end rounded-lg gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50 hover:enabled:opacity-90"
                    >
                      <Send className="h-4 w-4" /> Submit
                    </button>
                  </div>
                </div>
              )}
            </div>
            {dpoStep === "complete" && (
              <div className="flex flex-wrap items-center gap-2 rounded-lg bg-success/10 p-3 text-sm text-success">
                <Loader2 className="h-4 w-4 animate-spin-slow" />
                Responses saved. These will be used to tune your avatar model when you run optimization.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
