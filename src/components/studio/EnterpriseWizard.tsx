import { Link } from "react-router-dom";
import { ENTERPRISE_CAPABILITIES } from "@/lib/studio/constants";
import type { EnterpriseAgentDraft } from "@/types/studio";

export function EnterpriseWizard({
  form,
  setForm,
}: {
  form: EnterpriseAgentDraft;
  setForm: (v: EnterpriseAgentDraft) => void;
}) {
  return (
    <div className="space-y-4">
      <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Agent name" className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm" />
      <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={3} className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm" />
      <div className="space-y-2">
        {ENTERPRISE_CAPABILITIES.map((c) => (
          <label key={c.key} className="block text-xs">
            <input type="checkbox" checked={form.capabilities.includes(c.key)} onChange={() => setForm({ ...form, capabilities: form.capabilities.includes(c.key) ? form.capabilities.filter((x) => x !== c.key) : [...form.capabilities, c.key] })} className="mr-1" />
            {c.label} <span className="text-muted-foreground">- {c.description}</span>
          </label>
        ))}
      </div>
      <div className="rounded-lg border border-warning/30 bg-warning/10 p-3">
        <p className="text-xs font-medium text-warning">Identity & Compliance</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Enterprise agents need a verified digital identity for signing documents and government submissions.
        </p>
        <label className="mt-2 flex items-center gap-2 text-xs">
          <input type="checkbox" checked={form.setupIdentityNow} onChange={(e) => setForm({ ...form, setupIdentityNow: e.target.checked })} />
          Set up digital identity now
        </label>
        {form.setupIdentityNow ? (
          <div className="mt-2 text-xs text-muted-foreground">
            Your enterprise identity: <span className="text-success">Verified (Acme Sdn Bhd)</span>. Full policy config is available in Digital Identity.
          </div>
        ) : (
          <p className="mt-2 text-xs text-muted-foreground">
            You can credential this agent later from Digital Identity. <Link to="/identity/me" className="text-primary hover:underline">Verify now →</Link>
          </p>
        )}
      </div>
    </div>
  );
}
