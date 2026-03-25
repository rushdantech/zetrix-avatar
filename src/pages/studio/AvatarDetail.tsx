import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/identity/StatusBadge";
import { ScopeBadge } from "@/components/identity/ScopeBadge";
import { useApp } from "@/contexts/AppContext";
import { mockStudioEntities } from "@/data/studio/mock-avatars";
import { mergeStudioWithOverrides } from "@/lib/studio/merge-studio-lists";
import {
  INDIVIDUAL_SETUP_TABS,
  IndividualAvatarSetupStepContent,
  useIndividualAvatarDraft,
} from "@/components/studio/IndividualAvatarEditPanel";
import { DIDDisplay } from "@/components/identity/DIDDisplay";
import { ENTERPRISE_CAPABILITIES } from "@/lib/studio/constants";
import { formatScopeLabel } from "@/lib/identity/format";
import { studioEntityPath } from "@/lib/studio/studio-paths";
import { toast } from "sonner";
import { RagDocumentsUploadZone } from "@/components/studio/RagDocumentsUploadZone";
import type { RagDocumentItem, StudioEntity, StudioEntityEnterprise, StudioEntityIndividual } from "@/types/studio";

function activeMarketplaceSubscriptions(entity: StudioEntity): number {
  return entity.marketplace_active_subscriptions ?? entity.marketplace_downloads;
}

function IndividualAvatarTabs({
  entity,
  onSave,
}: {
  entity: StudioEntityIndividual;
  onSave: (next: StudioEntityIndividual) => void;
}) {
  const draft = useIndividualAvatarDraft(entity);
  const [tab, setTab] = useState<string>("Welcome");

  const handleSave = () => {
    onSave(draft.buildNextEntity());
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap justify-end">
        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-2 rounded-lg gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          <Save className="h-4 w-4" />
          Save changes
        </button>
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex h-auto min-h-10 w-full flex-wrap justify-start gap-1 bg-muted/40 p-1">
          {INDIVIDUAL_SETUP_TABS.map((t) => (
            <TabsTrigger key={t} value={t} className="whitespace-normal px-2 py-1.5 text-left text-[11px] leading-tight sm:text-xs">
              {t}
            </TabsTrigger>
          ))}
        </TabsList>
        {INDIVIDUAL_SETUP_TABS.map((t) => (
          <TabsContent key={t} value={t} className="mt-4">
            <IndividualAvatarSetupStepContent tab={t} entity={entity} draft={draft} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function EnterpriseConfigurationTab({
  entity,
  onSaveKnowledgebase,
}: {
  entity: StudioEntityEnterprise;
  onSaveKnowledgebase: (docs: RagDocumentItem[]) => void;
}) {
  const s = entity.enterpriseSetup;
  const kbFromEntity = s.knowledgebaseDocuments ?? [];
  const kbSignature = kbFromEntity.map((d) => `${d.id}:${d.name}`).join("|");
  const [kbDraft, setKbDraft] = useState<RagDocumentItem[]>(kbFromEntity);

  useEffect(() => {
    setKbDraft(kbFromEntity);
  }, [entity.id, kbSignature]);

  return (
    <div className="space-y-6">
      <div className="space-y-5 rounded-xl border border-border bg-card p-4 text-sm">
        <h2 className="text-sm font-semibold text-foreground">Agent profile</h2>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted-foreground">Agent type</dt>
            <dd className="mt-0.5 font-medium">{s.agentType}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Team / department</dt>
            <dd className="mt-0.5 font-medium">{s.department || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Operating hours</dt>
            <dd className="mt-0.5 font-medium">{s.operatingHours}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Max concurrent tasks</dt>
            <dd className="mt-0.5 font-medium">{s.maxConcurrentTasks}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs text-muted-foreground">Escalation email</dt>
            <dd className="mt-0.5 font-medium">{s.escalationEmail}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Credential validity</dt>
            <dd className="mt-0.5 font-medium">
              {s.validityStart} → {s.validityEnd}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Identity during setup</dt>
            <dd className="mt-0.5 font-medium">{s.setupIdentityNow ? "Set up digital identity now" : "Skipped — credential later"}</dd>
          </div>
        </dl>
        {s.selectedScopes.length > 0 && (
          <div>
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Scopes selected in wizard</h3>
            <div className="flex flex-wrap gap-1">
              {s.selectedScopes.map((sc) => (
                <span key={sc} className="rounded-md bg-primary/10 px-2 py-1 text-xs text-primary">
                  {formatScopeLabel(sc)}
                </span>
              ))}
            </div>
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Digital identity and ZID credentials are managed under the <span className="font-medium text-foreground">Identity</span> tab.
        </p>
      </div>

      <div className="space-y-3 rounded-xl border border-border bg-card p-4 text-sm">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Knowledge base</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Add documents to give this agent more context for its tasks (metadata only in this demo).
          </p>
        </div>
        <RagDocumentsUploadZone documents={kbDraft} onChange={setKbDraft} idPrefix={`agent-kb-${entity.id}`} />
        <div className="flex flex-wrap justify-end border-t border-border pt-3">
          <button
            type="button"
            onClick={() => {
              onSaveKnowledgebase(kbDraft.map((d) => ({ ...d })));
              toast.success("Knowledge base saved for this session.");
            }}
            className="flex items-center gap-2 rounded-lg gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            <Save className="h-4 w-4" />
            Save knowledge base
          </button>
        </div>
      </div>
    </div>
  );
}

function EnterpriseCapabilitiesTab({ entity }: { entity: StudioEntityEnterprise }) {
  const setup = entity.enterpriseSetup;
  const keys = setup.capabilities;
  const apiKeys = setup.capabilityApiKeys ?? {};
  const accessRequested = setup.capabilityApiAccessRequested ?? {};
  const custom = setup.customApiIntegration;

  return (
    <div className="rounded-xl border border-border bg-card p-4 text-sm">
      <p className="mb-3 text-xs text-muted-foreground">Capabilities, API access, and custom endpoint from Create Agent → Step 2</p>
      <ul className="space-y-2">
        {ENTERPRISE_CAPABILITIES.filter((c) => keys.includes(c.key)).map((c) => {
          const hasKey = (apiKeys[c.key] ?? "").trim().length > 0;
          const req = accessRequested[c.key] === true;
          return (
            <li key={c.key} className="rounded-lg border border-border bg-secondary/40 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{c.label}</p>
                {c.authMode === "provider" && hasKey && (
                  <Badge variant="secondary" className="text-[10px] font-normal">
                    Key on file
                  </Badge>
                )}
                {c.authMode === "provider" && !hasKey && req && (
                  <Badge variant="outline" className="text-[10px] font-normal">
                    Access requested
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{c.description}</p>
              {c.authMode === "custom_endpoint" && custom?.endpointUrl && (
                <p className="mt-2 break-all font-mono text-[11px] text-foreground">
                  {custom.httpMethod} {custom.endpointUrl}
                </p>
              )}
              {c.authMode === "custom_endpoint" && custom?.integrationCode && (
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Integration code saved ({custom.integrationCode.length} chars).
                </p>
              )}
            </li>
          );
        })}
      </ul>
      {keys.length === 0 && <p className="text-muted-foreground">No capabilities selected in mock data.</p>}
    </div>
  );
}

function EnterpriseMarketplaceTab({ entity }: { entity: StudioEntityEnterprise }) {
  const n = activeMarketplaceSubscriptions(entity);
  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4 text-sm">
      <div>
        <h3 className="font-medium text-foreground">Marketplace availability</h3>
        <p className="mt-2 text-muted-foreground">
          AI agents are not distributed as downloads. You make an agent available on the marketplace so customers or
          partner organizations can <span className="font-medium text-foreground">subscribe</span> and run it under contract,
          usage limits, and your identity controls.
        </p>
      </div>
      <div className="rounded-lg bg-secondary/50 p-3">
        <p className="text-xs text-muted-foreground">Subscribed organizations (demo)</p>
        <p className="mt-0.5 text-2xl font-semibold text-foreground">{n}</p>
        <p className="mt-1 text-xs text-muted-foreground">Orgs with an active subscription to this agent listing.</p>
      </div>
      <Link to="/marketplace" className="inline-flex text-sm font-medium text-primary hover:underline">
        Open Marketplace →
      </Link>
    </div>
  );
}

export default function AvatarDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { userStudioEntities, studioEntityOverrides, addUserStudioEntity } = useApp();
  const { data = [] } = useQuery({
    queryKey: ["studio-avatars"],
    queryFn: () => new Promise<typeof mockStudioEntities>((resolve) => setTimeout(() => resolve(mockStudioEntities), 300)),
  });
  const merged = useMemo(
    () => mergeStudioWithOverrides(userStudioEntities, data, studioEntityOverrides),
    [userStudioEntities, data, studioEntityOverrides],
  );
  const entity = useMemo(() => merged.find((d) => d.id === id) as StudioEntity | undefined, [merged, id]);

  useEffect(() => {
    if (!entity) return;
    const onAgentsPath = location.pathname.startsWith("/studio/agents/");
    if (entity.type === "individual" && onAgentsPath) {
      navigate(`/studio/avatars/${entity.id}`, { replace: true });
    } else if (entity.type === "enterprise" && location.pathname.startsWith("/studio/avatars/") && location.pathname !== "/studio/avatars/create") {
      navigate(studioEntityPath(entity), { replace: true });
    }
  }, [entity, location.pathname, navigate]);

  if (!entity) return <div className="text-sm text-muted-foreground">Not found.</div>;

  return (
    <div className="space-y-4 pb-20 lg:pb-0">
      <div className="rounded-xl border border-border bg-card p-5">
        <div>
          <h1 className="text-2xl font-bold">{entity.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{entity.description}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <StatusBadge value={entity.type === "individual" ? "published" : "active"} />
            <StatusBadge value={entity.status} />
          </div>
        </div>
      </div>
      {entity.type === "individual" ? (
        <IndividualAvatarTabs
          entity={entity}
          onSave={(next) => {
            addUserStudioEntity(next);
            toast.success("Saved to My Avatars (this session).");
          }}
        />
      ) : (
        <Tabs defaultValue="configuration">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
            <TabsTrigger value="identity">Identity</TabsTrigger>
          </TabsList>
          <TabsContent value="configuration">
            <EnterpriseConfigurationTab
              entity={entity}
              onSaveKnowledgebase={(docs) => {
                addUserStudioEntity({
                  ...entity,
                  enterpriseSetup: { ...entity.enterpriseSetup, knowledgebaseDocuments: docs },
                });
              }}
            />
          </TabsContent>
          <TabsContent value="capabilities">
            <EnterpriseCapabilitiesTab entity={entity} />
          </TabsContent>
          <TabsContent value="marketplace">
            <EnterpriseMarketplaceTab entity={entity} />
          </TabsContent>
          <TabsContent value="identity">
            <div className="rounded-xl border border-border bg-card p-4 text-sm">
              {entity.zid_credentialed ? (
                <div className="space-y-2">
                  <p className="font-medium">Credentialed</p>
                  <DIDDisplay did={`did:zetrix:agent:${entity.id}`} />
                  <div className="flex flex-wrap gap-1">
                    {(entity.zid_scopes || []).map((s) => (
                      <ScopeBadge key={s} scope={s} />
                    ))}
                  </div>
                  <button type="button" onClick={() => navigate(`/identity/agents/${entity.id}`)} className="text-primary hover:underline">
                    Manage in Digital Identity →
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p>No digital identity bound yet.</p>
                  {entity.enterpriseSetup.setupIdentityNow ? (
                    <p className="text-xs text-muted-foreground">Wizard requested identity setup; complete binding in ZID.</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Identity was deferred during Create Agent.</p>
                  )}
                  <button
                    type="button"
                    onClick={() => navigate(`/identity/agents/credential/${entity.id}`)}
                    className="text-primary hover:underline"
                  >
                    Set up identity →
                  </button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
