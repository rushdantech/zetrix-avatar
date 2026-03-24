import { KNOWLEDGE_DOMAINS, PERSONALITY_TRAITS } from "@/lib/studio/constants";
import type { IndividualAvatarDraft } from "@/types/studio";

export function IndividualWizard({
  form,
  setForm,
}: {
  form: IndividualAvatarDraft;
  setForm: (v: IndividualAvatarDraft) => void;
}) {
  return (
    <div className="space-y-4">
      <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Avatar name" className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm" />
      <input value={form.tagline} maxLength={120} onChange={(e) => setForm({ ...form, tagline: e.target.value })} placeholder="Tagline (max 120 chars)" className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm" />
      <div className="flex flex-wrap gap-2">
        {PERSONALITY_TRAITS.map((t) => (
          <button key={t} onClick={() => setForm({ ...form, personalityTraits: form.personalityTraits.includes(t) ? form.personalityTraits.filter((x) => x !== t) : [...form.personalityTraits, t] })} className="rounded-full bg-secondary px-3 py-1 text-xs">{t}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {KNOWLEDGE_DOMAINS.map((k) => (
          <label key={k} className="text-xs"><input type="checkbox" checked={form.knowledgeDomains.includes(k)} onChange={() => setForm({ ...form, knowledgeDomains: form.knowledgeDomains.includes(k) ? form.knowledgeDomains.filter((x) => x !== k) : [...form.knowledgeDomains, k] })} className="mr-1" />{k}</label>
        ))}
      </div>
    </div>
  );
}
