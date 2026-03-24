import { Link } from "react-router-dom";
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
import { ENTERPRISE_CAPABILITIES } from "@/lib/studio/constants";
import { ZID_ACTION_SCOPES } from "@/lib/identity/constants";
import { formatScopeLabel } from "@/lib/identity/format";
import type { EnterpriseAgentDraft } from "@/types/studio";
import { Switch } from "@/components/ui/switch";

export function EnterpriseStepProfile() {
  const { control } = useFormContext<EnterpriseAgentDraft>();

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Agent name</FormLabel>
            <FormControl>
              <Input placeholder="e.g. Tax Filing Agent" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea rows={4} placeholder="What this agent does" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="agentType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Agent type</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Internal Operations">Internal Operations</SelectItem>
                <SelectItem value="Customer-Facing">Customer-Facing</SelectItem>
                <SelectItem value="Compliance & Reporting">Compliance & Reporting</SelectItem>
                <SelectItem value="Financial Processing">Financial Processing</SelectItem>
                <SelectItem value="Custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="department"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Team / department (optional)</FormLabel>
            <FormControl>
              <Input placeholder="Finance, HR, Legal…" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export function EnterpriseStepCapabilities() {
  const { control, watch, setValue } = useFormContext<EnterpriseAgentDraft>();
  const caps = watch("capabilities");

  return (
    <div className="space-y-4">
      <div>
        <FormLabel>MCP tools & capabilities</FormLabel>
        <div className="mt-2 space-y-2">
          {ENTERPRISE_CAPABILITIES.map((c) => (
            <label key={c.key} className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-card p-3 text-xs">
              <input
                type="checkbox"
                className="mt-1 accent-primary"
                checked={caps.includes(c.key)}
                onChange={() =>
                  setValue(
                    "capabilities",
                    caps.includes(c.key) ? caps.filter((x) => x !== c.key) : [...caps, c.key],
                    { shouldValidate: true },
                  )
                }
              />
              <div>
                <p className="font-medium text-foreground">{c.label}</p>
                <p className="text-muted-foreground">{c.description}</p>
              </div>
            </label>
          ))}
        </div>
        <FormField control={control} name="capabilities" render={() => <FormMessage />} />
      </div>
      <FormField
        control={control}
        name="operatingHours"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Operating hours</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="24/7">24/7</SelectItem>
                <SelectItem value="Business hours only">Business hours only</SelectItem>
                <SelectItem value="Custom schedule">Custom schedule</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="maxConcurrentTasks"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Maximum concurrent tasks</FormLabel>
            <FormControl>
              <Input type="number" min={1} max={100} {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="escalationEmail"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Escalation contact email</FormLabel>
            <FormControl>
              <Input type="email" placeholder="ops@company.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export function EnterpriseStepIdentity() {
  const { control, watch, setValue } = useFormContext<EnterpriseAgentDraft>();
  const setup = watch("setupIdentityNow");
  const selected = watch("selectedScopes");

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-warning/30 bg-warning/10 p-4">
        <p className="text-sm font-medium text-warning">Identity & Compliance</p>
        <p className="mt-1 text-xs text-muted-foreground">
          AI agents need a verified digital identity to perform sensitive operations like signing documents or submitting
          government forms.
        </p>
        <FormField
          control={control}
          name="setupIdentityNow"
          render={({ field }) => (
            <FormItem className="mt-3 flex flex-row items-center justify-between rounded-lg border border-border bg-card p-3">
              <div>
                <FormLabel className="text-sm">Set up digital identity now</FormLabel>
                <p className="text-xs text-muted-foreground">Skip — you can credential later in ZID.</p>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
        {setup ? (
          <div className="mt-3 space-y-3 text-xs">
            <p>
              Prerequisite:{" "}
              <span className="text-success">Verified (Acme Sdn Bhd)</span> —{" "}
              <Link to="/identity/me" className="text-primary hover:underline">
                Verify now →
              </Link>
            </p>
            <div>
              <p className="mb-2 font-medium text-foreground">Scopes</p>
              <div className="space-y-2">
                {ZID_ACTION_SCOPES.map((s) => (
                  <label key={s} className="flex items-center gap-2 rounded-md border border-border bg-secondary/50 p-2">
                    <input
                      type="checkbox"
                      className="accent-primary"
                      checked={selected.includes(s)}
                      onChange={() =>
                        setValue(
                          "selectedScopes",
                          selected.includes(s) ? selected.filter((x) => x !== s) : [...selected, s],
                          { shouldValidate: true },
                        )
                      }
                    />
                    <span>{formatScopeLabel(s)}</span>
                  </label>
                ))}
              </div>
              <FormField control={control} name="selectedScopes" render={() => <FormMessage />} />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <FormField
                control={control}
                name="validityStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valid from</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="validityEnd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valid to</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <p className="text-muted-foreground">
              Full delegation policy configuration is available in Digital Identity → Policies & Audit after agent creation.
            </p>
          </div>
        ) : (
          <p className="mt-3 text-xs text-muted-foreground">
            You can credential this agent later from Digital Identity → Agent Credentials.
          </p>
        )}
      </div>
    </div>
  );
}

export function EnterpriseStepReview() {
  const { watch } = useFormContext<EnterpriseAgentDraft>();
  const v = watch();
  return (
    <div className="space-y-3 rounded-lg border border-border bg-secondary/40 p-4 text-sm">
      <p className="font-semibold">{v.name}</p>
      <p className="text-xs text-muted-foreground">{v.description.slice(0, 200)}{v.description.length > 200 ? "…" : ""}</p>
      <p className="text-xs">
        <span className="text-muted-foreground">Type:</span> {v.agentType}
      </p>
      <p className="text-xs">
        <span className="text-muted-foreground">Capabilities:</span> {v.capabilities.length} selected
      </p>
      <p className="text-xs">
        <span className="text-muted-foreground">Ops:</span> {v.operatingHours} · max {v.maxConcurrentTasks} tasks
      </p>
      {v.setupIdentityNow && (
        <p className="text-xs">
          <span className="text-muted-foreground">ZID scopes:</span> {v.selectedScopes.map(formatScopeLabel).join(", ") || "—"}
        </p>
      )}
    </div>
  );
}
