import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import type { FieldPath } from "react-hook-form";
import { useForm, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { Code2, KeyRound, Layers, Save } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ENTERPRISE_CAPABILITIES, type EnterpriseCapabilityMeta } from "@/lib/studio/constants";
import { cn } from "@/lib/utils";
import { ZID_ACTION_SCOPES } from "@/lib/identity/constants";
import { formatScopeLabel } from "@/lib/identity/format";
import type { EnterpriseAgentDraft, StudioEntityEnterprise } from "@/types/studio";
import { enterpriseStep2Schema } from "@/lib/studio/create-avatar-schemas";
import { applyZodIssues } from "@/lib/studio/apply-zod-issues";
import { enterpriseEntityToAgentDraft, enterpriseStep2PayloadForValidation } from "@/lib/studio/build-user-studio-entity";
import { Switch } from "@/components/ui/switch";
import { RagDocumentsUploadZone } from "@/components/studio/RagDocumentsUploadZone";

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

export function EnterpriseStepKnowledgebase() {
  const { control } = useFormContext<EnterpriseAgentDraft>();

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-medium text-foreground">Knowledge base</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Upload reference documents so this agent has more context for the tasks it runs (policies, SOPs, product sheets).
          Files are stored as metadata in this demo — you can add or change them later under the agent&apos;s Configuration.
        </p>
      </div>
      <FormField
        control={control}
        name="knowledgebaseDocuments"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <RagDocumentsUploadZone
                documents={field.value ?? []}
                onChange={field.onChange}
                idPrefix="create-enterprise-kb"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

function capabilityKeyField(key: string): FieldPath<EnterpriseAgentDraft> {
  return `capabilityApiKeys.${key}` as FieldPath<EnterpriseAgentDraft>;
}

function capabilityRequestedField(key: string): FieldPath<EnterpriseAgentDraft> {
  return `capabilityApiAccessRequested.${key}` as FieldPath<EnterpriseAgentDraft>;
}

function CapabilityCardIcon({ meta }: { meta: EnterpriseCapabilityMeta }) {
  if (meta.authMode === "custom_endpoint") {
    return (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Code2 className="h-5 w-5" aria-hidden />
      </span>
    );
  }
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
      <KeyRound className="h-5 w-5" aria-hidden />
    </span>
  );
}

export function EnterpriseStepCapabilities({
  hideCapabilitiesHeading = false,
}: {
  /** Hide the redundant "Capabilities" label when a parent section already titles the block (e.g. Configuration tab). */
  hideCapabilitiesHeading?: boolean;
} = {}) {
  const { control, watch, setValue } = useFormContext<EnterpriseAgentDraft>();
  const caps = watch("capabilities");
  const apiKeys = watch("capabilityApiKeys");
  const accessRequested = watch("capabilityApiAccessRequested");

  const toggleCapability = (key: string, enabled: boolean) => {
    if (enabled) {
      setValue("capabilities", caps.includes(key) ? caps : [...caps, key], { shouldValidate: true });
    } else {
      setValue(
        "capabilities",
        caps.filter((x) => x !== key),
        { shouldValidate: true },
      );
      setValue(capabilityKeyField(key), "", { shouldValidate: true });
      setValue(capabilityRequestedField(key), false, { shouldValidate: true });
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-secondary/30 p-4">
        <div className="flex gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-card text-primary shadow-sm">
            <Layers className="h-4 w-4" aria-hidden />
          </span>
          <div className="space-y-1 text-sm">
            <p className="font-medium text-foreground">Connect each capability</p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Enable only what this agent needs. For regulated or partner APIs, paste a key from your admin console or request
              access—we’ll email API credentials (demo). For <span className="font-medium text-foreground">Custom API</span>, set
              your endpoint and edit the integration code.
            </p>
          </div>
        </div>
      </div>

      <div>
        {!hideCapabilitiesHeading && (
          <>
            <FormLabel className="text-base">Capabilities</FormLabel>
            <p className="mt-1 text-xs text-muted-foreground">Optional — enable only the integrations this agent should use.</p>
          </>
        )}
        <div className={cn("space-y-3", !hideCapabilitiesHeading && "mt-3")}>
          {ENTERPRISE_CAPABILITIES.map((c) => {
            const enabled = caps.includes(c.key);
            const keyValue = (apiKeys?.[c.key] ?? "").trim();
            const requested = accessRequested?.[c.key] === true;

            return (
              <div
                key={c.key}
                className={cn(
                  "overflow-hidden rounded-xl border bg-card transition-shadow",
                  enabled ? "border-primary/40 shadow-sm ring-1 ring-primary/15" : "border-border",
                )}
              >
                <div className="flex items-start gap-3 p-4">
                  <CapabilityCardIcon meta={c} />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-foreground">{c.label}</p>
                      {enabled && c.authMode === "provider" && keyValue && (
                        <Badge variant="secondary" className="text-[10px] font-normal">
                          Key on file
                        </Badge>
                      )}
                      {enabled && c.authMode === "provider" && !keyValue && requested && (
                        <Badge variant="outline" className="border-primary/30 text-[10px] font-normal text-primary">
                          Access requested
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{c.description}</p>
                    <p className="text-[11px] text-muted-foreground">
                      <span className="font-medium text-foreground/80">Integration:</span> {c.providerHint}
                    </p>
                  </div>
                  <Switch
                    checked={enabled}
                    onCheckedChange={(on) => toggleCapability(c.key, on)}
                    aria-label={enabled ? `Disable ${c.label}` : `Enable ${c.label}`}
                  />
                </div>

                {enabled && c.authMode === "provider" && (
                  <div className="space-y-3 border-t border-border bg-secondary/25 px-4 py-4">
                    <p className="text-xs text-muted-foreground">
                      This capability talks to <span className="font-medium text-foreground">{c.providerHint}</span>. Use a
                      restricted key scoped to this agent where possible.
                    </p>
                    <FormField
                      control={control}
                      name={capabilityKeyField(c.key)}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">API key</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="password"
                              autoComplete="off"
                              placeholder="Paste secret key (demo only — not stored securely)"
                              onChange={(e) => {
                                field.onChange(e);
                                if (e.target.value.trim()) {
                                  setValue(capabilityRequestedField(c.key), false, { shouldValidate: true });
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        disabled={!!keyValue}
                        onClick={() => {
                          setValue(capabilityRequestedField(c.key), true, { shouldValidate: true });
                          toast.success("Request submitted", {
                            description: `We’ll send ${c.label} API credentials to your org contact (demo).`,
                          });
                        }}
                      >
                        Request API access
                      </Button>
                      {!keyValue && !requested && (
                        <span className="text-[11px] text-muted-foreground">or paste a key above to skip the wait.</span>
                      )}
                    </div>
                  </div>
                )}

                {enabled && c.authMode === "custom_endpoint" && (
                  <div className="space-y-4 border-t border-border bg-secondary/25 px-4 py-4">
                    <p className="text-xs text-muted-foreground">
                      Point the agent at your service, then refine the handler. The snippet is saved with the agent; it is not
                      executed in this prototype.
                    </p>
                    <div className="grid gap-3 sm:grid-cols-[1fr_minmax(0,8rem)]">
                      <FormField
                        control={control}
                        name="customApiIntegration.endpointUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Endpoint base URL</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://api.yourcompany.com" className="font-mono text-xs" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="customApiIntegration.httpMethod"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">HTTP method</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="GET">GET</SelectItem>
                                <SelectItem value="POST">POST</SelectItem>
                                <SelectItem value="PUT">PUT</SelectItem>
                                <SelectItem value="PATCH">PATCH</SelectItem>
                                <SelectItem value="DELETE">DELETE</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={control}
                      name="customApiIntegration.integrationCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Endpoint integration code</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              spellCheck={false}
                              className="min-h-[240px] resize-y font-mono text-[11px] leading-relaxed"
                              placeholder="TypeScript-style handler…"
                            />
                          </FormControl>
                          <p className="text-[11px] text-muted-foreground">
                            Tip: align <span className="font-mono text-foreground/80">fetch</span> URL and method with the
                            fields above so reviewers see a consistent story.
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            );
          })}
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
  const capLabels = v.capabilities
    .map((key) => ENTERPRISE_CAPABILITIES.find((c) => c.key === key)?.label ?? key)
    .join(", ");
  const providerKeys = v.capabilities.filter((key) => {
    const m = ENTERPRISE_CAPABILITIES.find((c) => c.key === key);
    return m?.authMode === "provider";
  });
  const withKey = providerKeys.filter((k) => (v.capabilityApiKeys[k] ?? "").trim().length > 0).length;
  const withRequestOnly = providerKeys.filter(
    (k) => v.capabilityApiAccessRequested[k] && !(v.capabilityApiKeys[k] ?? "").trim().length,
  ).length;

  return (
    <div className="space-y-3 rounded-lg border border-border bg-secondary/40 p-4 text-sm">
      <p className="font-semibold">{v.name}</p>
      <p className="text-xs text-muted-foreground">{v.description.slice(0, 200)}{v.description.length > 200 ? "…" : ""}</p>
      <p className="text-xs">
        <span className="text-muted-foreground">Type:</span> {v.agentType}
      </p>
      <div className="text-xs">
        <p>
          <span className="text-muted-foreground">Capabilities:</span> {capLabels || "—"}
        </p>
        {providerKeys.length > 0 && (
          <p className="mt-1 text-muted-foreground">
            API access:{" "}
            <span className="text-foreground">
              {withKey} key{withKey === 1 ? "" : "s"} on file
              {withRequestOnly > 0 ? ` · ${withRequestOnly} access request${withRequestOnly === 1 ? "" : "s"}` : ""}
            </span>
          </p>
        )}
        {v.capabilities.includes("custom-api") && (
          <p className="mt-1 break-all text-muted-foreground">
            <span className="text-muted-foreground">Custom API:</span>{" "}
            <span className="font-mono text-[11px] text-foreground">
              {v.customApiIntegration.httpMethod} {v.customApiIntegration.endpointUrl || "(set URL in step 2)"}
            </span>
          </p>
        )}
      </div>
      <p className="text-xs">
        <span className="text-muted-foreground">Ops:</span> {v.operatingHours} · max {v.maxConcurrentTasks} tasks
      </p>
      {v.setupIdentityNow && (
        <p className="text-xs">
          <span className="text-muted-foreground">ZID scopes:</span> {v.selectedScopes.map(formatScopeLabel).join(", ") || "—"}
        </p>
      )}
      <p className="text-xs">
        <span className="text-muted-foreground">Knowledge base:</span>{" "}
        {(() => {
          const kb = v.knowledgebaseDocuments ?? [];
          return kb.length === 0 ? "None (optional)" : `${kb.length} file(s): ${kb.map((d) => d.name).join(", ")}`;
        })()}
      </p>
    </div>
  );
}

export function EnterpriseCapabilitiesEditSection({
  entity,
  onSaved,
}: {
  entity: StudioEntityEnterprise;
  onSaved: (next: StudioEntityEnterprise) => void;
}) {
  const form = useForm<EnterpriseAgentDraft>({
    defaultValues: enterpriseEntityToAgentDraft(entity),
    mode: "onTouched",
  });

  const resetKey = useMemo(
    () =>
      [
        entity.id,
        JSON.stringify(entity.enterpriseSetup.capabilities),
        JSON.stringify(entity.enterpriseSetup.capabilityApiKeys ?? {}),
        JSON.stringify(entity.enterpriseSetup.capabilityApiAccessRequested ?? {}),
        JSON.stringify(entity.enterpriseSetup.customApiIntegration ?? {}),
        entity.enterpriseSetup.operatingHours,
        String(entity.enterpriseSetup.maxConcurrentTasks),
        entity.enterpriseSetup.escalationEmail,
      ].join("¦"),
    [entity],
  );

  useEffect(() => {
    form.reset(enterpriseEntityToAgentDraft(entity));
  }, [resetKey, entity, form.reset]);

  const saveCapabilities = () => {
    form.clearErrors();
    const v = form.getValues();
    const payload = enterpriseStep2PayloadForValidation(v);
    const r = enterpriseStep2Schema.safeParse({
      capabilities: payload.capabilities,
      capabilityApiKeys: payload.capabilityApiKeys,
      capabilityApiAccessRequested: payload.capabilityApiAccessRequested,
      customApiIntegration: payload.customApiIntegration,
      operatingHours: payload.operatingHours,
      maxConcurrentTasks: payload.maxConcurrentTasks,
      escalationEmail: payload.escalationEmail,
    });
    if (!r.success) {
      applyZodIssues(r.error.issues, form.setError);
      const first = r.error.issues[0];
      if (first?.message) toast.error("Check capabilities", { description: first.message });
      return;
    }
    const d = r.data;
    onSaved({
      ...entity,
      enterpriseSetup: {
        ...entity.enterpriseSetup,
        capabilities: [...d.capabilities],
        capabilityApiKeys: { ...d.capabilityApiKeys },
        capabilityApiAccessRequested: { ...d.capabilityApiAccessRequested },
        customApiIntegration: { ...d.customApiIntegration },
        operatingHours: d.operatingHours,
        maxConcurrentTasks: d.maxConcurrentTasks,
        escalationEmail: d.escalationEmail,
      },
    });
    toast.success("Capabilities saved for this session.");
  };

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4 text-sm">
      <p className="text-xs text-muted-foreground">
        Same options as Create Agent → Capabilities: integrations, API keys, custom endpoint, operating hours, and escalation
        contact.
      </p>
      <Form {...form}>
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <EnterpriseStepCapabilities hideCapabilitiesHeading />
          <div className="flex flex-wrap justify-end border-t border-border pt-4">
            <button
              type="button"
              onClick={saveCapabilities}
              className="flex items-center gap-2 rounded-lg gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              <Save className="h-4 w-4" />
              Save capabilities
            </button>
          </div>
        </form>
      </Form>
    </div>
  );
}
