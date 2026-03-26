import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { questionnaireQuestions } from "@/lib/mock-data";
import {
  Globe, Camera, Mic, MicOff, Upload, Check, Edit2, Save, X,
  Image as ImageIcon, ChevronDown, ChevronUp, UserCheck, Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function OnlineAvatar() {
  const app = useApp();
  const [editing, setEditing] = useState(false);
  const [personaForm, setPersonaForm] = useState({
    name: app.persona.name,
    bio: app.persona.bio,
    tonePlayful: app.persona.tonePlayful,
    toneBold: app.persona.toneBold,
    toneWitty: app.persona.toneWitty,
    styleTags: app.persona.styleTags,
    audience: app.persona.audience,
  });
  const [expandedSection, setExpandedSection] = useState<string | null>("persona");

  const allStyleTags = ["fashion", "tech", "travel", "memes", "fitness", "food", "photography", "AI", "lifestyle", "music", "art", "gaming"];

  const toggleTag = (tag: string) => {
    setPersonaForm(f => ({
      ...f,
      styleTags: f.styleTags.includes(tag)
        ? f.styleTags.filter(t => t !== tag)
        : [...f.styleTags, tag],
    }));
  };

  const save = () => {
    app.updatePersona(personaForm);
    setEditing(false);
    toast.success("Online Avatar updated!");
  };

  const toggleSection = (s: string) => setExpandedSection(prev => prev === s ? null : s);

  const SectionHeader = ({ id, icon: Icon, title }: { id: string; icon: any; title: string }) => (
    <button
      onClick={() => toggleSection(id)}
      className="flex w-full items-center justify-between rounded-lg bg-secondary p-3 text-left transition-all hover:bg-secondary/80"
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">{title}</span>
      </div>
      {expandedSection === id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
    </button>
  );

  return (
    <div className="mx-auto max-w-3xl pb-20 lg:pb-0">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
            <Globe className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Online Avatar</h1>
            <p className="text-xs text-muted-foreground">Manage your marketplace avatar</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button onClick={() => setEditing(false)} className="flex items-center gap-1 rounded-lg bg-secondary px-3 py-2 text-sm hover:bg-secondary/80">
                <X className="h-3.5 w-3.5" /> Cancel
              </button>
              <button onClick={save} className="flex items-center gap-1 rounded-lg gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow">
                <Save className="h-3.5 w-3.5" /> Save
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="flex items-center gap-1 rounded-lg bg-secondary px-3 py-2 text-sm hover:bg-secondary/80">
              <Edit2 className="h-3.5 w-3.5" /> Edit
            </button>
          )}
        </div>
      </div>

      {/* Status card */}
      <div className="mb-4 rounded-xl border border-border bg-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
            <Check className="h-6 w-6 text-success" />
          </div>
          <div>
            <p className="text-sm font-semibold">Avatar Active</p>
            <p className="text-xs text-muted-foreground">Available in the marketplace chat</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs font-medium text-success">Live</span>
        </div>
      </div>

      <div className="space-y-3">
        {/* Avatar Section */}
        <SectionHeader id="persona" icon={UserCheck} title="Avatar" />
        {expandedSection === "persona" && (
          <div className="rounded-xl border border-border bg-card p-4 space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Name</label>
              {editing ? (
                <input value={personaForm.name} onChange={e => setPersonaForm(f => ({ ...f, name: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              ) : (
                <p className="text-sm font-medium mt-0.5">{personaForm.name}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Bio</label>
              {editing ? (
                <textarea value={personaForm.bio} onChange={e => setPersonaForm(f => ({ ...f, bio: e.target.value }))}
                  rows={2} className="mt-1 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              ) : (
                <p className="text-sm mt-0.5">{personaForm.bio}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Tone</label>
              <div className="mt-2 space-y-2">
                {[
                  { key: "tonePlayful" as const, left: "Serious", right: "Playful" },
                  { key: "toneBold" as const, left: "Subtle", right: "Bold" },
                  { key: "toneWitty" as const, left: "Informative", right: "Witty" },
                ].map(t => (
                  <div key={t.key} className="flex items-center gap-3">
                    <span className="w-20 text-xs text-muted-foreground text-right">{t.left}</span>
                    <input type="range" min={0} max={100} value={personaForm[t.key]}
                      disabled={!editing}
                      onChange={e => setPersonaForm(f => ({ ...f, [t.key]: Number(e.target.value) }))}
                      className="flex-1 accent-primary" style={{ accentColor: "hsl(352, 72%, 42%)" }} />
                    <span className="w-20 text-xs text-muted-foreground">{t.right}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Style Tags</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {allStyleTags.map(tag => (
                  <button key={tag} onClick={() => editing && toggleTag(tag)} disabled={!editing}
                    className={cn("rounded-full px-3 py-1 text-xs font-medium transition-all",
                      personaForm.styleTags.includes(tag)
                        ? "gradient-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground",
                      !editing && "cursor-default"
                    )}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Audience</label>
              {editing ? (
                <input value={personaForm.audience} onChange={e => setPersonaForm(f => ({ ...f, audience: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              ) : (
                <p className="text-sm mt-0.5">{personaForm.audience}</p>
              )}
            </div>
          </div>
        )}

        {/* Photos Section */}
        <SectionHeader id="photos" icon={Camera} title="Photos" />
        {expandedSection === "photos" && (
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-3">Up to 3 photos for your online avatar.</p>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="aspect-square rounded-lg bg-secondary flex items-center justify-center border-2 border-dashed border-border hover:border-primary/40 cursor-pointer transition-all">
                  <div className="text-center">
                    <ImageIcon className="mx-auto h-6 w-6 text-muted-foreground mb-1" />
                    <span className="text-[10px] text-muted-foreground">Photo {i}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Voice Section */}
        <SectionHeader id="voice" icon={Mic} title="Voice Cloning" />
        {expandedSection === "voice" && (
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">Voice cloning status</p>
              <div className="flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1">
                <Mic className="h-3 w-3 text-success" />
                <span className="text-xs font-medium text-success">Active</span>
              </div>
            </div>
            <div className="rounded-lg bg-secondary p-3 mb-3">
              <p className="text-xs text-muted-foreground mb-1">Voice samples</p>
              <p className="text-sm">2 samples uploaded</p>
            </div>
            <button onClick={() => toast.info("Mock: Upload new voice sample")}
              className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm hover:bg-secondary/80 transition-all">
              <Upload className="h-3.5 w-3.5" /> Upload new sample
            </button>
          </div>
        )}

        {/* Consent Section */}
        <SectionHeader id="consent" icon={Shield} title="Consent & Agreements" />
        {expandedSection === "consent" && (
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="space-y-2">
              {[
                { label: "Likeness Consent", granted: true },
                { label: "Platform Terms", granted: true },
              ].map(c => (
                <div key={c.label} className="flex items-center justify-between rounded-lg bg-secondary p-3">
                  <span className="text-sm">{c.label}</span>
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-success" />
                    <span className="text-xs text-success">Granted</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Signed by: {app.consent.signatureName || "CZ Wong"} · {app.consent.timestamp ? new Date(app.consent.timestamp).toLocaleDateString() : "Dec 15, 2024"}</p>
          </div>
        )}
      </div>
    </div>
  );
}
